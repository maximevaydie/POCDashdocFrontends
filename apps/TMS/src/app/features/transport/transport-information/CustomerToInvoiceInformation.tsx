import {useFeatureFlag} from "@dashdoc/web-common";
import {getConnectedCompany} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {useToggle} from "dashdoc-utils";
import React, {FunctionComponent} from "react";

import {useCompaniesInConnectedGroupView} from "app/hooks/useCompaniesInConnectedGroupView";
import {fetchSetTransportCustomerToInvoice} from "app/redux/actions/transports";
import {useDispatch, useSelector} from "app/redux/hooks";
import {transportRightService} from "app/services/transport";
import {UpdatableCustomerToInvoice} from "app/taxation/invoicing/features/customer-to-invoice/UpdatableCustomerToInvoice";
import {UpdateCustomerToInvoiceModal} from "app/taxation/invoicing/features/customer-to-invoice/UpdateCustomerToInvoiceModal";

import {InformationBlockTitle} from "./information-block-title";

import type {Transport} from "app/types/transport";

type CustomerToInvoiceInformationProps = {
    transport: Transport;
    reloadTransportsToInvoice?: () => void;
};

export const CustomerToInvoiceInformation: FunctionComponent<
    CustomerToInvoiceInformationProps
> = ({transport, reloadTransportsToInvoice}) => {
    return (
        <CustomerToInvoiceEdition
            transport={transport}
            reloadTransportsToInvoice={reloadTransportsToInvoice}
            getTriggerButton={(openEdition, updateAllowed) => (
                <InformationBlockTitle
                    iconName="instructions"
                    label={t("common.customerToInvoice")}
                    pr={1}
                >
                    <UpdatableCustomerToInvoice
                        customerToInvoice={transport.customer_to_invoice}
                        updateAllowed={updateAllowed}
                        onClick={openEdition}
                    />
                </InformationBlockTitle>
            )}
        />
    );
};
export const CustomerToInvoiceEdition: FunctionComponent<
    CustomerToInvoiceInformationProps & {
        getTriggerButton: (openEdition: () => void, updateAllowed: boolean) => React.ReactNode;
    }
> = ({transport, reloadTransportsToInvoice, getTriggerButton}) => {
    const hasInvoiceEntityEnabled = useFeatureFlag("invoice-entity");
    const connectedCompany = useSelector(getConnectedCompany);
    const companiesInConnectedGroupView = useCompaniesInConnectedGroupView();
    const canReadCustomerToInvoice = transportRightService.canReadCustomerToInvoice(
        transport,
        connectedCompany?.pk,
        companiesInConnectedGroupView
    );
    const customerToInvoiceUpdatesAllowed = transportRightService.canEditCustomerToInvoice(
        transport,
        connectedCompany?.pk,
        companiesInConnectedGroupView,
        hasInvoiceEntityEnabled
    );
    const dispatch = useDispatch();
    const [editing, openEdition, closeEdition] = useToggle();
    if (!canReadCustomerToInvoice) {
        return null;
    }
    return (
        <>
            {getTriggerButton(openEdition, customerToInvoiceUpdatesAllowed)}
            {editing && (
                <UpdateCustomerToInvoiceModal
                    initialCustomerToInvoice={transport.customer_to_invoice}
                    onSubmit={handleSubmitCustomerToInvoice}
                    onClose={closeEdition}
                />
            )}
        </>
    );

    function handleSubmitCustomerToInvoice(companyPk: number | null) {
        return dispatch(fetchSetTransportCustomerToInvoice(transport.uid, companyPk)).then(() =>
            reloadTransportsToInvoice?.()
        );
    }
};
