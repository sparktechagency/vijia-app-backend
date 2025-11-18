import { IPreference, tags } from '../app/modules/preference/preference.interface';
import { Preference } from '../app/modules/preference/preference.model';
import { User } from '../app/modules/user/user.model';
import { chatbot } from '../config/chatbot.config';
import { redisClient } from '../config/redis';
import { RedisHelper } from '../tools/redis/redis.helper';

const getSuggestions = async (
  data: any,
  userAddress: { city: string; country: string },
  type: 'flight' | 'hotel' | 'activity' | 'restrudent',
  userId: string
) => {
  try {
    const prompt = await genPrompt(data, type, userAddress, userId);

    const response = await chatbot.generateContent(prompt!);

    const res = response?.response
      ?.text()
      ?.replace(/\n/g, '')
      ?.replace(/```json|```/g, '')
      .trim();

    return JSON.parse(res);
  } catch (error) {
    console.log(error);
  }
};

const genPrompt = async (
  data: any,
  type: 'flight' | 'hotel' | 'activity' | 'restrudent',
  userAddress: { city: string; country: string },
  userId: string
) => {
  const userInfo = await User.findOne(
    { _id: userId },
    { user_type: 1, interested_categories: 1 }
  );
  switch (type) {
    case 'flight':
      return `The user has the following profile:
- User type: ${userInfo?.user_type || 'none'}
- Interested categories: ${userInfo?.interested_categories?.join(',') || 'none'}
- Location: ${userAddress.city}, ${userAddress.country}

Here is the available flights data: ${JSON.stringify(data)}

Please analyze the flights and suggest the best options for this user, considering:
1. Best fit for the user's profile and preferences.
2. Affordable or cheapest available options.

Return only the recommended flights in the same JSON structure as the input flights list.
            `;
    case 'hotel':
      return `
        The user has the following profile:
- User type: ${userInfo?.user_type || 'none'}
- Interested categories: ${userInfo?.interested_categories?.join(',') || 'none'}
- Location: ${userAddress.city}, ${userAddress.country}

Here is the available hotels data: ${JSON.stringify(data)}

Please analyze the hotels and suggest the best options for this user, considering:
1. Best fit for the user's profile and preferences.
2. Affordable or cheapest available options.
3. Relevant amenities and features based on the user's interests.

Return only the recommended hotels in the same JSON structure as the input hotels list no other text only json.
        `;
      break;
    case 'activity':
      return `
        The user has the following profile:
- User type: ${userInfo?.user_type || 'none'}
- Interested categories: ${userInfo?.interested_categories?.join(',') || 'none'}
- Location: ${userAddress.city}, ${userAddress.country}

Here is the available activities data: ${JSON.stringify(data)}

Please analyze the activities and suggest the best options for this user, considering:
1. Best fit for the user's profile and interests.
2. Activities that are popular, relevant, or highly rated.
3. Cost-effective options if applicable.

Return only the recommended activities in the same JSON structure as the input activities list.

        `;
      break;
    case 'restrudent':
      return `
        The user has the following profile:
- User type: ${userInfo?.user_type || 'none'}
- Interested categories: ${userInfo?.interested_categories?.join(',') || 'none'}
- Location: ${userAddress.city}, ${userAddress.country}

Here is the available restaurants data: ${JSON.stringify(data)}

Please analyze the restaurants and suggest the best options for this user, considering:
1. Best fit for the user's profile and preferences.
2. Popular or highly rated restaurants.
3. Affordable or cost-effective options if applicable.
4. Cuisine or features relevant to the user's interests.

Return only the recommended restaurants in the same JSON structure as the input restaurants list.

        `;
      break;
    default:
      break;
  }
};

const sampleForm = {
  city: 'PAR',
  country: 'FR',
  suggestCountrys: [
    {
      city: 'PAR',
      country: 'FR',
    },
  ],
};

const getCityInfo = async (
  city: string,
  country: string
): Promise<typeof sampleForm> => {
  try {
    const promt = `
The user has the following profile:
- Location: ${city}, ${country}

Please provide:
1. The IATA code for the given city and country.
2. A list of suggested tourist-friendly countries with at least one city and its corresponding IATA code.

Return the result only in JSON format, following this structure: ${JSON.stringify(
      sampleForm
    )} and dont give any value null or empty string or undefined if not available use new york as default
`;

    const response = await chatbot.generateContent(promt);

    const res = response?.response
      ?.text()
      ?.replace(/\n/g, '')
      ?.replace(/```json|```/g, '')
      .trim();

    return JSON.parse(res);
  } catch (error) {
    console.log(error);
    return {
      city: 'PAR',
      country: 'FR',
      suggestCountrys: [
        {
          city: 'PAR',
          country: 'FR',
        },
      ],
    };
  }
};


export const demoObj = {
  "type": "hotel",
  "name": "The Grand Dhaka Hotel",
  "referenceId": "hotel id or flight id or activity id or resturant id",
  "images": [
    "https://example.com/images/hotel1.jpg",
    "https://example.com/images/hotel1-room.jpg",
    "https://example.com/images/hotel1-lobby.jpg"
  ],
  "description": "A luxurious 5-star hotel located in the heart of Dhaka, offering premium rooms, fine dining, and a rooftop infinity pool.",
  "price": "150",
  "isDiscounted": true,
  "discountPercentage": 10,
  "discountAmount": 15,
  "tags": "Alomost exhausted",
  "bookingLink": "https://example.com/book/the-grand-dhaka-hotel",
  "startDate": "2025-11-10",
  "endDate": "2025-11-15",
  "country": "Bangladesh",
  "city": "Dhaka",
  "lat": 23.8103,
  "lng": 90.4125
}


const createAiSuggestion = async (user:string) => {
    console.log("Ai is proecceeing now. please be patient");
    
    const preference = await Preference.findOne({user}).lean()

    if(!preference) return []

  const userDetails = await User.findOne({ _id: preference.user })
    .select('user_type interested_categories')
    .lean();
    if(!userDetails) return []

  const userAddress = {
    city: preference.city,
    country: preference.country,
  };

  const userInfo = {
    user_type: userDetails.user_type,
    interested_categories: userDetails.interested_categories,
  };

  const prompt = `
  this is the user profile:

  - User type: ${userInfo?.user_type || 'none'}
  - Interested categories: ${userInfo?.interested_categories?.join(',') || 'none'}
  - Location: ${userAddress.city}, ${userAddress.country}
  - here is hotel list ${JSON.stringify(preference.hotels)}
  - here is flight list ${JSON.stringify(preference.flights)}
  - here is activity list ${JSON.stringify(preference.activities)}
  - flight default image url : https://wallpaperbat.com/img/563899-flight-wallpaper.jpg
  - hotel default image url : https://eaglematinsurance.co.uk/wp-content/uploads/2024/08/Leisure-and-Hospitality-Insurance.jpg

  please analyze the data and suggest the best options for this user, considering:
  1. Best fit for the user's profile and preferences.
  2. Affordable or cheapest available options.
  3. Relevant amenities and features based on the user's interests.
  4. Popular or highly rated options.
  5.give tags as ${JSON.stringify(tags)} based on the user's preferences
  6.convert all of data to in one json format
  7.the json format is ${JSON.stringify(demoObj)}.
  8. if any flight or hotel or activity image is not available then use default image url. 
  9. for the activites use all of images of the activity. and dont give any demo book link. is there no booking link just use empty string. but you can use demo start date and end date and use country and city fullname
  10. Suffle the data and dont give in a sequential order

  


  Return only the recommended data in the ${JSON.stringify(demoObj)} format and dont give any value null and only return the json format
  `

  const response = await chatbot.generateContent(prompt!);
  
  
  const res = response?.response
    ?.text()
    ?.replace(/\n/g, '')
    ?.replace(/```json|```/g, '')
    .trim();

  const data =JSON.parse(res);

  await Preference.updateOne({user},{aiPreferences:data})
  console.log("Ai is done now. please check your preference");

  await redisClient.del(`preference:${user}`)
  return data
};



export const AiHelper = {
  getSuggestions,
  getCityInfo,
  createAiSuggestion
};
