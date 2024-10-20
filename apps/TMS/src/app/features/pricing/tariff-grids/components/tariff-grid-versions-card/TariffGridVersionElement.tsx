import {Flex, Icon, IconButton, Text} from "@dashdoc/web-ui";
import {formatDate} from "dashdoc-utils";
import React from "react";

import {TariffGridVersion} from "app/features/pricing/tariff-grids/types";

type TariffGridVersionProps = {
    tariffGridVersion: TariffGridVersion;
    openEditTariffGridVersionModal: () => unknown;
};

export const TariffGridVersionElement = ({
    tariffGridVersion,
    openEditTariffGridVersionModal,
}: TariffGridVersionProps) => (
    <Flex
        backgroundColor="grey.light"
        mt={3}
        pl={3}
        py={2}
        alignItems={"center"}
        data-testid="tariff-grid-version-element"
    >
        <Flex flex={1}>
            <Icon name="calendar" color="grey.dark" mr={3} />
            <Text>{formatDate(tariffGridVersion.start_date, "P")}</Text>
        </Flex>
        <IconButton
            data-testid="tariff-grid-version-edit-button"
            name="edit"
            onClick={openEditTariffGridVersionModal}
            mr={2}
        />
    </Flex>
);
