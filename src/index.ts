import express from "express";
const app = express();

import bodyParser from 'body-parser';
const jsonParser = bodyParser.json();

import * as db from './db-connection';

import cors from 'cors'; // Habilitar CORS
app.use(cors());

app.use(jsonParser);

// Endpoint para registrar un nuevo usuario en la base de datos
app.post('/usuarios', async (req, res) => {
    try {
        let { auth0_id, name } = req.body;

        if (!auth0_id) {
            return res.status(400).json({ error: 'El ID de Auth0 es obligatorio' });
        }

        // Verificar si el usuario ya existe en la base de datos
        let usuarioExistente = await db.query('SELECT * FROM users WHERE auth0_id = $1', [auth0_id]);

        if (usuarioExistente.rows.length > 0) {
            return res.status(400).json({ error: 'El usuario ya está registrado' });
        }

        let nuevoUsuario = await db.query(
            'INSERT INTO users (auth0_id, name) VALUES ($1, $2) RETURNING id',
            [auth0_id, name || 'Jugador']
          );
          
          let userId = (nuevoUsuario.rows as any[])[0].id;

        if (!userId) {
            return res.status(500).json({ error: 'Error al registrar el usuario.' });
        }

        // Crear un registro en tabla de ranking con score inicial de 0
        await db.query('INSERT INTO ranking (user_id, score) VALUES ($1, 0)', [userId]);

        res.status(201).json({ message: 'Usuario registrado correctamente.' });

    } catch (error) {
        console.error('Error al registrar el usuario:', error);
        res.status(500).json({ error: 'Error al registrar el usuario.' });
    }
});


const port = process.env.PORT || 10000;

app.listen(port, () => console.log(`App listening on PORT ${port}`));