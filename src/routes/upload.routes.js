import express from "express";
import * as uploadController from "../controllers/upload.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { uploadSingle, handleUploadError } from "../middlewares/upload.middleware.js";

const router = express.Router();

/**
 * @route   POST /api/upload
 * @desc    Upload un fichier GLB vers R2
 * @access  Private
 */
router.post(
  "/",
  authenticate,
  uploadSingle,
  handleUploadError,
  uploadController.uploadFile
);

export default router;
