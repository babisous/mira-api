import userService from "../services/user.service.js";

/**
 * Récupère le profil de l'utilisateur connecté
 * GET /api/users/me
 * Requiert authentification
 */
export const getMyProfile = async (req, res) => {
  try {
    const userId = req.user.userId;

    const profile = await userService.getProfile(userId);

    return res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération du profil:", error);

    if (error.message === "USER_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        error: "Utilisateur non trouvé",
      });
    }

    return res.status(500).json({
      success: false,
      error: "Erreur lors de la récupération du profil",
    });
  }
};

/**
 * Récupère le profil d'un utilisateur par son ID
 * GET /api/users/:id
 */
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const profile = await userService.getProfile(id);

    return res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération du profil:", error);

    if (error.message === "USER_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        error: "Utilisateur non trouvé",
      });
    }

    return res.status(500).json({
      success: false,
      error: "Erreur lors de la récupération du profil",
    });
  }
};

/**
 * Met à jour le profil de l'utilisateur connecté
 * PUT /api/users/me
 * Requiert authentification
 */
export const updateMyProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, email } = req.body;

    const updatedProfile = await userService.updateProfile(userId, {
      name,
      email,
    });

    return res.status(200).json({
      success: true,
      message: "Profil mis à jour avec succès",
      data: updatedProfile,
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du profil:", error);

    if (error.message === "USER_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        error: "Utilisateur non trouvé",
      });
    }

    if (error.message === "EMAIL_ALREADY_EXISTS") {
      return res.status(409).json({
        success: false,
        error: "Cet email est déjà utilisé",
      });
    }

    return res.status(500).json({
      success: false,
      error: "Erreur lors de la mise à jour du profil",
    });
  }
};

/**
 * Change le mot de passe de l'utilisateur connecté
 * PUT /api/users/me/password
 * Requiert authentification
 */
export const changePassword = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { currentPassword, newPassword } = req.body;

    // Validation
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: "Le mot de passe actuel et le nouveau mot de passe sont requis",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: "Le nouveau mot de passe doit contenir au moins 6 caractères",
      });
    }

    await userService.changePassword(userId, currentPassword, newPassword);

    return res.status(200).json({
      success: true,
      message: "Mot de passe modifié avec succès",
    });
  } catch (error) {
    console.error("Erreur lors du changement de mot de passe:", error);

    if (error.message === "USER_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        error: "Utilisateur non trouvé",
      });
    }

    if (error.message === "INVALID_PASSWORD") {
      return res.status(401).json({
        success: false,
        error: "Mot de passe actuel incorrect",
      });
    }

    return res.status(500).json({
      success: false,
      error: "Erreur lors du changement de mot de passe",
    });
  }
};

/**
 * Récupère tous les utilisateurs avec pagination
 * GET /api/users
 */
export const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await userService.getAll(page, limit);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs:", error);

    return res.status(500).json({
      success: false,
      error: "Erreur lors de la récupération des utilisateurs",
    });
  }
};
