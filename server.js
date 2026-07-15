const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// ⚙️ Update these with your PostgreSQL credentials
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// POST endpoint — receives form data and inserts into DB
app.post('/submit', async (req, res) => {
    const { fname, lname, bdate, email, phone } = req.body;

    // Server-side validation (never trust only the browser)
    const namePattern = /^[A-Za-z\s]+$/;
    const phonePattern = /^[0-9]{10}$/;
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$/;

    if (!namePattern.test(fname)) {
        return res.status(400).json({ error: "First name should not contain numbers." });
    }
    if (!namePattern.test(lname)) {
        return res.status(400).json({ error: "Last name should not contain numbers." });
    }
    if (!phonePattern.test(phone)) {
        return res.status(400).json({ error: "Phone number must be exactly 10 digits." });
    }
    if (!emailPattern.test(email)) {
        return res.status(400).json({ error: "Invalid email format." });
    }

    try {
        const result = await pool.query(
            `INSERT INTO submissions (first_name, last_name, date_of_birth, email, phone)
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [fname, lname, bdate || null, email, phone]
        );
        console.log("Saved to DB:", result.rows[0]);
        res.status(200).json({ message: "Submitted successfully!", data: result.rows[0] });
    } catch (err) {
        console.error("Database error:", err.message);
        res.status(500).json({ error: "Database error: " + err.message });
    }
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
