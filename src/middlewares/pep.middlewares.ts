import { Request, Response, NextFunction } from 'express';
import { IAuthorisationPolicy } from 'interfaces/policy.interface';
import repository from 'services/data.repository.service';
import pdp from 'services/policy/pdp.service';
import pip from 'services/policy/pip.service';
import policyService from 'services/policy/policy.provider.service';
import { logger } from 'utils/logger';

// Policy Enforcement Point
const pep = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Build user context policies
    let userPolicies: IAuthorisationPolicy[] | undefined =
      pip.getUserPolicyFromSession(req);
    // If no user policies exist, create and set them
    if (!userPolicies) {
      const newUserPolicy: IAuthorisationPolicy[] =
        pip.buildAuthenticationPolicy(req);
      pip.setUserPolicyToSession(req, newUserPolicy);
      userPolicies = newUserPolicy;
    }

    // Todo: to be removed
    // Temporary fake data for testing purpose
    const data: any = {
      age: 21,
      role: 'admin',
    };
    repository.addUserData(req.session.id, data);
    repository.addData(data);
    //

    // Filter user policies based on the current request
    const filteredUserPolicies = pip.filterUserPolicies(req, userPolicies);
    // Set reference policies
    const referencePolicy = await policyService.fetch();
    pdp.pushReferencePolicies(referencePolicy);
    // Check authorization against all user policies
    const isAuthorized =
      filteredUserPolicies.length &&
      filteredUserPolicies.every((policy) => {
        return pdp.evalPolicy(policy);
      });
    // Proceed to the next middleware if authorized; otherwise, respond with a 403 error
    if (isAuthorized) {
      next();
    } else {
      res
        .status(403)
        .json({ error: 'Unauthorized. Security policies not met.' });
    }
  } catch (error) {
    // Handle internal server error
    logger.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export default pep;
