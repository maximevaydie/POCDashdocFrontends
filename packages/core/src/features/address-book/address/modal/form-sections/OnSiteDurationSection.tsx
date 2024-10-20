import {t} from "@dashdoc/web-core";
import {Text, NumberInput, Icon, Flex, TooltipWrapper, Callout} from "@dashdoc/web-ui";
import {formatNumber} from "dashdoc-utils";
import {FormikContextType} from "formik";
import React, {useEffect, useState} from "react";

import {apiService} from "../../../../../services/api.service";
import {AddressForm} from "../types";
type Props = {
    formik: FormikContextType<Partial<AddressForm>>;
    addressPk: number | undefined;
    disabled?: boolean;
};

export function OnSiteDurationSection({formik, addressPk, disabled}: Props) {
    const [medianDuration, setMedianDuration] = useState<number | null>(null);

    useEffect(() => {
        fetchMedianDuration();
    }, [addressPk]);

    return (
        <>
            <Flex alignItems="center">
                <Text variant="h1" my={4}>
                    {t("optimization.onSiteDuration")}
                </Text>
                <TooltipWrapper
                    content={
                        t("optimization.onSiteDurationUtility") +
                        (medianDuration === null
                            ? ""
                            : "\n\n" + t("optimization.medianOnSiteDurationDetail"))
                    }
                >
                    <Icon name="info" ml={2} />
                </TooltipWrapper>
            </Flex>
            <Flex>
                <NumberInput
                    min={0}
                    onChange={(value) => {
                        formik.setFieldValue("theoretical_activity_duration_in_min", value);
                    }}
                    value={formik.values.theoretical_activity_duration_in_min ?? null}
                    units={t("common.minute", {
                        smart_count: formik.values.theoretical_activity_duration_in_min ?? 2,
                    })}
                    label={t("optimization.onSiteDuration")}
                    maxWidth="150px"
                    disabled={disabled}
                />
                {medianDuration !== null && (
                    <Callout variant="informative" icon="clock" ml={4} flex={1}>
                        {t("optimization.medianOnSiteDuration")}
                        {" : "}
                        {formatNumber(medianDuration, {
                            style: "unit",
                            unit: "minute",
                        })}
                    </Callout>
                )}
            </Flex>
        </>
    );

    async function fetchMedianDuration() {
        if (addressPk === undefined) {
            setMedianDuration(null);
            return;
        }

        try {
            const {median_real_activity_duration_in_min: fetchedMedianDuration} =
                await apiService.get(`/addresses/${addressPk}/real-activity-duration/`, {
                    apiVersion: "web",
                });
            setMedianDuration(fetchedMedianDuration);
        } catch {
            setMedianDuration(null);
        }
    }
}
