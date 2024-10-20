import {t} from "@dashdoc/web-core";
import {Box, Flex} from "@dashdoc/web-ui";
import styled from "@emotion/styled";
import React from "react";

const DayBox = styled(Box)`
    border-radius: 50px;
    cursor: pointer;
    margin: 0px 5px 0px 5px;
    width: 25px;
    height: 25px;
    padding-top: 2px;
    text-align: center;
`;
export type DayOfWeek =
    | "monday"
    | "tuesday"
    | "wednesday"
    | "thursday"
    | "friday"
    | "saturday"
    | "sunday";

export type DaysOfWeek = {[day in DayOfWeek]: boolean};

type Props = {
    daysOfWeek: DaysOfWeek;
    onChange: (day: DayOfWeek, status: boolean) => void;
};

export function DaysOfWeekPicker({daysOfWeek, onChange}: Props) {
    const handleChange = (day: DayOfWeek) => {
        onChange(day, !daysOfWeek[day]);
    };

    return (
        <Flex m="5px">
            <DayBox
                className={daysOfWeek["monday"] ? "btn-primary" : "btn-default"}
                onClick={handleChange.bind(this, "monday")}
            >
                {t("common.monday")[0]}
            </DayBox>
            <DayBox
                className={daysOfWeek["tuesday"] ? "btn-primary" : "btn-default"}
                onClick={handleChange.bind(this, "tuesday")}
            >
                {t("common.tuesday")[0]}
            </DayBox>
            <DayBox
                className={daysOfWeek["wednesday"] ? "btn-primary" : "btn-default"}
                onClick={handleChange.bind(this, "wednesday")}
            >
                {t("common.wednesday")[0]}
            </DayBox>
            <DayBox
                className={daysOfWeek["thursday"] ? "btn-primary" : "btn-default"}
                onClick={handleChange.bind(this, "thursday")}
            >
                {t("common.thursday")[0]}
            </DayBox>
            <DayBox
                className={daysOfWeek["friday"] ? "btn-primary" : "btn-default"}
                onClick={handleChange.bind(this, "friday")}
            >
                {t("common.friday")[0]}
            </DayBox>
            <DayBox
                className={daysOfWeek["saturday"] ? "btn-primary" : "btn-default"}
                onClick={handleChange.bind(this, "saturday")}
            >
                {t("common.saturday")[0]}
            </DayBox>
            <DayBox
                className={daysOfWeek["sunday"] ? "btn-primary" : "btn-default"}
                onClick={handleChange.bind(this, "sunday")}
            >
                {t("common.sunday")[0]}
            </DayBox>
        </Flex>
    );
}
