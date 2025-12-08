import { USER_ROLES } from "../../../enums/user";
import QueryBuilder from "../../builder/QueryBuilder";
import { IFlightBookingRecord } from "../flight/flight.interface";
import { FlightBookingRecord } from "../flight/flight.model";
import { BookingRecord } from "../hotel/hotel.model";
import { Subscription } from "../subscription/subscription.model";
import { User } from "../user/user.model";

const getYearStartAndEndDate = (year:number=new Date().getFullYear()) => {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);
    return {startDate,endDate}
}

const getAnalytics =async (query:Record<string,any>) => {
    const revinueYear = getYearStartAndEndDate(query.revinueYear)
    const bookingYear = getYearStartAndEndDate(query.bookingYear)
    const totalUsers = await User.countDocuments({role:USER_ROLES.USER,status:'active',verified:true});
    const totalFlightBookings = await FlightBookingRecord.countDocuments();
    const totalHotelBookings = await BookingRecord.countDocuments();
    const totalBookings = totalFlightBookings + totalHotelBookings;

    const totalSubscriptionsAmount = await Subscription.aggregate([{$group:{_id:null,totalAmount:{$sum:"$price"}}}])
    const toalRevinue = totalSubscriptionsAmount.length > 0 ? totalSubscriptionsAmount[0].totalAmount : 0

    const summury = {
        totalUsers,
        totalBookings,
        totalRevinue:toalRevinue
    }
    
    const subscriptionSumMonthwise = await Subscription.aggregate([
        {$match:{createdAt:{$gte:revinueYear.startDate,$lte:revinueYear.endDate}}},
        {$group:{_id:{$month:"$createdAt"},totalAmount:{$sum:"$price"}}},
        {$project:{month:"$_id",totalAmount:1,_id:0}}
    ])

    const flightBookingByMonth = await FlightBookingRecord.aggregate([
        {$match:{createdAt:{$gte:bookingYear.startDate,$lte:bookingYear.endDate}}},
        {$group:{_id:{$month:"$createdAt"},totalBookings:{$sum:1}}},
        {$project:{month:"$_id",totalBookings:1,_id:0}}
    ])

    console.log(flightBookingByMonth);
    

    const hotelBookingByMonth = await BookingRecord.aggregate([
        {$match:{createdAt:{$gte:bookingYear.startDate,$lte:bookingYear.endDate}}},
        {$group:{_id:{$month:"$createdAt"},totalBookings:{$sum:1}}},
        {$project:{month:"$_id",totalBookings:1,_id:0}}
    ])

    const months = {
        1:'Jan',2:'Feb',3:'Mar',4:'Apr',5:'May',6:'Jun',7:'Jul',8:'Aug',9:'Sep',10:'Oct',11:'Nov',12:'Dec'
    }

    const subscriptionMonthWise = []
    const totalBookingsMonthWise = []

    for(let month in months){
        subscriptionMonthWise.push({
            month:months[Number(month) as keyof typeof months],
            totalAmount:(subscriptionSumMonthwise.find((s:any) => s.month == month)?.totalAmount as number)?.toFixed(2) || 0
        })
        totalBookingsMonthWise.push({
            month:months[Number(month) as keyof typeof months],
            totalBookings:(flightBookingByMonth.find((f:any) => f.month == month)?.totalBookings||0 + hotelBookingByMonth.find((h:any) => h.month == month)?.totalBookings||0 as number)|| 0
        })
    }

    return {
        summury,
        subscriptionMonthWise,
        totalBookingsMonthWise
    }
};


const getAllBookingsFromDb = async (query:Record<string,any>) => {
    const flightBookings = await FlightBookingRecord.countDocuments()
    const hotelBookings = await BookingRecord.countDocuments()
    const carrentalBookings = 0


if(query.type=="flight"){
    
    const FlightBookings = new QueryBuilder(FlightBookingRecord.find({},{bookingId:1,user:1,createdAt:1,flights:1,status:1,totalPrice:1,currency:1}),query).paginate().sort().search(['bookingId'])

    const [bookings,pagination] = await Promise.all([
        FlightBookings.modelQuery.populate('user','name email image').exec(),
        FlightBookings.getPaginationInfo()
    ])

    return {
        data:bookings?.map((booking:any) => {
            const record:IFlightBookingRecord = booking.toObject()
            const flight = record.flights?.[0]
            {
                delete (record as any).flights
                return {
                    ...record,
                    to:flight.to,
                    from:flight.from,
                    departureDate:flight.departureTime,
                    airline:flight.airline,
                    flightNumber:flight.flightNumber,
                    type:'flight'
                }
            }
        }),
        pagination,
        summury:{
            totalFlightBookings:flightBookings,
            totalHotelBookings:hotelBookings,
            totalCarrentalBookings:carrentalBookings
        }
    }

}
else{
    const HotelBookings =new QueryBuilder(BookingRecord.find({},{user:1,createdAt:1,checkIn:1,checkOut:1,hotelId:1,hotelName:1,totalPrice:1,bookingId:1}),query).paginate().sort().search(['hotelName','hotelId','bookingId'])

    const [bookings,pagination] = await Promise.all([
        HotelBookings.modelQuery.populate('user','name email image').exec(),
        HotelBookings.getPaginationInfo()
    ])

    return {
        data:bookings?.map((booking:any) => {
            return {
                ...booking.toObject(),
                type:"hotel"
            }
        }),
        pagination,
        summury:{
            totalFlightBookings:flightBookings,
            totalHotelBookings:hotelBookings,
            totalCarrentalBookings:carrentalBookings
        }
    }
}


}

export const DashboardServices = {
    getAnalytics,
    getAllBookingsFromDb
};
