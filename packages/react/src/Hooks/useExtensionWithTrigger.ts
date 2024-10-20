import {useSelector} from "react-redux";

import {ApiModels} from "../index";
import {getExtensionsWithTrigger} from "../redux/accountSelector";
import {CommonRootState} from "../redux/types";

export function useExtensionWithTripSendToNetworkTrigger(): ApiModels.Extensions.ShortExtension[] {
    return useSelector((state: CommonRootState) =>
        getExtensionsWithTrigger(state, "trip_send_to_network")
    );
}
