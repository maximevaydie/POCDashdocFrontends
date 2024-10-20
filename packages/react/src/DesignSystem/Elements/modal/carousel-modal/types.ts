import {ModalProps} from "@dashdoc/web-ui";
import React from "react";

export type Step = {
    header: React.ReactNode;
    content: React.ReactNode;
};

export type CarouselModalProps = Partial<ModalProps> & {
    steps: Step[];
    finalStepConfirmLabel?: string;
    onClose?: () => void;
    onConfirmFinalStep: () => void;
};
