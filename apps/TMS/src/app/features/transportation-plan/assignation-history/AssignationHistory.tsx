import {apiService, useFeatureFlag} from "@dashdoc/web-common";
import {Logger, queryService, t} from "@dashdoc/web-core";
import {Flex, LoadingWheel, Text} from "@dashdoc/web-ui";
import React, {useEffect, useState} from "react";

import {TransportAssignationHistory} from "app/features/transportation-plan/assignation-history/types";
import {SearchQuery} from "app/redux/reducers/searches";

import {AssignedTransportHistoryCard} from "./components/AssignedTransportHistoryCard";
import {CurrentTransportInfo} from "./components/CurrentTransportInfo";
import {EmptyAssignationHistory} from "./components/EmptyAssignationHistory";

import type {Transport} from "app/types/transport";

type Props = (
    | {
          transport: Transport;
      }
    | {
          query: SearchQuery;
          // to be able to display the origin/destination/loads
          transport: Transport | null;
      }
) & {
    onSelect: (historyTransport: TransportAssignationHistory) => void;
};

export function AssignationHistory(props: Props) {
    const [isLoading, setIsLoading] = useState(false);
    const [transportsAssignationHistory, setTransportsAssignationHistory] = useState<
        TransportAssignationHistory[]
    >([]);
    const hasBetterCompanyRolesEnabled = useFeatureFlag("betterCompanyRoles");

    const transportUid = props.transport ? props.transport.uid : null;
    const transportFilters = "query" in props ? props.query : null;

    useEffect(() => {
        if (transportUid) {
            fetchTransportAssignationHistory(transportUid, hasBetterCompanyRolesEnabled);
        } else if (transportFilters) {
            fetchTransportsAssignationHistory(transportFilters, hasBetterCompanyRolesEnabled);
        }
    }, [transportUid, transportFilters, hasBetterCompanyRolesEnabled]);

    if (isLoading) {
        return (
            <>
                <Text variant="captionBold">{t("assignationHistory.title")}</Text>
                <LoadingWheel />
            </>
        );
    }

    if (transportsAssignationHistory.length === 0) {
        return (
            <>
                <Text variant="captionBold">{t("assignationHistory.title")}</Text>
                <EmptyAssignationHistory />
            </>
        );
    }

    return (
        <>
            <Flex alignItems="center" justifyContent={"space-between"} mb={5}>
                <Text variant="captionBold" mr={2}>
                    {t("assignationHistory.title")}
                </Text>
                <Text color="grey.dark">
                    {t("assignationHistory.lastTransports", {
                        smart_count: transportsAssignationHistory.length,
                    })}
                </Text>
            </Flex>
            {props.transport && <CurrentTransportInfo transport={props.transport} />}
            <Flex flexDirection="column">
                {transportsAssignationHistory.map((transportsAssignationHistory, index) => (
                    <AssignedTransportHistoryCard
                        key={index}
                        data-testid={`assigned-transport-history-card-${index}`}
                        transportAssignationHistory={transportsAssignationHistory}
                        onClick={() => {
                            props.onSelect(transportsAssignationHistory);
                        }}
                    />
                ))}
            </Flex>
        </>
    );

    async function fetchTransportAssignationHistory(transportUid: string, useWebApi: boolean) {
        setIsLoading(true);
        try {
            const transportsAssignationHistory: TransportAssignationHistory[] =
                await apiService.get(`/transports/${transportUid}/assignation-history/`, {
                    apiVersion: useWebApi ? "web" : "v4",
                });
            setTransportsAssignationHistory(transportsAssignationHistory);
        } catch (error) {
            Logger.log(`Error when trying to retrieve transport ${transportUid} history.`);
        } finally {
            setIsLoading(false);
        }
    }

    async function fetchTransportsAssignationHistory(
        transportFilters: SearchQuery,
        useWebApi: boolean
    ) {
        setIsLoading(true);
        const queryParams = queryService.toQueryString(transportFilters);
        try {
            const transportsAssignationHistory: TransportAssignationHistory[] =
                await apiService.get(`/transports/assignation-history/?${queryParams}`, {
                    apiVersion: useWebApi ? "web" : "v4",
                });
            setTransportsAssignationHistory(transportsAssignationHistory);
        } catch (error) {
            Logger.log(`Error when trying to retrieve transport ${queryParams} history.`);
        } finally {
            setIsLoading(false);
        }
    }
}
