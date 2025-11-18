import { sendNotifications } from "../../../../helpers/notificationsHelper";
import { kafkaConsumer } from "../../kafka-producers/kafka.consumer";

export const createNotificationConsumer = async () => {
    await kafkaConsumer({groupId:"notification",topic:"create-notification",cb:async (data:any)=>{
        await sendNotifications(data)
    }})
};