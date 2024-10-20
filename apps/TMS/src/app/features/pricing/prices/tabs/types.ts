import {Pricing} from "dashdoc-utils";

export type PricingTab = {
    tab: string;
    ref: React.RefObject<{
        isDirty: boolean;
    }>;
    label: string | JSX.Element;
    content: JSX.Element;
    testId: string;
    readOnly: boolean;
    pricing: Pricing | null;
};
