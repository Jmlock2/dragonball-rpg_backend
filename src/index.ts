import express from "express";
const app = express();

import bodyParser from 'body-parser';
const jsonParser = bodyParser.json();

// import * as db from './db-connection';

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

// ✅ Endpoint para registrar un nuevo usuario en la base de datos
app.post('/register', async (req, res) => {
    try {
        let { auth0_id, name } = req.body;

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

// ✅ Obtener el ranking (ordenado de mayor a menor)
app.get('/ranking', async (req, res) => {
    try {
        let result = await pool.query(
            "SELECT name, score FROM ranking ORDER BY score DESC LIMIT 10"
        );
        res.json(result.rows);
    } catch (error) {
        console.error("Error obteniendo el ranking:", error);
        res.status(500).json({ error: "Error al obtener el ranking" });
    }
});


// ✅ Registrar puntaje (si no existe, lo crea)
app.post("/ranking", async (req, res) => {
    const { auth0_id, name, score } = req.body;

    try {
        // Comprobar si el usuario ya tiene un registro en el ranking
        let existingUser = await pool.query(
            "SELECT * FROM ranking WHERE auth0_id = $1",
            [auth0_id]
        );

        if (existingUser.rows.length > 0) {
            // Si ya existe, actualizar el puntaje solo si es mayor al anterior
            await pool.query(
                "UPDATE ranking SET score = GREATEST(score, $1) WHERE auth0_id = $2",
                [score, auth0_id]
            );
            return res.json({ message: "Puntaje actualizado" });
        }

        // Si no existe, crear un nuevo registro
        await pool.query(
            "INSERT INTO ranking (auth0_id, name, score) VALUES ($1, $2, $3)",
            [auth0_id, name, score]
        );

        res.json({ message: "Puntaje registrado" });
    } catch (error) {
        console.error("Error registrando puntaje:", error);
        res.status(500).json({ error: "Error al registrar puntaje" });
    }
});



const port = process.env.PORT || 10000;

app.listen(port, () => console.log(`App listening on PORT ${port}`));