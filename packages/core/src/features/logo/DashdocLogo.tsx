import React from "react";

import {assets} from "../../constants/assets";
import {LOGO_HEIGHT} from "../../constants/constants";
import {StaticImage} from "../misc/StaticImage";

export function DashdocTmsLogo() {
    const today = new Date();
    const isXmas = today.getMonth() === 11 && today.getDate() === 25;
    const height = isXmas ? 25 : LOGO_HEIGHT;

    return (
        <StaticImage
            src={isXmas ? assets.DASHDOC_XMAS_LOGO : assets.DASHDOC_WHITE_TMS_LOGO}
            height={height}
        />
    );
}
