import {t} from "@dashdoc/web-core";
import {Box, Flex, IconButton, Link, Text} from "@dashdoc/web-ui";
import React, {useEffect, useState} from "react";

type NewFeatureHelpBannerProps = {
    preferenceSessionStorageKey: string;
    text: string;
    expirationDate: Date;
    learnMoreLink?: string;
};

export const NewFeatureHelpBanner: React.FC<NewFeatureHelpBannerProps> = ({
    preferenceSessionStorageKey,
    text,
    expirationDate,
    learnMoreLink = null,
}) => {
    const [isShown, setIsShown] = useState(false);

    useEffect(() => {
        // A user cannot restore the banner, so the value doesn't matter, only that the key was set.
        const userPrefHideBanner = sessionStorage.getItem(preferenceSessionStorageKey);
        const today = new Date();
        setIsShown(!userPrefHideBanner && today < expirationDate);
    }, [setIsShown, preferenceSessionStorageKey, expirationDate]);

    if (!isShown) {
        return null;
    }

    return (
        <Flex
            width="100%"
            minHeight="40px"
            mb={4}
            boxShadow="large"
            backgroundColor="grey.white"
            alignItems="center"
            style={{gap: "12px"}}
        >
            <Box
                color="blue.dark"
                border="1px solid"
                borderColor="blue.dark"
                borderRadius="3px"
                px={3}
                py={1}
                ml="auto"
            >
                {t("common.new")}
            </Box>
            <Text>{text}</Text>
            {learnMoreLink && (
                <Link href={learnMoreLink} target="_blank" rel="noopener noreferrer">
                    {t("common.findOutMore")}
                </Link>
            )}
            <IconButton
                name="close"
                onClick={() => {
                    sessionStorage.setItem(preferenceSessionStorageKey, "true");
                    setIsShown(false);
                }}
                fontSize={0}
                ml="auto"
                mr={4}
            />
        </Flex>
    );
};
