import express, { Request, Response } from "express";
import { pool } from "../../config/db";

import { userServices } from "./users.services";
import { userControllers } from "./users.controllers";

const router = express.Router();

router.post('/', userControllers.createUser);

router.get("/", userControllers.getUser);

router.get("/:id", userControllers.getSingleUser);

router.put("/:id", userControllers.updateUser);

router.delete("/:id", userControllers.deleteUser);




export const usersRoute = router;
