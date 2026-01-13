import authService from "../services/auth.service.js";

class AuthController {
  /**
   * Gère l'inscription d'un nouvel utilisateur
   * POST /api/auth/register
   */
  async register(req, res) {
    try {
      const { email, password, name } = req.body;

      // Validation des champs requis
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: "L'email et le mot de passe sont requis",
        });
      }

      // Validation du format de l'email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          error: "Format d'email invalide",
        });
      }

      // Validation de la longueur du mot de passe
      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          error: "Le mot de passe doit contenir au moins 6 caractères",
        });
      }

      // Appel au service
      const result = await authService.register(email, password, name);

      return res.status(201).json({
        success: true,
        message: "Inscription réussie",
        data: result,
      });
    } catch (error) {
      console.error("Erreur lors de l'inscription:", error);

      // Gestion des erreurs métier
      if (error.message === "USER_ALREADY_EXISTS") {
        return res.status(409).json({
          success: false,
          error: "Un utilisateur avec cet email existe déjà",
        });
      }

      // Erreur générique
      return res.status(500).json({
        success: false,
        error: "Erreur lors de l'inscription",
      });
    }
  }

  /**
   * Gère la connexion d'un utilisateur
   * POST /api/auth/login
   */
  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Validation des champs requis
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: "L'email et le mot de passe sont requis",
        });
      }

      // Appel au service
      const result = await authService.login(email, password);

      return res.status(200).json({
        success: true,
        message: "Connexion réussie",
        data: result,
      });
    } catch (error) {
      console.error("Erreur lors de la connexion:", error);

      // Gestion des erreurs métier
      if (error.message === "INVALID_CREDENTIALS") {
        return res.status(401).json({
          success: false,
          error: "Email ou mot de passe incorrect",
        });
      }

      // Erreur générique
      return res.status(500).json({
        success: false,
        error: "Erreur lors de la connexion",
      });
    }
  }

  /**
   * Vérifie le token JWT de l'utilisateur et retourne ses infos complètes
   * GET /api/auth/me
   */
  async me(req, res) {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
          success: false,
          error: "Token manquant ou invalide",
        });
      }

      const token = authHeader.substring(7);
      const decoded = authService.verifyToken(token);

      // Récupérer les informations complètes de l'utilisateur
      const user = await authService.getUserById(decoded.userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          error: "Utilisateur non trouvé",
        });
      }

      return res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      console.error("Erreur lors de la vérification du token:", error);

      if (error.message === "INVALID_TOKEN") {
        return res.status(401).json({
          success: false,
          error: "Token invalide ou expiré",
        });
      }

      return res.status(500).json({
        success: false,
        error: "Erreur lors de la vérification du token",
      });
    }
  }
}

export default new AuthController();
