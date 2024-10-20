import {OnDesktop, OnMobile} from "@dashdoc/web-ui";
import {SearchBar} from "features/topbar/search/SearchBar";
import {SearchBarMobile} from "features/topbar/search/SearchBarMobile";
import {useSiteTime} from "hooks/useSiteTime";
import React from "react";
import {useDispatch} from "react-redux";
import {searchSlots, selectProfile, useSelector} from "redux/reducers/flow";
import {clearSearch, selectSearchResult} from "redux/reducers/flow/slotSearch.slice";
import {startOfDay, tz} from "services/date";

export function SearchBarWrapper() {
    const dispatch = useDispatch();
    const siteTime = useSiteTime();
    const {slots, count, loading} = useSelector(selectSearchResult);
    const profile = useSelector(selectProfile);
    if (profile === "guest") {
        return null; // No search bar for guests
    }
    const searching = ["loading", "reloading"].includes(loading);
    const start = tz.dateToISO(startOfDay(siteTime));
    return (
        <>
            <OnDesktop>
                <SearchBar
                    search={search}
                    clear={clear}
                    slots={slots}
                    count={count}
                    searching={searching}
                />
            </OnDesktop>
            <OnMobile>
                <SearchBarMobile
                    search={search}
                    clear={clear}
                    slots={slots}
                    count={count}
                    searching={searching}
                />
            </OnMobile>
        </>
    );

    function search(value: string) {
        dispatch(searchSlots({search: value, start}));
    }

    function clear() {
        dispatch(clearSearch());
    }
}
