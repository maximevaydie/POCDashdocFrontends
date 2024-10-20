import {t} from "@dashdoc/web-core";
import {
    Box,
    Flex,
    Modal,
    Text,
    NumberInput,
    TooltipWrapper,
    Link,
    IconButton,
} from "@dashdoc/web-ui";
import React from "react";

import {fetchSetActivityCarbonFootprint} from "app/redux/actions";
import {useDispatch} from "app/redux/hooks";

import type {Site} from "app/types/transport";

type Props = {
    breakSite: Site;
    onClose: () => void;
};

export const SetBreakActivityCarbonFootprintModal: React.FunctionComponent<Props> = ({
    breakSite,
    onClose,
}) => {
    const dispatch = useDispatch();
    const [manualEmissionValue, setManualEmissionValue] = React.useState<number | null>(
        breakSite.manual_emission_value
    );

    const saveManualCarbonFootprint = () => {
        if (breakSite.manual_emission_value !== manualEmissionValue) {
            dispatch(fetchSetActivityCarbonFootprint(breakSite.uid, manualEmissionValue));
        }
    };

    return (
        <Modal
            mainButton={{
                children: t("common.save"),
                onClick: () => {
                    saveManualCarbonFootprint();
                    onClose();
                },
            }}
            secondaryButton={{
                variant: "plain",
                children: t("common.cancel"),
                onClick: onClose,
            }}
            onClose={onClose}
            title={t("carbonFootprint.break.modalTitle")}
        >
            <Text mb={4}>
                {t("carbonFootprint.break.description")}{" "}
                <Link
                    href="https://help.dashdoc.eu/fr/articles/6138895-comment-connaitre-la-quantite-d-emission-co2-de-ma-prestation-de-transport"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    {t("common.findOutMore")}
                </Link>
            </Text>
            <Flex flexDirection="row" alignItems="center">
                <Box flexGrow={1} maxWidth="400px" mr={2}>
                    <NumberInput
                        label={t("components.carbonFootprint.userCarbonFootprintLabel")}
                        value={manualEmissionValue}
                        onChange={setManualEmissionValue}
                        units={t("components.carbonFootprint.unit")}
                        data-testid="manual-carbon-footprint-input"
                    />
                </Box>
                <TooltipWrapper
                    content={t("components.carbonFootprint.removeUserCarbonFootprint")}
                >
                    <IconButton
                        onClick={() => setManualEmissionValue(null)}
                        fontSize={3}
                        data-testid="manual-carbon-footprint-clear-button"
                        name="bin"
                    />
                </TooltipWrapper>
            </Flex>
        </Modal>
    );
};
