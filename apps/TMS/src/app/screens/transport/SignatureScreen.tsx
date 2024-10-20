/// <reference types="intercom-web" />

import {SimpleNavbar, apiService} from "@dashdoc/web-common";
import {BuildConstants, localeService, queryService, t} from "@dashdoc/web-core";
import {LoadingWheel, theme} from "@dashdoc/web-ui";
import {Screen} from "@dashdoc/web-ui";
import {Global, ThemeProvider, css} from "@emotion/react";
import {
    DeliveryDocumentBusinessPrivacyScope,
    DeliveryDocument,
    DeprecatedSignatory,
    Signature as SignatureData,
} from "dashdoc-utils";
import React from "react";
import {StaticRouter} from "react-router";

import {SignatureAddObservations} from "app/features/document/signature/signature-add-observations";
import {SignatureAlreadySigned} from "app/features/document/signature/signature-already-signed";
import {SignatureBadUser} from "app/features/document/signature/signature-bad-user";
import {SignatureChooseSignature} from "app/features/document/signature/signature-choose-signature";
import {SignatureConfirmLoad} from "app/features/document/signature/signature-confirm-load";
import {SignatureDone} from "app/features/document/signature/signature-done";
import {SignatureError} from "app/features/document/signature/signature-error";
import {SignatureInvalidToken} from "app/features/document/signature/signature-invalid-token";
import {
    contactlessSignatureCompleted,
    getConsignmentNotesFromTransport,
    getConsignmentNotesNumbersAsStringFromConsignmentNotes,
    getPlatesListAsStringFromTransport,
    getSiteAndScopeFromSignature,
} from "app/features/document/signature/utils";

import type {Site, Transport} from "app/types/transport";

const screenCSS = css`
    display: flex;
    flex-direction: column;
    align-items: center;
    overflow: auto;
`;

enum SignatureStep {
    LOADING = 0,
    CONFIRM_INFORMATIONS,
    ADD_OBSERVATIONS,
    SEE_CONSIGNMENT_NOTE,
    CHOOSE_SIGNATURE,
    FINISH_FLOW,
    ERROR,
    INVALID_TOKEN,
    BAD_USER,
    ALREADY_SIGNED,
}

type SignatureProps = {};

type SignatureState = {
    step: SignatureStep;
    observations?: {
        content: string;
        deliveryUid: string;
    };
    transport?: Transport;
    signature?: SignatureData;
    signatoryName?: string;
    businessPrivacyScope?: DeliveryDocumentBusinessPrivacyScope;
    documentsToSign?: DeliveryDocument[];
    documentsNumbersAsString?: string;
    plates?: string;
    site?: Site;
};

type FetchDetailResponse = {
    transport: Transport;
    signature: SignatureData;
};

class Signature extends React.Component<SignatureProps, SignatureState> {
    constructor(props: undefined) {
        // @ts-ignore
        super(props);

        this.state = {
            step: SignatureStep.LOADING,
        };
    }

    componentDidMount() {
        const token = queryService.getQueryParameterByName("token");

        apiService
            .get(`/transport-signatures/fetch-details/?token=${token}`, {apiVersion: "web"})
            .then((response: FetchDetailResponse) => {
                const {transport, signature} = response;
                const {signatory_name: signatoryName} = signature;
                const {site, businessPrivacyScope} = getSiteAndScopeFromSignature(
                    signature,
                    transport
                );
                const documentsToSign = getConsignmentNotesFromTransport(
                    transport,
                    businessPrivacyScope
                );
                const documentsNumbersAsString =
                    getConsignmentNotesNumbersAsStringFromConsignmentNotes(documentsToSign);
                const plates = getPlatesListAsStringFromTransport(transport);

                if (!site) {
                    this.setState({step: SignatureStep.ERROR});
                } else {
                    const nextStep = response.signature.signatory_signed_at
                        ? SignatureStep.ALREADY_SIGNED
                        : SignatureStep.CONFIRM_INFORMATIONS;

                    this.setState({
                        transport,
                        signature,
                        signatoryName,
                        businessPrivacyScope,
                        documentsToSign,
                        documentsNumbersAsString,
                        plates,
                        site,
                        step: nextStep,
                    });
                }

                Intercom("update", {
                    app_id: BuildConstants.intercomAppID,
                    email: (response.signature.signatory as DeprecatedSignatory)?.user?.email,
                    name: response.signature.signatory_name,
                    hide_default_launcher: false,
                });
            })
            .catch(() => this.setState({step: SignatureStep.ERROR}));
    }

    onConfirmInfo = (observations?: {content: string; deliveryUid: string}) => {
        this.setState({observations, step: SignatureStep.CHOOSE_SIGNATURE});
    };

    completeSignature = (signatureImageUrl: string) => {
        const token = queryService.getQueryParameterByName("token");
        // @ts-ignore
        const signature_uid = this.state.signature.uid;

        this.setState({step: SignatureStep.LOADING});

        apiService
            .post(
                `/transport-signatures/${signature_uid}/complete-contactless-signature/?token=${token}`,
                {
                    signatory_observations: this.state.observations?.content && {
                        content: this.state.observations.content,
                        delivery: this.state.observations.deliveryUid ?? null,
                    },
                    signature_image_signatory: signatureImageUrl.replace(
                        "data:image/png;base64,",
                        ""
                    ),
                },
                {apiVersion: "v4"}
            )
            .then(() => {
                this.setState({step: SignatureStep.FINISH_FLOW});
                contactlessSignatureCompleted();
            })
            .catch((response) => {
                response
                    .text()
                    .then((text: any) => {
                        const body = JSON.parse(text);
                        if (body.code === "already_signed") {
                            this.setState({step: SignatureStep.ALREADY_SIGNED});
                        } else {
                            this.setState({step: SignatureStep.ERROR});
                        }
                    })
                    .catch(() => this.setState({step: SignatureStep.ERROR}));
            });
    };

    onBadUser = () => {
        this.setState({step: SignatureStep.LOADING});

        // Revoke the token to be sure this signature is disabled
        const token = queryService.getQueryParameterByName("token");
        apiService
            .post(
                `/transport-signatures/revoke-token/`,
                {token: token},
                {
                    apiVersion: "v4",
                }
            )
            .then(() => this.setState({step: SignatureStep.BAD_USER}))
            .catch(() => this.setState({step: SignatureStep.ERROR}));
    };

    render() {
        let renderedComponent;

        switch (this.state.step) {
            case SignatureStep.LOADING:
                renderedComponent = <LoadingWheel />;
                break;
            case SignatureStep.CONFIRM_INFORMATIONS:
                renderedComponent = (
                    <SignatureConfirmLoad
                        // @ts-ignore
                        signatoryName={this.state.signatoryName}
                        // @ts-ignore
                        transport={this.state.transport}
                        // @ts-ignore
                        documentsToSign={this.state.documentsToSign}
                        // @ts-ignore
                        documentsNumbersAsString={this.state.documentsNumbersAsString}
                        // @ts-ignore
                        plates={this.state.plates}
                        // @ts-ignore
                        site={this.state.site}
                        onAddObservations={() =>
                            this.setState({step: SignatureStep.ADD_OBSERVATIONS})
                        }
                        onConfirm={() => this.setState({step: SignatureStep.CHOOSE_SIGNATURE})}
                        onBadUser={this.onBadUser}
                    />
                );
                break;
            case SignatureStep.ADD_OBSERVATIONS:
                renderedComponent = (
                    <SignatureAddObservations
                        // @ts-ignore
                        signatoryName={this.state.signatoryName}
                        // @ts-ignore
                        transport={this.state.transport}
                        // @ts-ignore
                        businessPrivacyScope={this.state.businessPrivacyScope}
                        // @ts-ignore
                        documentsNumbersAsString={this.state.documentsNumbersAsString}
                        // @ts-ignore
                        plates={this.state.plates}
                        // @ts-ignore
                        site={this.state.site}
                        onConfirmObservation={this.onConfirmInfo}
                        onBadUser={this.onBadUser}
                        onBack={() => {
                            this.setState({step: SignatureStep.CONFIRM_INFORMATIONS});
                        }}
                    />
                );
                break;
            case SignatureStep.CHOOSE_SIGNATURE:
                renderedComponent = (
                    <SignatureChooseSignature
                        // @ts-ignore
                        signatoryName={this.state.signatoryName}
                        onConfirm={this.completeSignature}
                        onBack={() => {
                            this.setState({step: SignatureStep.CONFIRM_INFORMATIONS});
                        }}
                        onBadUser={this.onBadUser}
                    />
                );
                break;
            case SignatureStep.FINISH_FLOW:
                renderedComponent = (
                    <SignatureDone
                        // @ts-ignore
                        transport={this.state.transport}
                        // @ts-ignore
                        documentsToSign={this.state.documentsToSign}
                    />
                );
                break;
            case SignatureStep.INVALID_TOKEN:
                renderedComponent = <SignatureInvalidToken />;
                break;
            case SignatureStep.BAD_USER:
                renderedComponent = <SignatureBadUser />;
                break;
            case SignatureStep.ALREADY_SIGNED:
                renderedComponent = (
                    <SignatureAlreadySigned
                        // @ts-ignore
                        transport={this.state.transport}
                        // @ts-ignore
                        documentsToSign={this.state.documentsToSign}
                        // @ts-ignore
                        documentsNumbersAsString={this.state.documentsNumbersAsString}
                        // @ts-ignore
                        signatoryName={this.state.signatoryName}
                        onBadUser={this.onBadUser}
                    />
                );
                break;
            case SignatureStep.ERROR:
            default:
                renderedComponent = <SignatureError />;
        }

        return <Screen css={screenCSS}>{renderedComponent}</Screen>;
    }
}

type Props = {};

type State = {
    error: string | null;
};

export class SignatureScreen extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            error: null,
        };
    }

    componentDidMount() {
        const language = queryService.getQueryParameterByName("language");
        if (
            language &&
            localeService.isSupported(language) &&
            language !== BuildConstants.language
        ) {
            // @ts-ignore
            this.submitLanguage(language);
        }
    }

    _renderError = () => {
        return (
            <div className="col-md-12 text-center">
                <h4>{this.state.error}</h4>
                <h5>
                    <a href="/">{t("app.back")}</a>
                </h5>
            </div>
        );
    };

    submitLanguage = (language: string) => {
        apiService
            .post("/users/set-language/", {language}, {apiVersion: "v4"})
            .then((response: any) => {
                if (response.success) {
                    window.location.href = queryService.updateQueryParameterByName(
                        "language",
                        language
                    );
                }
            });
    };

    _renderContent = () => {
        if (this.state.error) {
            return this._renderError();
        }

        return (
            <>
                <SimpleNavbar
                    isSignatureMode
                    showLanguageSelector
                    onLanguageChange={this.submitLanguage}
                />
                <Signature />
            </>
        );
    };

    render = () => {
        return (
            <>
                <Global
                    styles={css`
                        .app-body {
                            background-color: white;
                        }
                    `}
                />
                <ThemeProvider theme={theme}>
                    <StaticRouter context={{}}>
                        <div className="container app app-public" style={{height: "100vh"}}>
                            {this._renderContent()}
                        </div>
                    </StaticRouter>
                </ThemeProvider>
            </>
        );
    };
}
