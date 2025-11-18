import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { googleHelper } from '../../../helpers/googleMapHelper';
import { RedisHelper } from '../../../tools/redis/redis.helper';
import QueryBuilder from '../../builder/QueryBuilder';
import { ActivityModel, IActivity } from './activity.interface';
import { Activity } from './activity.model';
import unlinkFile from '../../../shared/unlinkFile';
import { amaduesHelper } from '../../../helpers/AmaduesHelper';
import { JwtPayload } from 'jsonwebtoken';
import { User } from '../user/user.model';
import { HomeItem } from '../preference/preference.model';

const createActivityIntoDB = async (data: Partial<IActivity>)=>{
    const latlong = await googleHelper.getLatLongFromAddress(data.address!)
    data.location = {
        type:"Point",
        coordinates:[latlong.lng,latlong.lat]
    }
    const activity = await Activity.create(data)
    await RedisHelper.HKeyDelete(`activites`);
    return activity
}

const getActivities = async (query: Record<string, any>)=>{
    const cache = await RedisHelper.redisHget(`activites`, query);
    if (cache) {
        console.log('Cache hit');
        return cache;
    }
    const ActivityQuery = new QueryBuilder(Activity.find(query?.user_id ? {user:query?.user_id} : {}), query).paginate().sort()

    const [activites,pagination] = await Promise.all([
        ActivityQuery.modelQuery.exec(),
        ActivityQuery.getPaginationInfo()
    ])

    const data = {
        data:activites,
        pagination
    }

    await RedisHelper.redisHset(`activites`, query, data);
    return data
    
}


const updateActivityIntoDB = async (id:string,data:Partial<IActivity>)=>{
    const exist = await Activity.findOne({_id:id})
    if(!exist){
        throw new ApiError(StatusCodes.NOT_FOUND,'Activity not found')
    }
    if(data.images?.length){
        exist.images?.forEach((image:string)=>{
            unlinkFile(image)
        })
    }
    if(data.address){
        const latlong = await googleHelper.getLatLongFromAddress(data.address)
        data.location = {
            type:"Point",
            coordinates:[latlong.lng,latlong.lat]
        }
    }
    const activity = await Activity.findOneAndUpdate({_id:id},data,{new:true})
    await RedisHelper.HKeyDelete(`activites`);
    return activity
}

const deleteActivityFromDB = async (id:string)=>{
    const activity = await Activity.findOneAndDelete({_id:id})
    activity?.images?.forEach((image:string)=>{
        unlinkFile(image)
    })
    await RedisHelper.HKeyDelete(`activites`);
    return activity
}

const getPopulerDestinations = async (query: Record<string, any>,user:JwtPayload)=>{

    const cache = await RedisHelper.redisGet(`preference:${user.id}`, query);
    if (cache) {
        console.log('from cache');
        return cache;
    }

    const homeItemQuery = new QueryBuilder(HomeItem.find({user:user.id}), query).paginate().sort()


    const [destinations,pagination]= await Promise.all([
        homeItemQuery.modelQuery.exec(),
        homeItemQuery.getPaginationInfo()
    ])

    const data = {
        data:destinations,
        pagination
    }

    await RedisHelper.redisSet(`preference:${user.id}`, data, query, 60);

    return data
}


export const ActivityServices = {
    createActivityIntoDB,
    getActivities,
    updateActivityIntoDB,
    deleteActivityFromDB,
    getPopulerDestinations
};
