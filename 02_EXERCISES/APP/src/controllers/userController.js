// User Controller

import UserBuilder from "../builders/UserBuilder.js";
import { createUser as createUserRepository } from "../repositories/userRepository.js";
import logger from "../config/logger.js";

export const createUser = async (req, res) => {
    try {   
        // Usar el Builder para construir el objeto User
        const user = new UserBuilder()
            .setName(req.body.name)
            .setEmail(req.body.email)
            .setRole(req.body.role || "admin")
            .setActive(req.body.active !== undefined ? req.body.active : true)
            .build();
        
        // Guardar el usuario en la base de datos usando el repositorio
        const savedUser = await createUserRepository(user);
        
        logger.info(`Usuario creado exitosamente: ${savedUser.email}`);
        res.status(201).json({
            message: "Usuario creado exitosamente",
            user: savedUser
        });
    } catch (error) {
        logger.error(`Error al crear usuario: ${error.message}`);
        res.status(500).json({ 
            message: "Error al crear usuario",
            error: error.message 
        });
    }
};