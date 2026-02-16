import express from "express";
import { bookingControllers } from "./bookings.controllers";
import { requireAuth } from "../../middleware/auth";


const router = express.Router();

router.post('/', requireAuth, bookingControllers.createBooking);

router.get('/', requireAuth, bookingControllers.getBooking);

router.get('/:bookingId', requireAuth,  bookingControllers.getSingleBooking);

router.put('/:bookingId', requireAuth, bookingControllers.updateBooking);

router.delete('/:bookingId', requireAuth,  bookingControllers.deleteBooking);



export const bookingsRoute = router;