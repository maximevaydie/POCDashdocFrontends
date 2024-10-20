import {Place} from "@dashdoc/web-core";

export type AddressSuggestedComponentProps = {
    complementaryDataAutocomplete?: {[key in "address" | "postcode" | "city" | "county"]?: string};
    placeholder?: string;
    label?: string;
    required?: boolean;
    className?: string;
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur?: (event: React.ChangeEvent<HTMLInputElement>) => void;
    value: any;
    name?: string;
    error?: string | boolean;
    disabled?: boolean;
    onSuggestionClick: (suggestion: Place) => void;
    ["data-testid"]: string;
};

export type SimpleAddress = {
    pk: number;
    address: string;
    city: string;
    postcode: string;
    country: string;
    latitude: number;
    longitude: number;
};
