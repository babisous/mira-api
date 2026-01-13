import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import crypto from "crypto";

/**
 * Service R2 (Cloudflare)
 * Gère l'upload et la suppression de fichiers sur Cloudflare R2
 */
class R2Service {
  constructor() {
    this.client = new S3Client({
      region: "auto",
      endpoint: process.env.R2_ENDPOINT,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
      },
    });

    this.bucketName = process.env.R2_BUCKET_NAME;
    this.accountId = process.env.R2_ACCOUNT_ID;
  }

  /**
   * Génère un nom de fichier unique
   */
  generateFileName(originalName) {
    const timestamp = Date.now();
    const randomString = crypto.randomBytes(8).toString("hex");
    const extension = originalName.split(".").pop();
    return `artworks/${timestamp}-${randomString}.${extension}`;
  }

  /**
   * Upload un fichier vers R2
   */
  async uploadFile(file) {
    try {
      const fileName = this.generateFileName(file.originalname);

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: fileName,
        Body: file.buffer,
        ContentType: file.mimetype,
      });

      await this.client.send(command);

      // Construire l'URL publique R2
      const publicUrl = `https://pub-a7f280f2f7564ef5922717e823d764f0.r2.dev/${fileName}`;

      return {
        fileName,
        url: publicUrl,
        size: file.size,
        mimeType: file.mimetype,
      };
    } catch (error) {
      console.error("Erreur lors de l'upload vers R2:", error);
      throw new Error("UPLOAD_FAILED");
    }
  }

  /**
   * Supprime un fichier de R2
   */
  async deleteFile(fileName) {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: fileName,
      });

      await this.client.send(command);
    } catch (error) {
      console.error("Erreur lors de la suppression sur R2:", error);
      throw new Error("DELETE_FAILED");
    }
  }

  /**
   * Extrait le nom de fichier depuis une URL R2
   */
  extractFileNameFromUrl(url) {
    try {
      const urlParts = url.split("/");
      return urlParts.slice(-2).join("/"); // artworks/filename.glb
    } catch (error) {
      return null;
    }
  }

  /**
   * Récupère un fichier depuis R2
   */
  async getFile(fileName) {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: fileName,
      });

      const response = await this.client.send(command);
      return response;
    } catch (error) {
      console.error("Erreur lors de la récupération depuis R2:", error);
      throw new Error("GET_FILE_FAILED");
    }
  }
}

export default new R2Service();
