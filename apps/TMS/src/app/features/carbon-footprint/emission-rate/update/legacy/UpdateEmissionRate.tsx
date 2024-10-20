import {t} from "@dashdoc/web-core";
import {Box, Flex, Icon, Link, LoadingWheel, Text, toast} from "@dashdoc/web-ui";
import {HorizontalLine} from "@dashdoc/web-ui";
import {formatDate, formatNumber} from "dashdoc-utils";
import {addDays, differenceInDays, endOfDay, startOfDay} from "date-fns";
import React, {useState, forwardRef, useImperativeHandle, useEffect} from "react";
import {renderToStaticMarkup} from "react-dom/server";

import {EmissionRateBox} from "app/features/carbon-footprint/emission-rate/update/legacy/EmissionRateBox";
import {Period} from "app/features/carbon-footprint/emission-rate/update/legacy/useCollectTonneKilometer";
import {useFuelEmissionRates} from "app/features/carbon-footprint/emission-rate/update/legacy/useFuelEmissionRates";
import {useUpdateEmissionRateForm} from "app/features/carbon-footprint/emission-rate/update/legacy/useUpdatEmissionRateForm";
import {FuelTypeConsumptionInputs} from "app/features/carbon-footprint/field/FuelTypeConsumptionInputs";
import {NullableFuelConsumption} from "app/features/carbon-footprint/types";
import {carbonFootprintConstants} from "app/services/carbon-footprint/constants.service";
import {
    UpdateEmissionRateInformation,
    emissionRatesApiService,
} from "app/services/carbon-footprint/emissionRateApi.service";
import {TransportOperationCategory} from "app/services/carbon-footprint/TransportOperationCategoryApi.service";

type Props = {
    collectResult: UpdateEmissionRateInformation;
    referencePeriod: Period;
    transportOperationCategory: TransportOperationCategory;
    onClose: (didUpdate: boolean) => void;
    setIsSubmitting: (isSubmitting: boolean) => void;
};
const UpdateEmissionRate = forwardRef(
    (
        {
            transportOperationCategory,
            collectResult,
            referencePeriod,
            setIsSubmitting,
            onClose,
        }: Props,
        ref
    ) => {
        const [effectivePeriod] = useState<{start: Date; end: Date}>(
            getDefaultEffectivePeriod(referencePeriod)
        );
        const {fuelEmissionRates, computeEmissionRate} = useFuelEmissionRates();

        const {fuelConsumptions, addEmptyFuelConsumption, submit, isSubmitting} =
            useUpdateEmissionRateForm(getDefaultFuelConsumptions(), async (fuelConsumptions) => {
                try {
                    await emissionRatesApiService.updateDeprecated(
                        transportOperationCategory.uid,
                        {
                            start: referencePeriod.start,
                            end: referencePeriod.end,
                            effective_start: effectivePeriod.start,
                            effective_end: effectivePeriod.end,
                            tonne_kilometer: collectResult!.tonne_kilometer,
                            fuels: fuelConsumptions.map((c) => ({
                                fuel: c.fuel!,
                                quantity: c.quantity!,
                            })),
                        }
                    );
                    toast.success(t("carbonFootprint.emissionRateUpdated"));
                    onClose(true);
                } catch (error) {
                    toast.error(t("common.error"));
                }
            });

        useEffect(() => {
            setIsSubmitting(isSubmitting);
        }, [setIsSubmitting, isSubmitting]);

        useImperativeHandle(ref, () => ({
            submit,
        }));

        const newEmissionRate = computeEmissionRate(
            fuelConsumptions,
            collectResult?.tonne_kilometer
        );

        const errorLink =
            collectResult.transport_with_error_count > 0
                ? renderToStaticMarkup(
                      <>
                          {" ("}
                          <Link
                              href="/app/transports/?isExtendedSearch=true&tab=results&has_carbon_footprint=false"
                              target="_blank"
                              rel="noopener noreferrer"
                          >
                              {t("carbonFootprint.emissionRateModal.errorTransportCountLink", {
                                  smart_count: collectResult.transport_with_error_count,
                              })}
                              <Icon ml={1} scale={0.8} name="openInNewTab" />
                          </Link>
                          {")"}
                      </>
                  )
                : "";

        const referencePeriodLink = renderToStaticMarkup(
            <Link onClick={() => {}}>
                {t("carbonFootprint.emissionRateModal.periodLink", {
                    start: formatDate(referencePeriod.start, "P"),
                    end: formatDate(referencePeriod.end, "P"),
                })}
            </Link>
        );

        const tonneKilometerLink = renderToStaticMarkup(
            <Link onClick={() => {}}>
                {t("carbonFootprint.emissionRateModal.tonneKilometerLink", {
                    smart_count: formatNumber(collectResult.tonne_kilometer, {
                        maximumFractionDigits: 0,
                    }),
                })}
            </Link>
        );

        const effectivePeriodLink = renderToStaticMarkup(
            <Link onClick={() => {}}>
                {t("carbonFootprint.emissionRateModal.effectivePeriodLink", {
                    start: formatDate(effectivePeriod.start, "P"),
                    end: formatDate(effectivePeriod.end, "P"),
                })}
            </Link>
        );

        if (fuelEmissionRates === null) {
            return (
                <Text>
                    {t("carbonFootprint.emissionRateModal.loading")} <LoadingWheel small inline />
                </Text>
            );
        }

        return (
            <>
                <Text
                    mb={2}
                    dangerouslySetInnerHTML={{
                        __html: t("carbonFootprint.emissionRateModal.result", {
                            smart_count: collectResult.transport_count,
                            errorText: errorLink,
                            periodText: referencePeriodLink,
                            tonneKilometerText: tonneKilometerLink,
                        }),
                    }}
                />
                {fuelConsumptions.map((consumption, index) => (
                    <Box my={2} key={index}>
                        <FuelTypeConsumptionInputs
                            fuel={consumption.fuel}
                            quantity={consumption.quantity}
                            fuelEmissionRates={fuelEmissionRates}
                            fuelError={consumption.fuelError}
                            quantityError={consumption.quantityError}
                            onChange={consumption.onChange}
                            onDelete={index <= 0 ? null : consumption.onDelete}
                        />
                    </Box>
                ))}
                <Box my={2}>
                    <Link onClick={addEmptyFuelConsumption}>
                        {t("carbonFootprint.emissionRateModal.addFuelComsumptionLine")}
                    </Link>
                </Box>
                <HorizontalLine />
                <Text
                    mb={2}
                    dangerouslySetInnerHTML={{
                        __html: t("carbonFootprint.emissionRateModal.endSummary", {
                            periodText: effectivePeriodLink,
                            value: formatNumber(newEmissionRate, {
                                maximumFractionDigits:
                                    carbonFootprintConstants.emissionRateMaxDigits,
                            }),
                        }),
                    }}
                />
                <Flex mt={3}>
                    <EmissionRateBox
                        isOldEmissionRate={true}
                        value={transportOperationCategory.last_emission_rate.emission_rate}
                        periodStart={referencePeriod.start}
                        periodEnd={referencePeriod.end}
                    />
                    <Icon mx={6} scale={2.5} name="thickArrowRight" />
                    <EmissionRateBox
                        isOldEmissionRate={false}
                        value={newEmissionRate}
                        periodStart={effectivePeriod.start}
                        periodEnd={effectivePeriod.end}
                    />
                </Flex>
            </>
        );
    }
);

UpdateEmissionRate.displayName = "UpdateEmissionRate";
export {UpdateEmissionRate};

function getDefaultFuelConsumptions(): NullableFuelConsumption[] {
    return [
        {
            fuel: "GO",
            quantity: null,
        },
    ];
}

function getDefaultEffectivePeriod(referencePeriod: {start: Date; end: Date}) {
    // The effective period starts from today and span the same duration as the reference period
    const start = startOfDay(new Date());
    const duration = differenceInDays(referencePeriod.end, referencePeriod.start);
    const end = endOfDay(addDays(start, duration));
    return {start, end};
}
