import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';

/**
 * Handles user registration.
 * Expects 'email' and 'password' in the request body.
 * Returns a success message upon successful registration, or an error message on failure.
 */
export const register = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const result = await AuthService.register(email, password);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(error.status || 500).json({ message: error.message || 'Server error', error });
  }
};

/**
 * Handles user login.
 * Expects 'email' and 'password' in the request body.
 * Returns a JWT token and success message upon successful authentication, or an error message on failure.
 */
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const result = await AuthService.login(email, password);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(error.status || 500).json({ message: error.message || 'Server error', error });
  }
};