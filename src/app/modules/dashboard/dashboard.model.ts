import { Schema, model } from 'mongoose';
import { IDashboard, DashboardModel } from './dashboard.interface'; 

const dashboardSchema = new Schema<IDashboard, DashboardModel>({
  // Define schema fields here
});

export const Dashboard = model<IDashboard, DashboardModel>('Dashboard', dashboardSchema);
