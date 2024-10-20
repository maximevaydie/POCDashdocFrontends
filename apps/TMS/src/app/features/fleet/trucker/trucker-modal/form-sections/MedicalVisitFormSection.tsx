import {t} from "@dashdoc/web-core";
import {Box, DatePicker} from "@dashdoc/web-ui";
import {Trucker} from "dashdoc-utils";
import React from "react";
import {Controller} from "react-hook-form";
import {z} from "zod";

import {
    FieldSet,
    FieldSetLegend,
} from "app/features/fleet/trucker/trucker-modal/form-sections/generic";

export const medicalVisitFormValidationSchema = z.object({
    occupational_health_visit_deadline: z.date().nullable(),
});

export function getMedicalVisitDefaultValues(trucker?: Trucker) {
    return trucker
        ? {
              occupational_health_visit_deadline: trucker.occupational_health_visit_deadline
                  ? new Date(trucker.occupational_health_visit_deadline)
                  : null,
          }
        : {occupational_health_visit_deadline: null};
}
export function MedicalVisitFormSection() {
    return (
        <FieldSet mt={5}>
            <FieldSetLegend>{t("fleet.common.medicalVisitSection")}</FieldSetLegend>
            <Box mt={3}>
                <Controller
                    name="occupational_health_visit_deadline"
                    render={({field: {value, onChange}}) => (
                        <DatePicker
                            label={t("fleet.common.expiryDate")}
                            data-testid="input-occupational-health-visit-deadline"
                            placeholder={t("common.typeHere")}
                            onChange={onChange}
                            clearable
                            date={value}
                            rootId="react-app-modal-root"
                        />
                    )}
                />
            </Box>
        </FieldSet>
    );
}
