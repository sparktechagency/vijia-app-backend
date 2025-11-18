import { createActivityConsumer } from "./activity/create-activity.consumer";
import { createChatbotConsumer } from "./chatbot/create.chatbot.consumer";
import { createNotificationConsumer } from "./notification/create.notification.consumer";
import { addActivitesInPreference } from "./preference/create.activity.consumer";
import { addFlightsInPreference } from "./preference/create.flights.consumer";
import { addHotelsInPreference } from "./preference/create.hotels.consumer";
import { userConsumer } from "./user.consumer";

export async function loadConsumer() {
   await Promise.all([ addHotelsInPreference(),createActivityConsumer(),createNotificationConsumer(),createChatbotConsumer()]);
   console.log('consumer loaded');
}