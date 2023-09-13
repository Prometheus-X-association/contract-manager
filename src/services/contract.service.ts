import * as fs from 'fs';
import * as path from 'path';
import { IContract } from 'models/interfaces/contract.interface';
import { config } from 'config/config';

let contractModel: any;
try {
  const modelPath = path.resolve(process.cwd(), config.contract.modelPath);
  const modelData = fs.readFileSync(modelPath, 'utf8');
  contractModel = JSON.parse(modelData);
} catch (error) {
  console.error('An error occured while reading contract model\n', error);
}

const isValid = (contract: IContract, model: any) => {
  let currentField;
  const validateFields = (obj: any, model: any): any => {
    const inputFields = Object.keys(obj);
    return inputFields.every((field) => {
      currentField = field;
      if (field in model) {
        const fieldValue = model[field];
        if (Array.isArray(fieldValue)) {
          return fieldValue.every((entry) =>
            obj[field].every((arrayEntry: any) =>
              validateFields(arrayEntry, entry),
            ),
          );
        } else if (typeof fieldValue === 'object') {
          return validateFields(obj[field], fieldValue);
        }
        return fieldValue !== null && fieldValue !== undefined;
      }

      return false;
    });
  };
  const valid = validateFields(contract, model);
  if (!valid) {
    throw `${currentField} is an invalid field.`;
  }
  return valid;
};

const genContract = (contractData: IContract): IContract => {
  if (!contractModel) {
    throw new Error('No contract model found.');
  }
  const valid = isValid(contractData, contractModel);
  //
  console.log(contractData);
  const generatedContract: IContract = {
    ...contractData,
  };
  return generatedContract;
};

export default { genContract };
