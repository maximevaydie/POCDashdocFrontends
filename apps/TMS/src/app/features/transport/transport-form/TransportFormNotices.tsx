import {t} from "@dashdoc/web-core";
import {Box, Text} from "@dashdoc/web-ui";
import React from "react";

import {BusinessPrivacyInformationLabel} from "app/features/transport/business-privacy/BusinessPrivacyInformationLabel";

type Props = {
    cannotVerifyQualimatCertification: boolean;
    hasBusinessPrivacy: boolean;
    hasDangerousLoads: boolean;
};

export function TransportFormNotices({
    cannotVerifyQualimatCertification,
    hasBusinessPrivacy,
    hasDangerousLoads,
}: Props) {
    let informationMessages: React.JSX.Element[] = [];

    if (hasBusinessPrivacy) {
        informationMessages.push(<BusinessPrivacyInformationLabel />);
    }

    if (cannotVerifyQualimatCertification) {
        informationMessages.push(
            <Text
                data-testid="cannot-verify-qualimat-certification-information-label"
                color="blue.dark"
            >
                {t("qualimat.carrierUnknown")}
            </Text>
        );
    }

    if (hasDangerousLoads) {
        informationMessages.push(
            <Text data-testid="dangerous-load-information-label" color="blue.dark">
                {t("adr.warningPaperVersionNeededForControl")}
            </Text>
        );
    }

    if (informationMessages.length === 0) {
        return null;
    }

    return (
        <Box
            mx={-5} // Horizontally bleed into the parent container (for background color)
            px={5} // Compensate for the horizontal negative margin (realign content)
            mt={-5} // Vertically bleed into the parent container (for background color)
            py={3} // Compensate for the vertical negative margin (realign content)
            mb={2}
            borderRadius={0}
            borderTopLeftRadius={1}
            borderTopRightRadius={1}
            bg="blue.ultralight"
            color="blue.dark"
        >
            {informationMessages.length > 1 ? (
                <ul style={{marginBottom: 0, paddingLeft: 18}}>
                    {informationMessages.map((message, index) => (
                        <li key={index}>{message}</li>
                    ))}
                </ul>
            ) : (
                informationMessages
            )}
        </Box>
    );
}
