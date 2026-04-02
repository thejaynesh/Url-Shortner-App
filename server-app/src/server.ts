import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDb from './config/dbConfig';
import shortUrlRoutes from './routes/shortUrl';
import { getUrl } from './controllers/shorturl';

dotenv.config();
connectDb();

const port = process.env.PORT || 5001;
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:5173"],
    credentials: true,
  })
);

// API routes
app.use("/api", shortUrlRoutes);

// Direct root redirect for clean short URLs: e.g. http://localhost:5001/:id
app.get("/:id", getUrl);

app.listen(port, () => {
  console.log(`Server started successfully on port: ${port}`);
});
