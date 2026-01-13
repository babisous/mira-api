import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../config/database.js";

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || "votre-secret-jwt-temporaire";

class AuthService {
  /**
   * Inscrit un nouvel utilisateur
   * @param {string} email - Email de l'utilisateur
   * @param {string} password - Mot de passe en clair
   * @param {string} name - Nom de l'utilisateur (optionnel)
   * @returns {Promise<{user: object, token: string}>}
   */
  async register(email, password, name = null) {
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new Error("USER_ALREADY_EXISTS");
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });

    // Générer le token JWT
    const token = this.generateToken(user);

    // Retourner l'utilisateur sans le mot de passe
    return {
      user: this.sanitizeUser(user),
      token,
    };
  }

  /**
   * Connecte un utilisateur existant
   * @param {string} email - Email de l'utilisateur
   * @param {string} password - Mot de passe en clair
   * @returns {Promise<{user: object, token: string}>}
   */
  async login(email, password) {
    // Trouver l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error("INVALID_CREDENTIALS");
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new Error("INVALID_CREDENTIALS");
    }

    // Générer le token JWT
    const token = this.generateToken(user);

    // Retourner l'utilisateur sans le mot de passe
    return {
      user: this.sanitizeUser(user),
      token,
    };
  }

  /**
   * Génère un token JWT pour un utilisateur
   * @param {object} user - L'utilisateur
   * @returns {string} Le token JWT
   */
  generateToken(user) {
    return jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: "24h" }
    );
  }

  /**
   * Retire le mot de passe de l'objet utilisateur
   * @param {object} user - L'utilisateur
   * @returns {object} L'utilisateur sans le mot de passe
   */
  sanitizeUser(user) {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Vérifie et décode un token JWT
   * @param {string} token - Le token JWT
   * @returns {object} Les données décodées du token
   */
  verifyToken(token) {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      throw new Error("INVALID_TOKEN");
    }
  }

  /**
   * Récupère un utilisateur par son ID
   * @param {string} userId - ID de l'utilisateur
   * @returns {Promise<object>} L'utilisateur sans le mot de passe
   */
  async getUserById(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }
}

export default new AuthService();
