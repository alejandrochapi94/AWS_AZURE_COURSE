// Singleton MongoDB
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import logger from "./logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configurar dotenv con la ruta correcta al archivo .env
dotenv.config({ path: path.join(__dirname, "..", ".env") });

class Database {
  static instance;

  constructor() {
    if (Database.instance) {
      return Database.instance;
    }

    this.connect();
    Database.instance = this;
  }

  async connect() {
    try {
      await mongoose.connect(process.env.MONGO_URI);
      logger.info("MongoDB conectado");
      console.log("MongoDB conectado");
    } catch (error) {
      logger.error("Error MongoDB", error);
      console.error("Error MongoDB", error);
    }
  }
}

export default new Database();