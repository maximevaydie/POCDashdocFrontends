import {t} from "@dashdoc/web-core";
import {Button, Flex} from "@dashdoc/web-ui";
import React, {FunctionComponent} from "react";

import {Box} from "../../layout/Box";
import {Text} from "../Text";

export type ListEmptyComponentProps = {emptyLabel?: string};

export const ListEmptyComponent: FunctionComponent<ListEmptyComponentProps> = ({emptyLabel}) => (
    <Box py={6} data-testid="table-empty">
        <Text textAlign="center" color="grey.dark">
            {emptyLabel ?? t("common.noResultFound")}
        </Text>
    </Box>
);

export type ListEmptyFiltersComponentProps = {
    resetQuery: () => void;
    title?: string;
    middleButton?: React.ReactNode;
    ["data-testid"]?: string;
};
export const ListEmptyNoResultsWithFilters: FunctionComponent<ListEmptyFiltersComponentProps> = ({
    resetQuery,
    title = t("common.noResultFound"),
    middleButton,
    ...props
}) => {
    return (
        <Flex
            flexDirection="column"
            alignItems="center"
            justifyContent="flex-start"
            py={[2, 8]}
            data-testid={props["data-testid"]}
        >
            <Text variant="title">{title}</Text>
            <Box mt={4} textAlign="center">
                <Text mb={2}>{t("screens.transports.filters.modify")}</Text>
                {middleButton}
                <Text>
                    <Button display="inline-block !important" variant="plain" onClick={resetQuery}>
                        {t("screens.resetFilters")}
                    </Button>
                </Text>
            </Box>
        </Flex>
    );
};
