import { Request, Response } from 'express';
import repository from 'services/data.repository.service';

export const storeUserData = async (req: Request, res: Response) => {
  try {
    if (req.session?.id) {
      const data = Object.fromEntries(
        Object.entries(req.body).map(([key, value]) => [key, () => value]),
      );
      repository.addUserData(req.session.id, data);
      res.status(200).json({ message: 'Data has been added to the store.' });
    } else {
      throw new Error('Undefined session');
    }
  } catch (error: any) {
    res
      .status(500)
      .json({ message: 'Internal Server Error', error: error.message });
  }
};
