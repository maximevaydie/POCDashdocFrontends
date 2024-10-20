import React from "react";

import {assets} from "../../constants/assets";
import {LOGO_HEIGHT} from "../../constants/constants";
import {StaticImage} from "../misc/StaticImage";

export const DashdocWamLogo = ({height = LOGO_HEIGHT}: {height?: number}) => {
    return <StaticImage src={assets.DASHDOC_WAM_WHITE_LOGO} height={height} />;
};
