import {ReactNode} from "react";

// Represents a choice item
export type Item = {
    label: ReactNode; // A simple string will also be properly handled
    id: string;
};

export type ItemGroup = {
    label: string;
    id: string;
    items: Item[];
};
