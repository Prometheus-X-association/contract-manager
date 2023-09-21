import * as fs from 'fs';
import * as path from 'path';
import { IContract } from 'interfaces/contract.interface';
import { config } from 'config/config';
import { logger } from 'utils/logger';
import { AuthorizationPolicy } from './pdp.service';

// Contract Service
class ContractService {
  private contractModel: any;
  private static instance: ContractService;

  private constructor() {
    this.initContractModel();
  }

  public static getInstance(): ContractService {
    if (!ContractService.instance) {
      ContractService.instance = new ContractService();
    }
    return ContractService.instance;
  }

  private initContractModel() {
    try {
      // Read the contract model configuration file
      const modelPath = path.resolve(process.cwd(), config.contract.modelPath);
      const modelData = fs.readFileSync(modelPath, 'utf8');
      this.contractModel = JSON.parse(modelData);
    } catch (error) {
      // Handle errors produced when reading the contract model
      logger.error(
        'An error occurred while reading the contract model\n',
        error,
      );
    }
  }

  // Validate the contract input data against the contract model
  public isValid(contract: IContract): boolean {
    let currentField;
    const validateFields = (obj: any, model: any): boolean => {
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
    const valid = validateFields(contract, this.contractModel);
    if (!valid) {
      throw new Error(`${currentField} is an invalid field.`);
    }
    return valid;
  }

  // Generate a contract based on the contract data
  public genContract(contractData: IContract): IContract {
    if (!this.contractModel) {
      throw new Error('No contract model found.');
    }
    // Validate the contract input data against the contract model
    const valid = this.isValid(contractData);
    // tmp
    logger.info(contractData);
    // Spread the input contract data to the final contract
    const generatedContract: IContract = {
      // ... Missing fields here
      ...contractData,
    };
    return generatedContract;
  }

  // Generate policies (Todo, stub for now)
  public genPolicies(permission: any): AuthorizationPolicy[] {
    const policies: AuthorizationPolicy[] = [];
    return policies;
  }
}

export default ContractService.getInstance();
