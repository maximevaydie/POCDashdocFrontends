import {itRendersCorrectlyWith} from "@dashdoc/web-core/src/testing";
import React from "react";

import {FormGroup} from "../FormGroup";

describe("FormGroup", () => {
    itRendersCorrectlyWith(
        "children",
        <FormGroup>
            <input type="text" className="form-control" />
        </FormGroup>
    );

    itRendersCorrectlyWith(
        "error",
        <FormGroup error="this is a test error">
            <input type="text" className="form-control" />
        </FormGroup>
    );

    itRendersCorrectlyWith(
        "label",
        <FormGroup label="This is a helpful label">
            <input type="text" className="form-control" />
        </FormGroup>
    );

    itRendersCorrectlyWith(
        "no cols",
        <FormGroup noCols={true}>
            <input type="text" className="form-control" />
        </FormGroup>
    );
});
