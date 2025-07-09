import { Product } from '../models/product.model';

/**
 * ProductService provides methods to manage products in the inventory.
 */
export class ProductService {
  /**
   * Creates a new product with the provided data.
   * @param data - The product data including name, description, quantity, price, category, and image path.
   * @returns The created product document.
   */
  static async createProduct(data: any) {
    try {
      const { name, description, quantity, price, category, image } = data;
      const product = new Product({ name, description, quantity, price, category, image });
      await product.save();
      return product;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Retrieves a paginated list of products, optionally filtered by name, category, or stock status.
   * @param filters - Filtering and pagination options (name, category, stockStatus, page, limit).
   * @returns An object containing the products, total count, current page, and total pages.
   */
  static async getProducts(filters: any) {
    try {
      const { name, category, stockStatus } = filters;
      let { page = 1, limit = 10 } = filters;
      page = parseInt(page as string, 10) || 1;
      limit = parseInt(limit as string, 10) || 10;
      const filter: any = {};
      if (name) {
        filter.name = { $regex: name, $options: 'i' };
      }
      if (category) {
        filter.category = category;
      }
      if (stockStatus === 'in_stock') {
        filter.quantity = { $gt: 0 };
      } else if (stockStatus === 'out_of_stock') {
        filter.quantity = 0;
      }
      const total = await Product.countDocuments(filter);
      const products = await Product.find(filter)
        .skip((page - 1) * limit)
        .limit(limit);
      const totalPages = Math.ceil(total / limit);
      return {
        products,
        total,
        page,
        totalPages
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Retrieves a product by its unique identifier.
   * @param id - The product's unique identifier.
   * @returns The product document if found, otherwise null.
   */
  static async getProductById(id: string) {
    try {
      return await Product.findById(id);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Updates an existing product with the provided data.
   * @param id - The product's unique identifier.
   * @param data - The updated product data.
   * @returns The updated product document if found, otherwise null.
   */
  static async updateProduct(id: string, data: any) {
    try {
      const updateData: any = { ...data };
      return await Product.findByIdAndUpdate(id, updateData, { new: true });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Deletes a product by its unique identifier.
   * @param id - The product's unique identifier.
   * @returns The deleted product document if found, otherwise null.
   */
  static async deleteProduct(id: string) {
    try {
      return await Product.findByIdAndDelete(id);
    } catch (error) {
      throw error;
    }
  }
} 