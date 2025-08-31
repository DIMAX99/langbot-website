import { NextApiRequest, NextApiResponse } from 'next';
import { authHelpers } from '../../../lib/auth';
import { dbHelpers } from '../../../lib/database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { authorization } = req.headers;
    const { id } = req.query;

    if (!authorization || !authorization.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Conversation ID is required' });
    }

    const token = authorization.split(' ')[1];
    const user = authHelpers.verifyToken(token);

    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Get conversation messages
    const messages = await dbHelpers.getConversationMessages(parseInt(id));

    res.status(200).json({
      success: true,
      messages
    });

  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
