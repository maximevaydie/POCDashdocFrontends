import {Badge, Box, Button, LoadingWheel, Text, theme} from "@dashdoc/web-ui";
import styled from "@emotion/styled";
import isEmpty from "lodash.isempty";
import React, {FunctionComponent, useEffect, useState} from "react";

import {Api} from "../Api";

const FormStyle = styled("div")`
    .control-label,
    .checkbox > label > span {
        font-weight: bold;
    }
    .field-boolean {
        border-bottom: 1px solid ${theme.colors.grey.light};
    }
`;

const COMPANY_ADMIN_FEATURE_FLAGS_URL = "/companies-admin/{pk}/feature-flags/";

const CONFIG_CAT_PRODUCT_ID = "08d9533c-6721-492d-88c3-ba1056e00ab8";
const CONFIG_CAT_CONFIG_ID = "08d9533c-67d4-4e64-87b8-5357d5feebe3";

type ModerationFeatureFlagsProps = {
    companyPk: string;
};
type FeatureFlag = {
    key: string;
    value: boolean;
    name: string;
    description: string;
    setting_id: number;
    env_id: string;
};

export const ModerationFeatureFlags: FunctionComponent<ModerationFeatureFlagsProps> = ({
    companyPk,
}) => {
    const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>([]);

    useEffect(() => {
        async function fetchFeatureFlags() {
            const data = await Api.get(
                COMPANY_ADMIN_FEATURE_FLAGS_URL.replace("{pk}", companyPk),
                {apiVersion: "web"}
            );
            setFeatureFlags(data);
        }
        fetchFeatureFlags();
    }, [companyPk]);

    if (isEmpty(featureFlags)) {
        return <LoadingWheel />;
    }

    const hasCarrierAndShipperPriceEnabled = featureFlags.some(
        (featureFlag) => featureFlag.key === "carrierAndShipperPrice" && featureFlag.value
    );

    // @ts-ignore
    const sortedFeatureFlags = featureFlags.sort((a, b) =>
        a.key.localeCompare(b.key, "en", {
            usage: "sort",
            // Only strings that differ in base letters compare as unequal. Examples: a ≠ b, a = á, a = A.
            sensitivity: "base",
        })
    );

    return (
        <FormStyle>
            <Text fontWeight="bold" variant="title">
                ⚠️ Feature flags are synchronized every 30 seconds
            </Text>
            {sortedFeatureFlags.map((featureFlag, index) => (
                <Box key={index}>
                    <Box display="flex" my={2}>
                        <Text marginRight={2}>
                            <a
                                href={`https://app.configcat.com/${CONFIG_CAT_PRODUCT_ID}/${CONFIG_CAT_CONFIG_ID}/${featureFlag.env_id}?settingId=${featureFlag.setting_id}`}
                                target="_blank"
                                rel="noreferrer"
                            >
                                {featureFlag.key}
                            </a>
                        </Text>
                        {featureFlag.value ? (
                            <Badge variant="success" borderRadius={4}>
                                on
                            </Badge>
                        ) : (
                            <Badge variant="error" borderRadius={4}>
                                off
                            </Badge>
                        )}
                    </Box>
                    <Text mb={2}>{featureFlag.name}</Text>
                    {featureFlag.description && <p>{featureFlag.description}</p>}
                    <hr />
                </Box>
            ))}
            {!hasCarrierAndShipperPriceEnabled && (
                <Button variant="primary" onClick={onEnableCarrierAndShipperPrice}>
                    Enable carrier and shipper price
                </Button>
            )}
        </FormStyle>
    );

    async function onEnableCarrierAndShipperPrice() {
        // Do a JS confirm to validate the action
        if (
            !window.confirm(
                "Are you sure you want to enable carrier and shipper price for this company? \n" +
                    "It will also enable the feature flag in ConfigCat (in production only). \n" +
                    "WARNING: The action is irreversible."
            )
        ) {
            return;
        }
        await Api.post(
            "/enable-carrier-and-shipper-price/",
            {company_id: companyPk},
            {apiVersion: "moderation"}
        );
        window.location.reload();
    }
};
