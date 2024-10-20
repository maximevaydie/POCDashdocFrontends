import {t} from "@dashdoc/web-core";
import {Address, Settings, yup} from "dashdoc-utils";
import {differenceInHours} from "date-fns";
import {toDate} from "date-fns-tz";
import {FormikErrors} from "formik";

import {
    FormLoad,
    TransportFormActivity,
} from "app/features/transport/transport-form/transport-form.types";

export function getActivityValidationSchema(activityType: "loading" | "unloading") {
    return yup.object().shape({
        address: yup.object().nullable().required(t("common.mandatoryField")),
        contact: yup.object().nullable(),
        reference: yup.string(),
        slots: yup
            .array()
            .of(yup.object().shape({start: yup.string(), end: yup.string()}))
            .when("etaTracking", {
                is: true,
                then: yup
                    .array()
                    .of(yup.object().shape({start: yup.string(), end: yup.string()}))
                    .min(
                        1,
                        activityType == "loading"
                            ? t("eta.error.loadingAddressWithoutPreciseAskDateTime")
                            : t("eta.error.unloadingAddressWithoutPreciseAskDateTime")
                    )
                    .test(
                        "NotPreciseEnoughAskDateTime",
                        activityType == "loading"
                            ? t("eta.error.loadingAddressWithoutPreciseAskDateTime")
                            : t("eta.error.unloadingAddressWithoutPreciseAskDateTime"),
                        (value) => {
                            if (!value || value.length === 0) {
                                return false;
                            }
                            // @ts-ignore
                            const startDate = toDate(value[0].start);
                            // @ts-ignore
                            const endDate = toDate(value[0].end);
                            return Math.abs(differenceInHours(startDate, endDate)) <= 2;
                        }
                    ),
            }),
        truckerInstructions: yup.string(),
        instructions: yup.string(),
        etaTracking: yup.boolean().when("address", {
            is: (address: Address) =>
                address && (!address.latitude || !address.longitude || !address.coords_validated),
            then: yup
                .boolean()
                .isFalse(
                    activityType == "loading"
                        ? t("eta.error.loadingAddressWithoutPreciseGPSCoordinates")
                        : t("eta.error.unloadingAddressWithoutPreciseGPSCoordinates")
                ),
        }),
        isBookingNeeded: yup.boolean(),
        lockRequestedTimes: yup.boolean().optional(),
    });
}

export function getMeansValidationSchema(
    isOrder: boolean,
    companyPk: number | undefined,
    settings: Settings | null,
    hasRecipientsOrderEnabled: boolean,
    hasBetterCompanyRolesEnabled: boolean
) {
    const carrierShape = {
        carrier: yup.object().nullable(),
        address: yup.object().nullable(),
        contact: yup
            .object()
            .nullable()
            .when("address", {
                is: (address: Address) => {
                    return (
                        !hasRecipientsOrderEnabled &&
                        address &&
                        !address?.company.has_loggable_managers &&
                        companyPk !== address?.company.pk &&
                        isOrder &&
                        !settings?.print_mode
                    );
                },
                then: yup.object().nullable().required(t("transportsForm.carrierContactNeeded")),
            }),
        contacts: yup
            .array()
            .nullable()
            .when("address", {
                is: (address: Address) => {
                    return (
                        hasRecipientsOrderEnabled &&
                        address &&
                        !address?.company.has_loggable_managers &&
                        companyPk !== address?.company.pk &&
                        isOrder &&
                        !settings?.print_mode
                    );
                },
                then: yup
                    .array()
                    .nullable()
                    .min(1, t("transportsForm.carrierContactNeeded"))
                    .required(t("transportsForm.carrierContactNeeded")),
            }),
        reference: yup.string(),
    };
    if (hasBetterCompanyRolesEnabled) {
        carrierShape["carrier"] =
            isOrder || settings?.default_role !== "carrier"
                ? yup.object().nullable()
                : yup.object().nullable().required(t("common.mandatoryField"));
    } else {
        carrierShape["address"] =
            isOrder || settings?.default_role !== "carrier"
                ? yup.object().nullable()
                : yup.object().nullable().required(t("common.mandatoryField"));
    }
    return yup
        .object()
        .nullable()
        .shape({
            carrier:
                isOrder || settings?.default_role !== "carrier"
                    ? yup.object().shape(carrierShape).nullable()
                    : yup.object().shape(carrierShape),
            requestedVehicle: yup.object().nullable(),
            trucker: yup.object().nullable(),
            vehicle: yup.object().nullable(),
            trailer: yup.object().nullable(),
        });
}

export function getReadableErrors(
    errors: FormikErrors<unknown> | string | undefined
): string | undefined {
    if (!errors) {
        return undefined;
    }
    if (typeof errors === "string") {
        return errors;
    }

    const keys = Object.keys(errors);
    if (keys.length === 0) {
        return undefined;
    }
    let errorsList: Set<string> = flatifyErrors(errors);

    return Array.from(errorsList).join("\n");
}

type Tree<T> = {
    [index: string]: T | Tree<T>;
};

function flatifyErrors(errors: Tree<string>): Set<string> {
    const keys = Object.keys(errors);
    if (keys.length === 0) {
        return new Set();
    }
    let errorsList: Set<string> = new Set();
    for (const key of keys) {
        if (typeof errors[key] === "string") {
            errorsList.add(errors[key] as string);
        } else if (typeof errors[key] === "object") {
            errorsList = new Set([...errorsList, ...flatifyErrors(errors[key] as Tree<string>)]);
        }
    }

    return errorsList;
}

export function getTransportValidationSchema(
    isCreatingTemplate: boolean,
    isComplexMode: boolean,
    hasBetterCompanyRolesEnabled: boolean
) {
    const baseSchema = yup.object().shape({
        templateName: isCreatingTemplate
            ? yup.string().required(t("common.mandatoryField"))
            : yup.string().nullable(),
        shipper: hasBetterCompanyRolesEnabled
            ? yup.object().shape({
                  shipper: yup.object().nullable().required(t("common.mandatoryField")),
              })
            : yup.object().shape({
                  address: yup.object().nullable().required(t("common.mandatoryField")),
              }),
        means: yup.object().nullable(),
        price: yup.object().nullable(),
        settings: yup.object().shape({
            businessPrivacy: yup.boolean().required(),
            volumeDisplayUnit: yup.string().required(),
        }),
        instructions: yup.string().nullable(),
    });

    const loadsSchema = isCreatingTemplate
        ? yup.array()
        : yup
              .array()
              .test(
                  "load-description-required",
                  t("transportForm.errors.loads.noDescription"),
                  (loads: Array<FormLoad> = []) =>
                      loads
                          .filter((load) => load.category !== "rental")
                          .every((load) => load.description)
              );

    return isComplexMode
        ? baseSchema.shape({
              activities: yup
                  .object()

                  .test(
                      "at-least-one-loading",
                      t("common.mandatoryField"),
                      (activities: Record<string, TransportFormActivity> = {}) =>
                          Object.values(activities).some(
                              (a) => a.type === "loading" && a.address != null
                          )
                  ),
          })
        : baseSchema.shape({
              loadings: isCreatingTemplate
                  ? yup.array()
                  : yup.array().of(
                        yup.object().shape({
                            address: yup.object().nullable().required(t("common.mandatoryField")),
                        })
                    ),
              unloadings: yup.array(),
              loads: loadsSchema,
          });
}
