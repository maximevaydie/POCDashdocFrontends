import {ErrorBoundary, NotFoundScreen} from "@dashdoc/web-common";
import {Logger} from "@dashdoc/web-core";
import {Box, LoadingWheel} from "@dashdoc/web-ui";
import {Screen} from "@dashdoc/web-ui";
import {useToggle} from "dashdoc-utils";
import React, {useCallback, useEffect, useMemo} from "react";
import Helmet from "react-helmet";
import {RouteComponentProps} from "react-router";

import {TruckerDetails} from "app/features/fleet/trucker/trucker-details/TruckerDetails";
import {fetchRetrieveTrucker} from "app/redux/actions/truckers";
import {useDispatch, useSelector} from "app/redux/hooks";
import {getFullTrucker} from "app/redux/reducers";

type TruckerScreenProps = {
    truckerPk: number;
    updateScreenTitle?: boolean;
    onDelete?: () => void;
} & Partial<RouteComponentProps<{truckerPk: string}>>;

export function TruckerScreen({
    truckerPk: passedItemPk,
    updateScreenTitle,
    match,
    onDelete,
}: TruckerScreenProps) {
    const [isLoading, setLoading, setNotLoading] = useToggle(true);
    const truckerPk = useMemo(
        // @ts-ignore
        () => passedItemPk || parseInt(match?.params?.truckerPk),
        [match?.params?.truckerPk, passedItemPk]
    );

    const trucker = useSelector((state) => getFullTrucker(state, truckerPk.toString()));

    const dispatch = useDispatch();

    const fetchTrucker = useCallback(async () => {
        setLoading();
        try {
            await dispatch(fetchRetrieveTrucker(truckerPk));
        } catch (e) {
            Logger.error(`Trucker with pk "${truckerPk}" not found;`);
        }
        setNotLoading();
    }, [dispatch, setLoading, setNotLoading, truckerPk]);

    useEffect(() => {
        fetchTrucker();
    }, [fetchTrucker]);

    if (isLoading) {
        return <LoadingWheel />;
    } else if (!trucker) {
        return <NotFoundScreen />;
    }

    return (
        <Screen>
            <Box className="container-fluid">
                {updateScreenTitle !== false && (
                    <Helmet>
                        <title>{trucker.display_name}</title>
                    </Helmet>
                )}
                <ErrorBoundary>
                    <TruckerDetails trucker={trucker} onTruckerDelete={onDelete} />
                </ErrorBoundary>
            </Box>
        </Screen>
    );
}
