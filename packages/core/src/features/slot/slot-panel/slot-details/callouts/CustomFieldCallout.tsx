import {t} from "@dashdoc/web-core";
import {Box, Flex, Text} from "@dashdoc/web-ui";
import {css} from "@emotion/react";
import {EditCustomFieldAction} from "features/slot/actions/edit-slot/EditCustomFieldAction";
import {CustomCallout} from "features/slot/slot-panel/slot-details/callouts/CustomCallout";
import React, {useState} from "react";
import {rightPolicyServices} from "services/rightPolicy.service";
import {FlowProfile, Slot, SlotCustomField} from "types";

type Props = {customField: SlotCustomField; slot: Slot; profile: FlowProfile};

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

export function CustomFieldCallout({customField, slot, profile}: Props) {
    const {label, value} = customField;
    const [isHovering, setIsHovering] = useState(false);
    const isMutable = rightPolicyServices.canUpdateSlot(slot, profile, "custom_fields");
    return (
        <Box
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            mt={6}
        >
            <Text variant="h1" color="grey.dark">
                {label}
            </Text>
            <CustomCallout mt={2}>
                <Flex justifyContent="space-between" alignItems="center" height="auto">
                    <Text whiteSpace="pre-wrap" variant="h1">
                        {value ?? t("common.empty")}
                    </Text>
                    {isMutable && (
                        <Box css={!isHovering && editBoxStyles}>
                            <EditCustomFieldAction customField={customField} slot={slot} />
                        </Box>
                    )}
                </Flex>
            </CustomCallout>
        </Box>
    );
}
