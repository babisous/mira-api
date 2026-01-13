import r2Service from "../services/r2.service.js";

/**
 * Upload un fichier GLB
 * POST /api/upload
 * Requiert authentification
 */
export const uploadFile = async (req, res) => {
  try {
    // Vérifier qu'un fichier a été envoyé
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "Aucun fichier fourni",
      });
    }

    // Upload vers R2
    const uploadResult = await r2Service.uploadFile(req.file);

    return res.status(200).json({
      success: true,
      message: "Fichier uploadé avec succès",
      data: uploadResult,
    });
  } catch (error) {
    console.error("Erreur lors de l'upload:", error);

    if (error.message === "UPLOAD_FAILED") {
      return res.status(500).json({
        success: false,
        error: "Erreur lors de l'upload du fichier",
      });
    }

    return res.status(500).json({
      success: false,
      error: "Erreur serveur lors de l'upload",
    });
  }
};
