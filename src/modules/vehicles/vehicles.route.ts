import express from "express";

import { vehicleControllers } from "./vehicles.controllers";
import { requireAuth, requireRole } from "../../middleware/auth";

const router = express.Router();

router.post("/", requireAuth, requireRole("admin"), vehicleControllers.createVehicle);

router.get("/", vehicleControllers.getVehicle);

router.get("/:vehicleId", vehicleControllers.getSingleVehicle);

router.put("/:vehicleId", requireAuth, requireRole("admin"), vehicleControllers.updateVehicle);

router.delete("/:vehicleId", requireAuth, requireRole("admin"), vehicleControllers.deleteVehicle);


export const vehiclesRoute = router;