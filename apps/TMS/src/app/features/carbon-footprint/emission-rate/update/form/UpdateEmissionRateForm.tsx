import {Logger, t} from "@dashdoc/web-core";
import {LoadingWheel, Text} from "@dashdoc/web-ui";
import {parseDate} from "dashdoc-utils";
import {
    addDays,
    differenceInDays,
    endOfDay,
    previousFriday,
    startOfDay,
    subMonths,
} from "date-fns";
import {useFormik} from "formik";
import React, {useEffect} from "react";

import {fuelEmissionRatesService} from "app/features/carbon-footprint/emission-rate/update/form/fuelEmissionRate.service";
import {FuelConsumption, UpdateEmissionRatePayload} from "app/features/carbon-footprint/types";
import {TransportOperationCategory} from "app/services/carbon-footprint/TransportOperationCategoryApi.service";

import {
    getRateFormSchema,
    NEW_EMISSION_RATE_FORM_ID,
    RateForm,
    UpdateSubForm,
} from "./sub-form/UpdateSubForm";
import {
    EffectiveForm,
    EMISSION_RATE_VALIDATION_FORM_ID,
    getEffectiveFormSchema,
    ValidateSubForm,
} from "./sub-form/ValidateSubForm";
import {useCollectTonneKilometer} from "./useCollectTonneKilometer";
import {useFuelEmissionRates} from "./useFuelEmissionRates";

type Props = {
    transportOperationCategory: TransportOperationCategory;
    formId: string;
    onNext: () => void;
    onSubmit: (payload?: UpdateEmissionRatePayload) => Promise<Record<string, string>>;
};

/**
 * This component is responsible for managing several forms state (formik)
 * and displaying the expected form according to the given formId.
 */
export function UpdateEmissionRateForm({
    transportOperationCategory,
    formId,
    onNext,
    onSubmit,
}: Props) {
    const rateForm = useFormik<RateForm>({
        initialValues: getDefaultRateForm(),
        onSubmit: onNext,
        validationSchema: getRateFormSchema(),
        validateOnBlur: false,
        validateOnChange: false,
    });
    const {start, end} = rateForm.values;
    const {
        collectLoading,
        collectResult: {tonne_kilometer, transport_count, transport_with_error_count},
    } = useCollectTonneKilometer(transportOperationCategory.uid, start, end);

    useEffect(() => {
        rateForm.setFieldValue("tonne_kilometer", tonne_kilometer);
        // We can't depend on rateForm (circular dependency)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tonne_kilometer]);

    const validationForm = useFormik<EffectiveForm>({
        initialValues: getDefaultEffectivePeriod(rateForm.values.start, rateForm.values.end),
        onSubmit: handleSubmit,
        validationSchema: getEffectiveFormSchema(),
        validateOnBlur: false,
        validateOnChange: true,
    });

    useEffect(() => {
        const {effective_start, effective_end} = getDefaultEffectivePeriod(start, end);
        validationForm.setFieldValue("effective_start", effective_start);
        validationForm.setFieldValue("effective_end", effective_end);
        // We can't depend on validationForm (circular dependency)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [start, end]);

    const fuelEmissionRates = useFuelEmissionRates();
    if (collectLoading) {
        return (
            <Text>
                {t("carbonFootprint.emissionRateModal.loading")} <LoadingWheel small inline />
            </Text>
        );
    }
    if (formId === NEW_EMISSION_RATE_FORM_ID) {
        if (fuelEmissionRates === null) {
            return (
                <Text>
                    {t("carbonFootprint.emissionRateModal.loading")} <LoadingWheel small inline />
                </Text>
            );
        }
        return (
            <UpdateSubForm
                formik={rateForm}
                transportOperationCategory={transportOperationCategory}
                transportCount={transport_count}
                ignoredTransports={transport_with_error_count}
                fuelEmissionRates={fuelEmissionRates}
            />
        );
    }
    if (formId === EMISSION_RATE_VALIDATION_FORM_ID) {
        const {fuels} = rateForm.values;
        let newEmissionRate: number | null = null;
        if (fuelEmissionRates !== null) {
            newEmissionRate = fuelEmissionRatesService.computeNewEmissionRate(
                fuels,
                fuelEmissionRates,
                rateForm.values.tonne_kilometer
            );
        }
        if (newEmissionRate === null) {
            Logger.error("Invalid state");
            return null; // should never happen
        }
        return (
            <ValidateSubForm
                formik={validationForm}
                previousEmissionRate={transportOperationCategory.last_emission_rate.emission_rate}
                newEmissionRate={newEmissionRate}
            />
        );
    }

    Logger.error("Invalid state");
    return null; // should never happen

    async function handleSubmit(values: EffectiveForm) {
        const {fuels: nullableFuels, ...otherRateFormValues} = rateForm.values;
        const fuels = nullableFuels.filter(
            ({fuel, quantity}) => quantity !== null && fuel !== null
        ) as FuelConsumption[];
        const payload: UpdateEmissionRatePayload = {
            ...otherRateFormValues,
            fuels,
            ...values,
        };
        const errors = await onSubmit(payload);
        for (const [key, value] of Object.entries(errors)) {
            validationForm.setFieldError(key, value);
        }

        if (errors) {
            validationForm.setSubmitting(false);
        }
    }

    function getDefaultRateForm(): RateForm {
        // The default period is the last 6 months from last friday
        const end = endOfDay(previousFriday(new Date()));
        const start = startOfDay(subMonths(end, 6));

        return {
            start: start.toISOString(),
            end: end.toISOString(),
            tonne_kilometer: 0,
            fuels: [
                {
                    fuel: "GO",
                    quantity: null,
                },
            ],
        };
    }

    function getDefaultEffectivePeriod(start: string, end: string) {
        // The effective period starts from today and span the same duration as the reference period
        const effective_start = startOfDay(new Date());
        const duration = differenceInDays(parseDate(end) as Date, parseDate(start) as Date);
        const effective_end = endOfDay(addDays(effective_start, duration));
        return {
            effective_start: effective_start.toISOString(),
            effective_end: effective_end.toISOString(),
        };
    }
}
