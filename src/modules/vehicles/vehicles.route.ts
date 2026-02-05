import express from "express";

import { vehicleControllers } from "./vehicles.controllers";

const router = express.Router();

router.post("/", vehicleControllers.createVehicle);

router.get("/", vehicleControllers.getVehicle);

router.get("/:id", vehicleControllers.getSingleVehicle);

router.put("/:id", vehicleControllers.updateVehicle);

router.delete("/:id", vehicleControllers.deleteVehicle);


export const vehiclesRoute = router;