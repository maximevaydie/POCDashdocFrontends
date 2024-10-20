import {t} from "@dashdoc/web-core";
import {ClickableUpdateRegionStyle, ErrorMessage, Flex, Icon, Text} from "@dashdoc/web-ui";
import {formatNumber, useToggle} from "dashdoc-utils";
import React from "react";

import {UpdateTonneByKilometerModal} from "./UpdateTonneByKilometerModal";

type Props = {
    value: number;
    error: string | undefined;
    onUpdate: (value: number) => void;
};

export function TonneByKilometerField({value, error, onUpdate}: Props) {
    const [isModalOpen, openModal, closeModal] = useToggle();
    const valueLabel = `${formatNumber(value, {
        minimumFractionDigits: 2,
    })} ${t("common.tonneKilometer")}`;
    return (
        <>
            <Flex
                mt={4}
                border="1px solid"
                borderColor="grey.light"
                alignItems="center"
                p={4}
                width="100%"
                onClick={openModal}
                as={ClickableUpdateRegionStyle}
                data-testid="tonne-kilometer-section"
                // @ts-ignore
                updateButtonLabel={t("common.edit")}
            >
                <Icon name="truck" fontSize={4} mr={3} color="grey.default" />
                <Text>{valueLabel}</Text>
            </Flex>
            {error && <ErrorMessage error={error} />}
            {isModalOpen && (
                <UpdateTonneByKilometerModal
                    defaultTonneByKilometer={value}
                    onUpdate={handleUpdate}
                    onClose={closeModal}
                />
            )}
        </>
    );

    function handleUpdate(tonneByKilometer: number) {
        onUpdate(tonneByKilometer);
        closeModal();
    }
}
