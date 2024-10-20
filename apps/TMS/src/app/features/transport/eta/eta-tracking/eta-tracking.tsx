import {t} from "@dashdoc/web-core";
import {Flex, Icon, Link, TooltipWrapper, Text} from "@dashdoc/web-ui";
import {formatDate, parseDate, useToggle, validateSiteForETA} from "dashdoc-utils";
import {differenceInMinutes} from "date-fns";
import React, {FunctionComponent, useCallback} from "react";

import {fetchEnableETA} from "app/redux/actions";
import {useDispatch} from "app/redux/hooks";

import ETAValidationModal from "../eta-validation-modal";

import type {Site} from "app/types/transport";

interface EtaTrackingProps {
    site: Pick<Site, "uid" | "address"> & {
        slots?: Site["slots"];
        eta?: Site["eta"];
        eta_tracking?: Site["eta_tracking"];
        punctuality_status?: Site["punctuality_status"];
    };
    format?: "full" | "short";
    showActivateETAButton?: boolean;
}

const EtaTracking: FunctionComponent<EtaTrackingProps> = ({
    site,
    format = "full",
    showActivateETAButton = false,
}) => {
    const dispatch = useDispatch();
    const handleActivateETA = useCallback(() => {
        dispatch(fetchEnableETA(site.uid));
    }, [dispatch, site.uid]);

    const [isETAValidationModalOpen, openETAValidationModal, closeETAValidationModal] =
        useToggle(false);

    if (
        (site.eta_tracking == false && !showActivateETAButton) ||
        // @ts-ignore
        ["late", "on_time"].includes(site.punctuality_status)
    ) {
        return null;
    }

    if (site.eta_tracking == false && showActivateETAButton) {
        const etaValidation = validateSiteForETA(site);
        const canActivateETA = Object.values(etaValidation).filter((e) => !e).length == 0;
        return (
            <Flex>
                <Icon name="clock" color="blue.default" mr={1} />
                <Link onClick={canActivateETA ? handleActivateETA : openETAValidationModal} ml={2}>
                    {t("eta.enableETA")}
                </Link>
                {isETAValidationModalOpen && (
                    <ETAValidationModal site={site} onClose={closeETAValidationModal} />
                )}
            </Flex>
        );
    }

    // @ts-ignore
    const diffInMinutes = differenceInMinutes(parseDate(site.eta), new Date());
    if (site.eta && diffInMinutes > 0) {
        const isIncoming = diffInMinutes <= 2;
        const hoursLeft = Math.floor(diffInMinutes / 60);
        const minutesLeft = diffInMinutes % 60;
        const diff =
            hoursLeft > 0
                ? `${hoursLeft} ${t("common.hour", {
                      smart_count: hoursLeft,
                  })}  ${t("common.timeAnd")} ${minutesLeft} ${t("common.minute", {
                      smart_count: minutesLeft,
                  })}`
                : `${minutesLeft} ${t("common.minute", {smart_count: minutesLeft})}`;
        const tooltip = `${t("eta.arrivalIn")} ${diff}`;

        const hour = isIncoming ? "< 2min" : formatDate(parseDate(site.eta), "HH:mm");
        const eta_with_icon =
            format == "full" ? (
                <>
                    <Icon name="clock" /> {t("eta.withHour", {hour})}
                </>
            ) : (
                <>
                    {hour} <Icon name="clock" />
                </>
            );

        if (isIncoming) {
            return eta_with_icon;
        } else {
            return <TooltipWrapper content={tooltip}>{eta_with_icon}</TooltipWrapper>;
        }
    } else {
        const text = `<b>${t("eta.etaUnavailable")}</b> ${t(
            "eta.etaUnavailablePossibleRaisons"
        )}<br/>- ${t("eta.etaUnavailableNot2hSlot")};<br/>- ${t(
            "eta.etaUnavailableNoTelematic"
        )}.`;

        return (
            // nosemgrep react-dangerouslysetinnerhtml
            <TooltipWrapper content={<Text dangerouslySetInnerHTML={{__html: text}} />}>
                <Icon name="clock" /> {t("eta.etaTracking")}
            </TooltipWrapper>
        );
    }
};

export default EtaTracking;
