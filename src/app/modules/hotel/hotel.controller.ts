import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { HotelService } from "./hotel.service";
import sendResponse from "../../../shared/sendResponse";
import { googleHelper } from "../../../helpers/googleMapHelper";

const getHotelList = catchAsync(async (req:Request,res:Response) => {
    const hotelList = await HotelService.getHotelsFromApis(req.query,req.user);
    sendResponse(res, {
        success: true,
        statusCode: 200,
        message: 'Hotels fetched successfully',
        data: hotelList.data,
        pagination: hotelList.pagination
    })
})

const getActiviesForHome = catchAsync(async (req:Request,res:Response) => {
    const activites = await HotelService.getActiviesForHome(req.user,req.query);
    sendResponse(res, {
        success: true,
        statusCode: 200,
        message: 'Activites fetched successfully',
        data: activites.data,
        pagination: activites.pagination
    })
})

const getSingleDetails = catchAsync(async (req:Request,res:Response) => {
    const activites = await HotelService.singleHomeDetails(req.params.id,req.query,req.user);
    sendResponse(res, {
        success: true,
        statusCode: 200,
        message: 'Activites fetched successfully',
        data: activites
    })
})

const searchHotelsByLocation = catchAsync(async (req:Request,res:Response) => {

    const activites = await HotelService.getHotelsListFromApis(req.query,req.user);
    sendResponse(res, {
        success: true,
        statusCode: 200,
        message: 'Activites fetched successfully',
        data: activites.data,
        pagination: activites.pagination
    })
})

const bookHotel = catchAsync(async (req:Request,res:Response) => {
    const activites = await HotelService.bookHotelIntoApis(req.body,req.user);
    sendResponse(res, {
        success: true,
        statusCode: 200,
        message: 'Activites fetched successfully',
        data: activites
    })
})

const getAllBookings = catchAsync(async (req:Request,res:Response) => {
    const activites = await HotelService.getHotelBookingList(req.user,req.query);

    sendResponse(res, {
        success: true,
        statusCode: 200,
        message: 'Activites fetched successfully',
        data: activites.data,
        pagination: activites.pagination
    })
})

const discoverPlaces = catchAsync(async (req:Request,res:Response) => {
    const activites = await HotelService.discoverPlaces(req.query,req.user);
    sendResponse(res, {
        success: true,
        statusCode: 200,
        message: 'Activites fetched successfully',
        data: activites.data,
        pagination: activites.pagination
    })
})


export const HotelController = {
    getHotelList,
    getActiviesForHome,
    getSingleDetails,
    searchHotelsByLocation,
    bookHotel,
    getAllBookings,
    discoverPlaces
}