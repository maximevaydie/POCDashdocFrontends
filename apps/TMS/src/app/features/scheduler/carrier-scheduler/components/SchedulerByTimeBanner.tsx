import {getLocale, t} from "@dashdoc/web-core";
import {Flex, Text, Badge, Button} from "@dashdoc/web-ui";
import React from "react";

export function SchedulerByTimeBanner() {
    const surveyLink = getSurveyLink();
    return (
        <Flex
            width="100%"
            minHeight="40px"
            display="flex"
            backgroundColor="grey.white"
            alignItems="center"
            justifyContent="center"
            boxShadow="small"
        >
            <Badge variant="blueDark" mr={3} shape="squared">
                {t("common.beta")}
            </Badge>
            <Text mr={3} ellipsis>
                {t("schedulerByTime.betaVersion")}
            </Text>
            <Button
                variant="secondary"
                paddingY={1}
                onClick={() => window.open(surveyLink, "_blank")}
            >
                <Text ellipsis>{t("common.giveFeedback")}</Text>
            </Button>
        </Flex>
    );
}

function getSurveyLink() {
    switch (getLocale()) {
        case "fr":
            return "https://docs.google.com/forms/d/e/1FAIpQLScXk0X1NyVL06iPdQGhxM_j8rYNFTATCTi0Ix7E00QcnWyIGQ/viewform?usp=sf_link";
        case "nl":
            return "https://docs.google.com/forms/d/e/1FAIpQLScJhG2o6qzYHxhLwMPqEEWswyd_94rOS54es7wT8pxjzKb9Qw/viewform?usp=sf_link";
        default:
            return "https://docs.google.com/forms/d/e/1FAIpQLSfUeQW-EU-OH80G-rM7yPR9PuxLD8DWHlPL1oD3HG4MIa2FQA/viewform?usp=sf_link";
    }
}
