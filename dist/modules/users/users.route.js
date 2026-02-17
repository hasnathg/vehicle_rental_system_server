"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.usersRoute = void 0;
const express_1 = __importDefault(require("express"));
const users_controllers_1 = require("./users.controllers");
const auth_1 = require("../../middleware/auth");
const router = express_1.default.Router();
// router.post('/', userControllers.createUser);
router.get("/", auth_1.requireAuth, (0, auth_1.requireRole)("admin"), users_controllers_1.userControllers.getUser);
router.get("/:userId", auth_1.requireAuth, (0, auth_1.requireAdminOrSelf)("userId"), users_controllers_1.userControllers.getSingleUser);
router.put("/:userId", auth_1.requireAuth, (0, auth_1.requireAdminOrSelf)("userId"), users_controllers_1.userControllers.updateUser);
router.delete("/:userId", auth_1.requireAuth, (0, auth_1.requireRole)("admin"), users_controllers_1.userControllers.deleteUser);
exports.usersRoute = router;
