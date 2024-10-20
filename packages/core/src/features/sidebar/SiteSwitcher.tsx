import {CompanySwitcherContainer} from "@dashdoc/web-common";
import {SiteAvatar} from "features/sidebar/SiteAvatar";
import React from "react";
import {useSelector} from "redux/hooks";
import {selectSite} from "redux/reducers/flow/site.slice";

type SiteSwitcherProps = {
    displaySmall?: boolean;
};

export function SiteSwitcher({displaySmall = false}: SiteSwitcherProps) {
    const site = useSelector(selectSite);
    if (site) {
        return (
            <CompanySwitcherContainer
                displaySmall={displaySmall}
                px={0}
                py={4}
                isOpenable={false}
                data-testid="site-switcher-container"
            >
                <SiteAvatar site={site} />
            </CompanySwitcherContainer>
        );
    }

    return null;
}
