import {t} from "@dashdoc/web-core";
import {Box, TextInput} from "@dashdoc/web-ui";
import {Trucker} from "dashdoc-utils";
import React from "react";
import {Controller} from "react-hook-form";
import {z} from "zod";

import {
    FieldSet,
    FieldSetLegend,
} from "app/features/fleet/trucker/trucker-modal/form-sections/generic";

export const generalFormValidationSchema = z.object({
    first_name: z.string().nonempty("errors.field_cannot_be_empty"),
    last_name: z.string().nonempty("errors.field_cannot_be_empty"),
    remote_id: z.string().nullable(),
});

export function getGeneralDefaultValues(trucker?: Trucker, truckerFirstName?: string) {
    return trucker
        ? {
              first_name: trucker.user?.first_name || truckerFirstName || "",
              last_name: trucker.user?.last_name || "",
              remote_id: trucker.remote_id || "",
          }
        : {first_name: "", last_name: "", remote_id: ""};
}

export function GeneralFormSection({displayRemoteIdField}: {displayRemoteIdField: boolean}) {
    return (
        <FieldSet>
            <FieldSetLegend>{t("common.general")}</FieldSetLegend>
            <Box mt={3}>
                <Controller
                    name="first_name"
                    data-testid="input-first-name"
                    render={({field, fieldState: {error}}) => (
                        <TextInput
                            required
                            {...field}
                            data-testid="input-first-name"
                            label={t("settings.firstNameLabel")}
                            placeholder={t("common.typeHere")}
                            error={error?.message}
                        />
                    )}
                />
            </Box>
            <Box mt={3}>
                <Controller
                    name="last_name"
                    data-testid="input-last-name"
                    render={({field, fieldState: {error}}) => (
                        <TextInput
                            required
                            {...field}
                            data-testid="input-last-name"
                            label={t("settings.lastNameLabel")}
                            error={error?.message}
                        />
                    )}
                />
            </Box>
            {displayRemoteIdField && (
                <Box mt={3}>
                    <Controller
                        name="remote_id"
                        render={({field, fieldState: {error}}) => (
                            <TextInput
                                {...field}
                                data-testid="input-remote-id"
                                placeholder={t("common.typeHere")}
                                label={t("components.remoteId")}
                                error={error?.message}
                            />
                        )}
                    />
                </Box>
            )}
        </FieldSet>
    );
}
