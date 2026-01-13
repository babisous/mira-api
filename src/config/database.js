import { PrismaClient } from "../../generated/prisma/index.js";

// Instance unique de Prisma Client (singleton pattern)
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
});

// Gestion propre de la déconnexion
process.on("beforeExit", async () => {
  await prisma.$disconnect();
});

export default prisma;
