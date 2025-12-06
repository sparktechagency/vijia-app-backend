import { encode } from '@toon-format/toon';
import { chatbot } from '../../../config/openAIChatbot';
import { googleHelper } from '../../../helpers/googleMapHelper';
import {
  AddressType,
  getaddressFromTheAi,
  getChatbotPrompt,
} from './chatbot.constants';
import { ChatbotModel, IChatbot } from './chatbot.interface';
import { FlightServices } from '../flight/flight.service';
import { JwtPayload } from 'jsonwebtoken';
import { CabinRestriction } from '../../../types/flightOffer';
import { HotelService } from '../hotel/hotel.service';
import { RestrudentServices } from '../restrudent/restrudent.service';
import { User } from '../user/user.model';
import { Chatbot } from './chatbot.model';
import { kafkaProducer } from '../../../tools/kafka/kafka-producers/kafka.producer';
import { Server } from 'socket.io';
import QueryBuilder from '../../builder/QueryBuilder';
import { amaduesHelper } from '../../../helpers/AmaduesHelper';
import { convertHotelIntoHomeItem } from './chatbot.helper';
import { openAiFileUpload } from '../../../helpers/openAIUpload';
const generateAiResponse = async (
  user: JwtPayload,
  prompt?: string,
  audio?: string
) => {
  const io = (global as any).io as Server;
  const fileId = await openAiFileUpload(audio!);

  const userInfo = await User.findOne({ _id: user.id });
  const [lng, lat] = userInfo?.location?.coordinates || [116.4074, 39.9046];
  const excitingMMessage = await Chatbot.find({
    user: user.id,
    createdAt: { $gt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
  })
    .sort({ createdAt: -1 })
    .limit(5)
    .lean()
    .exec();
  const countyAndTheCity =
    await googleHelper.getCountryAndCityDetailsUsingGeoCode(lat, lng);
  await kafkaProducer.sendMessage('create-chatbot', {
    user: user.id,
    message: prompt || fileId,
    sender: 'user',
    voice: audio || '',
  });
  io.emit('get-chatbot::' + user.id, {
    message: prompt,
    sender: 'user',
    user: user.id,
  });
  const response = await chatbot.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content:
          'You are a travel recommendation engine. Return only valid JSON.',
      },
      {
        role: 'user',
        content: getaddressFromTheAi(
          `${prompt || fileId} and my current location is ${encode(
            countyAndTheCity
          )} and my previous messages are ${encode(excitingMMessage)}`
        ),
      },
    ],
  });

  const data = response.choices[0].message.content;
  // const information:AddressType = JSON.parse(data!);

  const jsonFormat = data
    ?.replace(/\n/g, '')
    .replace(/```json|```/g, '')
    .trim();

  console.log(jsonFormat);

  const json: AddressType = JSON.parse(jsonFormat!);

  if (Object.values(json.data ?? {}).some(data => data.length > 0)) {
    const data = {
      message: json.message,
      data: json.data,
    };

    await kafkaProducer.sendMessage('create-chatbot', {
      user: user.id,
      message: data.message,
      sender: 'ai',
      data: data.data,
    });
    io.emit('get-chatbot::' + user.id, {
      message: data.message,
      sender: 'ai',
      user: user.id,
      data: data.data,
    });
    return data;
  }

  const isData = json?.responseItems?.length > 0;

  if (!isData) {
    await kafkaProducer.sendMessage('create-chatbot', {
      user: user.id,
      message: json.message,
      sender: 'ai',
      data: [],
    });
    return {
      message: json.message,
    };
  }

  const lengthData = {
    flights: [],
    hotels: [],
    activities: [],
    restaurants: [],
  };

  if (json?.responseItems?.includes('flight')) {
    const flightData = FlightServices.getFlightsListUsingGeoCode(
      {
        place: [
          {
            origin: json.currentCity,
            destination: json.destinationCity,
            departureDate: new Date(
              new Date().setDate(new Date().getDate() + 1)
            )
              .toISOString()
              .split('T')[0],
            returnDate: new Date(new Date().setDate(new Date().getDate() + 7))
              .toISOString()
              .split('T')[0],
            originAitaCode: json.currentAitaCity,
            destinationAitaCode: json.destinationAitaCity,
          },
        ],
        adults: json.adults,
        children: json.children,
        class: (json.flightClass as CabinRestriction['cabin']) || 'BUSINESS',
        limit: 4,
      },
      user
    );

    lengthData.flights = flightData as any;
  }

  if (json?.responseItems?.includes('hotel')) {
    const hotelsData = await amaduesHelper.getHotelsList(
      json.destinationAitaCity,
      100,
      5
    );

    lengthData.hotels = convertHotelIntoHomeItem(
      hotelsData.data?.slice(0, 10)
    ) as any;
  }

  if (json?.responseItems?.includes('activity')) {
    lengthData.activities = HotelService.getActiviesForHome(user, {
      lat: json.destinationLatLong.lat,
      lng: json.destinationLatLong.lng,
    }) as any;
  }

  if (json?.responseItems?.includes('restaurant')) {
    lengthData.restaurants = RestrudentServices.getRestrudentUsingGeoCode({
      city: json.destinationCity,
    }) as any;
  }

  const [flights, hotels, activities, restaurants] = await Promise.all([
    lengthData.flights,
    lengthData.hotels,
    lengthData.activities,
    lengthData.restaurants,
  ]);
  const responsek = {
    message: json.message,
    data: {
      flights,
      hotels: hotels,
      activities: (activities as any)?.data,
      restaurants: (restaurants as any)?.restrudents,
    },
  };

  io.emit('get-chatbot::' + user.id, {
    message: responsek.message,
    sender: 'ai',
    user: user.id,
    data: responsek.data,
  });
  console.log('come');

  await kafkaProducer.sendMessage('create-chatbot', {
    user: user.id,
    message: responsek.message,
    sender: 'ai',
    data: responsek.data,
  });
  return responsek;
};

const getMessagesOFChatbot = async (
  user: JwtPayload,
  query: Record<string, any>
) => {
  const chatbotQuery = new QueryBuilder(
    Chatbot.find({ user: user.id }),
    query
  ).paginate().sort();
  const [messages, pagination] = await Promise.all([
    chatbotQuery.modelQuery.exec(),
    chatbotQuery.getPaginationInfo(),
  ]);

  return {
    data: messages,
    pagination,
  };
};

export const ChatbotServices = {
  generateAiResponse,
  getMessagesOFChatbot,
};
