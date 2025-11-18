import { Preference } from "../../../../app/modules/preference/preference.model"
import { amaduesHelper } from "../../../../helpers/AmaduesHelper"
import { kafkaConsumer } from "../../kafka-producers/kafka.consumer"

export const addFlightsInPreference = async () => {
  await kafkaConsumer({
    groupId: "preference-flight",
    topic: "flight-in-preference",
    cb: async (data: {
      userId: string;
      userAddress: {
        city: string;
        country: string;
        suggestCountrys: { city: string; country: string }[];
      };
    }) => {
      console.log(data);

      const flightsList: any[] = [];

      for (const country of data.userAddress.suggestCountrys) {
        try {
          await new Promise(resolve => setTimeout(resolve, 2000)); // wait 2 seconds between requests
          const flights = await amaduesHelper.getFlightsList(
            data?.userAddress?.city,
            country.city,
            new Date().toISOString().split('T')[0],
            new Date().toISOString().split('T')[0],
            1,
            5
          );
          if (flights?.data) {
            flightsList.push(...flights.data.slice(0, 10));
          }
        } catch (error) {
          console.error(`Error fetching flights for ${country.city}:`, error);
        }
      }

      await Preference.findOneAndUpdate(
        { user: data.userId },
        { flights: flightsList },
        { new: true, upsert: true }
      );

      console.log("Flights added to preference:", flightsList.length);
    },
  });
};
