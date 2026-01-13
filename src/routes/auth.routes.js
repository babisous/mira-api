import express from "express";
import authController from "../controllers/auth.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Inscription d'un nouvel utilisateur
 * @access  Public
 */
router.post("/register", authController.register.bind(authController));

/**
 * @route   POST /api/auth/login
 * @desc    Connexion d'un utilisateur
 * @access  Public
 */
router.post("/login", authController.login.bind(authController));

/**
 * @route   GET /api/auth/me
 * @desc    Vérification du token JWT
 * @access  Private
 */
router.get("/me", authenticate, authController.me.bind(authController));

export default router;
