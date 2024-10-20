/** In-dashdoc abstraction for an address,
 * typically used to wrap the output of an address search engine output.*/
export interface Place {
    address: string;
    postcode?: string;
    city: string;
    country: string;
    county?: string;
    countryCode: string;
    latitude?: number;
    longitude?: number;
    localityType: string;
}
