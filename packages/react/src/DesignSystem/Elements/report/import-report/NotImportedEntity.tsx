import {t, TranslationKeys} from "@dashdoc/web-core";
import React from "react";

export const NotImportedEntity = ({
    index,
    name,
    details,
}: {
    index: number;
    name: TranslationKeys;
    details: {
        lineNumber: number;
        identifier: string;
        errorDetails: string | {[key: string]: string};
    }[];
}) => {
    return (
        <>
            {details.length > 0 && (
                <li>
                    {t(name, {smart_count: details.length})}
                    <ul>
                        {details.map((detail, detailIndex) => (
                            <li key={`notImportedItem-${index}-${detailIndex}`}>
                                {t("common.line")} #{detail.lineNumber} - {detail.identifier}
                                <ul>
                                    {typeof detail.errorDetails === "object" &&
                                        Object.entries(detail.errorDetails).map(
                                            ([key, value], errorDetailIndex) => (
                                                <li
                                                    key={`error-${index}-${detailIndex}-${errorDetailIndex}`}
                                                >
                                                    {`${
                                                        key !== "non_field_errors"
                                                            ? `${key}: `
                                                            : ""
                                                    }${value}`}
                                                </li>
                                            )
                                        )}
                                    {typeof detail.errorDetails !== "object" && (
                                        <li>{detail.errorDetails}</li>
                                    )}
                                </ul>
                            </li>
                        ))}
                    </ul>
                </li>
            )}
        </>
    );
};
