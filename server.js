import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { routes } from './Routes/routes.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

const PORT = process.env.PORT;
const mongodbURL = process.env.MONGODB_URL;
const frontendURL = process.env.FRONTEND_URL;

// Custom CORS middleware for serverless functions
const allowCors = (fn) => async (req, res) => {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', frontendURL);  // Allow only your frontend
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    return fn(req, res);
};

// Enable CORS
app.use(cors({ 
    origin: frontendURL, 
    methods: ['GET', 'POST', 'PUT', 'DELETE'], 
    credentials: true 
}));

app.use(express.json());

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

// Connect to MongoDB
mongoose.connect(mongodbURL);
const db = mongoose.connection;

db.on('open', () => console.log('Database Connection Successful'));
db.on('error', () => console.log('Database Connection Unsuccessful'));

// API routes
routes(app);

// ✅ Export the Express app as a **serverless function**
export default allowCors(app);
