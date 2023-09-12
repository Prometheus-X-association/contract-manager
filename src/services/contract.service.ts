import { IContract, IContractHeader } from 'models/contract.model';

export const genContract = (contractData: IContractHeader): IContract => {
  const generatedContract: IContract = {
    ...contractData,
    generated: true,
  };
  return generatedContract;
};
