import {t} from "@dashdoc/web-core";
import {formatDate} from "dashdoc-utils";
import React from "react";

export type DateAndTimeProps = {
    zonedDateTimeMin: Date | null;
    zonedDateTimeMax: Date | null;
    wrap?: boolean;
};

export function DateAndTime({zonedDateTimeMin, zonedDateTimeMax, wrap = true}: DateAndTimeProps) {
    const formattedDateMin = formatDate(zonedDateTimeMin || zonedDateTimeMax, "P");
    const formattedDateMax = formatDate(zonedDateTimeMax, "P");
    const formattedTimeMin = zonedDateTimeMin ? formatDate(zonedDateTimeMin, "p") : null;
    const formattedTimeMax = zonedDateTimeMax ? formatDate(zonedDateTimeMax, "p") : null;

    if (zonedDateTimeMin && zonedDateTimeMax && formattedDateMin !== formattedDateMax) {
        return (
            <>
                {formattedDateMin} {formattedTimeMin} - {formattedDateMax} {formattedTimeMax}
            </>
        );
    }

    return (
        <React.Fragment>
            {/*
// @ts-ignore */}
            {wrap && t("common.dateOn", null, {capitalize: true})} {formattedDateMin}
            {wrap ? <br /> : " "}
            {formattedTimeMin && formattedTimeMax && formattedTimeMin !== formattedTimeMax && (
                <span>
                    {wrap
                        ? t("components.fromMinToMax", {
                              min: formattedTimeMin,
                              max: formattedTimeMax,
                          })
                        : t("components.fromMinToMax", {
                              min: formattedTimeMin,
                              max: formattedTimeMax,
                          }).toLowerCase()}
                </span>
            )}
            {(formattedTimeMin === formattedTimeMax || !formattedTimeMax) && (
                <span>
                    {t("common.at", undefined, {capitalize: wrap})} {formattedTimeMin}
                </span>
            )}
        </React.Fragment>
    );
}
