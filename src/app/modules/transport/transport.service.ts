import { amaduesHelper } from '../../../helpers/AmaduesHelper';
import { TransportModel } from './transport.interface';

const searchTransportFromAPis = async () => {
  const transport = await amaduesHelper.getTranspotOffers({
    startLocationCode: 'NYC',
    endAddressLine: '350 5th Ave',
    endCityName: 'New York',
    endZipCode: '10118',
    endCountryCode: 'US',
    endName: 'Empire State Building',
    endGeoCode: '40.748817,-73.985428',
    transferType: 'PRIVATE',
    startDateTime: '2025-11-20T09:00:00',
    passengers: 2,
    stopOvers: [
      {
        duration: 'PT2H30M',
        sequenceNumber: 1,
        addressLine: '30 Rockefeller Plaza',
        countryCode: 'US',
        cityName: 'New York',
        zipCode: '10112',
        name: 'Top of The Rock',
        geoCode: '40.758740,-73.978674',
        stateCode: 'NY',
      },
    ],
    passengerCharacteristics: [
      {
        passengerTypeCode: 'ADT',
        age: 20,
      },
      {
        passengerTypeCode: 'CHD',
        age: 10,
      },
    ],
}
);

  return transport;
};

export const TransportServices = {
  searchTransportFromAPis,
};
