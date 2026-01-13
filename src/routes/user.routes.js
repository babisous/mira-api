import express from "express";
import * as userController from "../controllers/user.controller.js";
import * as artworkController from "../controllers/artwork.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = express.Router();

/**
 * @route   GET /api/users
 * @desc    Récupère tous les utilisateurs avec pagination
 * @access  Public
 */
router.get("/", userController.getAllUsers);

/**
 * @route   GET /api/users/me
 * @desc    Récupère le profil de l'utilisateur connecté
 * @access  Private
 */
router.get("/me", authenticate, userController.getMyProfile);

/**
 * @route   PUT /api/users/me
 * @desc    Met à jour le profil de l'utilisateur connecté
 * @access  Private
 */
router.put("/me", authenticate, userController.updateMyProfile);

/**
 * @route   PUT /api/users/me/password
 * @desc    Change le mot de passe de l'utilisateur connecté
 * @access  Private
 */
router.put("/me/password", authenticate, userController.changePassword);

/**
 * @route   GET /api/users/:id
 * @desc    Récupère le profil d'un utilisateur par son ID
 * @access  Public
 */
router.get("/:id", userController.getUserById);

/**
 * @route   GET /api/users/:userId/artworks
 * @desc    Récupère toutes les œuvres d'un utilisateur
 * @access  Public
 */
router.get("/:userId/artworks", artworkController.getArtworksByUserId);

export default router;
