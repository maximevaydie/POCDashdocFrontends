import {itRendersCorrectlyWith} from "@dashdoc/web-core/src/testing";
import React from "react";

import {LoadingWheel} from "../LoadingWheel";

describe("LoadingWheel", () => {
    itRendersCorrectlyWith("default", <LoadingWheel />);
});
