import express from "express";
import { userControllers } from "./users.controllers";
import { requireAdminOrSelf, requireAuth, requireRole } from "../../middleware/auth";

const router = express.Router();

// router.post('/', userControllers.createUser);

router.get("/", requireAuth, requireRole("admin"), userControllers.getUser);

router.get("/:userId", requireAuth, requireAdminOrSelf("userId"), userControllers.getSingleUser);

router.put("/:userId", requireAuth, requireAdminOrSelf("userId"), userControllers.updateUser);

router.delete("/:userId",  requireAuth, requireRole("admin"), userControllers.deleteUser);


export const usersRoute = router;
