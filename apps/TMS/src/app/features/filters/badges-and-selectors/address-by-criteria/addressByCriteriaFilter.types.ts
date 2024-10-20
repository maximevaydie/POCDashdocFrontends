export type AddressesCriteriaQuery = {
    address_text?: string;
    address_country__in?: string;
    address_postcode__in?: string;

    destination_address_text?: string;
    destination_address_country__in?: string;
    destination_address_postcode__in?: string;

    origin_address_text?: string;
    origin_address_country__in?: string;
    origin_address_postcode__in?: string;
};
