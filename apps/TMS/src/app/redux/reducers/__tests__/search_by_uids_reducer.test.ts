import searches, {
    SearchesRootState,
    initialSearches,
    SearchAction,
} from "app/redux/reducers/searches";
import {SCHEDULER_PLANNED_TRIPS_QUERY_NAME} from "app/types/constants";
const currentQuery = {
    view: "trucker",
    extended_view: false,
    datetime_range: "2023-04-04T22:00:00.000Z,2023-04-09T21:59:59.999Z",
    rows: "",
};
const parsedCurrentQuery =
    "datetime_range=2023-04-04T22%3A00%3A00.000Z%2C2023-04-09T21%3A59%3A59.999Z&extended_view=false&view=trucker";

function getSearchState(
    items: Array<string>,
    count: number,
    hasNextPage = false
): SearchesRootState {
    return {
        ...initialSearches,
        [SCHEDULER_PLANNED_TRIPS_QUERY_NAME]: {
            model: "scheduler-trip",
            results: {
                [parsedCurrentQuery]: {
                    items,
                    count,
                    hasNextPage,
                    page: 1,
                },
            },
            currentQuery: currentQuery,
            loading: false,
        },
    };
}
describe("search by uids success reducer", () => {
    test("new item received", () => {
        const itemUid = "itemUid";
        const initialState = getSearchState([], 0);
        const expectedState = getSearchState([itemUid], 1);

        const action: Omit<SearchAction, "page" | "hasNextPage" | "count"> = {
            type: "SEARCH_BY_UIDS_ENTITIES_SUCCESS",
            query: currentQuery,
            queryName: "scheduler-planned-trips",
            uids: [itemUid],
            response: {
                result: [itemUid],
            },
        };

        expect(searches(initialState, action as unknown as SearchAction)).toEqual(expectedState);
    });
    test("removed item", () => {
        const itemUid = "itemUid";
        const initialState = getSearchState([itemUid], 1);
        const expectedState = getSearchState([], 0);

        const action: Omit<SearchAction, "page" | "hasNextPage" | "count"> = {
            type: "SEARCH_BY_UIDS_ENTITIES_SUCCESS",
            query: currentQuery,
            queryName: "scheduler-planned-trips",
            uids: [itemUid],
            response: {
                result: [],
            },
        };
        expect(searches(initialState, action as unknown as SearchAction)).toEqual(expectedState);
    });

    test("2 items added, 1 removed item, 1 item unchanged", () => {
        const itemUidNotSearched = "itemUidNotSearched";
        const itemUidToRemove = "itemUidToRemove";
        const itemUidToUpdate = "itemUidToUpdate";
        const itemUidToAdd1 = "itemUidToAdd1";
        const itemUidToAdd2 = "itemUidToAdd2";
        const initialState = getSearchState(
            [itemUidToRemove, itemUidToUpdate, itemUidNotSearched],
            3
        );
        const expectedState = getSearchState(
            [itemUidToUpdate, itemUidNotSearched, itemUidToAdd1, itemUidToAdd2],
            4
        );

        const action: Omit<SearchAction, "page" | "hasNextPage" | "count"> = {
            type: "SEARCH_BY_UIDS_ENTITIES_SUCCESS",
            query: currentQuery,
            queryName: "scheduler-planned-trips",
            uids: [itemUidToRemove, itemUidToUpdate, itemUidToAdd1, itemUidToAdd2],
            response: {
                result: [itemUidToUpdate, itemUidToAdd1, itemUidToAdd2],
            },
        };
        expect(searches(initialState, action as unknown as SearchAction)).toEqual(expectedState);
    });

    test("2 items added, 1 removed item, 1 item unchanged, multiple pages", () => {
        const itemUidNotSearched = "itemUidNotSearched";
        const itemUidToRemove = "itemUidToRemove";
        const itemUidToUpdate = "itemUidToUpdate";
        const itemUidToAdd1 = "itemUidToAdd1";
        const itemUidToAdd2 = "itemUidToAdd2";
        const initialState = getSearchState(
            [itemUidToRemove, itemUidToUpdate, itemUidNotSearched],
            6,
            true
        );
        const expectedState = getSearchState(
            [itemUidToUpdate, itemUidNotSearched, itemUidToAdd1, itemUidToAdd2],
            7,
            true
        );

        const action: Omit<SearchAction, "page" | "hasNextPage" | "count"> = {
            type: "SEARCH_BY_UIDS_ENTITIES_SUCCESS",
            query: currentQuery,
            queryName: "scheduler-planned-trips",
            uids: [itemUidToRemove, itemUidToUpdate, itemUidToAdd1, itemUidToAdd2],
            response: {
                result: [itemUidToUpdate, itemUidToAdd1, itemUidToAdd2],
            },
        };
        expect(searches(initialState, action as unknown as SearchAction)).toEqual(expectedState);
    });
});
