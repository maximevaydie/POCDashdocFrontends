import {apiService, getErrorMessagesFromServerError} from "@dashdoc/web-common";
import {Logger, t} from "@dashdoc/web-core";
import {
    Flex,
    Icon,
    Modal,
    ModeTypeSelector,
    Text,
    Link,
    ErrorMessage,
    toast,
} from "@dashdoc/web-ui";
import {zodResolver} from "@hookform/resolvers/zod";
import {SplitTurnover} from "dashdoc-utils";
import React, {useState} from "react";
import {FormProvider, useForm} from "react-hook-form";
import {z} from "zod";

import {
    AutomaticMeanTurnoverCard,
    ManualMeanTurnoverCard,
} from "app/features/transport/transport-details/transport-details-activities/split-means-turnover/MeanTurnoverCard";
import {SplitType} from "app/features/transport/transport-details/transport-details-activities/split-means-turnover/types";

interface SplitMeansTurnoverModalOpenProps {
    transportUid: string;
    splitTurnover: SplitTurnover;
    priceWithoutPurchaseCosts: number | null;
    onClose: () => void;
    openDistanceModal: () => void;
}

export const SplitMeansTurnoverModalOpen = ({
    transportUid,
    splitTurnover,
    priceWithoutPurchaseCosts,
    onClose,
    openDistanceModal,
}: SplitMeansTurnoverModalOpenProps) => {
    const [isDeletingCustomSplitTurnover, setIsDeletingCustomSplitTurnover] = useState(false);
    const [currentMode, setCurrentMode] = useState<SplitType>(
        splitTurnover.is_overridden ? "manual" : "auto"
    );

    const getTextInfo = () => {
        if (currentMode === "manual") {
            return t("splitMeansTurnover.changeBreakdownTurnoverManually");
        }

        if (splitTurnover.automatic_split_method === "segments") {
            return t("splitMeansTurnover.segmentsRatherThanDistance");
        }

        if (splitTurnover.automatic_split_method === "distance") {
            return t("splitMeansTurnover.breakdownSplitTurnoverBasedOnDistance");
        }

        return null;
    };

    const validationSchema = z.object({
        customSplitTurnover: z.array(
            z.object({
                id: z.number().positive().nullable(),
                activityUid: z.string(),
                weight: z
                    .number({
                        invalid_type_error: t("errors.field_cannot_be_empty"),
                        required_error: t("errors.field_cannot_be_empty"),
                    })
                    .min(0)
                    .max(100),
            })
        ),
    });

    type FormType = z.infer<typeof validationSchema>;

    const methods = useForm<FormType>({
        resolver: zodResolver(validationSchema),
        defaultValues: getDefaultValue(),
    });

    const {
        formState: {errors, isSubmitting},
        handleSubmit,
        watch,
        setError,
    } = methods;

    const customSplitTurnover = watch("customSplitTurnover");

    return (
        <Modal
            title={t("splitMeansTurnover.turnoverBreakdown")}
            onClose={onClose}
            data-testid="split-means-turnover-modal"
            mainButton={{
                disabled: isSubmitting || isDeletingCustomSplitTurnover,
                children: t("common.save"),
                onClick: onSave,
            }}
            secondaryButton={{}}
        >
            <Text variant="h2" mb={3}>
                {t("splitMeansTurnover.breakdownType")}
            </Text>
            <ModeTypeSelector<SplitType>
                modeList={[
                    {
                        value: "auto",
                        label: t("splitMeansTurnover.automatic"),
                        icon: "tripDistance",
                    },
                    {
                        value: "manual",
                        label: t("common.manual.singular"),
                        icon: "select",
                    },
                ]}
                currentMode={currentMode}
                setCurrentMode={setCurrentMode}
            />
            {currentMode === "auto" && splitTurnover.automatic_split_method === "segments" && (
                <Flex mt={2}>
                    <Icon name="info" color="yellow.default" />
                    <Text ml={1}>{t("splitMeansTurnover.atLeastOneDistanceIsMissing")}</Text>
                    <Link onClick={openDistanceModal} ml={1}>
                        {t("splitMeansTurnover.viewTheDistances")}
                    </Link>
                </Flex>
            )}
            <Text mt={2}>{getTextInfo()}</Text>
            <Flex flexDirection={"column"} style={{rowGap: "12px"}} mt={3}>
                {currentMode === "auto" ? (
                    Object.entries(splitTurnover.transport_share_until_next_break).map(
                        ([activityUid, turnoverData]) => (
                            <AutomaticMeanTurnoverCard
                                key={activityUid}
                                splitMethod={splitTurnover.automatic_split_method}
                                totalSegments={splitTurnover.total_real_segments_count}
                                priceWithoutPurchaseCosts={priceWithoutPurchaseCosts}
                                turnoverData={turnoverData}
                            />
                        )
                    )
                ) : (
                    <FormProvider {...methods}>
                        {customSplitTurnover.map((activityCustomSplitTurnover, index) => {
                            const turnoverData =
                                splitTurnover.transport_share_until_next_break[
                                    activityCustomSplitTurnover.activityUid
                                ];

                            return (
                                <ManualMeanTurnoverCard
                                    key={activityCustomSplitTurnover.activityUid}
                                    index={index}
                                    totalSegments={splitTurnover.total_real_segments_count}
                                    priceWithoutPurchaseCosts={priceWithoutPurchaseCosts}
                                    userInputWeight={activityCustomSplitTurnover.weight}
                                    turnoverData={turnoverData}
                                />
                            );
                        })}
                    </FormProvider>
                )}
            </Flex>
            {errors?.root?.message && <ErrorMessage error={errors.root.message} />}
        </Modal>
    );

    function getDefaultValue(): FormType {
        const customSplitTurnover = Object.entries(
            splitTurnover.transport_share_until_next_break
        ).reduce<FormType["customSplitTurnover"]>((acc, [activityUid, turnoverData]) => {
            const weight = splitTurnover.is_overridden
                ? turnoverData.manual_weight
                : turnoverData.automatic_data.weight;
            acc.push({
                id: turnoverData.custom_split_turnover_id,
                activityUid,
                weight: parseFloat(weight) * 100,
            });
            return acc;
        }, []);

        return {
            customSplitTurnover,
        };
    }

    async function onSave() {
        if (currentMode === "auto") {
            return await deleteCustomSplitTurnovers();
        }

        await handleSubmit(upsertCustomSplitTurnover)();
    }

    async function deleteCustomSplitTurnovers() {
        setIsDeletingCustomSplitTurnover(true);
        try {
            await apiService.delete(`/transports/${transportUid}/custom-split-turnovers/`, {
                apiVersion: "web",
            });
            toast.success(t("common.success"));
            onClose();
        } catch (error) {
            const errorJson = await getErrorMessagesFromServerError(error);
            const errorMessage = errorJson?.["non_field_errors"] ?? t("common.error");
            toast.error(errorMessage);
            Logger.error("Error upserting the custom split turnover", error);
        } finally {
            setIsDeletingCustomSplitTurnover(false);
        }
    }

    async function upsertCustomSplitTurnover(values: FormType) {
        const payload = {
            custom_split_turnover: values.customSplitTurnover.map((customSplitTurnover) => ({
                id: customSplitTurnover.id,
                activity_uid: customSplitTurnover.activityUid,
                weight: (customSplitTurnover.weight / 100.0).toFixed(4),
            })),
        };

        try {
            await apiService.post(`/transports/${transportUid}/custom-split-turnover/`, payload, {
                apiVersion: "web",
            });
            toast.success(t("common.success"));
            onClose();
        } catch (error) {
            const errorJson = await getErrorMessagesFromServerError(error);
            const errorMessage = errorJson?.["non_field_errors"];
            if (errorMessage) {
                setError("root", {type: "onSubmit", message: errorMessage});
            } else {
                Logger.error("Error upserting the custom split turnover", error);
                setError("root", {type: "onSubmit", message: t("common.error")});
            }
        }
    }
};
