import {Meta, Story} from "@storybook/react/types-6-0";
import React from "react";

import {
    NewFeatureBanner as NewFeatureBannerComponent,
    NewFeatureBannerProps,
} from "../new-feature-banner";

export default {
    title: "app/common/New Feature Banner",
    component: NewFeatureBannerComponent,
    args: {
        featureFlag: "dummyFeatureFlagForStorybook",
        featureLabel: "Nouveau formulaire",
        disabledMessage: "👋 Testez la nouvelle version du formulaire de création de transport !",
        enabledMessage:
            "👀  Vous utilisez la version beta du formulaire. Vos retours sont précieux.",
        surveyLink: "https://help.dashdoc.eu/",
        learnMoreLink: "https://help.dashdoc.eu/",
    },
} as Meta;

const Template: Story<NewFeatureBannerProps> = (args) => <NewFeatureBannerComponent {...args} />;

export const NewFeatureBanner = Template.bind({});
