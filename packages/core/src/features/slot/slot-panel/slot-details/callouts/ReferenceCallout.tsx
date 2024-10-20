import {t} from "@dashdoc/web-core";
import {Box, Flex, Text} from "@dashdoc/web-ui";
import {css} from "@emotion/react";
import {AddReferenceAction} from "features/slot/actions/edit-slot/AddReferenceAction";
import {EditReferenceAction} from "features/slot/actions/edit-slot/EditReferenceAction";
import {CustomCallout} from "features/slot/slot-panel/slot-details/callouts/CustomCallout";
import React, {useState} from "react";
import {rightPolicyServices} from "services/rightPolicy.service";
import {FlowProfile, Slot} from "types";

type Props = {slot: Slot; profile: FlowProfile};

const editBoxStyles = css`
    opacity: 0;
    pointer-events: none;
    &:hover {
        opacity: 1;
        pointer-events: auto;
    }
    @media (max-width: 768px) {
        opacity: 1;
        pointer-events: auto;
    }
`;

export function ReferenceCallout({slot, profile}: Props) {
    const {id: slotId} = slot;
    const references = slot.references ?? [];
    const [isHovering, setIsHovering] = useState(false);
    const isEmptyReferences = references.length === 0;
    const referencesString = references.join(", ");
    const isMutable = rightPolicyServices.canUpdateSlot(slot, profile, "references");
    return (
        <Box
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            mt={6}
        >
            <Text variant="h1" color="grey.dark">
                {t("common.references")}
            </Text>
            <CustomCallout mt={2}>
                <Flex justifyContent="space-between" alignItems="center" height="auto">
                    {isEmptyReferences && isMutable && (
                        <Box>
                            <AddReferenceAction references={references} slotId={slotId} />
                        </Box>
                    )}
                    <Text whiteSpace="pre-wrap" variant="h1">
                        {referencesString ?? t("common.empty")}
                    </Text>
                    {!isEmptyReferences && isMutable && (
                        <Box css={!isHovering && editBoxStyles}>
                            <EditReferenceAction references={references} slotId={slotId} />
                        </Box>
                    )}
                </Flex>
            </CustomCallout>
        </Box>
    );
}
