import {PartnerDetailOutput} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Box, Card, Flex, LoadingWheel, Text, VerticalBarChart} from "@dashdoc/web-ui";
import {Company} from "dashdoc-utils";
import React from "react";

import {useData} from "./hooks/useData";
import {useDelayChart} from "./hooks/useDelayChart";
import {useDistributionOfActivityTimesChart} from "./hooks/useDistributionOfActivityTimesChart";
import {useKPI} from "./hooks/useKPI";
import {usePunctualityChart} from "./hooks/usePunctualityChart";

type Props = {
    company: Company | PartnerDetailOutput;
};

export function CarrierKpi({company}: Props) {
    const {loading, data} = useData(company);
    const delayChart = useDelayChart(data);
    const distributionOfActivityTimes = useDistributionOfActivityTimesChart(data);
    const punctualityChart = usePunctualityChart(data);
    const {cancelled, done, notDone} = useKPI(data);

    if (loading) {
        return <LoadingWheel />;
    }
    if (!data) {
        return <Text>{t("common.noResultFound")}</Text>;
    }

    return (
        <>
            <Card border="1px solid" borderColor="grey.light" borderRadius="4px" p={4}>
                <Text fontWeight={600} color="grey.dark">
                    {t("common.kpi")}
                </Text>
                <Flex mt={5} style={{gap: "18px"}} justifyContent="space-between">
                    <Flex flexDirection="column" style={{gap: "38px"}}>
                        <SimpleKpi title={t("dashboard.finishedTransports")} value={done} />
                    </Flex>
                    <Flex flexDirection="column" style={{gap: "38px"}}>
                        <SimpleKpi title={t("dashboard.ongoingTransports")} value={notDone} />
                        <SimpleKpi title={t("dashboard.cancelledTransports")} value={cancelled} />
                    </Flex>
                </Flex>
            </Card>

            <Card
                border="1px solid"
                borderColor="grey.light"
                borderRadius="4px"
                p={2}
                height="300px"
            >
                <Box height="300px" pr={4} pt={2}>
                    <VerticalBarChart {...delayChart} />
                </Box>
            </Card>

            <Card
                border="1px solid"
                borderColor="grey.light"
                borderRadius="4px"
                p={2}
                height="300px"
            >
                <Box height="300px" pr={4} pt={2}>
                    <VerticalBarChart {...distributionOfActivityTimes} />
                </Box>
            </Card>

            <Card
                border="1px solid"
                borderColor="grey.light"
                borderRadius="4px"
                p={2}
                height="300px"
            >
                <Box height="300px" pr={4} pt={2}>
                    <VerticalBarChart {...punctualityChart} />
                </Box>
            </Card>
        </>
    );
}

const SimpleKpi = ({title, value}: {title: string; value: string | number}) => (
    <Flex flexDirection="column" style={{gap: "8px"}}>
        <Text variant="h2" color="grey.default" whiteSpace="nowrap">
            {title}
        </Text>
        <Text variant="title" color="grey.dark">
            {value}
        </Text>
    </Flex>
);
