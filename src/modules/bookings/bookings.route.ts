import express from "express";
import { bookingControllers } from "./bookings.controllers";


const router = express.Router();

router.post('/', bookingControllers.createBooking);

router.get('/', bookingControllers.getBooking);

router.get('/:id', bookingControllers.getSingleBooking);

router.put('/:id', bookingControllers.updateBooking);

router.delete('/:id', bookingControllers.deleteBooking);



export const bookingsRoute = router;