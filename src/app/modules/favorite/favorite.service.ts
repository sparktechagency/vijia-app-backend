import { JwtPayload } from 'jsonwebtoken';
import {IFavorite } from './favorite.interface';
import { Favorite } from './favorite.model';
import QueryBuilder from '../../builder/QueryBuilder';

const createFavarite = async (data: IFavorite, user:JwtPayload) => {
    const isExist = await Favorite.findOne({ refId: data.refId, user: user.id });
    if (isExist) {
        await Favorite.findOneAndDelete({ refId: data.refId });
        return {
            message: 'Removed from favorite',
            success: true,
        }
    }
    const result = await Favorite.create({ ...data, user: user.id });
    return {
        message: 'Added to favorite',
        success: true,
    }
};

const getFavoriteList = async (user:JwtPayload) => {
    const favoriteQuery = new QueryBuilder(Favorite.find({ user: user.id }), {}).paginate().sort()
    const [bookings,pagination] = await Promise.all([
        favoriteQuery.modelQuery.exec(),
        favoriteQuery.getPaginationInfo()
    ])

    return {
        data:bookings,
        pagination
    }
};




export const FavoriteServices = {
    createFavarite,
    getFavoriteList
 };
