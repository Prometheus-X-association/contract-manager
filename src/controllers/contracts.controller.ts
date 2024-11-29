/// This controller is for processing demands that should act on all contracts instead of only "bilateral" or "ecosystem" contracts.

import { Request, Response } from 'express';
import bilateralService from 'services/bilateral.service';
import contractService from 'services/contract.service';

export const removeOfferingFromContracts = async (
  req: Request,
  res: Response,
) => {
  try {
    const { offeringId } = req.params;

    const [contractsRemoved, contractsModified] = await Promise.all([
      contractService.removeOfferingFromContracts(offeringId),
      bilateralService.deleteManyFromOffering(offeringId),
    ]);

    res.status(200).json({
      message: 'Offering removed from contracts',
      contractsModified,
      contractsRemoved,
    });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({
      message: 'Failed to remove offering from contracts',
      error: error.message,
    });
  }
};
