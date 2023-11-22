import { Request, Response } from 'express';
import { genToken } from 'middlewares/auth.middleware';
import pipService from 'services/policy/pip.service';
import repository from 'services/data.repository.service';

export const logUser = (req: Request, res: Response) => {
  const user = req.body;
  const token = genToken(user);
  res.cookie('authToken', token, { httpOnly: true });
  res.json({ token });
};

export const addPolicies = async (req: Request, res: Response) => {
  const newPolicies = req.body.policies;
  try {
    const invalidPolicies = await pipService.addPolicies(req, newPolicies);
    if (invalidPolicies.length === 0) {
      res.status(200).json({ message: 'New policies injected successfully.' });
    } else {
      res.status(400).json({
        message: 'The following policies are not valid:',
        invalidPolicies,
      });
    }
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

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
