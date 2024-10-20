import {
    ModerationButton,
    PartnerDetailOutput,
    companyService,
    fetchDeleteCompany,
    getConnectedCompany,
    getConnectedManager,
    useBaseUrl,
} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Button, Flex, Icon, MenuItem, Popover, toast} from "@dashdoc/web-ui";
import {Company, useToggle} from "dashdoc-utils";
import React from "react";

import {useDispatch, useSelector} from "app/redux/hooks";

import {ErrorCannotDeletePartnerModal} from "./ErrorCannotDeletePartnerModal";

type Props = {
    company: Company | PartnerDetailOutput;
    fromAddressBook?: boolean;
    onDelete: () => void;
};
export function PartnerActions({company, fromAddressBook, onDelete}: Props) {
    const dispatch = useDispatch();
    const baseUrl = useBaseUrl();
    const [displayCannotDeleteCompanyErrorModal, openErrorModal, closeErrorModal] = useToggle();
    const ownCompany = useSelector(getConnectedCompany);
    const manager = useSelector(getConnectedManager);
    const canShowDelete =
        ownCompany !== null && company.pk !== ownCompany.pk && !company.is_verified;

    return (
        <>
            <Flex style={{gap: "8px"}} alignItems="center">
                <ModerationButton manager={manager} path={`companies/${company.pk}/`} />
                {(canShowDelete || fromAddressBook) && (
                    <Popover>
                        <Popover.Trigger>
                            <Button
                                variant="secondary"
                                data-testid="more-actions-button"
                                confirmationMessage={t("components.confirmDeleteCompany")}
                            >
                                {t("common.moreActions")}
                                <Icon name="arrowDown" ml={2} />
                            </Button>
                        </Popover.Trigger>
                        <Popover.Content>
                            {canShowDelete && (
                                <MenuItem
                                    icon="delete"
                                    dataTestId="delete-company-button"
                                    label={t("partner.delete")}
                                    onClick={handleDelete}
                                />
                            )}
                            {fromAddressBook && (
                                <MenuItem
                                    icon="openInNewTab"
                                    label={t("common.openInNewTab")}
                                    onClick={handleNewTab}
                                />
                            )}
                        </Popover.Content>
                    </Popover>
                )}
            </Flex>

            {displayCannotDeleteCompanyErrorModal && (
                <ErrorCannotDeletePartnerModal companyPk={company.pk} onClose={closeErrorModal} />
            )}
        </>
    );

    function handleNewTab() {
        window.open(companyService.getPartnerLink(baseUrl, company), "_blank");
    }

    async function handleDelete() {
        const yes = confirm(t("components.confirmDeleteCompany"));
        if (!yes) {
            return;
        }
        const response = await dispatch(fetchDeleteCompany(company.pk.toString()));
        if (response.type === "REQUEST_DELETE_COMPANY_ERROR") {
            const responseJson = await response.error.json();
            if (
                response.error.status === 403 &&
                responseJson?.["non_field_errors"]?.["code"]?.[0] ===
                    "cannot_delete_company_which_is_draft_invoice_debtor"
            ) {
                openErrorModal();
            } else {
                toast.error(t("common.error"));
            }
            return;
        }
        onDelete();
    }
}
