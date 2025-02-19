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
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
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
            return res.status(200).json({ message: "Usuario ya está registrado" });
        }

        // 2️⃣ Insertar usuario en la base de datos
        let nuevoUsuario = await pool.query(
            'INSERT INTO users (auth0_id, name) VALUES ($1, $2) RETURNING auth0_id, name',
            [auth0_id, name]
        );

        // 3️⃣ Insertar automáticamente el registro en ranking con score = 0
        await pool.query(
            'INSERT INTO ranking (auth0_id, name, score) VALUES ($1, $2, 0)',
            [nuevoUsuario.rows[0].auth0_id, nuevoUsuario.rows[0].name]
        );

        res.status(201).json({ message: "Usuario y ranking creados correctamente" });
    } catch (error) {
        console.error('Error al registrar usuario:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});


// ✅ Obtener el ranking de jugadores ordenado por puntos
app.get('/ranking', async (req, res) => {
    try {
        let result = await pool.query('SELECT name, score FROM ranking ORDER BY score DESC LIMIT 10');
        res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener el ranking:', error);
        res.status(500).json({ message: 'Error al obtener el ranking' });
    }
})

// ✅ Actualizar el puntaje de un jugador
app.put('/ranking', async (req, res) => {
    let { auth0_id, name, score } = req.body;

    if (!auth0_id || !name || score === undefined) {
        return res.status(400).json({ error: 'Faltan datos en la petición' });
    }

    try {
        // Verificamos si el usuario ya está en el ranking
        const checkUser = await pool.query('SELECT * FROM ranking WHERE auth0_id = $1', [auth0_id]);

        if (checkUser.rows.length > 0) {
            // Si ya existe, actualizamos su score (suma el nuevo puntaje al actual)
            await pool.query('UPDATE ranking SET score = score + $1 WHERE auth0_id = $2', [score, auth0_id]);
        } else {
            // Si no existe, lo insertamos
            await pool.query('INSERT INTO ranking (auth0_id, name, score) VALUES ($1, $2, $3)', [auth0_id, name, score]);
        }

        res.json({ message: 'Ranking actualizado correctamente' });
    } catch (error) {
        console.error('Error al actualizar el ranking:', error);
        res.status(500).json({ error: 'Error al actualizar el ranking' });
    }
});

const port = process.env.PORT || 10000;

app.listen(port, () => console.log(`App listening on PORT ${port}`));