import express from 'express';
import dotenv from 'dotenv'
import { pool } from './db/database.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.send('hello');
});

app.get('/test', async(req, res) => {
  try {
    const users = await pool.query('SELECT * FROM users');
    res.json(users).status(200);
  } catch (error) {
    console.log(error)
    res.json(error).status(500);
  }
});

app.listen(PORT, () => {
  console.log(`[server]: Server is running at http://localhost:${PORT}`);
});