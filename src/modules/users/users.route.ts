import { Request, Response, Router } from "express";
import { userController } from "./users.controllers";

const router = Router()

router.post('/', userController.createUser)


export const usersRoute = router
