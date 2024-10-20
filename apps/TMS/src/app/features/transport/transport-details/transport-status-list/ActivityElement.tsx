import {useTimezone} from "@dashdoc/web-common";
import {Box, Flex} from "@dashdoc/web-ui";
import {EventCircle} from "@dashdoc/web-ui";
import {css} from "@emotion/react";
import {formatDate, TransportMessage, parseAndZoneDate} from "dashdoc-utils";
import React, {ReactNode} from "react";

import type {TransportStatus} from "app/types/transport";

export function ActivityElement({
    title,
    subtitleDetails,
    icon,
    update,
    isAmendEvent = false,
    relatedObjectInfo,
    children,
    "data-testid": testId,
}: {
    title: string;
    subtitleDetails: ReactNode;
    icon?: string;
    update: TransportStatus | TransportMessage;
    isAmendEvent?: boolean;
    relatedObjectInfo?: ReactNode;
    children: ReactNode;
    "data-testid"?: string;
}) {
    const timezone = useTimezone();
    if (title === "") {
        return null;
    }

    return (
        <div className={"shipment-status-update clearfix"} data-testid={testId}>
            <div className="col-md-12">
                <div className="status-update-header media">
                    <div className="media-left media-middle">
                        {icon ? (
                            // TODO: Use <Icon> instead of fontawesome.
                            <i className={`media-object fa fa-${icon} fa-fw fa-lg`} />
                        ) : (
                            <EventCircle
                                backgroundColor={isAmendEvent ? "yellow.default" : "green.default"}
                            />
                        )}
                    </div>
                    <div className="media-body">
                        <div
                            css={css`
                                font-size: 14px;
                                margin-bottom: 2px;
                                display: inline-block;
                            `}
                        >
                            {title} {relatedObjectInfo}
                        </div>
                        <br />
                        <Box display="inline-block" color="grey.dark" fontSize="12px">
                            <Flex>
                                {formatDate(
                                    parseAndZoneDate(
                                        update.created_device || update.created,
                                        timezone
                                    ),
                                    "PPPp"
                                )}

                                {subtitleDetails}
                            </Flex>
                        </Box>
                    </div>
                </div>

                <Box ml="30px">{children}</Box>
            </div>
        </div>
    );
}
