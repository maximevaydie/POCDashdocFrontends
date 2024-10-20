import {t} from "@dashdoc/web-core";
import {TextArea} from "@dashdoc/web-ui";
import React, {FunctionComponent} from "react";

type GlobalInstructionsProps = {
    globalInstructions: string;
    onInputChange: (globalInstructions: string) => void;
};
const GlobalInstructionsPicker: FunctionComponent<GlobalInstructionsProps> = ({
    globalInstructions,
    onInputChange,
}) => {
    return (
        <TextArea
            pt={3}
            css={{lineHeight: "20px"}}
            minHeight={250}
            placeholder={t("transportForm.globalInstructionsPlaceholder")}
            aria-label={t("transportForm.globalInstructionsPlaceholder")}
            onChange={onInputChange}
            value={globalInstructions}
            maxLength={1000}
        />
    );
};

export default GlobalInstructionsPicker;
