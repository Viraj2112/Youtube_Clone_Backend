import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { routes } from './Routes/routes.js';
import dotenv from 'dotenv';
// import { Channel } from './Model/model.js';
// import { Video } from './Model/model.js';

dotenv.config();        // dotenv is used to access environment variables

const app = express();      // Creating the app using express.

const PORT = process.env.PORT;              //Getting hold of PORT stored in .env
const mongodbURL = process.env.MONGODB_URL;         //Getting hold of the mongodb Atlas url
const frontendURL = process.env.FRONTEND_URL;           //Getting hold of frontendURL from .env file

// Enabling CORS for frontend request
app.use(
    cors({
        origin: frontendURL, // React frontend URL
        // methods: ["GET", "POST", "PUT", "DELETE"],
        // allowedHeaders: ["Content-Type", "Authorization"],
        // credentials: true // Allows cookies and authentication headers
    })
);

// Explicitly handle OPTIONS (preflight) requests
app.options('*', cors());


// In production (i.e. on Vercel), do not call app.listen().
// Vercel automatically wraps your exported app as a serverless function.
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

app.use(express.json());        //express.json() is a middleware to parse files as json files

mongoose.connect(mongodbURL);           //Forming a connection with mongodb

const db = mongoose.connection;

// If the connection is successful 
db.on('open', () => {
    console.log('Database Connection Successful');          
})

// If the connection is not successsful
db.on('error', () => {
    console.log('Database Connection Unsuccessful');
})

// app routes
routes(app);