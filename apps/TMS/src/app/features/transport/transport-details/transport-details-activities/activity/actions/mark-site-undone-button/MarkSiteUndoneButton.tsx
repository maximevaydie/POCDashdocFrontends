import {Logger} from "@dashdoc/web-core";
import {t} from "@dashdoc/web-core";
import {Button, Icon} from "@dashdoc/web-ui";
import {Trucker, useToggle} from "dashdoc-utils";
import React, {useEffect} from "react";

import {useRefreshTransportLists} from "app/hooks/useRefreshTransportLists";
import {
    fetchMarkActivityUndone,
    fetchMarkBreakingAndResumingActivitiesUndone,
    fetchRetrieveTrucker,
} from "app/redux/actions";
import {useDispatch, useSelector} from "app/redux/hooks";
import {activityService} from "app/services/transport/activity.service";

import {MarkBreakSiteUndoneConfirmationModal} from "./MarkBreakSiteUndoneConfirmationModal";
import {MarkSiteUndoneConfirmationModal} from "./MarkSiteUndoneConfirmationModal";
import {OutdatedTruckerAppModal} from "./OutdatedTruckerAppModal";

import type {Site, Transport} from "app/types/transport";

type MarkActivityUndoneButtonProps = {
    dataTestId?: string;
    site: Site;
    transport: Transport;
    truckerPk?: Trucker["pk"];
    breakIsDone?: boolean;
    resumeIsDone?: boolean;
};

export const MarkSiteUndoneButton = ({
    dataTestId,
    site,
    transport,
    truckerPk,
    breakIsDone,
    resumeIsDone,
}: MarkActivityUndoneButtonProps) => {
    const dispatch = useDispatch();

    const transportListRefresher = useRefreshTransportLists();
    const [confirmationModalOpen, showConfirmationModal, hideConfirmationModal] = useToggle();
    const [
        truckerAppUpdateRequiredModalOpen,
        showTruckerAppUpdateRequiredModal,
        hideTruckerAppUpdateRequiredModal,
    ] = useToggle();

    const isBreak = activityService.isBreak(site);

    const trucker = useSelector((state) =>
        truckerPk ? state.entities.truckers?.[truckerPk] : null
    );

    useEffect(() => {
        if (truckerPk && !trucker) {
            try {
                dispatch(fetchRetrieveTrucker(truckerPk, false /* showToast */));
            } catch (e) {
                Logger.error(`Trucker with pk "${truckerPk}" not found;`);
            }
        }
    }, [truckerPk]);

    const onMarkActivityUndone = async () => {
        if (trucker && trucker.app_version <= 271) {
            hideConfirmationModal();
            showTruckerAppUpdateRequiredModal();
        } else {
            await handleMarkActivityUndone();
        }
    };

    const handleMarkActivityUndone = async () => {
        if (isBreak) {
            await dispatch(fetchMarkBreakingAndResumingActivitiesUndone(site.uid));
        } else {
            await dispatch(fetchMarkActivityUndone(site.uid));
        }
        transportListRefresher();
        hideConfirmationModal();
    };

    return (
        <>
            <Button
                type="button"
                variant="secondary"
                data-testid={dataTestId}
                onClick={showConfirmationModal}
                ml={4}
            >
                <Icon name="removeCircle" mr={2} color="red.default" />
                {resumeIsDone && !breakIsDone
                    ? t("common.markResumingUndone")
                    : t("common.markUndone")}
            </Button>
            {confirmationModalOpen &&
                (isBreak ? (
                    <MarkBreakSiteUndoneConfirmationModal
                        onSubmit={onMarkActivityUndone}
                        onClose={hideConfirmationModal}
                        breakIsDone={breakIsDone}
                        resumeIsDone={resumeIsDone}
                    />
                ) : (
                    <MarkSiteUndoneConfirmationModal
                        site={site}
                        transport={transport}
                        onSubmit={onMarkActivityUndone}
                        onClose={hideConfirmationModal}
                    />
                ))}
            {truckerAppUpdateRequiredModalOpen && (
                <OutdatedTruckerAppModal
                    onSubmit={() => {
                        handleMarkActivityUndone();
                        hideTruckerAppUpdateRequiredModal();
                    }}
                />
            )}
        </>
    );
};
