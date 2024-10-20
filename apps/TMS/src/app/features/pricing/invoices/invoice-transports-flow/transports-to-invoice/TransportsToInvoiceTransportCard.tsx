import {Flex, Icon, theme} from "@dashdoc/web-ui";
import React, {FunctionComponent} from "react";

import {InvoiceTransportResume} from "../components/InvoiceTransportResume";

import type {Transport} from "app/types/transport";

type TransportsToInvoiceTransportCardProps = {
    transport: Transport;
    selected: boolean;
    dataTestId?: string;
    handleSelectTransport: () => void;
    handleUnselectTransport: () => void;
    handleShowTransportPreview: () => void;
};

const TransportsToInvoiceTransportCard: FunctionComponent<
    TransportsToInvoiceTransportCardProps
> = ({
    transport,
    selected,
    dataTestId,
    handleSelectTransport,
    handleUnselectTransport,
    handleShowTransportPreview,
}) => {
    return (
        <Flex
            data-testid={dataTestId}
            borderColor="grey.light"
            borderWidth="1px"
            borderStyle="solid"
            alignItems="stretch"
            backgroundColor={selected ? "blue.ultralight" : "transparent"}
            css={{
                "&:hover": {
                    backgroundColor: selected ? theme.colors.blue.light : theme.colors.grey.light,
                },
                cursor: "pointer",
            }}
            onClick={handleShowTransportPreview}
        >
            {selected ? (
                <Flex
                    data-testid={`${dataTestId}-selected`}
                    p={3}
                    onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        handleUnselectTransport();
                    }}
                    css={{
                        "&:hover": {
                            backgroundColor: theme.colors.blue.ultralight,
                        },
                    }}
                >
                    <Icon
                        name="checkCircle"
                        color="blue.default"
                        size="16px"
                        style={{cursor: "pointer"}}
                    />
                </Flex>
            ) : (
                <Flex
                    data-testid={`${dataTestId}-unselected`}
                    p={3}
                    onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        handleSelectTransport();
                    }}
                    css={{
                        "&:hover": {
                            backgroundColor: theme.colors.grey.default,
                        },
                    }}
                >
                    <Icon
                        name="circle"
                        color="grey.dark"
                        size="16px"
                        style={{cursor: "pointer"}}
                    />
                </Flex>
            )}
            <InvoiceTransportResume transport={transport} showDetails />
        </Flex>
    );
};

export {TransportsToInvoiceTransportCard};
