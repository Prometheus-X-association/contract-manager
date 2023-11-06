import repository, { StoreElement } from 'services/data.repository.service';

// todo implementation
const vtRuleActions: StoreElement = {
  machineReadable: (): boolean => {
    return true;
  },
  termsOfUse: (): boolean => {
    return true;
  },
  acceptTracking: (): boolean => {
    return true;
  },
  rgpdCompliant: (): boolean => {
    return true;
  },
  userConsent: (): boolean => {
    return true;
  },
};

repository.addData(vtRuleActions);
