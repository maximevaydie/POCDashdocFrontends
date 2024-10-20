import {Company, Manager} from "dashdoc-utils";
import {useEffect} from "react";

import {useDispatch} from "app/redux/hooks";
import {realtimeService} from "app/services/realtime/realtime.service";

/**
 * This hook is used to setup the realtime part when the user is logged in.
 */
export function useSetupRealtime(manager: Manager, company: Company) {
    const dispatch = useDispatch();

    useEffect(() => {
        realtimeService.setup(dispatch, manager.user.pk, company.pk);

        /**
         * We assume that, when the user or company changes this hook is unmounted.
         * A cleanup should be done here, in a return function like this :
         * ```
            return () => {
                realtimeService.cleanup();
            };
         ```
         * I let the current behavior for now (in the logout) to avoid a potential side effect.
         */
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return;
}
