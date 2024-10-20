import {getConnectedCompany, getConnectedManager} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Flex, Icon, Text, FlexProps} from "@dashdoc/web-ui";
import isNil from "lodash.isnil";
import React, {FunctionComponent} from "react";

import {documentAnalyticsService} from "app/features/document/documentAnalytics.service";
import {useSelector} from "app/redux/hooks";

type ExtractedReferenceProps = FlexProps & {
    reference: string;
    extractedReference: string | null;
    onUseButtonClick: () => void;
    displayedFrom: "document_modal" | "edition_modal";
};

export const ExtractedReference: FunctionComponent<ExtractedReferenceProps> = ({
    reference,
    extractedReference,
    onUseButtonClick,
    displayedFrom,
    ...flexProps
}) => {
    const connectedManager = useSelector(getConnectedManager);
    const connectedCompany = useSelector(getConnectedCompany);

    const onClick = () => {
        const actionType = reference ? "replace" : "add";

        onUseButtonClick();

        documentAnalyticsService.sendExtractedReferenceUsedAnalyticsEvent(
            connectedManager?.user,
            connectedCompany?.pk,
            displayedFrom,
            actionType
        );
    };

    const matchedReferences = extractedReference === reference;

    if (isNil(extractedReference) || extractedReference.trim() === "") {
        return null;
    }

    return (
        <Flex
            backgroundColor={matchedReferences ? "green.ultralight" : "grey.light"}
            alignItems="center"
            p={2}
            {...flexProps}
        >
            <Icon name="barcodeScan" pr={2} color="grey.ultradark" />
            <Flex flex={1}>
                <Text mr={1}>{t("referenceExtraction.detectedReference")}</Text>
                {!matchedReferences && <Text fontWeight="bold">&quot;</Text>}
                <Text fontWeight={!matchedReferences ? "bold" : "regular"}>
                    {extractedReference}
                </Text>
                {!matchedReferences && <Text fontWeight="bold">&quot;</Text>}
                <Text>.</Text>
            </Flex>
            {matchedReferences ? (
                <Icon name="checkCircle" color="green.dark" />
            ) : (
                <Text color="blue.default" onClick={onClick} style={{cursor: "pointer"}}>
                    {reference ? t("common.replace") : t("common.add")}
                </Text>
            )}
        </Flex>
    );
};
