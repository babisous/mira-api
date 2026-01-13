import multer from "multer";

/**
 * Configuration Multer pour l'upload de fichiers
 * Stocke les fichiers en mémoire pour les envoyer directement à R2
 */

// Stockage en mémoire
const storage = multer.memoryStorage();

// Filtre pour accepter uniquement les fichiers .glb
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ["model/gltf-binary", "application/octet-stream"];
  const isGlb = file.originalname.toLowerCase().endsWith(".glb");

  if (isGlb || allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Seuls les fichiers .glb sont autorisés"), false);
  }
};

// Configuration Multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50 MB max
  },
});

/**
 * Middleware pour un seul fichier
 */
export const uploadSingle = upload.single("file");

/**
 * Gestion des erreurs Multer
 */
export const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        error: "Le fichier est trop volumineux (max 50 MB)",
      });
    }
    return res.status(400).json({
      success: false,
      error: `Erreur d'upload: ${error.message}`,
    });
  }

  if (error) {
    return res.status(400).json({
      success: false,
      error: error.message,
    });
  }

  next();
};
