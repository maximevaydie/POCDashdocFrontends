import {t} from "@dashdoc/web-core";
import {IconButton} from "@dashdoc/web-ui";
import React from "react";
import {useHistory} from "react-router";

export function ExportTabButton({active}: {active: boolean}) {
    const history = useHistory();
    return (
        <IconButton
            data-testid="transports-screen-exports-view-button"
            name="exports"
            label={t("common.exports")}
            onClick={() => {
                if (!active) {
                    history.push("/app/transports-export/");
                }
            }}
            color={active ? "blue.default" : undefined}
        />
    );
}
