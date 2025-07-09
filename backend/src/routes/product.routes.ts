import { Router } from 'express';
// @ts-ignore: If multer is not installed, run: npm install multer @types/multer
import multer, { StorageEngine, File as MulterFile } from 'multer';
import { authenticateJWT } from '../middleware/auth.middleware';
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct
} from '../controllers/product.controller';
import { body } from 'express-validator';
import { validateRequest } from '../middleware/validate.middleware';
import fs from 'fs';
import path from 'path';
import { upload } from '../middleware/upload.middleware';

const router = Router();

const productValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('quantity').isInt({ min: 0 }).withMessage('Quantity must be an integer >= 0'),
  body('price').isFloat({ gt: 0 }).withMessage('Price must be a positive number'),
  body('category').notEmpty().withMessage('Category is required'),
  validateRequest
];

router.post('/', authenticateJWT, upload.single('image'), (req: any, res: any, next: any) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Image is required.' });
  }
  next();
}, productValidation, createProduct);

router.get('/', authenticateJWT, getProducts);
router.get('/:id', authenticateJWT, getProductById);
router.put('/:id', authenticateJWT, upload.single('image'), productValidation, updateProduct);
router.delete('/:id', authenticateJWT, deleteProduct);

export default router; 