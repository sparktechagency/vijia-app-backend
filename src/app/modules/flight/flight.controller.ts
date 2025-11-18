import { Request, Response, NextFunction } from 'express';
import { FlightServices } from './flight.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { convertTime } from './flight.helpers';
const getFlightOffers = catchAsync(async (req:Request,res:Response) => {

    const flightOffers = await FlightServices.getFlightsListUsingGeoCode(req.body,req.user);
    sendResponse(res, {
        success: true,
        statusCode: 200,
        message: 'Flight offers fetched successfully',
        data: flightOffers
    })
})

const getSingleFlightOffer = catchAsync(async (req:Request,res:Response) => {

    
    const flightOffer = await FlightServices.getSingleFlightOffer(req.body?.offer);
    sendResponse(res, {
        success: true,
        statusCode: 200,
        message: 'Flight offer fetched successfully',
        data: flightOffer
    })
})

const createFlightBooking = catchAsync(async (req:Request,res:Response) => {
    const flightOffer = await FlightServices.bookFlight(req.body,req.user);
    sendResponse(res, {
        success: true,
        statusCode: 200,
        message: 'Flight offer fetched successfully',
        data: flightOffer
    })
})

const getOrderDetails = catchAsync(async (req:Request,res:Response) => {
    const flightOffer = await FlightServices.getSingleFlightOrderDetails(req.params.id);
    sendResponse(res, {
        success: true,
        statusCode: 200,
        message: 'Flight offer fetched successfully',
        data: flightOffer
    })
})

const getFlightOrderlist = catchAsync(async (req:Request,res:Response) => {
    const flightOffer = await FlightServices.getFlightBookingListFromDB(req.user,req.query);
    sendResponse(res, {
        success: true,
        statusCode: 200,
        message: 'Flight offer fetched successfully',
        data: flightOffer.data,
        pagination: flightOffer.pagination
    })
})
export const FlightController = {
    getFlightOffers,
    getSingleFlightOffer,
    createFlightBooking,
    getOrderDetails,
    getFlightOrderlist
 };
