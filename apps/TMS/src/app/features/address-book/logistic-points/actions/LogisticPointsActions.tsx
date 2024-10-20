import {AddressModal, getConnectedManager, managerService, useBaseUrl} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Button, Flex, Icon} from "@dashdoc/web-ui";
import {useToggle} from "dashdoc-utils";
import React from "react";
import {useHistory} from "react-router";

import {LINK_LOGISTIC_POINTS_EXPORTS} from "app/features/sidebar/constants";
import {useSelector} from "app/redux/hooks";

type Props = {
    onRefresh: () => void;
};
export function LogisticPointsActions({onRefresh}: Props) {
    const history = useHistory();
    const baseUrl = useBaseUrl();
    const connectedManager = useSelector(getConnectedManager);
    const [isNewAddressModalOpen, openNewAddressModal, closeNewAddressModal] = useToggle();
    return (
        <>
            <Flex alignItems="baseline">
                <Button
                    mr={2}
                    data-testid="companies-screen-exports-view-button"
                    name="exports"
                    onClick={handleExportView}
                    variant="plain"
                >
                    <Icon name="exports" mr={3} />
                    {t("common.exports")}
                </Button>
                {managerService.hasAtLeastUserRole(connectedManager) && (
                    <Button onClick={openNewAddressModal} data-testid="add-address-button">
                        <Icon name="add" mr={3} />
                        {t("components.addLogisticPoint")}
                    </Button>
                )}
            </Flex>

            {isNewAddressModalOpen && (
                <AddressModal companyBrowsable onClose={handleClose} onSave={handleCreate} />
            )}
        </>
    );

    function handleClose() {
        closeNewAddressModal();
    }

    function handleExportView() {
        history.push(`${baseUrl}${LINK_LOGISTIC_POINTS_EXPORTS}`);
    }

    function handleCreate() {
        closeNewAddressModal();
        onRefresh();
    }
}
