"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.vehiclesRoute = void 0;
const express_1 = __importDefault(require("express"));
const vehicles_controllers_1 = require("./vehicles.controllers");
const auth_1 = require("../../middleware/auth");
const router = express_1.default.Router();
router.post("/", auth_1.requireAuth, (0, auth_1.requireRole)("admin"), vehicles_controllers_1.vehicleControllers.createVehicle);
router.get("/", vehicles_controllers_1.vehicleControllers.getVehicle);
router.get("/:vehicleId", vehicles_controllers_1.vehicleControllers.getSingleVehicle);
router.put("/:vehicleId", auth_1.requireAuth, (0, auth_1.requireRole)("admin"), vehicles_controllers_1.vehicleControllers.updateVehicle);
router.delete("/:vehicleId", auth_1.requireAuth, (0, auth_1.requireRole)("admin"), vehicles_controllers_1.vehicleControllers.deleteVehicle);
exports.vehiclesRoute = router;
