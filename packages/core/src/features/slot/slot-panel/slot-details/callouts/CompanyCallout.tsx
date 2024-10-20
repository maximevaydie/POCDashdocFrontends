import {t} from "@dashdoc/web-core";
import {Box, CompanyAvatar, Flex, Text} from "@dashdoc/web-ui";
import {css} from "@emotion/react";
import {EditCompanyAction} from "features/slot/actions/edit-slot/EditCompanyAction";
import {CustomCallout} from "features/slot/slot-panel/slot-details/callouts/CustomCallout";
import React, {useState} from "react";
import {rightPolicyServices} from "services/rightPolicy.service";
import {FlowProfile, Site, Slot} from "types";

const editBoxStyles = css`
    opacity: 0;
    pointer-events: auto;
    &:hover {
        opacity: 1;
        pointer-events: auto;
    }
    @media (max-width: 768px) {
        opacity: 1;
        pointer-events: auto;
    }
`;

type Props = {site: Site; slot: Slot; profile: FlowProfile};

export function CompanyCallout({site, slot, profile}: Props) {
    const [isHovering, setIsHovering] = useState(false);
    const {id: slotId, company} = slot;
    const isMutable = rightPolicyServices.canUpdateSlot(slot, profile, "company");
    return (
        <Box
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            mt={6}
        >
            <Text variant="h1" color="grey.dark">
                {t("common.company")}
            </Text>
            <CustomCallout mt={2}>
                <Flex justifyContent="space-between">
                    <Flex alignItems="center" style={{gap: "8px"}}>
                        <Box width="40px" height="40px" minWidth="auto" flexShrink={2}>
                            <CompanyAvatar name={company.name} />
                        </Box>
                        <Text ml={2} variant="h1">
                            {company.name}
                        </Text>
                    </Flex>
                    {isMutable && (
                        <Box css={!isHovering && editBoxStyles}>
                            <EditCompanyAction
                                site={site}
                                slotId={slotId}
                                defaultCompany={company}
                            />
                        </Box>
                    )}
                </Flex>
            </CustomCallout>
        </Box>
    );
}
