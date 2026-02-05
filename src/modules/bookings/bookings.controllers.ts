import { Request, Response } from "express";
import { bookingServices } from "./bookings.services";


const createBooking = async(req: Request, res: Response)=>{
    const {customer_id, vehicle_id, rent_start_date, rent_end_date, total_price, status} = req.body;
    try{
       const result = await bookingServices.createBooking(customer_id, vehicle_id, rent_start_date, rent_end_date, total_price, status) ;
       res.status(201).json({
        success: true,
        message: "Bookings created",
        data: result.rows[0]
       })
    } catch(err: any){
        res.status(500).json({
            success: false,
            message: err.message,
        });

    }
};

const getBooking = async(req: Request, res: Response)=>{
    try{
       const result = await bookingServices.getBooking() ;
       res.status(200).json({
        success: true,
        message: "Bookings retrived succesfully",
        data: result.rows,
       });
    }catch(err: any){
        res.status(500).json({
            success: false,
            message: err.message,
            details: err,
        });

    }
};


const getSingleBooking = async(req: Request, res: Response) => {
    try{
      const result = await bookingServices.getSingleBooking(req.params.id as string) ;

      if(result.rows.length === 0){
        res.status(404).json({
            success: false,
            message: "Bookings not found",
        });
      } else {
        res.status(200).json({
            status: true,
            message: "Booking fetched successfully",
            data: result.rows[0],
        });
      }
    } catch (err: any){
        res.status(500).json({
            status: false,
            message: err.message,
        });

    }
};

const updateBooking = async(req: Request, res: Response) => {
    const {customer_id, vehicle_id, rent_start_date, rent_end_date, total_price, status} = req.body;
    try{
        const result = await bookingServices.updateBooking(customer_id, vehicle_id, rent_start_date, rent_end_date, total_price, status, req.params.id as string) ;

        if(result.rows.length ===0){
            res.status(404).json({
                success: false,
                message: "Bookings not found",
            });
        } else{
            res.status(200).json({
                success: true,
                message: "Bookings updated successfully",
                data: result.rows[0],
            });
        }

    } catch(err: any){
        res.status(500).json({
            status: false,
            message: err.message,
        });
    }
};

const deleteBooking = async(req: Request, res: Response) => {
    try{
       const result = await bookingServices.deleteBooking(req.params.id as string);

       if (result.rowCount === 0){
        res.status(404).json({
            success: false,
            message: "Bookings not found",
        });
       } else{
        res.status(200).json({
            status: true,
            message: "Booking deleted successfully",
            data: null,
        });
       }
    } catch (err: any){
        res.status(500).json({
            status: false,
            message: err.message,
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