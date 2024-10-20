import {t} from "@dashdoc/web-core";
import {ClickableFlex, Flex, Text} from "@dashdoc/web-ui";
import {useFormikContext} from "formik";
import React from "react";

import {
    AutoFilledMeansFields,
    TransportFormValues,
    type TransportFormMeans,
} from "app/features/transport/transport-form/transport-form.types";

import {MeansFormPanel} from "../means/MeansFormPanel";
import {MeansOverview} from "../means/MeansOverview";

interface MeansSectionProps {
    automaticMeansEnabled: boolean;
    setAutomaticMeansEnabled: (value: boolean) => void;
    autoFilledMeansFields: AutoFilledMeansFields | null;
    setAutoFilledMeansFields: (
        value:
            | AutoFilledMeansFields
            | ((prevValue: AutoFilledMeansFields | null) => AutoFilledMeansFields | null)
            | null
    ) => void;
    setPredictiveMeansField: (value: "trucker" | "trailer" | "vehicle") => void;
    setLastAssociatedMeansRequestStatus: (value: string) => void;
    confirmationExtractedCodes: string[];
    tripIndex: number;
}

export function MeansSection({
    automaticMeansEnabled,
    setAutomaticMeansEnabled,
    autoFilledMeansFields,
    setAutoFilledMeansFields,
    setPredictiveMeansField,
    setLastAssociatedMeansRequestStatus,
    confirmationExtractedCodes,
    tripIndex,
}: MeansSectionProps) {
    const [openEdition, setOpenEdition] = React.useState(false);
    const {values, setFieldValue} = useFormikContext<TransportFormValues>();
    const means = values.trips[tripIndex].means;
    const setMeans = (newMeans: TransportFormMeans | undefined) => {
        setFieldValue(`trips[${tripIndex}].means`, newMeans);
    };

    return (
        <>
            <Flex flexDirection="column" flex={1}>
                <Text variant="h1" mt={4} mb={3}>
                    {t("common.means")}
                </Text>
                <Flex minHeight="90px" data-testid="transport-form-add-means-button">
                    {means ? (
                        <MeansOverview
                            means={means}
                            isEditing={false}
                            openEdition={() => setOpenEdition(true)}
                            hideTitle={true}
                        />
                    ) : (
                        <ClickableFlex
                            onClick={() => setOpenEdition(true)}
                            border="1px dashed"
                            borderColor="grey.light"
                            padding={3}
                            paddingBottom={5}
                            flex={1}
                        >
                            <Text variant="h2">{t("transportsForm.addMeans")}</Text>
                        </ClickableFlex>
                    )}
                </Flex>
            </Flex>
            {openEdition && (
                <MeansFormPanel
                    tripIndex={tripIndex}
                    onSubmit={(means) => {
                        setMeans(means ?? undefined);
                        setOpenEdition(false);
                    }}
                    onClose={() => setOpenEdition(false)}
                    automaticMeansEnabled={automaticMeansEnabled}
                    setAutomaticMeansEnabled={setAutomaticMeansEnabled}
                    autoFilledMeansFields={autoFilledMeansFields}
                    setAutoFilledMeansFields={setAutoFilledMeansFields}
                    setPredictiveMeansField={setPredictiveMeansField}
                    setLastAssociatedMeansRequestStatus={setLastAssociatedMeansRequestStatus}
                    confirmationExtractedCodes={confirmationExtractedCodes}
                />
            )}
        </>
    );
}
