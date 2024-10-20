import {Flex, Icon, Text} from "@dashdoc/web-ui";
import React from "react";

export const TransportsInvoiceabilityHeader = ({
    onBack,
    label,
}: {
    onBack: () => void;
    label: string;
}) => {
    return (
        <Flex
            flexDirection="row"
            p={4}
            borderBottomColor="grey.light"
            borderBottomStyle="solid"
            borderBottomWidth="1px"
            alignItems="center"
        >
            <Flex flex={1}>
                <Text color="grey.dark" variant="title">
                    {label}
                </Text>
            </Flex>
            <Flex justifyContent="flex-end">
                <Icon name="close" style={{cursor: "pointer"}} onClick={onBack} />
            </Flex>
        </Flex>
    );
};
