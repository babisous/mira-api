import anchorService from "../services/anchor.service.js";

class AnchorController {
  /**
   * Crée ou met à jour l'anchor d'une œuvre
   */
  async createOrUpdate(req, res) {
    try {
      const { artworkId } = req.params;
      const { latitude, longitude, altitude, heading } = req.body;
      const userId = req.user.userId;

      // Validation
      if (latitude === undefined || longitude === undefined) {
        return res.status(400).json({
          success: false,
          error: "La latitude et la longitude sont requises",
        });
      }

      // Vérifier que latitude et longitude sont des nombres valides
      const lat = parseFloat(latitude);
      const lon = parseFloat(longitude);

      if (isNaN(lat) || isNaN(lon)) {
        return res.status(400).json({
          success: false,
          error: "La latitude et la longitude doivent être des nombres valides",
        });
      }

      // Vérifier les plages de valeurs
      if (lat < -90 || lat > 90) {
        return res.status(400).json({
          success: false,
          error: "La latitude doit être entre -90 et 90",
        });
      }

      if (lon < -180 || lon > 180) {
        return res.status(400).json({
          success: false,
          error: "La longitude doit être entre -180 et 180",
        });
      }

      const alt = altitude !== undefined && altitude !== "" ? parseFloat(altitude) : null;
      const head = heading !== undefined && heading !== "" ? parseFloat(heading) : null;

      const anchor = await anchorService.createOrUpdate(
        artworkId,
        userId,
        lat,
        lon,
        alt,
        head
      );

      return res.status(200).json({
        success: true,
        message: "Anchor créé/mis à jour avec succès",
        data: anchor,
      });
    } catch (error) {
      console.error("Erreur dans createOrUpdate:", error);

      if (error.message === "ARTWORK_NOT_FOUND") {
        return res.status(404).json({
          success: false,
          error: "Artwork non trouvé",
        });
      }

      if (error.message === "UNAUTHORIZED") {
        return res.status(403).json({
          success: false,
          error: "Vous n'êtes pas autorisé à modifier cet anchor",
        });
      }

      return res.status(500).json({
        success: false,
        error: "Erreur lors de la création/mise à jour de l'anchor",
      });
    }
  }

  /**
   * Récupère l'anchor d'une œuvre
   */
  async getByArtworkId(req, res) {
    try {
      const { artworkId } = req.params;

      const anchor = await anchorService.getByArtworkId(artworkId);

      if (!anchor) {
        return res.status(404).json({
          success: false,
          error: "Anchor non trouvé",
        });
      }

      return res.status(200).json({
        success: true,
        data: anchor,
      });
    } catch (error) {
      console.error("Erreur dans getByArtworkId:", error);

      return res.status(500).json({
        success: false,
        error: "Erreur lors de la récupération de l'anchor",
      });
    }
  }

  /**
   * Supprime l'anchor d'une œuvre
   */
  async delete(req, res) {
    try {
      const { artworkId } = req.params;
      const userId = req.user.userId;

      await anchorService.delete(artworkId, userId);

      return res.status(200).json({
        success: true,
        message: "Anchor supprimé avec succès",
      });
    } catch (error) {
      console.error("Erreur dans delete:", error);

      if (error.message === "ARTWORK_NOT_FOUND") {
        return res.status(404).json({
          success: false,
          error: "Artwork non trouvé",
        });
      }

      if (error.message === "ANCHOR_NOT_FOUND") {
        return res.status(404).json({
          success: false,
          error: "Anchor non trouvé",
        });
      }

      if (error.message === "UNAUTHORIZED") {
        return res.status(403).json({
          success: false,
          error: "Vous n'êtes pas autorisé à supprimer cet anchor",
        });
      }

      return res.status(500).json({
        success: false,
        error: "Erreur lors de la suppression de l'anchor",
      });
    }
  }

  /**
   * Récupère tous les anchors
   */
  async getAll(req, res) {
    try {
      const anchors = await anchorService.getAll();

      return res.status(200).json({
        success: true,
        data: anchors,
      });
    } catch (error) {
      console.error("Erreur dans getAll:", error);

      return res.status(500).json({
        success: false,
        error: "Erreur lors de la récupération des anchors",
      });
    }
  }

  /**
   * Récupère les anchors dans une bounding box
   */
  async getByBounds(req, res) {
    try {
      const { minLat, maxLat, minLng, maxLng } = req.query;

      // Valider que tous les paramètres sont présents
      if (minLat === undefined || maxLat === undefined || minLng === undefined || maxLng === undefined) {
        return res.status(400).json({
          success: false,
          error: "Les paramètres minLat, maxLat, minLng et maxLng sont requis",
        });
      }

      // Parser les valeurs
      const parsedMinLat = parseFloat(minLat);
      const parsedMaxLat = parseFloat(maxLat);
      const parsedMinLng = parseFloat(minLng);
      const parsedMaxLng = parseFloat(maxLng);

      // Valider que ce sont des nombres
      if (isNaN(parsedMinLat) || isNaN(parsedMaxLat) || isNaN(parsedMinLng) || isNaN(parsedMaxLng)) {
        return res.status(400).json({
          success: false,
          error: "Les paramètres doivent être des nombres valides",
        });
      }

      // Valider les plages de valeurs
      if (parsedMinLat < -90 || parsedMinLat > 90 || parsedMaxLat < -90 || parsedMaxLat > 90) {
        return res.status(400).json({
          success: false,
          error: "Les latitudes doivent être entre -90 et 90",
        });
      }

      if (parsedMinLng < -180 || parsedMinLng > 180 || parsedMaxLng < -180 || parsedMaxLng > 180) {
        return res.status(400).json({
          success: false,
          error: "Les longitudes doivent être entre -180 et 180",
        });
      }

      const anchors = await anchorService.getByBounds(parsedMinLat, parsedMaxLat, parsedMinLng, parsedMaxLng);

      return res.status(200).json({
        success: true,
        data: anchors,
        count: anchors.length,
      });
    } catch (error) {
      console.error("Erreur dans getByBounds:", error);

      return res.status(500).json({
        success: false,
        error: "Erreur lors de la récupération des anchors",
      });
    }
  }
}

export default new AnchorController();
