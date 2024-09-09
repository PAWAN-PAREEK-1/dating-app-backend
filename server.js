import express from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import connectDb from './config/connectDb.js';  // Default import
import routes  from './routes/index.js';
import multer from 'multer'
import http from 'http';
import {setupSocket} from './config/socket.js';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



const server = http.createServer(app);
const io = setupSocket(server);




connectDb();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.json());

app.use(cors());

const storage = multer.memoryStorage();  // Can use diskStorage if needed
const upload = multer({ storage: storage });

app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  req.io = io;
  next();
});

// Apply multer middleware globally
app.use(upload.none());
app.use("/api", routes);



server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});


