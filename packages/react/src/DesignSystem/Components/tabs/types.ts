import {ReactNode} from "react";

export type TabProps = {
    active: boolean;
    index: number;
    children: ReactNode;
    testId?: string;
    onClick: (() => void) | null;
};
