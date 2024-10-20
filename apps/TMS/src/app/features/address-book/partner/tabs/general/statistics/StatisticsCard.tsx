import {companyService, PartnerDetailOutput} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Card, Flex, Tabs, Text} from "@dashdoc/web-ui";
import {Company} from "dashdoc-utils";
import React from "react";

import {CarrierKpi} from "./CarrierKpi";

type Props = {
    company: Company | PartnerDetailOutput;
};
export function StatisticsCard({company}: Props) {
    const isCarrier = companyService.isCarrier(company);
    if (!isCarrier) {
        return null;
    }
    return (
        <Card mb={4} p={4}>
            <Text variant="h1" p={2}>
                {t("common.statistics")}
            </Text>

            <Tabs
                pl={4}
                tabs={[
                    {
                        label: t("common.carrier"),
                        testId: "company-stats-carrier-tab",
                        content: (
                            <Flex mt={2} flexDirection="column" style={{gap: "15px"}}>
                                <CarrierKpi company={company} />
                            </Flex>
                        ),
                    },
                ]}
                actionButton={null}
            />
        </Card>
    );
}
