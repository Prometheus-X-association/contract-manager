// Policy Enforcement Point
import { Request, Response, NextFunction } from 'express';
import pdp, { AuthorizationPolicy } from 'services/pdp.service';
import pip from 'services/pip.service';
import policyService from 'services/policy.provider.service';
import { logger } from 'utils/logger';

const pep = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const policy: AuthorizationPolicy = pip.buildAuthenticationPolicy(req);
    pdp.defineReferencePolicies(policyService.fetch());
    const isAuthorized = pdp.evalPolicy(policy);
    if (isAuthorized) {
      next();
    } else {
      res
        .status(403)
        .json({ error: 'Unauthorized. Security policies not met.' });
    }
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export default pep;
