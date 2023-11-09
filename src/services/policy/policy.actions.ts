import repository, { StoreElement } from 'services/data.repository.service';
// odrl default action
const odrlLeftOperands: StoreElement = {
  absolutePosition: (target: string): number => {
    return 0;
  },
  absoluteSize: (target: string): number => {
    return 0;
  },
  absoluteSpatialPosition: (target: string): string => {
    return '0,0,0';
  },
  absoluteTemporalPosition: (target: string): Date => {
    return new Date();
  },
  count: (target: string): number => {
    return 0;
  },
  dateTime: (target: string): Date => {
    return new Date();
  },
  delayPeriod: (target: string): number => {
    return 0;
  },
  deliveryChannel: (target: string): string => {
    return 'online';
  },
  device: (target: string): string => {
    return 'deviceID';
  },
  elapsedTime: (target: string): number => {
    return 0;
  },
  event: (target: string): string => {
    return 'eventID';
  },
  fileFormat: (target: string): string => {
    return 'text/plain';
  },
  industry: (target: string): string => {
    return 'industryID';
  },
  language: (target: string): string => {
    return 'en';
  },
  media: (): string => {
    return 'mediaID';
  },
  meteredTime: (target: string): number => {
    return 0;
  },
  payAmount: (target: string): number => {
    return 0;
  },
  percentage: (target: string): number => {
    return 0;
  },
  product: (target: string): string => {
    return 'productID';
  },
  purpose: (target: string): string => {
    return 'purposeID';
  },
  recipient: (target: string): string => {
    return 'recipientID';
  },
  relativePosition: (target: string): number => {
    return 0;
  },
  relativeSize: (target: string): number => {
    return 0;
  },
  relativeSpatialPosition: (target: string): string => {
    return '0,0,0';
  },
  relativeTemporalPosition: (target: string): Date => {
    return new Date();
  },
  resolution: (target: string): string => {
    return 'HD';
  },
  spatial: (target: string): string => {
    return 'locationID';
  },
  spatialCoordinates: (target: string): string => {
    return 'latitude,longitude';
  },
  system: (target: string): string => {
    return 'systemID';
  },
  systemDevice: (target: string): string => {
    return 'systemDeviceID';
  },
  timeInterval: (target: string): number => {
    return 0;
  },
  unitOfCount: (target: string): number => {
    return 0;
  },
  version: (target: string): string => {
    return '0.0.0';
  },
  virtualLocation: (target: string): string => {
    return 'virtualLocationID';
  },
};

// Todo implementation
const vtRuleActions: StoreElement = {
  /*
    Ex: MUST describe their organisations and service offerings
    in a machine readable format and human readable
  */
  machineReadable: (target: string): boolean => {
    return true;
  },
  /*
  	Ex: MUST define clear data set terms of use
  */
  termsOfUse: (target: string): boolean => {
    return true;
  },
  /*
    Ex: MUST accept and comply with requests from the
    person on data sharing, consent and GDPR rights
  */
  acceptTracking: (target: string): boolean => {
    return true;
  },
  rgpdCompliant: (target: string): boolean => {
    return true;
  },
  userConsent: (target: string): boolean => {
    return true;
  },
  /*
    Ex: MUST use data within a specified time interval
    Ex: MUST use data for a specified time period
  */
  dateTime: (target: string): number => {
    return Date.now();
  },
  /*
    Ex: MUST not use data for more than n times
  */
  count: (target: string): number => {
    return 0;
  },
  /*
    Ex: CAN use data with notification message
  */
  notificationMessage: (target: string): string => {
    return '';
  },
};

repository.addData(vtRuleActions);
