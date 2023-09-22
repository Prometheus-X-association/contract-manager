import * as fs from 'fs';
import * as path from 'path';
import { IContract } from 'interfaces/contract.interface';
import { config } from 'config/config';
import { logger } from 'utils/logger';
import { AuthorizationPolicy } from './pdp.service';
import contractConfig, {
  IConstraints,
  IConstraint,
} from 'config/contrat.config';

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
    console.time('initContractModel');
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
    console.timeEnd('initContractModel');
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

  // Generate policies based on permissions and constraint configuration.
  public genPolicies(permissions: any): AuthorizationPolicy[] {
    const policies: AuthorizationPolicy[] = [];

    // Iterate through each permission provided.
    for (const permission of permissions) {
      const policy: AuthorizationPolicy = {
        // Set the subject of the policy to the '@type' property of the permission.
        subject: permission['@type'],
        // Set the action of the policy to the 'action' property of the permission.
        action: permission.action,
        conditions: {},
      };

      if (permission.constraint) {
        const constraintConfig: IConstraints = contractConfig.constraint;
        // Iterate through each constraint in the permission.
        for (const constraint of permission.constraint) {
          // Determine the type of the constraint based on '@type'.
          const constraintType = constraint[
            '@type'
          ] as keyof typeof constraintConfig.constraint;

          // Get the configuration for this constraint type.
          const constraintTypeConfig: IConstraint =
            contractConfig.constraint[constraintType];

          if (constraintTypeConfig) {
            const condition: Record<string, any> = {};
            const parent: string = constraintTypeConfig.field;

            if (typeof constraintTypeConfig.operator === 'string') {
              // Handle constraints with single operator ($eq).
              for (const key in constraint) {
                if (key !== '@type') {
                  condition[`${parent}.${key}`] = constraint[key];
                }
              }
            } else {
              condition[constraintTypeConfig.field] = {};
              const leftField: string | undefined =
                constraintTypeConfig.leftField;

              if (leftField) {
                // Handle constraints with multiple operators.
                const operator: string | undefined =
                  constraintTypeConfig.operator[constraint.operator];

                if (operator) {
                  const field: any = condition[constraintTypeConfig.field];
                  const rightField: string | undefined =
                    constraintTypeConfig.rightField;

                  if (rightField) {
                    field[operator] = constraint[rightField];
                  }
                } else {
                  logger.warn(
                    `Operator not supported in this constraint type: ${constraintType}`,
                  );
                }
              }
            }
            // Merge the condition into the policy's conditions.
            Object.assign(policy.conditions, condition);
          } else {
            // Log a warning for unsupported constraint types.
            logger.warn(`Unsupported constraint type: ${constraintType}`);
          }
        }
      }
      // Add the policy to the list of generated policies.
      policies.push(policy);
    }
    // Return the generated policies.
    return policies;
  }
}

export default ContractService.getInstance();
