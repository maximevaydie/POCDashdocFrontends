import {t} from "@dashdoc/web-core";
import {Button, TooltipWrapper, theme} from "@dashdoc/web-ui";
import {Trucker, useToggle} from "dashdoc-utils";
import React from "react";

import {fetchDisableTrucker} from "app/redux/actions";
import {useDispatch} from "app/redux/hooks";

import {DisableTruckerConfirmationModal} from "./DisableTruckerConfirmationModal";

type Props = {
    trucker: Trucker;
    onClick: () => void;
};
export const DisableTruckerButton = ({trucker, onClick}: Props) => {
    const dispatch = useDispatch();
    const [isDisableTruckerModalOpen, openDisableTruckerModal, closeDisableTruckerModal] =
        useToggle();

    const handleDisableTrucker = async () => {
        onClick();
        await dispatch(fetchDisableTrucker(trucker.pk));
    };

    const buttonDisabled = trucker.is_rented == true;

    const getButton = () => (
        <>
            <Button
                key="disable-trucker-button"
                data-testid="disable-trucker-button"
                onClick={openDisableTruckerModal}
                variant="plain"
                color={`${theme.colors.grey.ultradark} !important`}
                disabled={buttonDisabled}
            >
                {t("components.disableTheTrucker")}
            </Button>
            {isDisableTruckerModalOpen && (
                <DisableTruckerConfirmationModal
                    truckerDisplayName={trucker.display_name}
                    onSubmit={handleDisableTrucker}
                    onClose={closeDisableTruckerModal}
                />
            )}
        </>
    );

    if (trucker.is_disabled) {
        // empty component, because it is not possible to disable a trucker already disabled
        return <></>;
    } else if (buttonDisabled) {
        return (
            <TooltipWrapper
                content={t("components.cannotDisableTruckerWhenRented")}
                placement="left"
                boxProps={{display: "inline-block"}}
            >
                {getButton()}
            </TooltipWrapper>
        );
    } else {
        return getButton();
    }
};
