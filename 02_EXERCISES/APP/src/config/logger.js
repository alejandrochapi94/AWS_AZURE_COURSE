// Singleton Winston
import winston from "winston";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class Logger {
    static instance;
  
    constructor() {
      if (Logger.instance) return Logger.instance;
  
      try {
        // Ruta absoluta a la carpeta logs dentro de src
        const logsDir = path.join(__dirname, "..", "logs");
        
        this.logger = winston.createLogger({
          level: "info",
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
          ),
          transports: [
            new winston.transports.File({ 
              filename: path.join(logsDir, "error.log"), 
              level: "error" 
            }),
            new winston.transports.File({ 
              filename: path.join(logsDir, "combined.log") 
            }),
            // También mostrar logs en consola
       
          ]
        });
  
        Logger.instance = this;
      } catch (error) {
        // Si falla la creación del logger, crear uno mínimo solo con consola
        console.error("Error al inicializar logger:", error.message);
        this.logger = winston.createLogger({
          level: "info",
          transports: [
            new winston.transports.Console({
              format: winston.format.simple()
            })
          ]
        });
        Logger.instance = this;
      }
    }
  
    info(msg) {
      try {
        this.logger.info(msg);
      } catch (error) {
        // Fallback: si falla el logger, usar console.log
        console.log(`[INFO] ${msg}`);
        console.error("Error en logger.info:", error.message);
      }
    }
  
    error(msg) {
      try {
        this.logger.error(msg);
      } catch (error) {
        // Fallback: si falla el logger, usar console.error
        console.error(`[ERROR] ${msg}`);
        console.error("Error en logger.error:", error.message);
      }
    }
  }
  
  export default new Logger();