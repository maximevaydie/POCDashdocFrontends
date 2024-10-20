import {FeatureFlags} from "dashdoc-utils";
import isEqual from "lodash.isequal";
import {useSelector} from "react-redux";

import {getFeatureFlag} from "../redux/accountSelector";
import {CommonRootState} from "../redux/types";

export function useFeatureFlag(flagName: FeatureFlags): boolean {
    return useSelector((state: CommonRootState) => getFeatureFlag(state, flagName));
}

export function useFeatureFlags(flagName: FeatureFlags | FeatureFlags[], any = false) {
    const flagNames = typeof flagName === "string" ? [flagName] : flagName;
    const values: boolean[] = useSelector(
        (state: CommonRootState) => flagNames.map((flag) => getFeatureFlag(state, flag)),
        isEqual
    );

    if (any) {
        return values.reduce((previous, current) => previous || current) == true;
    } else {
        return values.reduce((previous, current) => previous && current) == true;
    }
}
