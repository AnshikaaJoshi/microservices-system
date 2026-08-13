import express from "express";
import * as userController from "../controllers/user.controller.js";
import authenticate from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/login", userController.loginUser);

router.get("/", authenticate, userController.getUsers);

router.post("/", userController.createUser);

export default router;