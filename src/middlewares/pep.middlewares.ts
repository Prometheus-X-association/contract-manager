import { Request, Response, NextFunction } from 'express';
import pdp, { PDPAction, PDPPolicy } from 'services/pdp.service';

const pep = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const urlSegments = req.url.split('/');
    const policy: PDPPolicy = {
      subject: urlSegments[1],
      action: req.method as PDPAction,
    };

    // tmp
    policy.conditions =
      policy.subject === 'user'
        ? {
            task: urlSegments[2],
          }
        : policy.subject === 'contract'
        ? {
            participant: 'admin',
          }
        : {};
    const isAuthorized = await pdp.evalPolicy(policy);
    if (isAuthorized) {
      next();
    } else {
      res
        .status(403)
        .json({ error: 'Unauthorized. Security policies not met.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export default pep;
