import express from "express";
import { authControllers } from "./auth.controllers";

const router = express.Router();

router.post("/signup", authControllers.signup);
router.post("/signin", authControllers.signin);

export const authRoute = router;