import { IActivity } from "../../../../app/modules/activity/activity.interface";
import { ActivityServices } from "../../../../app/modules/activity/activity.service";
import { kafkaConsumer } from "../../kafka-producers/kafka.consumer";

export const createActivityConsumer = async () => {
    await kafkaConsumer({groupId:"activity",topic:"create-activity",cb:async (data:IActivity)=>{
        try {
              await ActivityServices.createActivityIntoDB(data)
        } catch (error) {
            console.log(error);
            
        }
    }})
};