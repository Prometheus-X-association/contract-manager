// Contract constraint model
export interface IConstraint {
  field: string;
  operator:
    | {
        [key: string]: string;
      }
    | string;
  leftField?: string;
  rightField?: string;
}
export interface IConstraints {
  [key: string]: IConstraint;
}

const constraint: IConstraints = {
  spatial: {
    field: 'spatial',
    operator: '$eq',
  },
  dateTime: {
    field: 'dateTime',
    leftField: 'leftOperand',
    rightField: 'rightOperand',
    operator: {
      eq: '$eq',
      lt: '$lt',
      lte: '$lte',
      gt: '$gt',
      gte: '$gte',
    },
  },
};

export default { constraint };
