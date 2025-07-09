import { Request, Response } from 'express';
import { ProductService } from '../services/product.service';
import fs from 'fs';
import path from 'path';

/**
 * Creates a new product.
 * Expects 'name', 'description', 'quantity', 'price', 'category' in the request body,
 * and an image file in 'req.file'.
 * Returns the created product or an error if the image is missing or creation fails.
 */
export const createProduct = async (req: Request, res: Response) => {
  try {
    const { name, description, quantity, price, category } = req.body;
    if (!req.file) {
      return res.status(400).json({ message: 'Image is required.' });
    }
    // Save only the file path (relative to your project root or public URL)
    const imagePath = req.file.path; // e.g., 'uploads/1234567890.png'
    const product = await ProductService.createProduct(
      { name, description, quantity, price, category, image: imagePath }
    );
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

/**
 * Retrieves a paginated list of products.
 * Supports optional filtering by name, category, and stock status via query parameters.
 * Returns an object containing products, total count, current page, and total pages.
 */
export const getProducts = async (req: Request, res: Response) => {
  try {
    const result = await ProductService.getProducts(req.query);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

/**
 * Retrieves a single product by its ID.
 * Returns the product if found, or a 404 error if not found.
 */
export const getProductById = async (req: Request, res: Response) => {
  try {
    const product = await ProductService.getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

/**
 * Updates an existing product by its ID.
 * Accepts updated fields in the request body and an optional image file.
 * Returns the updated product or a 404 error if the product does not exist.
 */
export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { name, description, quantity, price, category } = req.body;
    let imagePath;
    let oldImagePath;
    if (req.file) {
      imagePath = req.file.path;
      // Fetch the existing product to get the old image path
      const existingProduct = await ProductService.getProductById(req.params.id);
      if (existingProduct && existingProduct.image) {
        oldImagePath = existingProduct.image;
      }
    }
    const product = await ProductService.updateProduct(
      req.params.id,
      { name, description, quantity, price, category, ...(imagePath && { image: imagePath }) }
    );
    if (!product) {
      // If product not found, optionally delete the newly uploaded image to avoid orphan files
      if (imagePath) {
        fs.unlink(imagePath, () => {});
      }
      return res.status(404).json({ message: 'Product not found.' });
    }
    // Delete the old image file if a new one was uploaded and the old image exists
    if (oldImagePath && imagePath && oldImagePath !== imagePath) {
      fs.unlink(oldImagePath, (err) => {
        // Ignore errors (file may not exist)
      });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

/**
 * Deletes a product by its ID.
 * Returns a success message if deleted, or a 404 error if the product does not exist.
 */
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const product = await ProductService.deleteProduct(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }
    res.status(200).json({ message: 'Product deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
}; 