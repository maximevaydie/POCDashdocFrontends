function parseQueryString(queryString: string) {
    if (!queryString) {
        return null;
    }
    var parsed: {[key: string]: any} = {};
    var hashes = queryString.slice(1).split("&");
    for (var i = 0; i < hashes.length; i++) {
        let hash = hashes[i].split("=");
        parsed[hash[0]] = hash[1];
    }
    return parsed;
}

// Used just below by toQueryString to retreive the right value to query
// if it was passed as an object containing value or pk key
const extractValue = (value: any) => value?.value ?? value?.pk ?? value;

function cleanQuery(initialQuery: {[key: string]: any}) {
    let cleanedQuery: {[key: string]: string} = {};

    for (let key of Object.keys(initialQuery)) {
        const rawValue = initialQuery[key];
        let value: string;
        if (rawValue === undefined) {
            value = "";
        } else if (Array.isArray(rawValue)) {
            value = rawValue.map(extractValue).join();
        } else {
            value = extractValue(rawValue);
        }

        if (value !== "") {
            cleanedQuery[key] = value;
        }
    }
    return cleanedQuery;
}

function toQueryString(initialQuery: {[key: string]: any}) {
    return Object.entries(cleanQuery(initialQuery))
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join("&");
}

// thanks SO http://stackoverflow.com/a/901144/1418983
function getQueryParameterByName(name: string) {
    let url = window.location.href;
    name = name.replace(/[[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) {
        return null;
    }
    if (!results[2]) {
        return null;
    }
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function updateQueryParameterByName(key: string, value: string) {
    let urlQueryString = document.location.search,
        newParam = key + "=" + value,
        params = "?" + newParam;

    // If the "search" string exists, then build params from it
    if (urlQueryString) {
        let keyRegex = new RegExp("([?&])" + key + "[^&]*");

        // If param exists already, update it
        if (urlQueryString.match(keyRegex) !== null) {
            params = urlQueryString.replace(keyRegex, "$1" + newParam);
        } else {
            // Otherwise, add it to end of query string
            params = urlQueryString + "&" + newParam;
        }
    }
    return params;
}

function isSearchQueryEqual(queryA: Object, queryB: Object) {
    if (!queryA || !queryB) {
        return true;
    }
    // we compare using toQueryString because sometimes the params are stringified
    return toQueryString(queryA).replace("%2C", "") === toQueryString(queryB).replace("%2C", "");
}

function isPublicTokenAuthorized() {
    return !!getQueryParameterByName("public_token");
}

export const queryService = {
    parseQueryString,
    cleanQuery,
    toQueryString,
    getQueryParameterByName,
    isSearchQueryEqual,
    updateQueryParameterByName,
    isPublicTokenAuthorized,
};
