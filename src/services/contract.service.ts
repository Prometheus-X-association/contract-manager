import * as fs from 'fs';
import * as path from 'path';
import { IContract } from 'interfaces/contract.interface';
import { config } from 'config/config';
import { logger } from 'utils/logger';

let contractModel: any;
try {
  // Read the contract model configuration file
  const modelPath = path.resolve(process.cwd(), config.contract.modelPath);
  const modelData = fs.readFileSync(modelPath, 'utf8');
  contractModel = JSON.parse(modelData);
} catch (error) {
  // Handle errors produced when reading the contract model
  logger.error('An error occurred while reading the contract model\n', error);
}

// Validate the contract input data against the contract model
const isValid = (contract: IContract, model: any) => {
  let currentField;
  // Recursively validate fields through the contract
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
        // Check if the field has a null or undefined value
        return fieldValue !== null && fieldValue !== undefined;
      }
      return false;
    });
  };
  // Perform validation
  const valid = validateFields(contract, model);
  if (!valid) {
    throw `${currentField} is an invalid field.`;
  }
  return valid;
};

// Generate a contract based on the contract data
const genContract = (contractData: IContract): IContract => {
  if (!contractModel) {
    throw new Error('No contract model found.');
  }
  // Validate the contract input data against the contract model
  const valid = isValid(contractData, contractModel);
  // tmp
  logger.info(contractData);
  // Spread the input contrat data to the final contrat
  const generatedContract: IContract = {
    //, ... Missing fields here
    ...contractData,
  };
  return generatedContract;
};

export default { genContract };
