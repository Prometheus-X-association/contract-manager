import { Request, Response } from 'express';
import axios from 'axios';
import { logger } from 'utils/logger';
import { config } from 'config/config';

// temporary controller
export const getSomething = async (req: Request, res: Response) => {
  try {
    const response = await axios.get(config.catalog.url);
    res.json(response.data);
  } catch (error) {
    logger.error('Error while making a request to catalog', error);
    res.status(500).json({ error: 'Error while making a request to catalog' });
  }
};
