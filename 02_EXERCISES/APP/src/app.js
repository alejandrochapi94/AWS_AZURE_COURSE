// Express App Configuration
import express from "express";
import morgan from "morgan";
import logger from "./config/logger.js";
import userRoutes from "./routes/userRoutes.js";
import path from "path";
import { fileURLToPath } from "url";
import database from "./config/database.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json());
app.use(morgan("dev"));

// Conectar a la base de datos
database.connect();

// Servir archivos estáticos desde la carpeta public
app.use(express.static(path.join(__dirname, "public")));

app.use("/api", userRoutes);

// Ruta raíz que sirve el index.html
app.get("/", (req, res) => {
  logger.info("Página principal accedida");
  
});

export default app;
