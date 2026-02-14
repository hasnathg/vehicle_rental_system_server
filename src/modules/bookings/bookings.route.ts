import express from "express";
import { bookingControllers } from "./bookings.controllers";


const router = express.Router();

router.post('/', bookingControllers.createBooking);

router.get('/', bookingControllers.getBooking);

router.get('/:bookingId', bookingControllers.getSingleBooking);

router.put('/:bookingId', bookingControllers.updateBooking);

router.delete('/:bookingId', bookingControllers.deleteBooking);



export const bookingsRoute = router;