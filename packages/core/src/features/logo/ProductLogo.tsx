import React from "react";

import {assets} from "../../constants/assets";
import {FLOW_ROOT_PATH, TMS_ROOT_PATH, WASTE_ROOT_PATH} from "../../constants/constants";
import {StaticImage} from "../misc/StaticImage";

export function ProductLogo() {
    let logoPath: string;
    let height = 34;
    if (window.location.pathname.startsWith(FLOW_ROOT_PATH)) {
        logoPath = assets.DASHDOC_FLOW_LOGO;
    } else if (window.location.pathname.startsWith(WASTE_ROOT_PATH)) {
        logoPath = assets.DASHDOC_WAM_LOGO;
    } else if (window.location.pathname.startsWith(TMS_ROOT_PATH)) {
        logoPath = assets.DASHDOC_TMS_LOGO;
    } else {
        logoPath = assets.DASHDOC_LOGO;
        height = 32;
    }
    return <StaticImage src={logoPath} height={height} />;
}
