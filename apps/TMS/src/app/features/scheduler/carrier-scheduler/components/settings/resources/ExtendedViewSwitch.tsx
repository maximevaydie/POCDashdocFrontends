import {t} from "@dashdoc/web-core";
import {Box, SwitchInput} from "@dashdoc/web-ui";
import React from "react";

import {useExtendedView} from "app/hooks/useExtendedView";

type ExtendedViewSwitchProps = {
    value: boolean;
    onChange: (value: boolean) => void;
};
export function ExtendedViewSwitch({value, onChange}: ExtendedViewSwitchProps) {
    const {canActivateExtendedView} = useExtendedView();
    return canActivateExtendedView ? (
        <Box pt={2}>
            <SwitchInput
                labelRight={t("scheduler.extendedView")}
                value={value}
                onChange={onChange}
                data-testid="extended-view"
            />
        </Box>
    ) : null;
}
