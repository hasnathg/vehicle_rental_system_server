import { Request, Response } from "express";
import { bookingServices } from "./bookings.services";


const createBooking = async(req: Request, res: Response)=>{
    
    try{
        const {customer_id, vehicle_id, rent_start_date, rent_end_date} = req.body;

       if (customer_id === undefined || vehicle_id === undefined || !rent_start_date || !rent_end_date){
        return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: "customer_id, vehicle_id, rent_start_date, rent_end_date are required",
       });

       }

        if (req.user?.role === "customer" && Number(customer_id) !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
        errors: "Customers can only create bookings for themselves",
      });
    }

       const result = await bookingServices.createBooking(
        Number(customer_id), Number(vehicle_id), new Date(rent_start_date), new Date(rent_end_date)
       );

       return res.status(201).json({
        success: true,
        message: "Booking created successfully",
        data: result,
       });
       
    } catch(err: any){
        const msg = String(err.message || "");
        const isBadRequest = msg.includes("not available") || msg.includes("Invalid rental period") || msg.includes("Vehicle not found");

        return res.status(isBadRequest ? 400 : 500).json({
            success: false,
            message: isBadRequest ? "Bad request" : "Internal server error",
            errors: err.message,
        });

    }
};

const getBooking = async(req: Request, res: Response)=>{
    try{
        const user = req.user!;
       const result = user.role === "admin" ? await bookingServices.getBookingsForAdmin() : await bookingServices.getBookingsForCustomer(user.id) ;

       return res.status(200).json({
        success: true,
        message: result.length ? "Bookings retrived succesfully" : "Your bookings retrieved successfully",
        data: result,
       });
    }catch(err: any){
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            errors: err.message,
        });

    }
};


const getSingleBooking = async(req: Request, res: Response) => {
    try{
        const bookingId = Number(req.params.bookingId);
        if (Number.isNaN(bookingId)){
            return res.status(400).json({
             success: false,
             message: "Validation error",
             errors: "bookingId must be a number",   
            });
        }
        
        const user = req.user!;
        const result = await bookingServices.getSingleBookingScoped(bookingId, user.role, user.id) ;

      if(!result){
        return res.status(404).json({
            success: false,
            message: "Bookings not found",
            errors: "Booking not found",
        });
      }
        return res.status(200).json({
            success: true,
            message: "Booking retrieved successfully",
            data: result,
        });
      
    } catch (err: any){
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            errors: err.message,
        });
    }
};

const updateBooking = async(req: Request, res: Response) => {
  
    try{
        const bookingId = Number(req.params.bookingId);
         if (Number.isNaN(bookingId)) {
         return res.status(400).json({
         success: false,
         message: "Validation error",
         errors: "bookingId must be a number",
        });
        }

        const { status } = req.body;
        if (!status) {
        return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: "status is required",
      });
    }

    const user = req.user!;
    const statusStr = String(status);

    if (user.role === "customer" && statusStr !== "cancelled") {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
        errors: "Customers can only cancel bookings",
      });
    }
    if (user.role === "admin" && statusStr !== "returned") {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
        errors: "Admins can only mark bookings as returned",
      });
    }


    const result = await bookingServices.updateBookingScoped(bookingId,  statusStr,
      user.role, user.id) ;

        if(!result){
            return res.status(404).json({
                success: false,
                message: "Bookings not found",
                errors: "Bookings not found",
            });
        } 
            return res.status(200).json({
                success: true,
                message: statusStr === "returned" ? "Booking marked as returned. Vehicle is now available" : "Bookings cancelled successfully",
                data: result,
            });
        

    } catch(err: any){
        const msg = String(err.message || "");
        const isBadRequest = msg.includes("Invalid status") || msg.includes("Cannot cancel booking after start date");

        return res.status(isBadRequest ? 400 : 500).json({
            success: false,
            message: isBadRequest ? "Bad request" : "Internal server error",
            errors: err.message,
        });
    }
};

const deleteBooking = async(req: Request, res: Response) => {
    try{

         if (req.user?.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
        errors: "Admin access required",
      });
    }
        const bookingId = Number(req.params.bookingId);
    if (Number.isNaN(bookingId)) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: "bookingId must be a number",
      });
    }

       const result = await bookingServices.deleteBooking(bookingId);

       if (!result){
        return res.status(404).json({
            success: false,
            message: "Bookings not found",
            errors: "Bookings not found",
        });
       } 
        return res.status(200).json({
            success: true,
            message: "Booking deleted successfully",
            data: null,
        });
       
    } catch (err: any){
        res.status(500).json({
            success: false,
            message: "Internal server error",
            errors: err.message,
        });

    }
};

export const bookingControllers = {
    createBooking,
    getBooking,
    getSingleBooking,
    updateBooking,
    deleteBooking,
}