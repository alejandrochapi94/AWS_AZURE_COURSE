// User Repository
import mongoose from "mongoose";
import User from "../models/User.js";
import modelUserBD from "../models/modelUserBD.js";
import logger from "../config/logger.js";

export const createUser = async (user) => {
    try {
        // Extraer los datos del objeto User (clase) para crear el documento en MongoDB
        const userData = {
            name: user.name,
            email: user.email,
            role: user.role,
            active: user.active
        };
        
        // Crear el documento en MongoDB
        const newUser = new modelUserBD(userData);
        await newUser.save();
        
        logger.info(`Usuario creado en BD: ${userData.email}`);
        return newUser;
    } catch (error) {
        logger.error(`Error al crear usuario en BD: ${error.message}`);
        throw error; // Re-lanzar el error para que el controller lo maneje
    }
};