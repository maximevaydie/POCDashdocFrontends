import {t} from "@dashdoc/web-core";
import {Button, Flex, NumberInput, Popover, toast} from "@dashdoc/web-ui";
import {formatNumber, yup} from "dashdoc-utils";
import {useFormik} from "formik";
import React, {useState} from "react";

import {ActionButton} from "app/features/pricing/tariff-grids/modals/tariff-grid-version-modal/ActionButton";

type Form = {
    percentage: number;
    decimals: number;
};

type IncreaseOrDecreaseActionButtonProps = {
    mode: "increase" | "decrease";
    dataTestId?: string;
    onSubmit: (values: Form) => unknown;
};

export const IncreaseOrDecreaseActionButton = ({
    mode,
    dataTestId,
    onSubmit,
}: IncreaseOrDecreaseActionButtonProps) => {
    const [isPopupOpened, setOpenPopup] = useState(false);

    const formik = useFormik<Form>({
        initialValues: {
            percentage: 20,
            decimals: 2,
        },
        validationSchema: yup.object({
            percentage: yup.number().required(t("common.mandatoryField")).min(0),
            decimals: yup.number().required(t("common.mandatoryField")).min(0),
        }),
        onSubmit: (values) => {
            onSubmit(values);
            const percentage = formatNumber(values.percentage / 100, {
                style: "percent",
                maximumFractionDigits: 20,
            });

            const toastMessage =
                mode === "increase"
                    ? t("tariffGridVersion.successfullyAppliedARaise", {
                          percent: percentage,
                      })
                    : t("tariffGridVersion.successfullyAppliedAReduction", {
                          percent: percentage,
                      });
            toast.success(toastMessage);
            setOpenPopup(false);
        },
    });

    return (
        <Popover
            placement="bottom"
            visibility={{
                isOpen: isPopupOpened,
                onOpenChange: setOpenPopup,
            }}
        >
            <Popover.Trigger>
                <ActionButton
                    dataTestId={dataTestId}
                    iconName={mode === "increase" ? "thickArrowTopRight" : "thickArrowBottomRight"}
                    label={
                        mode === "increase"
                            ? t("tariffGridVersion.applyAnIncrease")
                            : t("tariffGridVersion.applyADecrease")
                    }
                />
            </Popover.Trigger>
            <Popover.Content>
                <NumberInput
                    {...formik.getFieldProps("percentage")}
                    label={
                        mode === "increase"
                            ? t("tariffGrid.percentageOfIncrease")
                            : t("tariffGrid.percentageDrop")
                    }
                    placeholder={
                        mode === "increase"
                            ? t("tariffGrid.percentageOfIncrease")
                            : t("tariffGrid.percentageDrop")
                    }
                    units="%"
                    onChange={(value) => {
                        formik.setFieldError("percentage", undefined);
                        formik.setFieldValue("percentage", value);
                    }}
                    maxDecimals={20}
                    data-testid="tariff-grid-version-modal-increase-or-decrease-percentage-input"
                />
                <NumberInput
                    {...formik.getFieldProps("decimals")}
                    containerProps={{mt: 3}}
                    label={t("common.numberOfDecimals")}
                    placeholder={t("common.numberOfDecimals")}
                    min={0}
                    onChange={(value) => {
                        formik.setFieldError("decimals", undefined);
                        formik.setFieldValue("decimals", value);
                    }}
                    data-testid="tariff-grid-version-modal-increase-or-decrease-decimal-input"
                />
                <Flex mt={2} flex={1} justifyContent={"flex-end"}>
                    <Button
                        onClick={formik.submitForm}
                        type="button"
                        disabled={!formik.isValid}
                        data-testid="tariff-grid-version-modal-increase-or-decrease-submit-button"
                    >
                        {t("tariffGrids.Apply")}
                    </Button>
                </Flex>
            </Popover.Content>
        </Popover>
    );
};
