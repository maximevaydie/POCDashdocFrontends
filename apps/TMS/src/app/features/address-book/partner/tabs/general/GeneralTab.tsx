import {
    companyService,
    getConnectedManager,
    managerService,
    PartnerDetailOutput,
} from "@dashdoc/web-common";
import {Box, Flex} from "@dashdoc/web-ui";
import {Company} from "dashdoc-utils";
import React from "react";

import {useSelector} from "app/redux/hooks";

import {ContactsCard} from "./contacts/ContactsCard";
import {InfoCard} from "./info/InfoCard";
import {InvoicingCard} from "./invoicing/InvoicingCard";
import {LogisticPointsCard} from "./logistic-points/LogisticPointsCard";
import {MergeDuplicatesCallout} from "./merge-duplicates/MergeDuplicatesCallout";
import {NotesCard} from "./notes/NotesCard";
import {StatisticsCard} from "./statistics/StatisticsCard";

type Props = {
    company: Company | PartnerDetailOutput;
    onUpdate: () => void;
};

export function GeneralTab({company, onUpdate}: Props) {
    const connectedManager = useSelector(getConnectedManager);

    const canShowDuplicates = managerService.hasAtLeastAdminRole(connectedManager);
    const isShipper = companyService.isShipper(company);

    return (
        <Box minWidth={900}>
            {canShowDuplicates && <MergeDuplicatesCallout company={company} />}
            <Flex>
                <Box flexGrow={1} minWidth={600}>
                    <Flex flexDirection="column" style={{gap: "15px"}}>
                        <InfoCard company={company} onUpdate={onUpdate} />
                        {isShipper && <InvoicingCard company={company} />}
                        <ContactsCard company={company} />
                    </Flex>
                </Box>
                <Box flexGrow={1} maxWidth={550} minWidth={450} ml={4}>
                    <Flex flexDirection="column">
                        <LogisticPointsCard company={company} />
                        <NotesCard company={company} />
                        <StatisticsCard company={company} />
                    </Flex>
                </Box>
            </Flex>
        </Box>
    );
}
