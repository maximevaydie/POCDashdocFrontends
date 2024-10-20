import {t} from "@dashdoc/web-core";
import {Box, Button, Flex, Icon, Text} from "@dashdoc/web-ui";
import {ActivityTurnoverData, formatNumber, useToggle} from "dashdoc-utils";
import React, {useMemo, useState} from "react";

import DocumentModal, {DisplayableDocument} from "app/features/document/DocumentModal";
import {fetchRetrieveTransport} from "app/redux/actions/transports";
import {useDispatch, useSelector} from "app/redux/hooks";
import {getChildTransportCost, getSubcontractingCostOfActivities} from "app/services/transport";

import type {SubcontractingChildTransport, Transport} from "app/types/transport";

export function SubContract({
    charteringChildTransport,
    meanTurnover,
}: {
    charteringChildTransport: SubcontractingChildTransport;
    meanTurnover: ActivityTurnoverData | null;
}) {
    const [shouldDisplayCharterConfirmation, displayCharteringDocument, hideCharterConfirmation] =
        useToggle(false);
    const [isCharterButtonLoading, setCharterButtonLoading] = useState(false);
    const dispatch = useDispatch();

    const childTransportCost = getChildTransportCost(charteringChildTransport);
    const costOfActivities = getSubcontractingCostOfActivities(childTransportCost, meanTurnover);
    const childTransportCostDisplay =
        childTransportCost === costOfActivities ? (
            <Text data-testid="activity-means-card-child-transport-cost">
                {t("components.cost")}{" "}
                {formatNumber(childTransportCost, {
                    style: "currency",
                    currency: "EUR",
                })}
            </Text>
        ) : (
            <Text data-testid="activity-means-card-child-transport-cost">
                {t("components.costOfActivities")}{" "}
                {formatNumber(costOfActivities, {
                    style: "currency",
                    currency: "EUR",
                })}
                {" ("}
                {formatNumber(meanTurnover?.weight_in_subcontracting, {
                    style: "percent",
                })}
                {")"}
            </Text>
        );

    const childTransport: Transport | null = useSelector((state) => {
        if (
            charteringChildTransport?.uid &&
            state.entities.transports?.[charteringChildTransport.uid]
        ) {
            return state.entities.transports[charteringChildTransport.uid] as any as Transport;
        }
        return null;
    });

    const loadChildTransport = async () => {
        if (!childTransport && charteringChildTransport?.uid) {
            dispatch(fetchRetrieveTransport(charteringChildTransport.uid));
        }
    };
    const charterConfirmationData = useMemo(() => {
        if (childTransport?.documents) {
            const charterConfirmation = childTransport.documents
                .reverse()
                .find((d) => d.category === "chc");
            if (charterConfirmation) {
                return {
                    url: charterConfirmation.file,
                    deliveryUid: charterConfirmation.delivery,
                    showInIFrame: true,
                    label: charterConfirmation.reference,
                };
            }
        }
        return null;
    }, [childTransport?.documents]);

    const isChildTransportDraftAssigned =
        charteringChildTransport.carrier_assignation_status === "draft_assigned";
    const isChildTransportAssigned =
        charteringChildTransport.carrier_assignation_status === "assigned";
    const shouldShowCharterConfirmationButton =
        charterConfirmationData && isChildTransportAssigned;

    return (
        <>
            <Box maxWidth={230}>
                <Flex>
                    <Icon name="carrier" mr={1} />
                    <Text>
                        {isChildTransportDraftAssigned
                            ? charteringChildTransport.draft_carrier_name
                            : charteringChildTransport.carrier_name}
                    </Text>
                </Flex>
                <Flex>
                    <Icon name="euro" mr={1} />
                    {childTransportCostDisplay}
                </Flex>
                <Flex>
                    <Icon name="instructions" mr={1} />
                    <Text
                        ellipsis
                        // Used to limit the size of the text,
                        // without it the text can overlap with the icon
                        flexBasis="100%"
                        // @ts-ignore
                        title={charteringChildTransport.instructions}
                    >
                        {t("common.instructions")} :{" "}
                        {charteringChildTransport.instructions || t("common.emptyInstructions")}
                    </Text>
                </Flex>
                {shouldShowCharterConfirmationButton && (
                    <Flex>
                        <Button
                            // To align the icon with other icons in the card
                            ml={-1}
                            variant="plain"
                            onClick={handleCharterConfirmation}
                            loading={isCharterButtonLoading}
                            data-testid="activity-means-card-charter-confirmation-button"
                        >
                            <Icon name="document" mr={1} />
                            {t("deliveryDocumentType.charterConfirmation")}
                        </Button>
                    </Flex>
                )}
            </Box>
            {shouldDisplayCharterConfirmation && charterConfirmationData && (
                <DocumentModal
                    documents={[charterConfirmationData as DisplayableDocument]}
                    onClose={hideCharterConfirmation}
                />
            )}
        </>
    );

    async function handleCharterConfirmation() {
        setCharterButtonLoading(true);
        await loadChildTransport();
        setCharterButtonLoading(false);
        displayCharteringDocument();
    }
}
