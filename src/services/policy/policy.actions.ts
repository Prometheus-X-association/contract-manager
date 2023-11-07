import repository, { StoreElement } from 'services/data.repository.service';
/*
'absolutePosition';
'absoluteSize';
'absoluteSpatialPosition';
'absoluteTemporalPosition';
'count';
'dateTime';
'delayPeriod';
'deliveryChannel';
'device';
'elapsedTime';
'event';
'fileFormat';
'industry';
'language';
'media';
'meteredTime';
'payAmount';
'percentage';
'product';
'purpose';
'recipient';
'relativePosition';
'relativeSize';
'relativeSpatialPosition';
'relativeTemporalPosition';
'resolution';
'spatial';
'spatialCoordinates';
'system';
'systemDevice';
'timeInterval';
'unitOfCount';
'version';
'virtualLocation';
*/
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
  dateTime: (): number => {
    return Date.now();
  },
  count: (): number => {
    return 0;
  },
  notificationMessage: (): string => {
    return '';
  },
};

repository.addData(vtRuleActions);
