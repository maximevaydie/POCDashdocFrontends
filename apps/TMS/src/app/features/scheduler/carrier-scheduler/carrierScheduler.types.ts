import {TranslationKeys} from "@dashdoc/web-core";
import {IconNames} from "@dashdoc/web-ui";

export interface Decoration {
    color: string;
    backgroundColor: string;
    darkerBackground: string;
    strippedBackground?: boolean;
    statusIcon?: IconNames;
    statusLabel?: TranslationKeys;
    statusIconStrokeWidth?: number;
}
