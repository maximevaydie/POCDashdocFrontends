export const LOCAL_STORAGE_EXTENDED_VIEW = "extended_view";

function getPersistedExtendedView() {
    return window.localStorage.getItem(LOCAL_STORAGE_EXTENDED_VIEW) === "true";
}

function persistExtendedView(activated: boolean) {
    window.localStorage.setItem(LOCAL_STORAGE_EXTENDED_VIEW, activated ? "true" : "false");
}

export const extendedViewService = {
    persistExtendedView,
    getPersistedExtendedView,
};
