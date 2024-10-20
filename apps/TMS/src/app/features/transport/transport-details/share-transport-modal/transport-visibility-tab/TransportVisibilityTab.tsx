import {apiService} from "@dashdoc/web-common";
import {getConnectedManager} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Box, Text, Link, Callout} from "@dashdoc/web-ui";
import {LoadingWheel} from "@dashdoc/web-ui";
import {HorizontalLine} from "@dashdoc/web-ui";
import {SlimCompanyForInvitation} from "dashdoc-utils";
import {TransportVisibilityResponse} from "dashdoc-utils/dist/api/scopes/transports";
import React, {useCallback, useEffect, useState} from "react";
import {useSelector} from "react-redux";

import {AddContactModal} from "app/features/company/contact/AddContactModal";
import {RootState} from "app/redux/reducers/index";

import {TransportVisibilityCompany} from "./TransportVisibilityCompany";

import type {Transport} from "app/types/transport";

type Props = {
    transport: Transport;
};

export function TransportVisibilityTab(props: Props) {
    const {transport} = props;
    const [companies, setCompanies] = useState<TransportVisibilityResponse>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [addContactModalCompany, setAddContactModalCompany] =
        useState<SlimCompanyForInvitation | null>(null);

    const {userLanguage} = useSelector((state: RootState) => {
        const connectedManager = getConnectedManager(state);
        return {
            userLanguage: connectedManager?.language,
        };
    });

    const fetchTransportVisibility = useCallback(async () => {
        try {
            const response = await apiService.Transports.visibility(transport.uid, {
                apiVersion: "web",
            });
            setCompanies(response);
            setLoading(false);
        } catch (error) {
            setError(true);
        }
    }, [transport.uid]);

    useEffect(() => {
        fetchTransportVisibility();
    }, [fetchTransportVisibility]);

    const helpLink =
        userLanguage === "fr"
            ? "https://help.dashdoc.com/fr/articles/6436336"
            : "https://help.dashdoc.com/en/articles/6436336";

    return (
        <Box>
            {error && <Text>{t("common.error")}</Text>}
            {loading && <LoadingWheel />}
            {!loading && (
                <Box py={5}>
                    {companies.map((company, item) => (
                        <>
                            {item !== 0 && <HorizontalLine my={1} />}
                            <TransportVisibilityCompany
                                company={company}
                                key={company.pk}
                                onInviteClick={() => setAddContactModalCompany(company)}
                            />
                        </>
                    ))}
                </Box>
            )}
            <Callout variant="informative" mb={3}>
                {t("transportDetails.shareTransportModal.visibilityBanner")}{" "}
                <Link href={helpLink} target="_blank" rel="noopener">
                    {t("transportDetails.shareTransportModal.visibilityBannerLink")}
                </Link>
            </Callout>
            {addContactModalCompany && (
                <AddContactModal
                    company={addContactModalCompany}
                    onClose={() => setAddContactModalCompany(null)}
                    onSubmit={() => fetchTransportVisibility()}
                />
            )}
        </Box>
    );
}
