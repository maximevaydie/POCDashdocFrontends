import {t} from "@dashdoc/web-core";
import {Box, Flex, Icon} from "@dashdoc/web-ui";
import isNil from "lodash.isnil";
import React, {FunctionComponent} from "react";

import type {Load} from "app/types/transport";

export const getWeightExtractionStatus = (
    weightExtractionInProgress: boolean,
    extractedWeight: number,
    realLoad: Load
) => {
    // display weight extraction only if there is a weight to check
    if (realLoad?.weight) {
        if (weightExtractionInProgress) {
            return "in_progress";
        }
        if (extractedWeight === -1) {
            return "fail";
        }
        if (!isNil(extractedWeight)) {
            if (
                Math.abs(
                    (typeof realLoad.weight === "number"
                        ? realLoad.weight
                        : parseFloat(realLoad.weight)) - extractedWeight
                ) < 1
            ) {
                return "validated";
            } else {
                return "notValidated";
            }
        }
    }
    return null;
};

interface WeightExtractionRowProps {
    weightExtractionStatus: string;
    extractedWeight: number;
    realLoad: Load;
}

export const WeightExtractionRow: FunctionComponent<WeightExtractionRowProps> = ({
    weightExtractionStatus,
    extractedWeight,
    realLoad,
}) => {
    let weightExtractionText;
    let weightExtractionTextColor;
    let weightExtractionIconColor;
    switch (weightExtractionStatus) {
        case "in_progress":
            weightExtractionText = t("weightExtraction.inProgress");
            weightExtractionTextColor = "grey.dark";
            weightExtractionIconColor = "grey.dark";
            break;
        case "fail":
            weightExtractionText = t("weightExtraction.fail");
            weightExtractionTextColor = "yellow.dark";
            weightExtractionIconColor = "yellow.dark";
            break;
        case "validated":
            weightExtractionText = t("weightExtraction.validatedWeight");
            weightExtractionTextColor = "grey.dark";
            weightExtractionIconColor = "grey.dark";
            break;
        case "notValidated":
            weightExtractionText = t("weightExtraction.notValidatedWeight", {
                extracted_weight: extractedWeight,
            });
            weightExtractionTextColor = "yellow.dark";
            weightExtractionIconColor = "yellow.dark";
            break;
    }

    const getWeightDiffText = () => {
        const diff =
            // @ts-ignore
            (typeof realLoad.weight === "number" ? realLoad.weight : parseFloat(realLoad.weight)) -
            extractedWeight;
        return `${diff < 0 ? "-" : "+"} ${Math.abs(diff)}kg`;
    };

    return (
        <Flex mt={2} alignItems="center" data-testid="weight-extraction-row">
            <Icon name="officeFileStampAlternate" mr={3} color={weightExtractionIconColor} />
            <Flex
                flexDirection="column"
                flex={5}
                overflow="hidden"
                color={weightExtractionTextColor}
            >
                {weightExtractionText}
            </Flex>
            {weightExtractionStatus === "notValidated" && (
                <Flex flex={1} overflow="hidden">
                    <Box
                        flexDirection="column"
                        bg="yellow.light"
                        borderRadius={1}
                        fontWeight="bold"
                        py={1}
                        px={3}
                        color="yellow.dark"
                    >
                        {getWeightDiffText()}
                    </Box>
                </Flex>
            )}
        </Flex>
    );
};
