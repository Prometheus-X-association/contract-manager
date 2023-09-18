// Policy Service
import { PDPPolicy } from './pdp.service';

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

const fetch = (): PDPPolicy[] => {
  return policies;
};
export default { fetch };
