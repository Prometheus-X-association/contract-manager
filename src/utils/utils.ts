import * as fs from 'fs';
import * as path from 'path';
import { logger } from './logger';

export const urlToOriginal = (
  url: string,
  params: Record<string, any>,
): string => {
  let formattedUrl = url;
  Object.entries(params).forEach(([key, value]) => {
    const regex = new RegExp(`${value}(\\/|$)`, 'g');
    formattedUrl = formattedUrl.replace(regex, `:${key}$1`);
  });
  return formattedUrl;
};

export const loadJsonFromFile = (jsonPath: string) => {
  try {
    // Read the contract model configuration file
    const resolvedModelPath = path.resolve(process.cwd(), jsonPath);
    const modelData = fs.readFileSync(resolvedModelPath, 'utf8');
    return JSON.parse(modelData);
  } catch (error) {
    // Handle errors produced when reading the contract model
    logger.error('An error occurred while reading the contract model\n', error);
    return null;
  }
};

export const checkFieldsMatching = (a: any, b: any) => {
  let currentField;
  const recursiveFieldComparison = (a: any, b: any): boolean => {
    const inputFields = Object.keys(a);
    return inputFields.every((field) => {
      currentField = field;
      return checkField(a, b, field);
    });
  };
  const checkField = (a: any, b: any, field: string): boolean => {
    if (!(field in b)) {
      return false;
    }
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
  };
  return { success: recursiveFieldComparison(a, b), field: currentField };
};

export const replaceValues = (obj: any, replacements: any) => {
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      if (typeof obj[key] === 'object') {
        replaceValues(obj[key], replacements);
      } else if (typeof obj[key] === 'string' && obj[key].startsWith('@')) {
        const replacementKey = obj[key].substring(2, obj[key].length - 1);
        if (replacements[replacementKey] !== undefined) {
          obj[key] = replacements[replacementKey];
        }
      }
    }
  }
};
