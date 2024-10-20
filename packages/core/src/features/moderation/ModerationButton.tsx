import {t} from "@dashdoc/web-core";
import {Button, Icon} from "@dashdoc/web-ui";
import {Manager} from "dashdoc-utils";
import React from "react";

import {apiService} from "../../services/api.service";
import {managerService} from "../../services/manager.service";

type ModerationButtonProps = {
    path: string;
    manager: Manager | null;
};

export function ModerationButton({path, manager}: ModerationButtonProps) {
    const isStaff = managerService.isDashdocStaff(manager);

    if (!isStaff) {
        return null;
    }

    return (
        <Button
            variant="plain"
            onClick={() => window.open(`${apiService.options.host}/moderation/${path}`)}
        >
            <Icon name="desktop" mr={2} /> {t("app.moderation")}
        </Button>
    );
}
