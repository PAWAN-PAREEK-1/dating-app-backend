import express from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import connectDb from './config/connectDb.js';  // Default import
import routes  from './routes/index.js';
import multer from 'multer' // Keep this as a named import

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;


connectDb();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.json());
const storage = multer.memoryStorage();  // Can use diskStorage if needed
const upload = multer({ storage: storage });

// Apply multer middleware globally
app.use(upload.none()); 
app.use("/api", routes);

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
