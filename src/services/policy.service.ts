import { Request } from 'express';

const evalPolicy = async (req: Request) => {
  return true;
};

export const pdp = { evalPolicy };
