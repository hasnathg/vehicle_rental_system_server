import express from "express";

import { vehicleControllers } from "./vehicles.controllers";

const router = express.Router();

router.post("/", vehicleControllers.createVehicle);

router.get("/", vehicleControllers.getVehicle);

router.get("/:vehicleId", vehicleControllers.getSingleVehicle);

router.put("/:vehicleId", vehicleControllers.updateVehicle);

router.delete("/:vehicleId", vehicleControllers.deleteVehicle);


export const vehiclesRoute = router;