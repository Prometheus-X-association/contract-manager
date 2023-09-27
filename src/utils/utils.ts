import * as fs from 'fs';
import * as path from 'path';

export const loadModel = (modelPath: string) => {
  try {
    // Read the contract model configuration file
    const resolvedModelPath = path.resolve(process.cwd(), modelPath);
    const modelData = fs.readFileSync(resolvedModelPath, 'utf8');
    return JSON.parse(modelData);
  } catch (error) {
    // Handle errors produced when reading the contract model
    console.error(
      'An error occurred while reading the contract model\n',
      error,
    );
    return null;
  }
};

export const checkFieldsMatching = (a: any, b: any) => {
  let currentField;
  const recursiveFieldComparison = (a: any, b: any): boolean => {
    const inputFields = Object.keys(a);
    return inputFields.every((field) => {
      currentField = field;
      if (field in b) {
        const fieldValue = b[field];
        if (Array.isArray(fieldValue)) {
          return fieldValue.every((entry) =>
            a[field].every((arrayEntry: any) =>
              recursiveFieldComparison(arrayEntry, entry),
            ),
          );
        } else if (typeof fieldValue === 'object') {
          return recursiveFieldComparison(a[field], fieldValue);
        }
        // Check if the field has a null or undefined value
        return fieldValue !== null && fieldValue !== undefined;
      }
      return false;
    });
  };
  return {
    success: recursiveFieldComparison(a, b),
    field: currentField,
  };
};
