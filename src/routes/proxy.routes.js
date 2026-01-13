import express from "express";
import r2Service from "../services/r2.service.js";

const router = express.Router();

/**
 * GET /api/proxy/models/:filename
 * Proxy pour récupérer les fichiers .glb depuis R2 avec les headers CORS
 */
router.get("/models/:filename", async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = `artworks/${filename}`;

    const response = await r2Service.getFile(filePath);

    // Définir les headers pour le fichier .glb
    res.set({
      "Content-Type": response.ContentType || "model/gltf-binary",
      "Content-Length": response.ContentLength,
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=31536000",
    });

    // Streamer le fichier
    response.Body.pipe(res);
  } catch (error) {
    console.error("Erreur proxy R2:", error);
    res.status(404).json({
      success: false,
      error: "Fichier non trouvé",
    });
  }
});

export default router;
