import {SimpleNavbar, apiService, authService, getErrorMessage} from "@dashdoc/web-common";
import {queryService, t} from "@dashdoc/web-core";
import {Box, Button, Flex, LoadingWheel, Text} from "@dashdoc/web-ui";
import {PublicScreen, PublicScreenContent} from "@dashdoc/web-ui";
import {Company, Manager, TransportStatusCategory} from "dashdoc-utils";
import React, {useCallback, useEffect, useState} from "react";
import {Link} from "react-router-dom";

import {Panel} from "app/features/transport/update-late-transports/Panel";
import {UserPersona, LateTransport} from "app/features/transport/update-late-transports/transport";
import {UpdateLateTransportSelector} from "app/features/transport/update-late-transports/transport-switch";
import {fetchListPublicTransports, fetchPublicTokenUserInfo} from "app/redux/actions/transports";
import {realtimeService} from "app/services/realtime/realtime.service";

import type {Transport} from "app/types/transport";

const isTransportCancellable = (transportStatus: TransportStatusCategory) =>
    !["done", "cancelled", "verified", "invoiced", "paid", "deleted", "declined"].includes(
        transportStatus
    );

type LateTransportAction = "update" | "cancel";

export type ManagerWithCompany = Manager & {current_company: Company};

export const UpdateLateTransportScreen = () => {
    const [errorScreen, setErrorScreen] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [qualimatWarningEnabled, setQualimatWarningEnabled] = useState(false);
    const [transports, setTransports] = useState<Array<Transport> | null>(null);
    const [email, setEmail] = useState<string | null>(null);
    const [companyPk, setCompanyPk] = useState<number | null>(null);
    const [currentTransportIndex, setCurrentTransportIndex] = useState<number | null>(null);
    const [screenLoading, setScreenLoading] = useState(false);
    const persona = queryService.getQueryParameterByName("persona") as UserPersona;
    const action = queryService.getQueryParameterByName("action") as LateTransportAction;

    const _oldPublicToken = queryService.getQueryParameterByName("token");
    const _newPublicToken = queryService.getQueryParameterByName("public_token");
    const publicToken = _oldPublicToken || _newPublicToken;
    if (publicToken) {
        authService.setPublicTokenForRestrictedDashdocAPIAccess(publicToken);
    }

    const fetchTransports = useCallback(async () => {
        setError(null);
        setSuccess(null);
        setScreenLoading(true);

        if (!publicToken) {
            setErrorScreen(t("common.error"));
            return;
        }

        try {
            const result = await fetchListPublicTransports();
            const userInfo = await fetchPublicTokenUserInfo();
            if (result !== undefined) {
                const {results: resultTransports}: {results: Transport[]; headers: Headers} =
                    result;

                const {user_email: email, user_company: companyPk} = userInfo;

                setEmail(email);
                setCompanyPk(companyPk);
                setTransports(resultTransports);

                let index = currentTransportIndex;
                if (!index) {
                    const firstTransportUid = queryService.getQueryParameterByName("uid");
                    index = resultTransports.findIndex(({uid}) => uid === firstTransportUid) || 0;
                }
                setCurrentTransportIndex(index);
                setScreenLoading(false);
            } else {
                throw new Error("Undefined transport list");
            }
        } catch (error) {
            setScreenLoading(false);
            if (error.status === 403) {
                setErrorScreen(t("updateLateTransports.cannotAccessTransport"));
            } else {
                setErrorScreen(t("common.error"));
            }
        }
    }, [currentTransportIndex, publicToken]);

    // fetch transports on mount
    useEffect(() => {
        if (!publicToken) {
            setErrorScreen(t("updateLateTransports.cannotAccessTransport"));
        } else {
            fetchTransports();
        }
    }, []);

    const setQualimatWarning = useCallback(
        (enabled: boolean) => {
            setQualimatWarningEnabled(enabled);
        },
        [setQualimatWarningEnabled]
    );

    const subtitle =
        action === "cancel"
            ? null
            : persona === UserPersona.REMINDER_STATUS
              ? t("updateLateTransports.updateTransportStatusAndDocuments")
              : t("updateLateTransports.addMissingCN");

    const handlePreviousTransportClick = useCallback(() => {
        setError(null);
        setSuccess(null);

        if (currentTransportIndex !== null && currentTransportIndex > 0) {
            setCurrentTransportIndex(currentTransportIndex - 1);
            return true;
        }
        return false;
    }, [currentTransportIndex]);

    const handleNextTransportClick = useCallback(() => {
        if (!transports) {
            return;
        }

        setError(null);
        setSuccess(null);

        if (currentTransportIndex !== null && currentTransportIndex < transports?.length - 1) {
            setCurrentTransportIndex(currentTransportIndex + 1);
            return true;
        }
        return false;
    }, [currentTransportIndex, transports?.length]);

    const onSubmitAndNext = useCallback(() => {
        if (!handleNextTransportClick()) {
            setSuccess(t("updateLateTransports.changesSuccess"));
        }
    }, [handleNextTransportClick]);

    const onCancelTransport = useCallback(async () => {
        if (currentTransportIndex === null || !transports) {
            return;
        }

        try {
            await apiService.post(`/transports/${transports[currentTransportIndex].uid}/cancel/`, {
                cancel_reason: t("updateLateTransports.cancelReason"),
            });
            await fetchTransports();
            setSuccess(t("updateLateTransports.cancelTransportSuccess"));
        } catch (error) {
            if (error.status === 403) {
                setError(t("updateLateTransports.cantCancelOngoingTransport"));
            } else {
                setError(await getErrorMessage(error, null));
            }
        }
    }, [currentTransportIndex, fetchTransports, transports]);

    const handleSetError = useCallback(
        (error: string | null) => {
            setError(error);
        },
        [setError]
    );

    const isLast = transports ? currentTransportIndex === transports.length - 1 : false;

    if (errorScreen) {
        return (
            <Flex height="100%" flexDirection="column" justifyContent="center" alignItems="center">
                <Text variant="title" as="h4" mb={3}>
                    {errorScreen}
                </Text>
                <Link to="/app/">{t("app.back")}</Link>
            </Flex>
        );
    }

    const loading =
        !transports || currentTransportIndex === null || !email || !companyPk || screenLoading;

    return (
        <PublicScreen>
            <PublicScreenContent>
                <SimpleNavbar
                    user={{display_name: email || t("common.loading")}}
                    onLogout={handleLogout}
                    forPublicScreen
                />
                <Box>
                    <Box minHeight="90vh">
                        <Panel justifyContent="center" alignItems="center" flexDirection="column">
                            <Text variant="title">
                                {action === "cancel"
                                    ? t("updateLateTransports.confirmCanceltransport")
                                    : t("updateLateTransports.completeTransportInformations")}
                            </Text>
                            {action === "update" && (
                                <Text variant="h1" m={2}>
                                    {subtitle}
                                </Text>
                            )}
                            {loading ? (
                                <LoadingWheel />
                            ) : (
                                <Flex
                                    id="transport-container"
                                    flexDirection="column"
                                    border="1px solid"
                                    borderColor="grey.light"
                                >
                                    {action === "update" && transports.length > 1 && (
                                        <UpdateLateTransportSelector
                                            transportCount={transports.length}
                                            transportIndex={currentTransportIndex}
                                            onPreviousTransportClick={handlePreviousTransportClick}
                                            onNextTransportClick={handleNextTransportClick}
                                        />
                                    )}
                                    {error && (
                                        <Box backgroundColor="red.light" p={3}>
                                            <Text>{error}</Text>
                                        </Box>
                                    )}
                                    {success && (
                                        <Box
                                            data-testid="late-transport-update-success"
                                            backgroundColor="green.light"
                                            p={3}
                                        >
                                            <Text>{success}</Text>
                                        </Box>
                                    )}
                                    {qualimatWarningEnabled && (
                                        <Flex
                                            alignItems="center"
                                            flexDirection="column"
                                            backgroundColor="yellow.light"
                                            p={3}
                                        >
                                            {t(
                                                "updateLateTransports.qualimatPreventUpdateWarning"
                                            )}
                                            <Box>
                                                <Button variant="plain">
                                                    {t(
                                                        "updateLateTransports.qualimatPreventUpdateWarningLink"
                                                    )}
                                                </Button>
                                            </Box>
                                        </Flex>
                                    )}
                                    <LateTransport
                                        userCompany={{pk: companyPk}}
                                        transport={transports[currentTransportIndex]}
                                        persona={persona}
                                        updatesEnabled={action === "update"}
                                        /* We can safely cast the token as a "string" here
                                           because if the token is null or undefined
                                           an error screen would be rendered instead of the transport (see useEffect above) */
                                        setError={handleSetError}
                                        setQualimatWarning={setQualimatWarning}
                                        onDocumentAdded={fetchTransports}
                                        onStatusChange={fetchTransports}
                                    />
                                    <Flex justifyContent="space-around">
                                        {action === "cancel" ? (
                                            !isTransportCancellable(
                                                transports[currentTransportIndex].status
                                            ) ? (
                                                <Text p={2}>
                                                    {t(
                                                        "updateLateTransports.cantCancelOngoingTransport"
                                                    )}
                                                </Text>
                                            ) : (
                                                <Button
                                                    variant="primary"
                                                    severity="danger"
                                                    onClick={onCancelTransport}
                                                    mb={3}
                                                >
                                                    {t("updateLateTransports.markCancelled")}
                                                </Button>
                                            )
                                        ) : (
                                            <Button
                                                data-testid="late-transport-submit-updates"
                                                variant="primary"
                                                onClick={onSubmitAndNext}
                                                mb={3}
                                            >
                                                {isLast
                                                    ? t("common.save")
                                                    : t(
                                                          "updateLateTransports.saveAndNextTransport"
                                                      )}
                                            </Button>
                                        )}
                                    </Flex>
                                </Flex>
                            )}
                        </Panel>
                    </Box>
                </Box>
            </PublicScreenContent>
        </PublicScreen>
    );

    function handleLogout() {
        realtimeService.cleanup();
        authService.logout();
    }
};
