import prisma from "../config/database.js";
import r2Service from "./r2.service.js";

class ArtworkService {
  /**
   * Crée une nouvelle œuvre d'art
   * @param {string} userId - ID de l'utilisateur
   * @param {string} title - Titre de l'œuvre
   * @param {string} description - Description de l'œuvre
   * @param {string} url - URL de l'œuvre
   * @returns {Promise<object>}
   */
  async create(userId, title, description, url) {
    // Vérifier que l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error("USER_NOT_FOUND");
    }

    const artwork = await prisma.artwork.create({
      data: {
        title,
        description,
        url,
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        anchor: true,
      },
    });

    return artwork;
  }

  /**
   * Récupère toutes les œuvres d'art avec pagination
   * @param {number} page - Numéro de page
   * @param {number} limit - Nombre d'éléments par page
   * @returns {Promise<{artworks: object[], total: number, page: number, totalPages: number}>}
   */
  async getAll(page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [artworks, total] = await Promise.all([
      prisma.artwork.findMany({
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
          anchor: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.artwork.count(),
    ]);

    return {
      artworks,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Récupère une œuvre d'art par son ID
   * @param {string} id - ID de l'œuvre
   * @returns {Promise<object>}
   */
  async getById(id) {
    const artwork = await prisma.artwork.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        anchor: true,
      },
    });

    if (!artwork) {
      throw new Error("ARTWORK_NOT_FOUND");
    }

    return artwork;
  }

  /**
   * Récupère toutes les œuvres d'un utilisateur
   * @param {string} userId - ID de l'utilisateur
   * @returns {Promise<object[]>}
   */
  async getByUserId(userId) {
    const artworks = await prisma.artwork.findMany({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        anchor: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return artworks;
  }

  /**
   * Met à jour une œuvre d'art
   * @param {string} id - ID de l'œuvre
   * @param {string} userId - ID de l'utilisateur (pour vérifier la propriété)
   * @param {object} data - Données à mettre à jour
   * @returns {Promise<object>}
   */
  async update(id, userId, data) {
    // Vérifier que l'œuvre existe
    const artwork = await prisma.artwork.findUnique({
      where: { id },
    });

    if (!artwork) {
      throw new Error("ARTWORK_NOT_FOUND");
    }

    // Vérifier que l'utilisateur est le propriétaire
    if (artwork.userId !== userId) {
      throw new Error("UNAUTHORIZED");
    }

    // Mettre à jour l'œuvre
    const updatedArtwork = await prisma.artwork.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        url: data.url,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        anchor: true,
      },
    });

    return updatedArtwork;
  }

  /**
   * Recherche des œuvres par titre ou nom d'artiste
   * @param {string} query - Terme de recherche
   * @param {number} limit - Nombre maximum de résultats
   * @returns {Promise<object[]>}
   */
  async search(query, limit = 10) {
    if (!query?.trim()) return [];

    return prisma.artwork.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { user: { name: { contains: query, mode: "insensitive" } } },
        ],
        anchor: { isNot: null },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        anchor: true,
      },
      take: limit,
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Supprime une œuvre d'art
   * @param {string} id - ID de l'œuvre
   * @param {string} userId - ID de l'utilisateur (pour vérifier la propriété)
   * @returns {Promise<void>}
   */
  async delete(id, userId) {
    // Vérifier que l'œuvre existe
    const artwork = await prisma.artwork.findUnique({
      where: { id },
    });

    if (!artwork) {
      throw new Error("ARTWORK_NOT_FOUND");
    }

    // Vérifier que l'utilisateur est le propriétaire
    if (artwork.userId !== userId) {
      throw new Error("UNAUTHORIZED");
    }

    // Supprimer le fichier de R2 si l'URL existe
    if (artwork.url) {
      try {
        const fileName = r2Service.extractFileNameFromUrl(artwork.url);
        if (fileName) {
          await r2Service.deleteFile(fileName);
        }
      } catch (error) {
        console.error("Erreur lors de la suppression du fichier R2:", error);
        // On continue même si la suppression du fichier échoue
      }
    }

    // Supprimer l'œuvre de la base de données
    await prisma.artwork.delete({
      where: { id },
    });
  }
}

export default new ArtworkService();
