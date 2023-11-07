import repository, { StoreElement } from 'services/data.repository.service';
// odrl default action
const odrlLeftOperands: { [key: string]: () => number | string | Date } = {
  absolutePosition: (): number => {
    return 0;
  },
  absoluteSize: (): number => {
    return 0;
  },
  absoluteSpatialPosition: (): string => {
    return '0,0,0';
  },
  absoluteTemporalPosition: (): Date => {
    return new Date();
  },
  count: (): number => {
    return 0;
  },
  dateTime: (): Date => {
    return new Date();
  },
  delayPeriod: (): number => {
    return 0;
  },
  deliveryChannel: (): string => {
    return 'online';
  },
  device: (): string => {
    return 'deviceID';
  },
  elapsedTime: (): number => {
    return 0;
  },
  event: (): string => {
    return 'eventID';
  },
  fileFormat: (): string => {
    return 'text/plain';
  },
  industry: (): string => {
    return 'industryID';
  },
  language: (): string => {
    return 'en';
  },
  media: (): string => {
    return 'mediaID';
  },
  meteredTime: (): number => {
    return 0;
  },
  payAmount: (): number => {
    return 0;
  },
  percentage: (): number => {
    return 0;
  },
  product: (): string => {
    return 'productID';
  },
  purpose: (): string => {
    return 'purposeID';
  },
  recipient: (): string => {
    return 'recipientID';
  },
  relativePosition: (): number => {
    return 0;
  },
  relativeSize: (): number => {
    return 0;
  },
  relativeSpatialPosition: (): string => {
    return '0,0,0';
  },
  relativeTemporalPosition: (): Date => {
    return new Date();
  },
  resolution: (): string => {
    return 'HD';
  },
  spatial: (): string => {
    return 'locationID';
  },
  spatialCoordinates: (): string => {
    return 'latitude,longitude';
  },
  system: (): string => {
    return 'systemID';
  },
  systemDevice: (): string => {
    return 'systemDeviceID';
  },
  timeInterval: (): number => {
    return 0;
  },
  unitOfCount: (): number => {
    return 0;
  },
  version: (): string => {
    return '0.0.0';
  },
  virtualLocation: (): string => {
    return 'virtualLocationID';
  },
};

// Todo implementation
const vtRuleActions: StoreElement = {
  /*
    Ex: MUST describe their organisations and service offerings
    in a machine readable format and human readable
  */
  machineReadable: (): boolean => {
    return true;
  },
  /*
  	Ex: MUST define clear data set terms of use
  */
  termsOfUse: (): boolean => {
    return true;
  },
  /*
    Ex: MUST accept and comply with requests from the
    person on data sharing, consent and GDPR rights
  */
  acceptTracking: (): boolean => {
    return true;
  },
  rgpdCompliant: (): boolean => {
    return true;
  },
  userConsent: (): boolean => {
    return true;
  },
  /*
    Ex: MUST use data within a specified time interval
    Ex: MUST use data for a specified time period
  */
  dateTime: (): number => {
    return Date.now();
  },
  /*
    Ex: MUST not use data for more than n times
  */
  count: (): number => {
    return 0;
  },
  /*
    Ex: CAN use data with notification message
  */
  notificationMessage: (): string => {
    return '';
  },
};

repository.addData(vtRuleActions);
