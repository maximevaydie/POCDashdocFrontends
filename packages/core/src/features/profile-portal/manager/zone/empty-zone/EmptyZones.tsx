import {t} from "@dashdoc/web-core";
import {Button, Flex, Text} from "@dashdoc/web-ui";
import React from "react";
import {useHistory, useParams} from "react-router";

import {EmptyZonesImage} from "./EmptyZonesImage";

export const EmptyZones = () => {
    const history = useHistory();
    const {slug} = useParams<{slug: string}>();
    return (
        <Flex
            alignItems="center"
            textAlign="center"
            flexDirection="column"
            maxWidth="960px"
            margin="50px auto"
        >
            <EmptyZonesImage />
            <Text variant="title" mb={4}>
                {t("flow.home.title")}
            </Text>
            <Text variant="title" mb={6}>
                {t("flow.home.subtitle")}
            </Text>
            <Text variant="title" color="grey.dark" mb={6}>
                {t("flow.home.description")}
            </Text>
            <Button
                variant="primary"
                onClick={() => {
                    history.push(`/flow/site/${slug}/settings/`);
                }}
            >
                {t("flow.home.setupButton")}
            </Button>
        </Flex>
    );
};
