import { User } from '../models/user.model';
import jwt from 'jsonwebtoken';

/**
 * AuthService provides methods for user registration and authentication.
 */
export class AuthService {
  /**
   * Registers a new user with the provided email and password.
   * Throws an error if the email or password is missing, or if the user already exists.
   * @param email - The user's email address.
   * @param password - The user's password.
   * @returns A success message upon successful registration.
   */
  static async register(email: string, password: string) {
    try {
      if (!email || !password) {
        throw { status: 400, message: 'Email and password are required.' };
      }
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw { status: 409, message: 'User already exists.' };
      }
      const user = new User({ email, password });
      await user.save();
      return { message: 'User registered successfully.' };
    } catch (error) {
      // Rethrow for controller to handle, or customize as needed
      throw error;
    }
  }

  /**
   * Authenticates a user with the provided email and password.
   * Throws an error if the credentials are invalid.
   * Returns a JWT token upon successful authentication.
   * @param email - The user's email address.
   * @param password - The user's password.
   * @returns An object containing a success message and a JWT token.
   */
  static async login(email: string, password: string) {
    try {
      if (!email || !password) {
        throw { status: 400, message: 'Email and password are required.' };
      }
      const user = await User.findOne({ email });
      if (!user) {
        throw { status: 401, message: 'Invalid credentials.' };
      }
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        throw { status: 401, message: 'Invalid credentials.' };
      }
      const token = jwt.sign(
        { userId: user._id, email: user.email },
        process.env.JWT_SECRET || 'default_jwt_secret',
        { expiresIn: '1h' }
      );
      return { message: 'Login successful.', token };
    } catch (error) {
      // Rethrow for controller to handle, or customize as needed
      throw error;
    }
  }
} 