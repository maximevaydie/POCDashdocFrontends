import {t} from "@dashdoc/web-core";
import {TranslationKeys} from "@dashdoc/web-core";
import {Box, Icon} from "@dashdoc/web-ui";
import React from "react";
import {Link as ReactLink} from "react-router-dom";

interface BackToLinkProps {
    label?: TranslationKeys;
    route: string;
}

export const BackToLink = ({label, route}: BackToLinkProps) => {
    return (
        <ReactLink to={route} style={{display: "flex", gap: "8px"}}>
            <Icon name={"thickArrowLeft"} />
            <Box>{t(label ?? "app.back")}</Box>
        </ReactLink>
    );
};
