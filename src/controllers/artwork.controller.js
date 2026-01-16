import artworkService from "../services/artwork.service.js";

/**
 * Recherche des œuvres par titre ou nom d'artiste
 * GET /api/artworks/search?q=...
 */
export const searchArtworks = async (req, res) => {
  try {
    const { q, limit } = req.query;

    if (!q?.trim()) {
      return res.status(200).json({
        success: true,
        data: [],
      });
    }

    const artworks = await artworkService.search(q, parseInt(limit) || 10);

    return res.status(200).json({
      success: true,
      data: artworks,
    });
  } catch (error) {
    console.error("Erreur lors de la recherche d'œuvres:", error);

    return res.status(500).json({
      success: false,
      error: "Erreur lors de la recherche d'œuvres",
    });
  }
};

/**
 * Crée une nouvelle œuvre d'art
 * POST /api/artworks
 * Requiert authentification
 */
export const createArtwork = async (req, res) => {
  try {
    const { title, description, url } = req.body;
    const userId = req.user.userId; // Ajouté par le middleware authenticate

    // Validation
    if (!title) {
      return res.status(400).json({
        success: false,
        error: "Le titre est requis",
      });
    }

    if (!url) {
      return res.status(400).json({
        success: false,
        error: "L'URL est requise",
      });
    }

    const artwork = await artworkService.create(userId, title, description, url);

    return res.status(201).json({
      success: true,
      message: "Œuvre créée avec succès",
      data: artwork,
    });
  } catch (error) {
    console.error("Erreur lors de la création de l'œuvre:", error);

    if (error.message === "USER_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        error: "Utilisateur non trouvé",
      });
    }

    return res.status(500).json({
      success: false,
      error: "Erreur lors de la création de l'œuvre",
    });
  }
};

/**
 * Récupère toutes les œuvres avec pagination
 * GET /api/artworks
 */
export const getAllArtworks = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await artworkService.getAll(page, limit);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des œuvres:", error);

    return res.status(500).json({
      success: false,
      error: "Erreur lors de la récupération des œuvres",
    });
  }
};

/**
 * Récupère une œuvre par son ID
 * GET /api/artworks/:id
 */
export const getArtworkById = async (req, res) => {
  try {
    const { id } = req.params;

    const artwork = await artworkService.getById(id);

    return res.status(200).json({
      success: true,
      data: artwork,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération de l'œuvre:", error);

    if (error.message === "ARTWORK_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        error: "Œuvre non trouvée",
      });
    }

    return res.status(500).json({
      success: false,
      error: "Erreur lors de la récupération de l'œuvre",
    });
  }
};

/**
 * Récupère toutes les œuvres d'un utilisateur
 * GET /api/users/:userId/artworks
 */
export const getArtworksByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    const artworks = await artworkService.getByUserId(userId);

    return res.status(200).json({
      success: true,
      data: artworks,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des œuvres:", error);

    return res.status(500).json({
      success: false,
      error: "Erreur lors de la récupération des œuvres de l'utilisateur",
    });
  }
};

/**
 * Met à jour une œuvre
 * PUT /api/artworks/:id
 * Requiert authentification et propriété
 */
export const updateArtwork = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, url } = req.body;
    const userId = req.user.userId;

    const artwork = await artworkService.update(id, userId, {
      title,
      description,
      url,
    });

    return res.status(200).json({
      success: true,
      message: "Œuvre mise à jour avec succès",
      data: artwork,
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'œuvre:", error);

    if (error.message === "ARTWORK_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        error: "Œuvre non trouvée",
      });
    }

    if (error.message === "UNAUTHORIZED") {
      return res.status(403).json({
        success: false,
        error: "Vous n'êtes pas autorisé à modifier cette œuvre",
      });
    }

    return res.status(500).json({
      success: false,
      error: "Erreur lors de la mise à jour de l'œuvre",
    });
  }
};

/**
 * Supprime une œuvre
 * DELETE /api/artworks/:id
 * Requiert authentification et propriété
 */
export const deleteArtwork = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    await artworkService.delete(id, userId);

    return res.status(200).json({
      success: true,
      message: "Œuvre supprimée avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de la suppression de l'œuvre:", error);

    if (error.message === "ARTWORK_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        error: "Œuvre non trouvée",
      });
    }

    if (error.message === "UNAUTHORIZED") {
      return res.status(403).json({
        success: false,
        error: "Vous n'êtes pas autorisé à supprimer cette œuvre",
      });
    }

    return res.status(500).json({
      success: false,
      error: "Erreur lors de la suppression de l'œuvre",
    });
  }
};
