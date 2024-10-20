import {t} from "@dashdoc/web-core";
import {Button, TooltipWrapper, theme} from "@dashdoc/web-ui";
import {Trucker} from "dashdoc-utils";
import React from "react";

import {fetchEnableTrucker} from "app/redux/actions";
import {useDispatch} from "app/redux/hooks";

type Props = {
    trucker: Trucker;
    onClick: () => void;
};

export const EnableTruckerButton = ({trucker, onClick}: Props) => {
    const dispatch = useDispatch();

    const handleEnableTrucker = async () => {
        onClick();
        await dispatch(fetchEnableTrucker(trucker.pk));
    };

    const buttonDisabled = trucker.is_rented == true;

    const getButton = () => (
        <>
            <Button
                key="enable-trucker-button"
                data-testid="enable-trucker-button"
                onClick={handleEnableTrucker}
                variant="plain"
                color={`${theme.colors.grey.ultradark} !important`}
                disabled={buttonDisabled}
            >
                {t("components.enableTheTrucker")}
            </Button>
        </>
    );

    if (!trucker.is_disabled) {
        // empty component, because it is not possible to enable a trucker already enabled
        return <></>;
    } else if (buttonDisabled) {
        return (
            <TooltipWrapper
                content={t("components.cannotEnableTruckerWhenRented")}
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
