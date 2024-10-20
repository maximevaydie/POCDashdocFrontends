import {HasFeatureFlag} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {ClickOutside, Flex, IconButton} from "@dashdoc/web-ui";
import {useToggle} from "dashdoc-utils";
import React from "react";

import {DeleteBulkAction} from "app/features/address-book/logistic-points/actions/DeleteBulkAction";
import {ExportLogisticPointAction} from "app/features/address-book/logistic-points/actions/ExportLogisticPointAction";

import type {LogisticPointSelection} from "app/features/address-book/logistic-points/types";

type Props = {
    selection: LogisticPointSelection;
    onActionFinished: (option?: {unselect: true}) => void;
};
export function BulkActions(props: Props) {
    return (
        <>
            <ExportLogisticPointAction {...props} />
            <HasFeatureFlag flagName="logisticPointsHaveNoRole">
                <MoreBulkActions {...props} />
            </HasFeatureFlag>
        </>
    );
}

function MoreBulkActions({selection, onActionFinished}: Props) {
    const [
        showMoreActions,
        ,
        /*here we have openMoreActions that is not used */ closeMoreActions,
        toggleMoreActions,
    ] = useToggle(false);

    return (
        <ClickOutside position="relative" onClickOutside={closeMoreActions} ml={2}>
            <IconButton
                color="grey.dark"
                name="arrowDown"
                iconPosition="right"
                label={t("common.moreActions")}
                onClick={toggleMoreActions}
                data-testid="logistic-points-more-actions-dropdown-button"
            />

            {showMoreActions && (
                <Flex
                    flexDirection={"column"}
                    width="100%"
                    minWidth="fit-content"
                    position="absolute"
                    backgroundColor="grey.white"
                    boxShadow="large"
                    borderRadius={1}
                    zIndex="level1"
                >
                    <DeleteBulkAction
                        selection={selection}
                        onDeleted={() => onActionFinished({unselect: true})}
                    />
                </Flex>
            )}
        </ClickOutside>
    );
}
