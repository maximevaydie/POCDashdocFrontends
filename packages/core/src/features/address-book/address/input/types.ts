import {Address, ExtractedNewAddress, OriginalAddress} from "dashdoc-utils";
import React from "react";

export type SuggestedAddress = {
    address: Address;
    tooltipContent: string;
    children?: React.ReactNode;
};

export interface OriginalAddressEnriched extends OriginalAddress {
    isLastExtracted?: boolean;
    isLastSuggested?: boolean;
    tooltipContent?: string;
    children?: React.ReactNode;
}

export interface ExtractedNewAddressEnriched extends ExtractedNewAddress {
    isLastExtracted?: boolean;
}

export type SearchAddressResult = {
    options: (OriginalAddressEnriched | ExtractedNewAddressEnriched)[];
    hasMore: boolean;
    additional: {
        page: number;
    };
};
