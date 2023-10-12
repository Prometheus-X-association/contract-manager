import { Request, Response, NextFunction } from 'express';
import { IAuthorisationPolicy } from 'interfaces/policy.interface';
import pdp from 'services/pdp.service';
import pip from 'services/pip.service';
import policyService from 'services/policy.provider.service';
import { logger } from 'utils/logger';

// Policy Enforcement Point
const pep = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let userPolicies: IAuthorisationPolicy[] | undefined =
      pip.getUserPolicyFromSession(req);

    if (!userPolicies) {
      const newUserPolicy: IAuthorisationPolicy[] =
        pip.buildAuthenticationPolicy(req);
      pip.setUserPolicyToSession(req, newUserPolicy);
      userPolicies = newUserPolicy;
    }
    const referencePolicy = await policyService.fetch();
    pdp.defineReferencePolicies(referencePolicy);
    const isAuthorized = userPolicies.every((policy) => {
      return pdp.evalPolicy(policy);
    });
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
