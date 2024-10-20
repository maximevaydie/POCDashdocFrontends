import {FlowProfile, Site} from "types";

function needAccept(profile: FlowProfile, site: Site) {
    const accepted =
        profile !== "siteManager" &&
        site.security_protocol !== null &&
        site.security_protocol.accepted_by_current_user !== true;
    return accepted;
}

export const securityProtocolService = {
    needAccept,
};
