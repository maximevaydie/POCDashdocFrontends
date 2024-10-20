import styled from "@emotion/styled";
import {Menu, useContextMenu} from "react-contexify";

import "react-contexify/ReactContexify.css";
import {themeAwareCss} from "../../../Elements/utils";

export const ContextMenu = styled(Menu)(
    themeAwareCss({
        boxShadow: "large",
        backgroundColor: "grey.white",
        ".contexify_item:hover > .contexify_itemContent, .contexify_item:focus > .contexify_itemContent":
            {
                backgroundColor: "grey.light",
            },
    })
);

export {useContextMenu};
