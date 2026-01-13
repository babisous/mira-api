import prisma from "../config/database.js";

class AnchorService {
  /**
   * Crée ou met à jour l'anchor d'une œuvre d'art
   * @param {string} artworkId - ID de l'œuvre
   * @param {string} userId - ID de l'utilisateur (pour vérifier la propriété)
   * @param {number} latitude - Latitude
   * @param {number} longitude - Longitude
   * @param {number} altitude - Altitude (optionnelle)
   * @param {number} heading - Orientation (optionnelle)
   * @returns {Promise<object>}
   */
  async createOrUpdate(artworkId, userId, latitude, longitude, altitude = null, heading = null) {
    // Vérifier que l'artwork existe et appartient à l'utilisateur
    const artwork = await prisma.artwork.findUnique({
      where: { id: artworkId },
    });

    if (!artwork) {
      throw new Error("ARTWORK_NOT_FOUND");
    }

    if (artwork.userId !== userId) {
      throw new Error("UNAUTHORIZED");
    }

    // Vérifier si un anchor existe déjà
    const existingAnchor = await prisma.anchor.findUnique({
      where: { artworkId },
    });

    // Nettoyer les valeurs NaN
    const cleanAltitude = altitude !== null && !isNaN(altitude) ? altitude : null;
    const cleanHeading = heading !== null && !isNaN(heading) ? heading : null;

    let anchor;

    if (existingAnchor) {
      // Mettre à jour l'anchor existant
      anchor = await prisma.anchor.update({
        where: { artworkId },
        data: {
          latitude,
          longitude,
          altitude: cleanAltitude,
          heading: cleanHeading,
        },
      });
    } else {
      // Créer un nouvel anchor
      anchor = await prisma.anchor.create({
        data: {
          artworkId,
          latitude,
          longitude,
          altitude: cleanAltitude,
          heading: cleanHeading,
        },
      });
    }

    return anchor;
  }

  /**
   * Récupère l'anchor d'une œuvre d'art
   * @param {string} artworkId - ID de l'œuvre
   * @returns {Promise<object|null>}
   */
  async getByArtworkId(artworkId) {
    const anchor = await prisma.anchor.findUnique({
      where: { artworkId },
    });

    return anchor;
  }

  /**
   * Supprime l'anchor d'une œuvre d'art
   * @param {string} artworkId - ID de l'œuvre
   * @param {string} userId - ID de l'utilisateur (pour vérifier la propriété)
   * @returns {Promise<void>}
   */
  async delete(artworkId, userId) {
    // Vérifier que l'artwork existe et appartient à l'utilisateur
    const artwork = await prisma.artwork.findUnique({
      where: { id: artworkId },
    });

    if (!artwork) {
      throw new Error("ARTWORK_NOT_FOUND");
    }

    if (artwork.userId !== userId) {
      throw new Error("UNAUTHORIZED");
    }

    // Vérifier si un anchor existe
    const anchor = await prisma.anchor.findUnique({
      where: { artworkId },
    });

    if (!anchor) {
      throw new Error("ANCHOR_NOT_FOUND");
    }

    // Supprimer l'anchor
    await prisma.anchor.delete({
      where: { artworkId },
    });
  }

  /**
   * Récupère tous les anchors avec leurs artworks
   * @returns {Promise<object[]>}
   */
  async getAll() {
    const anchors = await prisma.anchor.findMany({
      include: {
        artwork: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return anchors;
  }
}

export default new AnchorService();
