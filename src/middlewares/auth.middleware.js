import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "votre-secret-jwt-temporaire";

/**
 * Middleware pour vérifier le token JWT
 * Ajoute les données de l'utilisateur dans req.user si le token est valide
 */
export const authenticate = (req, res, next) => {
  try {
    // Récupérer le token du header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        error: "Token d'authentification manquant",
      });
    }

    // Extraire le token
    const token = authHeader.substring(7);

    // Vérifier et décoder le token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Ajouter les données de l'utilisateur à la requête
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
    };

    // Passer au middleware suivant
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        error: "Token invalide",
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        error: "Token expiré",
      });
    }

    return res.status(500).json({
      success: false,
      error: "Erreur lors de la vérification du token",
    });
  }
};

/**
 * Middleware optionnel : ajoute les données utilisateur si un token est fourni
 * Mais ne bloque pas si le token est absent
 */
export const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = {
        userId: decoded.userId,
        email: decoded.email,
      };
    }

    next();
  } catch (error) {
    // En cas d'erreur, on continue sans utilisateur authentifié
    next();
  }
};
