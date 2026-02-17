"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.vehicleControllers = void 0;
const vehicles_services_1 = require("./vehicles.services");
const ALLOWED_VEHICLE_TYPES = ["car", "bike", "van", "SUV"];
const ALLOWED_AVAILABILITY = ["available", "booked"];
const createVehicle = async (req, res) => {
    try {
        const { vehicle_name, type, registration_number, daily_rent_price, availability_status } = req.body;
        if (!vehicle_name || !type || !registration_number || daily_rent_price === undefined || !availability_status) {
            return res.status(400).json({
                success: false,
                message: "Validation error",
                errors: "vehicle_name, type, registration_number, daily_rent_price, availability_status are required",
            });
        }
        const typeStr = String(type);
        if (!ALLOWED_VEHICLE_TYPES.includes(typeStr)) {
            return res.status(400).json({
                success: false,
                message: "Validation error",
                errors: "type must be 'car', 'bike', 'van' or 'SUV'",
            });
        }
        const statusStr = String(availability_status);
        if (!ALLOWED_AVAILABILITY.includes(statusStr)) {
            return res.status(400).json({
                success: false,
                message: "Validation error",
                errors: "availability_status must be 'available' or 'booked'",
            });
        }
        const priceNum = Number(daily_rent_price);
        if (!Number.isFinite(priceNum) || priceNum <= 0) {
            return res.status(400).json({
                success: false,
                message: "Validation error",
                errors: "daily_rent_price must be a positive number",
            });
        }
        const result = await vehicles_services_1.vehicleServices.createVehicle(String(vehicle_name), typeStr, String(registration_number), priceNum, statusStr);
        return res.status(201).json({
            success: true,
            message: "Vehicles created successfully",
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
const getVehicle = async (req, res) => {
    try {
        const result = await vehicles_services_1.vehicleServices.getVehicle();
        return res.status(200).json({
            success: true,
            message: result.length ? "Vehicles retrieved successfully" : "No vehicles found",
            data: result,
        });
    }
    catch (err) {
        return res.status(500).json({
            sussess: false,
            message: "Internal server error",
            errors: err.message,
        });
    }
};
const getSingleVehicle = async (req, res) => {
    try {
        const vehicleId = Number(req.params.vehicleId);
        if (Number.isNaN(vehicleId)) {
            return res.status(400).json({
                success: false,
                message: "Validation error",
                errors: "vehicleId must be a number",
            });
        }
        const result = await vehicles_services_1.vehicleServices.getSingleVehicle(vehicleId);
        if (!result) {
            return res.status(404).json({
                success: false,
                message: "Vehicle not found",
                errors: "Vehicle not found",
            });
        }
        return res.status(200).json({
            success: true,
            message: "Vehicle retrived succesfully",
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
const updateVehicle = async (req, res) => {
    try {
        const vehicleId = Number(req.params.vehicleId);
        if (Number.isNaN(vehicleId)) {
            return res.status(400).json({
                success: false,
                message: "Validation error",
                errors: "vehicleId must be a number",
            });
        }
        const { vehicle_name, type, registration_number, daily_rent_price, availability_status } = req.body;
        const payload = {};
        if (vehicle_name !== undefined)
            payload.vehicle_name = String(vehicle_name);
        if (type !== undefined) {
            const typeStr = String(type);
            if (!ALLOWED_VEHICLE_TYPES.includes(typeStr)) {
                return res.status(400).json({
                    success: false,
                    message: "Validation error",
                    errors: "type must be 'car', 'bike', 'van' or 'SUV'",
                });
            }
            payload.type = typeStr;
        }
        if (registration_number !== undefined)
            payload.registration_number = String(registration_number);
        if (daily_rent_price !== undefined) {
            const priceNum = Number(daily_rent_price);
            if (!Number.isFinite(priceNum) || priceNum <= 0) {
                return res.status(400).json({
                    success: false,
                    message: "Validation error",
                    errors: "daily_rent_price must be a positive number",
                });
            }
            payload.daily_rent_price = priceNum;
        }
        if (availability_status !== undefined) {
            const statusStr = String(availability_status);
            if (!ALLOWED_AVAILABILITY.includes(statusStr)) {
                return res.status(400).json({
                    success: false,
                    message: "Validation error",
                    errors: "availability_status must be 'available' or 'booked'",
                });
            }
            payload.availability_status = statusStr;
        }
        const result = await vehicles_services_1.vehicleServices.updateVehicle(vehicleId, payload);
        if (!result) {
            return res.status(404).json({
                success: false,
                message: "Vehicle not found",
                errors: "Vehicle not found",
            });
        }
        return res.status(200).json({
            success: true,
            message: "Vehicle updated succesfully",
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
const deleteVehicle = async (req, res) => {
    try {
        const vehicleId = Number(req.params.vehicleId);
        if (Number.isNaN(vehicleId)) {
            return res.status(400).json({
                success: false,
                message: "Validation error",
                errors: "vehicleId must be a number",
            });
        }
        const result = await vehicles_services_1.vehicleServices.deleteVehicle(vehicleId);
        if (!result) {
            return res.status(404).json({
                success: false,
                message: "Vehicle not found",
                errors: "Vehicle not found",
            });
        }
        return res.status(200).json({
            success: true,
            message: "Vehicle deleted succesfully",
            data: null,
        });
    }
    catch (err) {
        const msg = String(err.message || "");
        const isBadRequest = msg.includes("Cannot delete vehicle with active bookings");
        return res.status(isBadRequest ? 400 : 500).json({
            success: false,
            message: isBadRequest ? "Bad request" : "Internal server error",
            errors: err.message,
        });
    }
};
exports.vehicleControllers = {
    createVehicle,
    getVehicle,
    getSingleVehicle,
    updateVehicle,
    deleteVehicle,
};
