import {t} from "@dashdoc/web-core";
import {ClickableBox, Flex, Modal} from "@dashdoc/web-ui";
import React, {FC, useState} from "react";

import {CarouselModalProps} from "./types";

export const CarouselModal: FC<CarouselModalProps> = ({
    steps,
    finalStepConfirmLabel,
    onClose,
    onConfirmFinalStep,
    ...modalProps
}) => {
    const [stepIndex, setStepIndex] = useState<number>(0);
    const step = steps[stepIndex];

    return (
        <Modal
            title={step.header}
            onClose={onClose}
            mainButton={
                stepIndex + 1 >= steps.length
                    ? {
                          children: finalStepConfirmLabel || t("common.understood"),
                          onClick: onConfirmFinalStep,
                          "data-testid": `${
                              modalProps["data-testid"] || "carousel-modal"
                          }-confirm-button`,
                      }
                    : {
                          children: t("common.next"),
                          onClick: () => setStepIndex((prevIndex) => prevIndex + 1),
                          "data-testid": `${
                              modalProps["data-testid"] || "carousel-modal"
                          }-next-button`,
                      }
            }
            secondaryButton={
                stepIndex > 0
                    ? {
                          children: t("common.previous"),
                          onClick: () => setStepIndex((prevIndex) => prevIndex - 1),
                          "data-testid": `${
                              modalProps["data-testid"] || "carousel-modal"
                          }-previous-button`,
                      }
                    : null
            }
            {...modalProps}
        >
            {step.content}
            <Flex mt={5} justifyContent="center">
                {steps.map((_, index) => {
                    let backgroundColor = "grey.light";
                    if (stepIndex > index) {
                        backgroundColor = "blue.light";
                    } else if (stepIndex === index) {
                        backgroundColor = "blue.default";
                    }

                    return (
                        <ClickableBox
                            key={index}
                            width={14}
                            height={14}
                            backgroundColor={backgroundColor}
                            hoverStyle={{bg: "blue.dark"}}
                            borderRadius="50%"
                            mx={1}
                            onClick={() => setStepIndex(index)}
                        />
                    );
                })}
            </Flex>
        </Modal>
    );
};
