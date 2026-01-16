import express from "express";
import * as artworkController from "../controllers/artwork.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = express.Router();

/**
 * @route   GET /api/artworks
 * @desc    Récupère toutes les œuvres avec pagination
 * @access  Public
 */
router.get("/", artworkController.getAllArtworks);

/**
 * @route   GET /api/artworks/search
 * @desc    Recherche des œuvres par titre ou nom d'artiste
 * @access  Public
 */
router.get("/search", artworkController.searchArtworks);

/**
 * @route   GET /api/artworks/:id
 * @desc    Récupère une œuvre par son ID
 * @access  Public
 */
router.get("/:id", artworkController.getArtworkById);

/**
 * @route   POST /api/artworks
 * @desc    Crée une nouvelle œuvre
 * @access  Private (nécessite authentification)
 */
router.post("/", authenticate, artworkController.createArtwork);

/**
 * @route   PUT /api/artworks/:id
 * @desc    Met à jour une œuvre
 * @access  Private (nécessite authentification + propriété)
 */
router.put("/:id", authenticate, artworkController.updateArtwork);

/**
 * @route   DELETE /api/artworks/:id
 * @desc    Supprime une œuvre
 * @access  Private (nécessite authentification + propriété)
 */
router.delete("/:id", authenticate, artworkController.deleteArtwork);

export default router;
