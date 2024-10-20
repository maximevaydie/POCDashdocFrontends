export function selectRows(checked: boolean, model: string, rowIds: Array<string | number>) {
    return {
        type: "SELECT_ROWS",
        checked,
        model,
        rowIds,
    };
}

export function unselectAllRows(model: any) {
    return {
        type: "UNSELECT_ALL_ROWS",
        model,
    };
}
