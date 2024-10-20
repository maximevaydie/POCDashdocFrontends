import {Logger} from "@dashdoc/web-core";
import {Box, DatePicker, Flex, IconButton, LoadingWheel, OnDesktop} from "@dashdoc/web-ui";
import {useSiteDate} from "hooks/useSiteDate";
import * as React from "react";
import {useDispatch} from "redux/hooks";
import {updateFlowDate} from "redux/reducers/flow";
import {addDays, subDays} from "services/date";
import {TzDate} from "types";

const DAY_INC = 1;

export function SiteDate() {
    const dispatch = useDispatch();
    const siteDate = useSiteDate();
    if (siteDate === null) {
        return (
            <Flex data-testid="site-date">
                <LoadingWheel noMargin />
            </Flex>
        );
    }
    return (
        <Flex data-testid="site-date">
            <OnDesktop>
                <IconButton
                    name="arrowLeftFull"
                    onClick={onMinus}
                    fontSize={2}
                    width="42px"
                    pr={2}
                    display="flex"
                    justifyContent="center"
                />
            </OnDesktop>
            <Box flexGrow={1}>
                <DatePicker
                    clearable={false}
                    date={siteDate}
                    required={true}
                    onChange={onDateChange}
                    dateDisplayFormat="EEEE dd MMMM"
                    inputProps={{textAlign: "center"}}
                    data-testid="site-date-picker"
                />
            </Box>
            <OnDesktop>
                <IconButton
                    data-testid="arrow-right"
                    name="arrowRightFull"
                    onClick={onPlus}
                    fontSize={2}
                    width="42px"
                    pl={2}
                    display="flex"
                    justifyContent="center"
                />
            </OnDesktop>
        </Flex>
    );

    function onMinus() {
        if (siteDate === null) {
            Logger.error("siteDate is null");
            return;
        }
        const newDate = subDays(siteDate, DAY_INC);
        onDateChange(newDate);
    }

    function onPlus() {
        if (siteDate === null) {
            Logger.error("siteDate is null");
            return;
        }
        const newDate = addDays(siteDate, DAY_INC);
        onDateChange(newDate);
    }

    function onDateChange(date: TzDate) {
        dispatch(updateFlowDate(date));
    }
}
