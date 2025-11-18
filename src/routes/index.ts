import express from 'express';
import { AuthRoutes } from '../app/modules/auth/auth.route';
import { UserRoutes } from '../app/modules/user/user.route';
import { CategoryRoutes } from '../app/modules/category/category.route';
import { PackageRoutes } from '../app/modules/package/package.route';
import { SubscriptionRoutes } from '../app/modules/subscription/subscription.route';
import { DisclaimerRoutes } from '../app/modules/disclaimer/disclaimer.route';
import { FaqRoutes } from '../app/modules/faq/faq.route';
import { HotelRoutes } from '../app/modules/hotel/hotel.route';
import { FlightRoutes } from '../app/modules/flight/flight.route';
import { RestrudentRoutes } from '../app/modules/restrudent/restrudent.route';
import { ActivityRoutes } from '../app/modules/activity/activity.route';
import { FavoriteRoutes } from '../app/modules/favorite/favorite.route';
import { NotificationRoutes } from '../app/modules/notification/notification.routes';
import { ChatbotRoutes } from '../app/modules/chatbot/chatbot.route';
import { TransportRoutes } from '../app/modules/transport/transport.route';
const router = express.Router();

const apiRoutes = [
  {
    path: '/user',
    route: UserRoutes,
  },
  {
    path: '/auth',
    route: AuthRoutes,
  },
  {
    path: '/category',
    route:CategoryRoutes,
  },
  {
    path: '/package',
    route:PackageRoutes,
  },
  {
    path: '/subscription',
    route: SubscriptionRoutes,
  },
  {
    path: '/disclaimer',
    route: DisclaimerRoutes,
  },
  {
    path: '/faq',
    route: FaqRoutes,
  },
  {
    path:'/hotel',
    route:HotelRoutes
  },
  {
    path:'/flight',
    route:FlightRoutes
  },
  {
    path: '/restrudents',
    route: RestrudentRoutes,
  },
  {
    path: '/activity',
    route: ActivityRoutes,
  },
  {
    path: '/favorite',
    route: FavoriteRoutes,
  },
  {
    path:"/notification",
    route:NotificationRoutes
  },
  {
    path:"/chatbot",
    route:ChatbotRoutes
  },
  {
    path:"/transport",
    route:TransportRoutes
  }
];

apiRoutes.forEach(route => router.use(route.path, route.route));

export default router;
