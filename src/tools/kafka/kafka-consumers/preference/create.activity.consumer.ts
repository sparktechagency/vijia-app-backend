import { Preference } from "../../../../app/modules/preference/preference.model";
import { AiHelper } from "../../../../helpers/openAiHelper";
import { amaduesHelper } from "../../../../helpers/AmaduesHelper";
import { googleHelper } from "../../../../helpers/googleMapHelper";
import { kafkaConsumer } from "../../kafka-producers/kafka.consumer"

export const addActivitesInPreference = async () => {
    await kafkaConsumer({groupId:"preference-activity",topic:"activity-in-preference",cb:async (data:{userId:string,userAddress:{city:string,country:string,suggestCountrys:{city:string,country:string}[]}})=>{
        for (const country of data.userAddress.suggestCountrys) {
            try {
                await new Promise(resolve => setTimeout(resolve, 3000)); // wait 2 seconds between requests
                const getLatLong = await googleHelper.getLatLongFromCityAndCountry(country.city, country.country);
                
                const activities = await amaduesHelper.getAactivtiesUsingGeoCode(getLatLong.lat, getLatLong.lng);
  
                
                if (activities?.data) {
                    await Preference.findOneAndUpdate({ user: data.userId }, { $push: { activities: { $each: activities.data.slice(0, 10) } } });
                }
            } catch (error) {
                console.error(`Error fetching activities for ${country.city}:`, error);
            }
        }

        AiHelper.createAiSuggestion(data.userId)
    
    }})
}


