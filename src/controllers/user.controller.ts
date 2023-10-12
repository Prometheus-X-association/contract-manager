import { Request, Response } from 'express';
import { genToken } from 'middlewares/auth.middleware';
import pipService from 'services/pip.service';

export const logUser = (req: Request, res: Response) => {
  const user = req.body;
  const token = genToken(user);
  res.json({ token });
};

export const addPolicies = (req: Request, res: Response) => {
  const newPolicies = req.body.policies;
  const invalidPolicies = pipService.addPolicies(req, newPolicies);
  if (invalidPolicies.length === 0) {
    res.status(200).json({ message: 'New policies injected successfully.' });
  } else {
    res.status(400).json({
      message: 'The following policies are not valid:',
      invalidPolicies,
    });
  }
};
