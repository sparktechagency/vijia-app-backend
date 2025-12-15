import { IChatbot } from "../../../../app/modules/chatbot/chatbot.interface"
import { Chatbot } from "../../../../app/modules/chatbot/chatbot.model"
import { kafkaConsumer } from "../../kafka-producers/kafka.consumer"

export const createChatbotConsumer = async () => {
    await kafkaConsumer({groupId:"chatbot",topic:"create-chatbot",cb: async (data:IChatbot)=>{
        try {
        
            
            await Chatbot.create(data)
        } catch (error) {
            console.log(error);
            
        }
    }})
}