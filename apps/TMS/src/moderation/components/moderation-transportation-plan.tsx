import {Box, Text, Link, Flex, LoadingWheel} from "@dashdoc/web-ui";
import React, {Fragment, useEffect, useState} from "react";

import {Api} from "moderation/Api";
import {BootstrapPanel} from "moderation/components/moderation-bootstrap-panel";

type Props = {
    companyPk: number;
};

type FetchedExport = {
    created: string;
    file: string;
};

/** To keep in sync with backend `TransportOfferExportOutputSerializer`*/
type ExportTransportationPlanResponse = {
    exports: FetchedExport[];
    status: "up-to-date" | "outdated" | "no-transport-offers" | "error";
    function_to_call: string;
};

const fetchExports = async (companyPk: number): Promise<ExportTransportationPlanResponse> => {
    try {
        const response = await Api.post(
            "transport-offers/exports/",
            {company_pk: companyPk},
            {apiVersion: "moderation"}
        );
        return response as ExportTransportationPlanResponse;
    } catch (error) {
        const jsonError = await error.json();
        alert(`Error: ${JSON.stringify(jsonError)}`);
        return {
            exports: [],
            status: "error",
            function_to_call: "",
        };
    }
};

export const ModerationTransportationPlan: React.FC<Props> = ({companyPk}) => {
    const [exportResponse, setExportResponse] = useState<
        ExportTransportationPlanResponse | undefined
    >(undefined);

    const fetch = async () => {
        const response = await fetchExports(companyPk);
        setExportResponse(response);
    };
    useEffect(() => {
        fetch();
    }, []);

    const renderExports = (response: ExportTransportationPlanResponse) => {
        if (response.status === "error") {
            return <Text> Something went wrong, please contact a dev about this.</Text>;
        }
        if (response.status === "no-transport-offers") {
            return <Text> This company does not have any transport offers.</Text>;
        }
        if (response.exports.length === 0) {
            return (
                <Text>
                    No export yet. Please ask some dev to create a new one by calling the following
                    function:
                    {response.function_to_call}
                </Text>
            );
        }
        const exports = response.exports;
        return (
            <>
                {response.status === "outdated" && (
                    <Text marginBottom={2}>
                        The transportation plan has been updated since the last export. Please ask
                        some dev to create a new one by calling the following function:{" "}
                        <Text variant="captionBold" display={"inline"}>
                            {response.function_to_call}
                        </Text>
                        .
                    </Text>
                )}

                <Text>Last transportation plan exports:</Text>

                {exports.map((exportItem) => (
                    <Flex key={exportItem.created} flexDirection={"row"}>
                        <Text marginRight={4}>
                            {new Date(exportItem.created).toLocaleString()}
                        </Text>
                        <Link href={exportItem.file} target={"_blank"}>
                            Download
                        </Link>
                    </Flex>
                ))}
            </>
        );
    };
    return (
        <Fragment>
            <BootstrapPanel title="Export Transportation Plan">
                <Box>{exportResponse ? renderExports(exportResponse) : <LoadingWheel />}</Box>
            </BootstrapPanel>
        </Fragment>
    );
};
