import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import rateLimit from 'express-rate-limit';
import { errorHandler } from './middleware/error.middleware';
import authRoutes from './routes/auth.routes';
import productRoutes from './routes/product.routes';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to URL Shortener API',
    version: '1.0.0',
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login'
      },
    }
  });
});

// Error handling
app.use(errorHandler);
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
const MONGODB_URI = "mongodb+srv://jimithothi:6wtOdwZwk3NfFHvo@cluster0.mtasuqc.mongodb.net/inventory-management?retryWrites=true&w=majority&appName=Cluster0";

// Database connection

mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('MongoDB connection error:', error));

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 
