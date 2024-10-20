import {Screen} from "@dashdoc/web-ui";
import {css} from "@emotion/react";
import {Signature} from "dashdoc-utils";
import React from "react";

import mockedTransport from "../../../../../../../__mocks__/full-transport-web.json";
import {SignatureAddObservations} from "../signature-add-observations";
import {SignatureBadUser} from "../signature-bad-user";
import {SignatureChooseSignature} from "../signature-choose-signature";
import {SignatureConfirmLoad} from "../signature-confirm-load";
import {SignatureDone} from "../signature-done";
import {SignatureError} from "../signature-error";
import {SignatureInvalidToken} from "../signature-invalid-token";
import {
    getConsignmentNotesFromTransport,
    getConsignmentNotesNumbersAsStringFromConsignmentNotes,
    getPlatesListAsStringFromTransport,
    getSiteAndScopeFromSignature,
} from "../utils";

import type {Transport} from "app/types/transport";

// @ts-ignore
const transport: Transport = {...(mockedTransport as Transport)};

const screenCss = css`
    display: flex;
    flex-direction: column;
    align-items: center;
    background-color: #fff;
`;

const signature: Signature = {
    uid: "123",
    signature_method: "contactless_email",
    // @ts-ignore
    status_update: (transport.status_updates ?? []).find(
        ({category}) => category === "loading_complete"
    ).uid,
    created: "2020-10-02",
    created_device: "2020-10-02",
    // @ts-ignore
    checksum: null,
    signatory: null,
    signatory_name: "Jean Michel Signataire",
    signatory_email: "",
    signatory_phone_number: "",
    trucker_name: "Trucker",
    signatory_signed_at: null,
    // @ts-ignore
    signature_image_signatory: null,
    // @ts-ignore
    signature_image_trucker: null,
    // @ts-ignore
    signature_trucker: null,
    code: "123",
    failure_reason: "",
};
const {businessPrivacyScope} = getSiteAndScopeFromSignature(signature, transport);
const documentsToSign = getConsignmentNotesFromTransport(transport, businessPrivacyScope);
const documentsNumbersAsString =
    getConsignmentNotesNumbersAsStringFromConsignmentNotes(documentsToSign);
const plates = getPlatesListAsStringFromTransport(transport);

export default {
    title: "app/features/signature",
};

export const SignatureConfirmLoads = () => (
    <Screen css={screenCss}>
        <SignatureConfirmLoad
            onAddObservations={() => {}}
            onBadUser={() => {}}
            onConfirm={() => {}}
            signatoryName="Jean Michel Signataire"
            site={transport.segments[0].origin}
            transport={transport}
            documentsToSign={transport.documents}
            documentsNumbersAsString={documentsNumbersAsString}
            plates={plates}
        />
    </Screen>
);

export const WithSignatureAddObservations = () => (
    <Screen css={screenCss}>
        <SignatureAddObservations
            onConfirmObservation={() => {}}
            onBadUser={() => {}}
            signatoryName="Jean Michel Signataire"
            site={transport.segments[0].origin}
            transport={transport}
            documentsNumbersAsString={documentsNumbersAsString}
            businessPrivacyScope={businessPrivacyScope}
            plates={plates}
            onBack={() => {}}
        />
    </Screen>
);

export const WithSignatureChooseSignature = () => (
    <Screen css={screenCss}>
        <SignatureChooseSignature
            onConfirm={() => {}}
            onBack={() => {}}
            onBadUser={() => {}}
            signatoryName="Jean Michel Signataire"
        />
    </Screen>
);

export const WithSignatureDone = () => (
    <Screen css={screenCss}>
        <SignatureDone transport={transport} documentsToSign={transport.documents} />
    </Screen>
);

export const WithSignatureBadUser = () => (
    <Screen css={screenCss}>
        <SignatureBadUser />
    </Screen>
);

export const WithSignatureBadToken = () => (
    <Screen css={screenCss}>
        <SignatureInvalidToken />
    </Screen>
);

export const WithSignatureError = () => (
    <Screen css={screenCss}>
        <SignatureError />
    </Screen>
);
