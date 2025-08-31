import { NextApiRequest, NextApiResponse } from 'next';
import { dbHelpers } from '../../../lib/database';
import { authHelpers } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password, name } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (!authHelpers.isValidEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    if (!authHelpers.isValidPassword(password)) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    // Check if user already exists
    const existingUser = await dbHelpers.getUserByEmail(email.toLowerCase());
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists with this email' });
    }

    // Hash password
    const hashedPassword = await authHelpers.hashPassword(password);

    // Create user
    const userId = await dbHelpers.createUser(email.toLowerCase(), hashedPassword, name);

    // Generate JWT token
    const token = authHelpers.generateToken({
      id: userId,
      email: email.toLowerCase(),
      name: name,
      preferred_language: 'en'
    });

    // Return success response
    res.status(201).json({
      success: true,
      token,
      user: {
        id: userId,
        email: email.toLowerCase(),
        name: name,
        preferred_language: 'en'
      }
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
