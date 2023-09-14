import { Request, Response, NextFunction } from 'express';
import pdp, { PDPAction, PDPPolicy } from 'services/pdp.service';

const pep = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // tmp
    const policy: PDPPolicy = {
      subjectType: 'contract',
      action: req.method as PDPAction,
      conditions: {
        message: 'hello',
      } /*
      fields: [],
      */,
    };

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
