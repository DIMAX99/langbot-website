import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export interface User {
  id: number;
  email: string;
  name?: string;
  preferred_language?: string;
}

export const authHelpers = {
  // Hash password
  hashPassword: async (password: string): Promise<string> => {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  },

  // Compare password
  comparePassword: async (password: string, hashedPassword: string): Promise<boolean> => {
    return await bcrypt.compare(password, hashedPassword);
  },

  // Generate JWT token
  generateToken: (user: User): string => {
    return jwt.sign(
      { 
        id: user.id, 
        email: user.email,
        name: user.name,
        preferred_language: user.preferred_language
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
  },

  // Verify JWT token
  verifyToken: (token: string): User | null => {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      return {
        id: decoded.id,
        email: decoded.email,
        name: decoded.name,
        preferred_language: decoded.preferred_language
      };
    } catch (error) {
      return null;
    }
  },

  // Validate email format
  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Validate password strength
  isValidPassword: (password: string): boolean => {
    // At least 6 characters
    return password.length >= 6;
  }
};

export default authHelpers;
