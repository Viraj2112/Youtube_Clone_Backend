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

// Custom allowCors function for serverless compatibility
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

// Express middleware
app.use(cors({ origin: frontendURL, credentials: true }));
app.use(express.json());

// MongoDB connection
mongoose.connect(mongodbURL);
const db = mongoose.connection;

db.on('open', () => console.log('Database Connection Successful'));
db.on('error', () => console.log('Database Connection Unsuccessful'));

// API routes
routes(app);

// Wrap Express with allowCors and export as a serverless function
const handler = allowCors(app);

// Vercel-specific: Export the wrapped handler instead of running app.listen()
export default handler;
