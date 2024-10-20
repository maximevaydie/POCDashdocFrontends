import {useContext} from "react";
import {useSelector} from "react-redux";

import {ActionableExtendedViewContext} from "app/common/ActionableExtendedViewContext";
import {useHasOtherCompanyInGroupView} from "app/hooks/useHasOtherCompanyInGroupView";
import {RootState} from "app/redux/reducers/index";

export function useExtendedView() {
    const hasOtherCompanyInGroupView = useHasOtherCompanyInGroupView();
    const hasActionableProvider = useContext(ActionableExtendedViewContext);
    const canActivateExtendedView = hasOtherCompanyInGroupView && hasActionableProvider;

    const hasExtendedViewActivated = useSelector((state: RootState) => state.extendedView);
    return {
        canActivateExtendedView,
        extendedView: canActivateExtendedView && hasExtendedViewActivated,
    };
}
