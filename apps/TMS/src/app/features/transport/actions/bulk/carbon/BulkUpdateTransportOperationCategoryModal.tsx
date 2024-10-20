import {apiService} from "@dashdoc/web-common";
import {queryService, t} from "@dashdoc/web-core";
import {Box, Flex, Icon, Link, LoadingWheel, Modal, Text, toast} from "@dashdoc/web-ui";
import {HorizontalLine} from "@dashdoc/web-ui";
import React, {FunctionComponent, useState} from "react";

import {
    TransportOperationCategoryOption,
    TransportOperationCategorySelect,
} from "app/features/carbon-footprint/transport-operation-category/TransportOperationCategorySelect";
import {SelectedTransportsCountCallout} from "app/features/transport/actions/bulk/SelectedTransportsCountCallout";
import {SearchQuery} from "app/redux/reducers/searches";

type BulkUpdateTransportOperationCategoryStatus = "pending" | "loading" | "done";

type BulkUpdateTransportOperationCategoryModalProps = {
    selectedTransportsQuery: SearchQuery;
    selectedTransportsCount: number;
    onClose: () => void;
};

type BulkUpdateTransportOperationCategoryResponse = {
    updated_transports_count: number;
    not_allowed_transports: {uid: string; sequential_id: string}[];
};

export const BulkUpdateTransportOperationCategoryModal: FunctionComponent<
    BulkUpdateTransportOperationCategoryModalProps
> = ({selectedTransportsCount, selectedTransportsQuery, onClose}) => {
    const [status, setStatus] = useState<BulkUpdateTransportOperationCategoryStatus>("pending");
    const [result, setResult] = useState<BulkUpdateTransportOperationCategoryResponse | undefined>(
        undefined
    );
    const [selectedTransportOperationCategory, setSelectedTransportOperationCategory] = useState<
        TransportOperationCategoryOption | undefined
    >(undefined);

    async function handleSubmit() {
        setStatus("loading");
        try {
            const response: BulkUpdateTransportOperationCategoryResponse = await apiService.post(
                "/transports/bulk-update-transport-operation-category/",
                {
                    filters: queryService.toQueryString(selectedTransportsQuery),
                    transport_operation_category_uid: selectedTransportOperationCategory?.uid,
                },
                {apiVersion: "web"}
            );

            setResult(response);
            setStatus("done");
        } catch (error) {
            toast.error(t("common.error"));
            setStatus("pending");
        }
    }

    return (
        <Modal
            title={t("bulkAction.updateTransportOperationCategory.title")}
            id="bulk-update-transport-operation-category-modal"
            onClose={onClose}
            mainButton={
                status === "done"
                    ? {
                          type: "button",
                          onClick: onClose,
                          children: t("common.understood"),
                      }
                    : {
                          children: t("common.updateAndReplace"),
                          disabled: status !== "pending",
                          onClick: () => handleSubmit(),
                      }
            }
            secondaryButton={status !== "done" ? {type: "button", onClick: onClose} : undefined}
        >
            {status === "pending" && (
                <>
                    <SelectedTransportsCountCallout
                        selectedTransportsCount={selectedTransportsCount}
                    />

                    <Text my={4}>
                        {t("bulkAction.updateTransportOperationCategory.informationText")}
                    </Text>

                    <Box>
                        <TransportOperationCategorySelect
                            onChange={setSelectedTransportOperationCategory}
                            onSetDefaultValue={setSelectedTransportOperationCategory}
                            value={selectedTransportOperationCategory}
                        />
                    </Box>
                </>
            )}
            {status === "loading" && <LoadingWheel noMargin />}
            {status === "done" && result !== undefined && (
                <>
                    <Text variant="h1">{t("common.processing_completed")}</Text>
                    <Text variant="h2" mt={5} mb={3}>
                        {t("common.processing_summary")}
                    </Text>
                    <Box backgroundColor="grey.ultralight" p={4}>
                        {result.updated_transports_count > 0 && (
                            <Flex>
                                <Icon
                                    mr={2}
                                    name="checkCircle"
                                    color="green.dark"
                                    alignSelf="center"
                                />
                                <Text>
                                    {t(
                                        "bulkAction.updateTransportOperationCategory.updatedTransports",
                                        {
                                            smart_count: result.updated_transports_count,
                                        }
                                    )}
                                </Text>
                            </Flex>
                        )}
                        {result.updated_transports_count > 0 &&
                            result.not_allowed_transports.length > 0 && (
                                <HorizontalLine width="80%" my={2} />
                            )}
                        {result.not_allowed_transports.length > 0 && (
                            <Flex my={2}>
                                <Icon
                                    mr={2}
                                    name="removeCircle"
                                    color="red.dark"
                                    alignSelf="center"
                                />
                                <Text>
                                    {t(
                                        "bulkAction.updateTransportOperationCategory.transportsNotAllowed",
                                        {
                                            smart_count: result.not_allowed_transports.length,
                                        }
                                    )}

                                    <Box>
                                        {result.not_allowed_transports.map(
                                            ({uid, sequential_id}, index) => (
                                                <>
                                                    {index > 0 && ", "}
                                                    <Link
                                                        target="_blank"
                                                        href={`/app/transports/${uid}`}
                                                        rel="noopener noreferrer"
                                                    >
                                                        {sequential_id}
                                                    </Link>
                                                </>
                                            )
                                        )}
                                    </Box>
                                </Text>
                            </Flex>
                        )}
                    </Box>
                </>
            )}
        </Modal>
    );
};
