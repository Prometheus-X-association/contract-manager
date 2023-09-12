import * as fs from 'fs';
import * as path from 'path';
import { IContract, IContractHeader } from 'models/contract.model';
import { config } from 'config/config';

let contractModel: any /*: IContract | null*/ = null;

const modelPath = path.resolve(process.cwd(), config.contract.modelPath);
try {
  const data = fs.readFileSync(modelPath, 'utf8');
  contractModel = JSON.parse(data);
  //
} catch (err) {
  console.error('Error while loading contract model', err);
}
const genContract = (contractData: IContractHeader): IContract => {
  if (!contractModel) {
    throw new Error('No contract model found.');
  }
  const generatedContract: IContract = {
    ...contractData,
    generated: true,
  };
  return generatedContract;
};

export default { genContract };
