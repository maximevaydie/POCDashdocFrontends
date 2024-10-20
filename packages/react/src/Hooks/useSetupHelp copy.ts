import {helpService} from "@dashdoc/web-common";
import {Company, Manager, ManagerMe} from "dashdoc-utils";
import {useEffect} from "react";

/**
 * This hook is used to setup the help part.
 */
export function useSetupHelp(props?: {manager: Manager; company: Company}) {
    const manager = props?.manager;
    const company = props?.company;

    useEffect(() => {
        if (manager && company) {
            helpService.setup({
                manager: manager as ManagerMe /* TODO why not set deleted in the type?*/,
                company,
            });
        } else {
            helpService.setup();
        }
        return helpService.cleanup;
    }, [manager, company]);

    return;
}
