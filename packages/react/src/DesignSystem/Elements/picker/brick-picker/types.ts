import {SystemStyleObject} from "@styled-system/css";
import {SpaceProps, HeightProps} from "styled-system";

import {SupportedStyles} from "./components/SupportedStyles";

export type Brick = {empty: boolean; selected: boolean};

export type BrickLine = {
    label: string;
    bricks: Brick[];
};

export type BrickStyle = {
    defaultStyle: SupportedStyles;
    hoverStyle: SystemStyleObject;
    forceHover?: boolean;
};

export type BrickPickerStyle = Pick<SpaceProps, "m"> &
    Pick<HeightProps, "height"> & {
        empty: BrickStyle;
        emptySelected: BrickStyle;
        full: BrickStyle;
        fullSelected: BrickStyle;
    };
