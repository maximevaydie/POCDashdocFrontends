import {t} from "@dashdoc/web-core";
import {QualimatCleaning} from "dashdoc-utils";
import React from "react";

import {getCleaningRegime} from "app/services/transport";

function QualimatCleaningDetails({
    cleaning,
    inlineDetails,
}: {
    cleaning: QualimatCleaning;
    inlineDetails?: boolean;
}) {
    const cleaningRegime = getCleaningRegime(cleaning.method);
    const detailsText =
        cleaning.isMultiCompartment && cleaningRegime
            ? t("qualimat.cleaning.multiCompartmentMention", {regime: cleaningRegime})
            : cleaningRegime;

    return (
        <div css={{display: inlineDetails ? "inline" : "initial"}}>
            <p css={{display: inlineDetails ? "inline" : "initial"}}>
                {detailsText}
                {cleaning.detergent && (
                    <span className="small">
                        <br />
                        {t("qualimat.detergentUsed", {detergent: cleaning.detergent})}
                    </span>
                )}
                {cleaning.disinfectant && (
                    <span className="small">
                        <br />
                        {t("qualimat.disinfectantUsed", {disinfectant: cleaning.disinfectant})}
                    </span>
                )}
            </p>
        </div>
    );
}

export {QualimatCleaningDetails};
