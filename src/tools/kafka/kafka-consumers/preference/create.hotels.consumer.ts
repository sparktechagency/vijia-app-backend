import { HomeItem, Preference } from '../../../../app/modules/preference/preference.model';
import { AiHelper } from '../../../../helpers/openAiHelper';
import { amaduesHelper } from '../../../../helpers/AmaduesHelper';
import { ActivitiesResponse } from '../../../../types/activities';
import { HotelsResponse } from '../../../../types/AmudusTypes';
import { FlightOfferPricingResponse } from '../../../../types/flightOffer';
import { kafkaConsumer } from '../../kafka-producers/kafka.consumer';
import { kafkaProducer } from '../../kafka-producers/kafka.producer';
import { IHomeItem } from '../../../../app/modules/preference/preference.interface';
import { getImagesFromApi } from '../../../../helpers/photoHelper';

export const addHotelsInPreference = async () => {
  await kafkaConsumer({
    groupId: 'preference',
    topic: 'hotel-in-preference',
    cb: async ({
      userId,
      userAddress,
    }: {
      userId: string;
      userAddress: { city: string; country: string };
    }) => {


      //   const cityInfo = await AiHelper.getCityInfo(
      //     userAddress.city,
      //     userAddress.country
      //   );




      //   const arr = {
      //     hotels: [] as HotelsResponse['data'],
      //     flights: [] as FlightOfferPricingResponse['data']['flightOffers'],
      //     activities: [] as ActivitiesResponse['data'],
      //   };

      //   const data = await Promise.all(
      //     cityInfo?.suggestCountrys?.map(async country => {
      //       const hotels = await amaduesHelper.getHotelsList(country.city);

      //       return hotels?.data?.slice(0, 4);
      //     })
      //   );

      //   await Preference.findOneAndUpdate({ user: userId }, {hotels:data.flat()});


      //   await Promise.all([
      //     kafkaProducer.sendMessage('activity-in-preference', { userId,userAddress:cityInfo }),
      //   ])
      try {

      } catch (error) {
        const data: IHomeItem[] = await AiHelper.createAiSuggestionTravelDestination(userId, { city: userAddress.city, country: userAddress.country });

        const mapItems = await Promise.all(
          data?.map(async (item) => {
            const images = await getImagesFromApi(item.name);
            return {
              ...item, images, user: userId, location: {
                type: "Point",
                coordinates: [item.lng, item.lat]
              }
            };
          })
        );


        await HomeItem.deleteMany({ user: userId });


        await HomeItem.insertMany(mapItems)
      }



    },
  });
};



