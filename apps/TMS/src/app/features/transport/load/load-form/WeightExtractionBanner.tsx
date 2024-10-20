import {t} from "@dashdoc/web-core";
import {Flex, Icon, Text} from "@dashdoc/web-ui";
import isNil from "lodash.isnil";
import React from "react";

interface WeightExtractionBannerProps {
    extractedWeight: number | null;
    weight: number | string | null;
}

export function WeightExtractionBanner({extractedWeight, weight}: WeightExtractionBannerProps) {
    const displayBanner = !isNil(extractedWeight) && extractedWeight != -1 && !!weight;

    let backgroundColor = "grey.light";
    let iconColor = "grey.dark";
    let textColor = "grey.dark";
    let text = t("weightExtraction.validatedWeight");
    if (
        displayBanner &&
        Math.abs((typeof weight === "number" ? weight : parseFloat(weight)) - extractedWeight) >= 1
    ) {
        backgroundColor = "yellow.ultralight";
        iconColor = "yellow.dark";
        textColor = "yellow.dark";
        text = t("weightExtraction.notValidatedWeight", {
            extracted_weight: extractedWeight,
        });
    }

    return displayBanner ? (
        <Flex bg={backgroundColor} mb={2} borderRadius={1} p={1} alignItems="center">
            <Icon name="officeFileStampAlternate" color={iconColor} m={3} />
            <Text color={textColor}>{text}</Text>
        </Flex>
    ) : null;
}
