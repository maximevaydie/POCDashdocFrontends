import {t} from "@dashdoc/web-core";
import {Box, Checkbox, Flex, Icon, Radio, Text, TooltipWrapper} from "@dashdoc/web-ui";
import {FormikErrors} from "formik";
import React from "react";

import {ExtensionsConnectorPayload} from "app/features/settings/hooks/useCrudConnector";

export function GedmouvConnectorSpecificities({
    values,
    setFieldValue,
    errors,
    disabled,
}: {
    values: ExtensionsConnectorPayload;
    errors: FormikErrors<ExtensionsConnectorPayload>;
    setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void;
    disabled: boolean;
}) {
    return (
        <>
            {values["license_plate_transmission"] && (
                <>
                    <Text variant="captionBold" my={2}>
                        {t("common.options")}
                    </Text>
                    <Box justifyContent="space-between" mb={2}>
                        <Flex my={2}>
                            <Checkbox
                                label={t("settings.gedmouv.s3pSubscription")}
                                checked={values["s3p_subscription"] !== undefined}
                                onChange={(checked) =>
                                    setFieldValue(
                                        "s3p_subscription",
                                        checked ? "vehicles" : undefined
                                    )
                                }
                                error={errors["s3p_subscription"]}
                                disabled={disabled}
                            />
                            <TooltipWrapper content={t("settings.gedmouv.s3pSubscriptionTooltip")}>
                                <Icon name="info" ml={2} />
                            </TooltipWrapper>
                        </Flex>
                        {values["s3p_subscription"] !== undefined && (
                            <Flex ml={2} flexDirection={"column"}>
                                <Radio
                                    name="s3p_subscription"
                                    label={t("settings.gedmouv.s3pSubscription.vehicles")}
                                    value="vehicles"
                                    checked={values["s3p_subscription"] === "vehicles"}
                                    onChange={(value) => setFieldValue("s3p_subscription", value)}
                                    disabled={disabled}
                                />
                                <Radio
                                    name="s3p_subscription"
                                    label={t("settings.gedmouv.s3pSubscription.trailers")}
                                    value="trailers"
                                    checked={values["s3p_subscription"] === "trailers"}
                                    onChange={(value) => setFieldValue("s3p_subscription", value)}
                                    disabled={disabled}
                                />
                                <Radio
                                    name="s3p_subscription"
                                    label={t("settings.gedmouv.s3pSubscription.both")}
                                    value="both"
                                    checked={values["s3p_subscription"] === "both"}
                                    onChange={(value) => setFieldValue("s3p_subscription", value)}
                                    disabled={disabled}
                                />
                            </Flex>
                        )}
                    </Box>
                </>
            )}
        </>
    );
}
