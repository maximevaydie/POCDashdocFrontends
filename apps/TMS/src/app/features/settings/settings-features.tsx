import {t} from "@dashdoc/web-core";
import {Box, Flex, Text} from "@dashdoc/web-ui";
import {FullHeightMinWidthScreen} from "@dashdoc/web-ui";
import React from "react";
import {Link, Redirect, Route, Switch, withRouter} from "react-router-dom";

import SettingsAdditionalFeatures from "./settings-additional-features";

type FeatureTabs = "additional-features";
type FeatureTabsProps = {selectedTab: FeatureTabs};

function FeatureTabs({selectedTab}: FeatureTabsProps) {
    return (
        <Flex flexDirection="column">
            <Box width="100%">
                <ul className="nav nav-tabs">
                    <li
                        role="presentation"
                        className={selectedTab === "additional-features" ? "active" : ""}
                    >
                        <Link
                            to="../additional-features/"
                            data-testid="settings-additional-features-tab"
                        >
                            {t("settings.additionalFeatures")}
                        </Link>
                    </li>
                </ul>
            </Box>
            <Box flexDirection="column" width="100%" padding={2}>
                {selectedTab === "additional-features" && <SettingsAdditionalFeatures />}
            </Box>
        </Flex>
    );
}

function Features() {
    return (
        <Flex>
            <Box>
                <Text variant="title" mb={1}>
                    {t("settings.features")}
                </Text>

                <FullHeightMinWidthScreen p={3}>
                    <Switch>
                        {/* This is the default route */}
                        <Route
                            path="/app/settings/features/"
                            render={() => (
                                <Redirect to="/app/settings/features/additional-features/" />
                            )}
                            exact
                        />
                        <Route
                            path="/app/settings/features/additional-features/"
                            component={() => <FeatureTabs selectedTab="additional-features" />}
                        />
                    </Switch>
                </FullHeightMinWidthScreen>
            </Box>
        </Flex>
    );
}

export default withRouter(Features);
