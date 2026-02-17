"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bookingsRoute = void 0;
const express_1 = __importDefault(require("express"));
const bookings_controllers_1 = require("./bookings.controllers");
const auth_1 = require("../../middleware/auth");
const router = express_1.default.Router();
router.post('/', auth_1.requireAuth, bookings_controllers_1.bookingControllers.createBooking);
router.get('/', auth_1.requireAuth, bookings_controllers_1.bookingControllers.getBooking);
router.get('/:bookingId', auth_1.requireAuth, bookings_controllers_1.bookingControllers.getSingleBooking);
router.put('/:bookingId', auth_1.requireAuth, bookings_controllers_1.bookingControllers.updateBooking);
router.delete('/:bookingId', auth_1.requireAuth, bookings_controllers_1.bookingControllers.deleteBooking);
exports.bookingsRoute = router;
