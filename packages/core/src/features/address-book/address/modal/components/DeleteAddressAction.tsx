import {t} from "@dashdoc/web-core";
import {Box, Button} from "@dashdoc/web-ui";
import {Address, Company} from "dashdoc-utils";
import React from "react";

import {addressService} from "../../address.service";

type Props = {
    originalAddress: Address | Partial<Omit<Address, "pk">> | undefined;
    companyFromAddress: Company | undefined;
    onDelete: (() => void) | undefined;
};

export function DeleteAddressAction({originalAddress, companyFromAddress, onDelete}: Props) {
    if (onDelete && originalAddress && "pk" in originalAddress) {
        const canDeleteAddress = addressService.canDeleteAddress(
            originalAddress,
            companyFromAddress
        );
        const [canDelete, errorReason] = canDeleteAddress;
        return (
            <Button
                variant="plain"
                severity="danger"
                alignSelf="flex-start"
                withConfirmation
                confirmationMessage={t("components.addressConfirmDeletion", {
                    address: originalAddress.name,
                })}
                disabled={!canDelete}
                data-disableReason={
                    (errorReason &&
                        errorReason.substring(
                            errorReason.lastIndexOf(".") + 1,
                            errorReason.length
                        )) ||
                    undefined
                }
                title={errorReason ? t(errorReason) : undefined}
                onClick={onDelete}
                data-testid="delete-address-button"
            >
                {t("components.addressDelete")}
            </Button>
        );
    }
    return <Box />;
}
