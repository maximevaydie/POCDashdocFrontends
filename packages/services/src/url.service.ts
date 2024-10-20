function getBaseUrl() {
    // IE doesn't have window.location.origin
    return (
        window.location.protocol +
        "//" +
        window.location.hostname +
        (window.location.port ? ":" + window.location.port : "")
    );
}

/**
 * Get the URL of a flow site.
 * @param slug The slug of the flow site.
 *
 * example: When slug is 'my-site', the URL will be:
 * https://www.dashdoc.eu/flow/site/my-site/
 */
function getFlowSiteUrl(slug: string) {
    if (slug.length === 0) {
        throw new Error("slug is empty");
    }
    return `${urlService.getBaseUrl()}/flow/site/${slug}/`;
}

function getFlowSiteRegex() {
    const flowSiteBaseUrl = `${urlService.getBaseUrl()}/flow/site/`;
    const flowSiteBaseUrlRegex = flowSiteBaseUrl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`^${flowSiteBaseUrlRegex}(.+)/$`);
    return regex;
}

/**
 * Check if a URL is a valid flow site URL.
 * @param flowUrl Example: https://www.dashdoc.eu/flow/site/my-site/
 */
function isValidFlowSiteUrl(flowUrl: string | undefined) {
    if (flowUrl) {
        const regex = getFlowSiteRegex();
        return regex.test(flowUrl);
    }
    return false;
}

/**
 * Extract the slug from a flow site URL.
 * @param flowUrl Example: https://www.dashdoc.eu/flow/site/my-site/
 * @returns the slug Example: my-site
 */
function extractFlowSlug(flowUrl: string) {
    if (isValidFlowSiteUrl(flowUrl)) {
        const regex = getFlowSiteRegex();
        const match = flowUrl.match(regex);
        if (match && match[1]) {
            return match[1];
        }
    }
    throw new Error("Invalid flow URL");
}

export const Arrayify = <T>(value: T | T[]) => (Array.isArray(value) ? value : [value]);

export const urlService = {
    getBaseUrl,
    getFlowSiteUrl,
    isValidFlowSiteUrl,
    extractFlowSlug,
};
