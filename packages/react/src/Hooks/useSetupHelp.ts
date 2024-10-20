import {Company, Manager, ManagerMe} from "dashdoc-utils";
import {useEffect} from "react";

import {helpService} from "../services/help.service";

/**
 * This hook is used to setup the help part.
 */
export function useSetupHelp(manager: Manager, company: Company) {
    useEffect(() => {
        helpService.setup({
            manager: manager as ManagerMe /* TODO why not set deleted in the type?*/,
            company,
        });
    }, [manager, company]);

    return;
}
