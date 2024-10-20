import React from "react";

import {assets} from "../../constants/assets";
import {LOGO_HEIGHT} from "../../constants/constants";
import {StaticImage} from "../misc/StaticImage";

export const DashdocFlowLogo = ({height = LOGO_HEIGHT}: {height?: number}) => {
    return <StaticImage src={assets.DASHDOC_FLOW_WHITE_LOGO} height={height} />;
};
