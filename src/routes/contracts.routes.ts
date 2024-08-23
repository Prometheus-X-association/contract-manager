/// Router for operations that should be performed on all kind of contracts

import { removeOfferingFromContracts } from 'controllers/contracts.controller';
import { Router } from 'express';

const router: Router = Router();

router.delete(
  '/contracts/offerings/:offeringId',
  removeOfferingFromContracts,
);

export default router;
