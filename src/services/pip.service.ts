// Policy Information Point
import { PDPAction, PDPPolicy } from './pdp.service';
import { Request } from 'express';

// Temporary static policies for testing
const policies: PDPPolicy[] = [
  {
    subject: 'contract',
    action: 'GET',
    conditions: {},
  },
  {
    subject: 'contract',
    action: 'POST',
    conditions: {
      participant: 'admin',
    },
  },
  {
    subject: 'contract',
    action: 'DELETE',
    conditions: {
      participant: 'admin',
    },
  },
  {
    subject: 'user',
    action: 'GET',
    conditions: {
      task: 'login',
    },
  },
];

const buildAuthenticationPolicy = (req: Request) => {
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
  return policy;
};
export default { buildAuthenticationPolicy };
