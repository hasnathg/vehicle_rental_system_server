import express, { Request, Response } from "express";
import { userControllers } from "./users.controllers";

const router = express.Router();

router.post('/', userControllers.createUser);

router.get("/", userControllers.getUser);

router.get("/:userId", userControllers.getSingleUser);

router.put("/:userId", userControllers.updateUser);

router.delete("/:userId", userControllers.deleteUser);




export const usersRoute = router;
