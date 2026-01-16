import express from "express";

const router = express.Router();

const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || "https://pub-a7f280f2f7564ef5922717e823d764f0.r2.dev";

/**
 * GET /api/proxy/models/:filename
 * Proxy pour récupérer les fichiers .glb depuis R2 avec les headers CORS
 */
router.get("/models/:filename", async (req, res) => {
  try {
    const { filename } = req.params;
    const r2Url = `${R2_PUBLIC_URL}/artworks/${filename}`;

    const response = await fetch(r2Url);

    if (!response.ok) {
      return res.status(404).json({
        success: false,
        error: "Fichier non trouvé",
      });
    }

    // Définir les headers pour le fichier .glb
    res.set({
      "Content-Type": response.headers.get("content-type") || "model/gltf-binary",
      "Content-Length": response.headers.get("content-length"),
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=31536000",
    });

    // Streamer le fichier
    const arrayBuffer = await response.arrayBuffer();
    res.send(Buffer.from(arrayBuffer));
  } catch (error) {
    console.error("Erreur proxy R2:", error);
    res.status(500).json({
      success: false,
      error: "Erreur lors de la récupération du fichier",
    });
  }
});

export default router;
