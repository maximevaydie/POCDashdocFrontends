import {apiService} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Flex, Callout, Link, Modal, Text, TextInput, toast, TestableProps} from "@dashdoc/web-ui";
import {TrackDechets, TrackDechetsApi} from "dashdoc-utils";
import {useFormik} from "formik";
import React from "react";

import useDebouncedCallback from "app/hooks/useDebouncedCallback";

import {ExtraRowType} from "../transport-details/transport-details-activities/activity/activity-document/documents-panel";

import type {Transport} from "app/types/transport";

const trackDechetsApi = new TrackDechetsApi(apiService);

/*
    Create a fake Document row for automatic TrackDechet document
    (the document is not hosted by us and has a temporary link)
*/
export function trackDechetsToExtraDocumentRow(
    trackDechets: TrackDechets,
    transport: Transport
): ExtraRowType {
    return {
        key: trackDechets.uid,
        doc: {
            type: "waste_manifest",
            label: t("documentType.wasteManifest"),
            position: {latitude: NaN, longitude: NaN},
            date: trackDechets.created,
        },
        // TODO: identify a company by its name seems fragile
        authorizedCompanies: transport.carrier ? [transport.carrier.name] : [],
        onClick: async (event) => {
            event.preventDefault();
            try {
                const response = await trackDechetsApi.fetchTrackDechetsDocumentURL(trackDechets);
                window.open(response.link);
            } catch (error) {
                toast.error(t("trackdechets.couldNotObtainPdfLink"));
            }
            return false;
        },
    };
}

/**
 * Real time validating input for TrackDechets numbers
 */
interface TrackDechetsNumberInputProps extends TestableProps {
    value?: string;
    onChange: (value: string) => void;
    onError: (msg: string) => void;
    errorMessage: string;
}

const onChange = async (value: string, onError: (msg: string) => void) => {
    try {
        await trackDechetsApi.fetchPrevalidateTrackDechets(value);
    } catch (error) {
        const message = await error.json();
        onError(message["non_field_errors"]["detail"][0]);
    }
};

export const TrackDechetsNumberInput = (props: TrackDechetsNumberInputProps) => {
    const debouncedOnChange = useDebouncedCallback(
        (newValue: string) => {
            onChange(newValue, props.onError);
        },
        300,
        [props.onError]
    );

    return (
        <>
            <TextInput
                // @ts-ignore
                value={props.value}
                onChange={(newValue: string) => {
                    props.onChange(newValue);
                    debouncedOnChange(newValue);
                }}
                label={t("transportForm.wasteManifest")}
                error={props.errorMessage}
                autoFocus={false}
                type="text"
                data-testid={props["data-testid"]}
            />
        </>
    );
};

/**
 * Modal to link a transport to a TrackDechets number.
 */
type TrackDechetsCreateModalProps = {
    transport: Transport;
    onClose: () => void;
    onSubmit: (trackdechets: TrackDechets) => void;
};

export const TrackDechetsCreateModal = function (props: TrackDechetsCreateModalProps) {
    const formik = useFormik({
        initialValues: {wasteManifest: ""},
        onSubmit: async ({wasteManifest}) => {
            try {
                const response = await trackDechetsApi.fetchCreateTrackDechets(
                    wasteManifest,
                    props.transport.uid
                );
                toast.success(t("common.success"));
                props.onSubmit(response);
            } catch (error) {
                toast.error(t("common.error"));
                props.onClose();
            }
        },
    });

    return (
        <Modal
            title={t("trackdechets.createLink")}
            mainButton={{
                children: t("trackdechets.linkTransport"),
                onClick: formik.submitForm,
            }}
            secondaryButton={null}
            onClose={props.onClose}
        >
            <Flex flexDirection="column">
                <Text>{t("common.reference")}</Text>
                <Callout variant="informative" mb={3} mt={3}>
                    {t("trackdechets.linkModalInformation")}
                    <Link href="#">{t("common.learnMore")}</Link>
                </Callout>
                <TrackDechetsNumberInput
                    value={formik.values.wasteManifest}
                    onChange={(value) => {
                        formik.setFieldValue("wasteManifest", value);
                    }}
                    onError={(msg: string) => {
                        formik.setFieldError("wasteManifest", msg);
                    }}
                    // @ts-ignore
                    errorMessage={
                        formik.errors.wasteManifest && (formik.errors.wasteManifest as string)
                    }
                    data-testid="transport-form-waste-note-reference"
                />
            </Flex>
        </Modal>
    );
};

/**
 * Modal to delete the link of a transport to a TrackDechets object.
 */
type TrackDechetsDeleteModalProps = {
    trackDechets: TrackDechets;
    onSubmit: () => void;
    onClose: () => void;
};

export const TrackDechetsDeleteModal = function (props: TrackDechetsDeleteModalProps) {
    const onSubmit = async () => {
        try {
            await trackDechetsApi.fetchDeleteTrackDechets(props.trackDechets);
            toast.success(t("common.success"));
            props.onSubmit();
        } catch (error) {
            toast.error(error);
            props.onClose();
        }
    };

    return (
        <Modal
            title={t("trackdechets.deleteLink")}
            mainButton={{
                children: t("common.delete"),
                onClick: onSubmit,
                severity: "danger",
            }}
            secondaryButton={{}}
            onClose={props.onClose}
        >
            <Text>{t("trackdechets.deletionWarning")}</Text>
        </Modal>
    );
};
