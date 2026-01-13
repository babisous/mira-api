import express from "express";
import anchorController from "../controllers/anchor.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = express.Router();

/**
 * @route   GET /api/anchors
 * @desc    Récupère tous les anchors
 * @access  Public
 */
router.get("/", (req, res) => anchorController.getAll(req, res));

/**
 * @route   POST /api/anchors/:artworkId
 * @desc    Crée ou met à jour l'anchor d'une œuvre
 * @access  Private
 */
router.post("/:artworkId", authenticate, (req, res) =>
  anchorController.createOrUpdate(req, res)
);

/**
 * @route   GET /api/anchors/:artworkId
 * @desc    Récupère l'anchor d'une œuvre
 * @access  Public
 */
router.get("/:artworkId", (req, res) =>
  anchorController.getByArtworkId(req, res)
);

/**
 * @route   DELETE /api/anchors/:artworkId
 * @desc    Supprime l'anchor d'une œuvre
 * @access  Private
 */
router.delete("/:artworkId", authenticate, (req, res) =>
  anchorController.delete(req, res)
);

export default router;
