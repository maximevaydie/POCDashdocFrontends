import {Button} from "@dashdoc/web-ui";
import React, {FunctionComponent} from "react";

import {Flex} from "../../layout/Flex";
import {Text} from "../Text";

export type SelectAllRowsButtonProps = {
    allRowsSelected: boolean;
    onSelectAllRows: () => void;
    allVisibleRowsSelectedMessage: string;
    selectAllRowsMessage: string;
    allRowsSelectedMessage: string;
};

export const SelectAllRowsButton: FunctionComponent<SelectAllRowsButtonProps> = ({
    allRowsSelected,
    onSelectAllRows,
    allVisibleRowsSelectedMessage,
    selectAllRowsMessage,
    allRowsSelectedMessage,
}) => (
    <Flex alignItems="center" justifyContent="center" flexWrap="wrap" p={2}>
        {allRowsSelected ? (
            <Text fontSize="inherit">{allRowsSelectedMessage}</Text>
        ) : (
            <>
                <Text fontSize="inherit" mr={2} textAlign="center">
                    {allVisibleRowsSelectedMessage}
                </Text>
                <Button
                    variant="plain"
                    onClick={onSelectAllRows}
                    data-testid="select-all-rows-button"
                >
                    {selectAllRowsMessage}
                </Button>
            </>
        )}
    </Flex>
);
