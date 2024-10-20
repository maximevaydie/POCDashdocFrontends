import {HasFeatureFlag, apiService, getConnectedCompany} from "@dashdoc/web-common";
import {t, translateVolumeUnit} from "@dashdoc/web-core";
import {Box, Flex, SwitchInput, Text} from "@dashdoc/web-ui";
import {TrackDechetsApi, yup} from "dashdoc-utils";
import {FormikProvider, useFormik, useFormikContext} from "formik";
import React, {FunctionComponent, useContext, useEffect, useState} from "react";
import {useSelector} from "react-redux";

import {TransportOperationCategorySelect} from "app/features/carbon-footprint/transport-operation-category/TransportOperationCategorySelect";
import {TrackDechetsNumberInput} from "app/features/transport/track-dechets/track-dechets";

import {BusinessPrivacyInformationIcon} from "../../business-privacy/BusinessPrivacyInformationIcon";
import {TransportFormContext} from "../transport-form-context";
import {TransportFormValues} from "../transport-form.types";

import VolumeDisplayUnitPicker from "./VolumeDisplayUnitPicker";

import type {Transport} from "app/types/transport";

const trackDechetsApi = new TrackDechetsApi(apiService);

type TransportSettingsFormProps = {
    onChange: (values: TransportSettingsFormValues) => void;
    multipleDeliveries: boolean;
};

type TransportSettingsFormValues = TransportFormValues["settings"];

export const TransportSettingsForm: FunctionComponent<TransportSettingsFormProps> = ({
    onChange,
    multipleDeliveries,
}) => {
    const {
        values: {settings},
    } = useFormikContext<TransportFormValues>();
    const {isMultipleRounds, isComplexMode} = useContext(TransportFormContext);
    const [hasTrackDechetConnector, setHasTrackDechetConnector] = useState(false);
    const company = useSelector(getConnectedCompany);
    const hasTrackdechetsEnabled = company?.settings?.trackdechets;

    const formik = useFormik<TransportSettingsFormValues>({
        initialValues: settings ?? {
            businessPrivacy: false,
            volumeDisplayUnit: "m3",
            wasteManifest: "",
        },
        validationSchema: yup.object().shape({
            businessPrivacy: yup.boolean().required(),
            volumeDisplayUnit: yup.string().required(),
        }),
        onSubmit: () => {},
    });

    useEffect(() => {
        onChange(formik.values);
    }, [formik.values]);

    useEffect(() => {
        (async () => {
            setHasTrackDechetConnector(await trackDechetsApi.fetchHasTrackDechetsConnector());
        })();
    }, [setHasTrackDechetConnector]);

    const volumeDisplayUnitPickerLabels = ["m3", "L"].reduce(
        (
            acc: {[key in Transport["volume_display_unit"]]?: string},
            unit: Transport["volume_display_unit"]
        ) => {
            const translatedUnit = `${translateVolumeUnit(
                unit
            ).toLowerCase()} (${translateVolumeUnit(unit, {short: true})})`;

            acc[unit] = t("shipment.volumeUnit.selectLabel", {unit: translatedUnit});

            return acc;
        },
        {}
    );
    return (
        <FormikProvider value={formik}>
            <Text variant="h2" mb={4} mt={5}>
                {t("transportForm.volumeUnit")}
            </Text>
            <Box>
                <VolumeDisplayUnitPicker
                    unit={formik.values.volumeDisplayUnit as "m3" | "L"}
                    onChange={(value) => formik.setFieldValue("volumeDisplayUnit", value)}
                    labels={volumeDisplayUnitPickerLabels}
                    data-testid="volume-display-unit-select"
                />
            </Box>

            {!isComplexMode && !multipleDeliveries && !isMultipleRounds && (
                <>
                    <Text variant="h2" mb={4} mt={5}>
                        {t("transportForm.privacy")}
                    </Text>
                    <Flex alignItems="center" mt={3}>
                        <SwitchInput
                            value={formik.values.businessPrivacy}
                            onChange={(value) => formik.setFieldValue("businessPrivacy", value)}
                            labelRight={t("common.businessPrivacy")}
                            data-testid="transport-form-business-privacy-switch"
                        />
                        <Box mr={2} />
                        <BusinessPrivacyInformationIcon />
                    </Flex>
                </>
            )}
            {hasTrackdechetsEnabled && hasTrackDechetConnector && (
                <>
                    <Text variant="h2" mb={4} mt={5}>
                        {t("settings.trackdechets")}
                    </Text>
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
                </>
            )}

            <HasFeatureFlag flagName="carbonfootprintiso">
                <Text variant="h2" mb={4} mt={5}>
                    {t("carbonFootprint.title")}
                </Text>
                <TransportOperationCategorySelect
                    onChange={(value) => {
                        formik.setFieldValue("transportOperationCategory", value);
                    }}
                    onSetDefaultValue={(value) => {
                        formik.setFieldValue("transportOperationCategory", value);
                    }}
                    value={formik.values.transportOperationCategory}
                />
            </HasFeatureFlag>
        </FormikProvider>
    );
};
