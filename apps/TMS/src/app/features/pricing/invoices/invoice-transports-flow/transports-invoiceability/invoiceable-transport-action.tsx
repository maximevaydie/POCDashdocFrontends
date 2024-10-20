import {Box, Button, Flex, Icon, BoxProps, Text, IconProps} from "@dashdoc/web-ui";
import {theme} from "@dashdoc/web-ui";
import React from "react";

type InvoiceableTransportActionProps = BoxProps & {
    label: string;
    iconName: IconProps["name"];
    iconRotation?: IconProps["rotation"];
    onClickAction: () => void;
    dataTestId?: string;
};
function InvoiceableTransportAction({
    label,
    iconName,
    iconRotation,
    onClickAction,
    dataTestId,
    ...containerProps
}: InvoiceableTransportActionProps) {
    return (
        <Box
            css={{
                "&:hover": {
                    backgroundColor: theme.colors.grey.light,
                },
            }}
            data-testid={dataTestId}
            {...containerProps}
        >
            <Button width="100%" variant="plain" type="button" onClick={onClickAction}>
                <Flex p={3} flex={1} alignItems="center">
                    <Icon color="grey.dark" name={iconName} mr={2} rotation={iconRotation} />
                    <Text color="grey.dark" whiteSpace="nowrap">
                        {label}
                    </Text>
                </Flex>
            </Button>
        </Box>
    );
}

export default InvoiceableTransportAction;
