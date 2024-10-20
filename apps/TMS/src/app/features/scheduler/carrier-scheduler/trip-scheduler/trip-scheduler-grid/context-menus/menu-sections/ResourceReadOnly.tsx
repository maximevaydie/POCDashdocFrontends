import {t} from "@dashdoc/web-core";
import {Text} from "@dashdoc/web-ui";
import React, {FunctionComponent} from "react";

export const ResourceReadOnly: FunctionComponent = () => {
    return (
        <Text variant="caption" color="grey.dark" maxWidth="300px" mt={1} mb={1}>
            {t("contextmenu.resourceReadOnly")}
        </Text>
    );
};
