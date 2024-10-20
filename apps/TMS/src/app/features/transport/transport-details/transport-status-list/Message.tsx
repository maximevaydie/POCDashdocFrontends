import {apiService} from "@dashdoc/web-common";
import {getEventMessageTranslation, getLoadText, t} from "@dashdoc/web-core";
import {Box, Flex, Link, TooltipWrapper, toast} from "@dashdoc/web-ui";
import {TransportMessage, TrackDechetsApi} from "dashdoc-utils";
import React, {ReactNode} from "react";

import {getCompanyNamesWhoCanAccessMessage, getTransportSortedSites} from "app/services/transport";

import {ActivityElement} from "./ActivityElement";
import {Document} from "./Document";

import type {Load, Transport} from "app/types/transport";

const trackDechetsApi = new TrackDechetsApi(apiService);

export function Message({message, transport}: {message: TransportMessage; transport: Transport}) {
    let header = "";
    let icon;
    let content: ReactNode = message.message ?? "";
    // It seems legitimate that messages created by the system
    // do not have an actual user as author. Since we only
    // need the author to name the creator, let null authors
    // actually be Dashdoc.
    const author_name = message.author?.display_name ?? "Dashdoc";
    const messageHasReference = message.reference && message.reference.length > 0;
    const wasteNoteType = message.reference.split("-")[0];

    switch (message.type) {
        case "photo":
            header = messageHasReference
                ? t("components.addedPhotoWithReference", {
                      name: author_name,
                      reference: message.reference,
                  })
                : t("components.addedPhoto", {name: author_name});
            icon = "picture-o";
            break;
        case "document":
            header = messageHasReference
                ? t("components.addedDocumentWithReference", {
                      name: author_name,
                      reference: message.reference,
                  })
                : t("components.addedDocument", {name: author_name});
            icon = "file-alt";
            break;
        case "note":
            header = messageHasReference
                ? t("components.addedNoteWithReference", {
                      name: author_name,
                      reference: message.reference,
                  })
                : t("components.addedNote", {name: author_name});
            icon = "sticky-note";
            break;
        case "share":
            icon = "share";
            content = null;
            header = getEventMessageTranslation(message) || "";
            break;
        case "load_verification":
            header = `${author_name} a déclaré les marchandises suivantes :`;
            icon = "box-open";
            content = message.message ? (
                <LoadVerificationBody loads={JSON.parse(message.message)} />
            ) : null;
            break;
        case "child_transport_cancelled":
            header = t("chartering.charterHasBeenCancelledBy", {
                author: author_name,
            });
            icon = "times";
            content = null;
            break;
        case "waste_note_pdf_url":
            /* ----------- Waste Manifest handling ----------- */
            // Waste Manifest successfully linked to the transport
            icon = "link";
            header = t("trackdechets.wasteManifestLinkedToTransport", {
                wasteManifest: message.reference,
            });
            content = (
                <TwoStepLink
                    firstStepUrl={() => {
                        return trackDechetsApi.fetchTrackDechetsDocumentURL(message.reference);
                    }}
                    errorMessage={t("trackdechets.couldNotObtainPdfLink")}
                    data-testid="trackdechet-link-to-obtain-pdf-link"
                />
            );
            break;
        case "waste_note_signature_url":
            // Waste Manifest signature fail, link to retry
            icon = "signature";
            header = t("trackdechets.linkToPickoffWasteManifestValidation", {
                wasteManifest: message.reference,
            });

            // Different status
            if (wasteNoteType === "BSDA") {
                header = t("trackdechets.linkToPickoffWasteManifestValidationBSDA", {
                    wasteManifest: message.reference,
                });
            }

            content = (
                <Link
                    onClick={async (event) => {
                        event.preventDefault();
                        try {
                            await trackDechetsApi.fetchSignTrackDechetsWasteManifest(
                                message.reference,
                                message.transport
                            );
                            toast.success(t("common.success"));
                        } catch (error) {
                            const message = await error.json();
                            toast.error(message["non_field_errors"]["detail"][0]);
                        }
                        return false;
                    }}
                >
                    {t("trackdechets.sign")}
                </Link>
            );
            break;
        case "waste_note_complete":
            // Waste Manifest successfully signed
            icon = "link";
            header = t("trackdechets.successfulSignature", {
                wasteManifest: message.reference,
            });
            content = (
                <TwoStepLink
                    firstStepUrl={() => {
                        return trackDechetsApi.fetchTrackDechetsDocumentURL(message.reference);
                    }}
                    errorMessage={t("trackdechets.couldNotObtainPdfLink")}
                    data-testid="trackdechet-link-to-obtain-pdf-link"
                />
            );
            break;
        case "waste_note_deleted":
            icon = "unlink";
            header = t("trackdechets.linkRemoved", {
                wasteManifest: message.reference,
            });
            content = null;
            break;
        case "trucker_kept_non_cmr":
            icon = "file-alt";
            header = t("identifyPaperCmr.truckerKeptNonCmr", {
                author: message?.author?.display_name,
            });
            break;
    }

    const authorizedCompanies = getCompanyNamesWhoCanAccessMessage(
        transport,
        message.readable_by_company_ids
    );

    const subtitleDetails = (
        <>
            <MessageCity message={message} transport={transport} />
            {" · "}
            <TooltipWrapper
                content={t("visibilityLabel.companiesDetail", {
                    companies: authorizedCompanies.join(", "),
                })}
            >
                <Flex ml={1} alignItems="center">
                    {t("common.companiesCount", {
                        smart_count: authorizedCompanies.length,
                    })}
                </Flex>
            </TooltipWrapper>
        </>
    );

    return (
        <ActivityElement
            title={header}
            subtitleDetails={subtitleDetails}
            update={message}
            icon={icon}
            data-testid="transport-message"
        >
            <Box>
                {content}
                <Document message={message} />
            </Box>
        </ActivityElement>
    );
}

function LoadVerificationBody({loads}: {loads: Load[]}) {
    return (
        <ul>
            {loads.map((load, index) => (
                <li key={index}> {getLoadText(load)}</li>
            ))}
        </ul>
    );
}

/**
 * Get a dynamic link from an endpoint and open it in another window
 * @param firstStepUrl The full path to the endpoint that will generate the URL
 * @param text Text do display, defaults to "Click to download"
 * @returns A <a> component
 */
function TwoStepLink(props: {
    firstStepUrl: () => Promise<{link: string}>;
    text?: string;
    errorMessage: string;
    "data-testid"?: string;
}) {
    const {firstStepUrl, text, errorMessage} = props;
    return (
        <Link
            onClick={async (event) => {
                event.preventDefault();
                try {
                    const response = await firstStepUrl();
                    window.open(response.link);
                } catch (error) {
                    toast.error(errorMessage);
                }
                return false;
            }}
            data-testid={props["data-testid"]}
        >
            {!!text || t("components.clickToDownload")}
        </Link>
    );
}

const MessageCity = ({message, transport}: {transport: Transport; message: TransportMessage}) => {
    if (message.site !== null) {
        const site = getTransportSortedSites(transport).find(({uid}) => message.site === uid);
        if (site && site.address) {
            const tooltipCompanyPart = site.address.company
                ? site.address.company.name + " · "
                : "";
            const tooltipContent =
                tooltipCompanyPart +
                `${site.address.address} · ${site.address.postcode} ${site.address.city} (${site.address.country})`;

            return (
                <>
                    {" · "}
                    <TooltipWrapper content={tooltipContent}>{site.address.city}</TooltipWrapper>
                </>
            );
        }
    }

    return null;
};
