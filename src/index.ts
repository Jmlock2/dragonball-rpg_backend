import express from "express";
const app = express();

import bodyParser from 'body-parser';
const jsonParser = bodyParser.json();

import * as db from './db-connection';

import cors from 'cors'; // Habilitar CORS
// app.use(cors());

import pool from './db-connection';

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
  }));

app.use(jsonParser);

app.use(express.json());

// Endpoint para registrar un nuevo usuario en la base de datos
app.post('/register', async (req, res) => {
    try {
        const { auth0_id, name } = req.body;

        // 1️⃣ Verificar si el usuario ya existe en la base de datos
        let usuarioExistente = await pool.query('SELECT * FROM users WHERE auth0_id = $1', [auth0_id]);

        if (usuarioExistente.rows.length > 0) {
            return res.status(200).json({ message: "Usuario ya está registrado" }); // Devuelve mensaje sin error
        }

        // 2️⃣ Si no existe, lo registramos
        let nuevoUsuario = await pool.query(
            'INSERT INTO users (auth0_id, name) VALUES ($1, $2) RETURNING *',
            [auth0_id, name]
        );

        res.status(201).json(nuevoUsuario.rows[0]); // Devolvemos el usuario creado
    } catch (error) {
        console.error('Error al registrar usuario:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});



const port = process.env.PORT || 10000;

app.listen(port, () => console.log(`App listening on PORT ${port}`));