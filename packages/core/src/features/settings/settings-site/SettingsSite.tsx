import {t} from "@dashdoc/web-core";
import {Box, Button, Flex, toast} from "@dashdoc/web-ui";
import {zodResolver} from "@hookform/resolvers/zod";
import {unwrapResult} from "@reduxjs/toolkit";
import React from "react";
import {FormProvider, useForm} from "react-hook-form";
import {useDispatch} from "redux/hooks";
import {refreshFlow} from "redux/reducers/flow";
import {
    SitePatchPayload,
    addSiteSecurityProtocol,
    deleteSiteSecurityProtocol,
    patchSite,
} from "redux/reducers/flow/site.slice";
import {actionService} from "redux/services/action.service";
import {Site} from "types";
import {z} from "zod";

import {SettingsSiteAddressFields} from "./fields/SettingsSiteAddressFields";
import {SettingsSiteConfigurationFields} from "./fields/SettingsSiteConfigurationFields";
import {SettingsSiteGeneralFields} from "./fields/SettingsSiteGeneralFields";
import {SettingsSiteSecurityProtocolFields} from "./fields/SettingsSiteSecurityProtocolFields";

type Props = {
    company: {name: string};
    site: Site;
};

export function SettingsSite({company, site}: Props) {
    const validationSchema = z.object({
        file: z.instanceof(File).nullable().optional(),
        contact_email: z.string().email(t("errors.email.invalid")).or(z.literal("")),
        contact_phone: z.string().min(1, t("common.invalidPhoneNumber")).or(z.literal("")),
        address: z.object({
            address: z.string().nonempty(t("errors.field_cannot_be_empty")),
            postcode: z.string().nonempty(t("errors.field_cannot_be_empty")),
            city: z.string().nonempty(t("errors.field_cannot_be_empty")),
            country: z.string().nonempty(t("errors.field_cannot_be_empty")),
            longitude: z.number().nullable().optional(),
            latitude: z.number().nullable().optional(),
        }),
        use_slot_handled_state: z.boolean().optional(),
    });

    type FormType = z.infer<typeof validationSchema>;

    const methods = useForm<FormType>({
        resolver: zodResolver(validationSchema),
        defaultValues: getDefaultValue(site),
    });
    const dispatch = useDispatch();

    const {
        handleSubmit,
        trigger,
        formState: {isValid, isSubmitting, isDirty, touchedFields},
        reset,
    } = methods;

    const atLeastOneFieldTouched =
        touchedFields.contact_email ||
        touchedFields.contact_phone ||
        touchedFields.file ||
        (touchedFields.address &&
            Object.values(touchedFields.address).length > 0 &&
            Object.values(touchedFields.address).some((touchedField) => touchedField === true)) ||
        touchedFields.use_slot_handled_state;
    const disableSubmit = !(isDirty || atLeastOneFieldTouched) || !isValid || isSubmitting;
    const loading = isSubmitting;

    return (
        <Box
            style={{
                display: "grid",
                gridTemplateRows: `1fr min-content`,
            }}
            flexGrow={1}
            flexBasis="100px"
            backgroundColor="grey.white"
            overflowY="hidden"
            borderRadius={2}
            p={2}
        >
            <FormProvider {...methods}>
                <Box
                    style={{
                        display: "grid",
                        gridTemplateColumns: `minmax(min-content, 500px) 1fr`,
                    }}
                    overflowY="scroll"
                >
                    <Flex flexDirection="column">
                        <Box
                            style={{
                                display: "grid",
                                gridTemplateRows: ` min-content min-content`,
                            }}
                            p={5}
                            mt={2}
                        >
                            <SettingsSiteGeneralFields company={company} site={site} />
                            <SettingsSiteAddressFields site={site} />
                        </Box>
                    </Flex>
                    <Box p={5} mt={2}>
                        <SettingsSiteSecurityProtocolFields
                            securityProtocol={site.security_protocol}
                            // this component will be unmounted and remounted when the security_protocol changes
                            key={`${site.security_protocol?.id}`}
                        />
                        <Box mt={6}>
                            <SettingsSiteConfigurationFields />
                        </Box>
                    </Box>
                </Box>
                <Box display="flex" flexDirection="row-reverse" mt={4}>
                    <Button
                        type="button"
                        onClick={handleSubmit(onSubmit)}
                        variant="primary"
                        ml={4}
                        data-testid="settings-site-tab-save-button"
                        loading={loading}
                        disabled={disableSubmit}
                    >
                        {t("common.save")}
                    </Button>
                </Box>
            </FormProvider>
        </Box>
    );

    async function onSubmit(data: FormType) {
        const isValidForm = await trigger();

        if (!isValidForm) {
            return;
        }
        if (data.file !== undefined) {
            const securityProtocolActionResult = await dispatch(
                data.file === null
                    ? deleteSiteSecurityProtocol({payload: {site: site.id}})
                    : addSiteSecurityProtocol({
                          payload: {
                              site: site.id,
                              file: data.file ?? null,
                          },
                      })
            );
            if (actionService.containsError(securityProtocolActionResult)) {
                toast.error(actionService.getError(securityProtocolActionResult));
                return; // Abort submit
            }
        }

        const originalData = {
            contact_email: site.contact_email,
            contact_phone: site.contact_phone,
            address: {
                address: site.address.address,
                postcode: site.address.postcode,
                city: site.address.city,
                country: site.address.country,
                longitude: site.address.longitude,
                latitude: site.address.latitude,
            },
            use_slot_handled_state: site.use_slot_handled_state,
        };

        const payload: SitePatchPayload = {id: site.id};

        for (const key in originalData) {
            const typedKey = key as keyof typeof originalData;
            if (originalData[typedKey] !== data[typedKey]) {
                if (typedKey === "address") {
                    const {address, city, country, postcode, longitude, latitude} = data.address;
                    if (longitude === undefined || latitude === undefined) {
                        // nothing changed
                        payload.address = {
                            address,
                            city,
                            country,
                            postcode,
                            longitude: site.address.longitude,
                            latitude: site.address.latitude,
                        };
                    } else if (longitude === null || latitude === null) {
                        // longitude/latitude not provided by here
                        payload.address = {
                            address,
                            city,
                            country,
                            postcode,
                            longitude: null,
                            latitude: null,
                        };
                    } else {
                        // longitude/latitude provided by here
                        payload.address = {
                            address,
                            city,
                            country,
                            postcode,
                            longitude: longitude,
                            latitude: latitude,
                        };
                    }
                } else if (typedKey === "use_slot_handled_state") {
                    payload.use_slot_handled_state = data.use_slot_handled_state;
                } else {
                    payload[typedKey] = data[typedKey];
                }
            }
        }

        const siteActionResult = await dispatch(patchSite({payload}));
        if (actionService.containsError(siteActionResult)) {
            toast.error(actionService.getError(siteActionResult));
            return; // Abort submit
        }
        const newSite = unwrapResult(siteActionResult) as Site;
        reset(getDefaultValue(newSite));
        await dispatch(refreshFlow());
    }
}

function getDefaultValue(site: Site) {
    return {
        file: undefined,
        contact_email: site.contact_email ?? "",
        contact_phone: site.contact_phone ?? "",
        address: {
            address: site.address.address ?? "",
            postcode: site.address.postcode ?? "",
            city: site.address.city ?? "",
            country: site.address.country ?? "FR",
            longitude: undefined,
            latitude: undefined,
        },
        use_slot_handled_state: site.use_slot_handled_state,
    };
}
