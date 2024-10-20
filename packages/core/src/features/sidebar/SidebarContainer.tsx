import {Box} from "@dashdoc/web-ui";
import {PublicContent} from "features/sidebar/content/PublicContent";
import {SiteManagerContent} from "features/sidebar/content/SiteManagerContent";
import React from "react";
import {useSelector} from "react-redux";
import {selectProfile} from "redux/reducers/flow";

import {Sidebar} from "./Sidebar";

export function SidebarContainer() {
    const profile = useSelector(selectProfile);
    return (
        <Sidebar>
            {profile === "siteManager" ? (
                <SiteManagerContent />
            ) : (
                <Box>
                    <PublicContent />
                </Box>
            )}
        </Sidebar>
    );
}
