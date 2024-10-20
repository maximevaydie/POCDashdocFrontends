export interface Suggestion {
    title: string;
    id: string;
    language: string;
    resultType: string;
    houseNumberType: string;
    address: {
        label: string;
        countryCode: string;
        countryName: string;
        stateCode: string;
        state: string;
        countyCode: string;
        county: string;
        city: string;
        district: string;
        street: string;
        postalCode: string;
        houseNumber: string;
    };
    position: {
        lat: number;
        lng: number;
    };
    access: {lat: number; lng: number}[];
    distance: number;
    mapView: {
        west: number;
        south: number;
        east: number;
        north: number;
    };
}
