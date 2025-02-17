import express from "express";
const app = express();

// import bodyParser from 'body-parser';
// const jsonParser = bodyParser.json();

import * as db from './db-connection';

import cors from 'cors'; // Habilitar CORS
app.use(cors());

app.use(express.json()); // Habilitar el análisis de solicitudes JSON

// app.use(jsonParser);


// Endpoint GET para obtener el registro de los usuarios
app.get('/usuarios', async (req, res) => {
    try {
        let rpg_response = await db.query('SELECT * FROM usuarios;');
        res.status(200).json(rpg_response.rows);
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({ error: 'Error al obtener usuarios' });
    }
});

// Endpoint POST para insertar un nuevo usuario
app.post('/usuarios', async (req, res) => {
    console.log('Datos recibidos', req.body)
    try {
        let { name, email } = req.body; // Obtiene el nombre y email del cuerpo de la solicitud

        // Valida que los datos no estén vacíos
        if (!name || !email) {
            return res.status(400).json({ error: 'El nombre y el email son obligatorios.' });
        }

        // Inserta un nuevo usuario en la base de datos
        let result = await db.query(
            'INSERT INTO usuarios (name, email) VALUES ($1, $2) RETURNING *;',
            [req.body.name, req.body.email]
        );

        console.log('Usuario guardado', result.rows[0]) // Log de usuario
        res.status(201).json(result.rows[0]); // Devuelve el usuario recién creado
    } catch (error) {
        console.error('Error al insertar usuario:', error);
        res.status(500).json({ error: 'Error al insertar usuario.' });
    }
});

// Endpoint DELETE para eliminar un usuario
app.delete('/usuarios/:id', async (req, res) => {
    try {
        let { id } = req.params; // Obtiene el id del usuario desde los parámetros de la URL

        // Intenta eliminar el usuario
        let result = await db.query('DELETE FROM usuarios WHERE id = $1 RETURNING *;', [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado.' });
        }

        res.status(200).json({ message: 'Usuario eliminado correctamente.', usuario: result.rows[0] });
    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        res.status(500).json({ error: 'Error al eliminar usuario.' });
    }
});

// Endpoint PUT para actualizar el rank de un usuario
app.put('/actualizar-ranking', async (req, res) => {
    const { email, puntos } = req.body;

    try {
        await db.query('UPDATE usuarios SET ranking = ranking + $1 WHERE email = $2;', [puntos, email]);
        res.status(200).json({ message: 'Ranking actualizado correctamente' });
    } catch (error) {
        console.error('Error al actualizar el ranking:', error);
        res.status(500).json({ error: 'Error al actualizar el ranking' });
    }
});

// Endpoint para obtener el ranking de jugadores (ordenado por puntos)
app.get('/ranking', async (req, res) => {
    try {
        let result = await db.query('SELECT name, ranking FROM usuarios ORDER BY ranking DESC;');
        res.status(200).json(result.rows); // Devolver el ranking en formato JSON
    } catch (error) {
        console.error('Error al obtener el ranking:', error);
        res.status(500).json({ error: 'Error al obtener el ranking' });
    }
});


const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`App listening on PORT ${port}`));