"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const db_1 = __importDefault(require("./config/db"));
const config_1 = __importDefault(require("./config"));
const users_route_1 = require("./modules/users/users.route");
const vehicles_route_1 = require("./modules/vehicles/vehicles.route");
const bookings_route_1 = require("./modules/bookings/bookings.route");
const auth_route_1 = require("./modules/auth/auth.route");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.get('/', (req, res) => {
    res.status(200).json({
        message: "This is the root route",
        path: req.path
    });
});
app.use("/api/v1/auth", auth_route_1.authRoute);
app.use('/api/v1/users', users_route_1.usersRoute);
app.use('/api/v1/vehicles', vehicles_route_1.vehiclesRoute);
app.use('/api/v1/bookings', bookings_route_1.bookingsRoute);
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: " Route not found",
        path: req.path,
    });
});
const startServer = async () => {
    try {
        await (0, db_1.default)();
        app.listen(config_1.default.port, () => {
            console.log(`Server is running on port ${config_1.default.port}`);
        });
    }
    catch (err) {
        console.error("Failed to start server:", err);
    }
};
startServer();
