import {IconButton} from "@dashdoc/web-ui";
import React, {FC, useContext} from "react";

import {ExpandContext} from "../contexts/ExpandContext";

export const ExpandAllAction: FC<{}> = () => {
    const {allExpanded, onExpandAll, onCollapseAll} = useContext(ExpandContext);
    if (allExpanded) {
        return (
            <IconButton
                color="blue.dark"
                name="arrowDown"
                onClick={onCollapseAll}
                data-testid="collapse-all-invoice-lines"
            />
        );
    } else {
        return (
            <IconButton
                color="blue.dark"
                name="arrowRight"
                onClick={onExpandAll}
                data-testid="expand-all-invoice-lines"
            />
        );
    }
};
