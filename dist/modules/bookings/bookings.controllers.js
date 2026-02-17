"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bookingControllers = void 0;
const bookings_services_1 = require("./bookings.services");
const createBooking = async (req, res) => {
    try {
        const { customer_id, vehicle_id, rent_start_date, rent_end_date } = req.body;
        if (customer_id === undefined || vehicle_id === undefined || !rent_start_date || !rent_end_date) {
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
        const result = await bookings_services_1.bookingServices.createBooking(Number(customer_id), Number(vehicle_id), new Date(rent_start_date), new Date(rent_end_date));
        return res.status(201).json({
            success: true,
            message: "Booking created successfully",
            data: result,
        });
    }
    catch (err) {
        const msg = String(err.message || "");
        const isBadRequest = msg.includes("not available") || msg.includes("Invalid rental period") || msg.includes("Vehicle not found");
        return res.status(isBadRequest ? 400 : 500).json({
            success: false,
            message: isBadRequest ? "Bad request" : "Internal server error",
            errors: err.message,
        });
    }
};
const getBooking = async (req, res) => {
    try {
        const user = req.user;
        const result = user.role === "admin" ? await bookings_services_1.bookingServices.getBookingsForAdmin() : await bookings_services_1.bookingServices.getBookingsForCustomer(user.id);
        return res.status(200).json({
            success: true,
            message: result.length ? "Bookings retrived succesfully" : "Your bookings retrieved successfully",
            data: result,
        });
    }
    catch (err) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            errors: err.message,
        });
    }
};
const getSingleBooking = async (req, res) => {
    try {
        const bookingId = Number(req.params.bookingId);
        if (Number.isNaN(bookingId)) {
            return res.status(400).json({
                success: false,
                message: "Validation error",
                errors: "bookingId must be a number",
            });
        }
        const user = req.user;
        const result = await bookings_services_1.bookingServices.getSingleBookingScoped(bookingId, user.role, user.id);
        if (!result) {
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
    }
    catch (err) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            errors: err.message,
        });
    }
};
const updateBooking = async (req, res) => {
    try {
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
        const user = req.user;
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
        const result = await bookings_services_1.bookingServices.updateBookingScoped(bookingId, statusStr, user.role, user.id);
        if (!result) {
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
    }
    catch (err) {
        const msg = String(err.message || "");
        const isBadRequest = msg.includes("Invalid status") || msg.includes("Cannot cancel booking after start date");
        return res.status(isBadRequest ? 400 : 500).json({
            success: false,
            message: isBadRequest ? "Bad request" : "Internal server error",
            errors: err.message,
        });
    }
};
const deleteBooking = async (req, res) => {
    try {
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
        const result = await bookings_services_1.bookingServices.deleteBooking(bookingId);
        if (!result) {
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
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: "Internal server error",
            errors: err.message,
        });
    }
};
exports.bookingControllers = {
    createBooking,
    getBooking,
    getSingleBooking,
    updateBooking,
    deleteBooking,
};
