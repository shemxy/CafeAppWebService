//include the required packages
const express = require('express');
const mysql = require('mysql2/promise');
require('dotenv').config();
const port = 3000;

//database config info
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 100,
    queueLimit: 0,
};

//initialise Express app
const app = express();
//helps app to read JSON
app.use(express.json());

//start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`)
});

app.get('/menuitems', async (req, res) => {
    try{
        let connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute('SELECT * FROM menu_items');
        res.json(rows);
    } catch(err) {
        console.error(err);
        res.status(500).json({message: 'Server error for menu items'});
    }
});

app.post('/addMenuItem', async (req, res) => {
    const { name, price, description } = req.body;

    try {
        let connection = await mysql.createConnection(dbConfig);
        await connection.execute(
            'INSERT INTO menu_items (name, price, category) VALUES (?, ?, ?)',
            [name, price, description]
        );
        await connection.end();

        res.status(201).json({
            message: name + ' added successfully'
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error adding menu item' });
    }
});

app.put('/updateMenuItem/:id', async (req, res) => {
    const { id } = req.params;
    const { name, price, description } = req.body;

    try {
        let connection = await mysql.createConnection(dbConfig);
        await connection.execute(
            'UPDATE menu_items SET name = ?, price = ?, category = ? WHERE id = ?',
            [name, price, description, id]
        );
        await connection.end();

        res.json({
            message: name + ' updated successfully'
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error updating menu item' });
    }
});

app.get('/deleteMenuItem/:id', async (req, res) => {
    const { id } = req.params;

    try {
        let connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute(
            'SELECT * FROM menu_items WHERE id = ?',
            [id]
        );
        await connection.end();

        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error retrieving menu item' });
    }
});

app.post('/deleteMenuItem', async (req, res) => {
    const { id } = req.body;

    try {
        let connection = await mysql.createConnection(dbConfig);
        await connection.execute(
            'DELETE FROM menu_items WHERE id = ?',
            [id]
        );
        await connection.end();

        res.json({
            message: 'Menu item deleted successfully'
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error deleting menu item' });
    }
});
