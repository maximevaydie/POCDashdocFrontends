import {requestPlanUpgrade} from "@dashdoc/web-common";
import {Logger} from "@dashdoc/web-core";
import {t} from "@dashdoc/web-core";
import {Button, Box, toast, ButtonProps} from "@dashdoc/web-ui";
import {LoadingWheel} from "@dashdoc/web-ui";
import React, {ReactNode} from "react";

import {useDispatch, useSelector} from "app/redux/hooks";
import {RootState} from "app/redux/reducers/index";

export type RequestPlanUpgradeProps = {
    onUpgradePlan?: () => void;
    buttonProps?: Partial<ButtonProps>;
};

export const RequestPlanUpgradeAction = ({
    onUpgradePlan,
    buttonProps,
}: RequestPlanUpgradeProps) => {
    const isPending = useSelector(({loading}: RootState) => loading.requestPlanUpgrade);
    const alreadyRequested = useSelector(({account}: RootState) => account.requestPlanUpgrade);
    const dispatch = useDispatch();

    let actionContent: ReactNode | null = (
        <Button
            variant="primary"
            ml={3}
            {...buttonProps}
            disabled={isPending || alreadyRequested}
            onClick={handleUpgrade}
        >
            <Box as="span" mr={1}>
                {isPending && <LoadingWheel noMargin small />}
            </Box>
            {t("common.requestPlanUpgrade")}
        </Button>
    );

    if (alreadyRequested) {
        actionContent = null;
    }
    return (
        <>
            <Box>{actionContent}</Box>
        </>
    );

    async function handleUpgrade() {
        const action = await dispatch(requestPlanUpgrade());
        if (action.type === requestPlanUpgrade.rejected.type) {
            toast.error(t("common.error"));
            // Take a look at the related chargeBee account
            Logger.error(
                "Error while requesting plan upgrade, probably a billing account issue",
                action.payload
            );
        } else {
            onUpgradePlan?.();
        }
    }
};
