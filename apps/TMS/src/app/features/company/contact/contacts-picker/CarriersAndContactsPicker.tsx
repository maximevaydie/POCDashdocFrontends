import {t} from "@dashdoc/web-core";
import {Box, Button, Flex, IconButton, Text} from "@dashdoc/web-ui";
import {type SimpleContact} from "dashdoc-utils";
import React, {ReactNode} from "react";

import {useCarrierSelections} from "app/features/company/contact/contacts-picker/useCarrierSelections";
import {CarrierAndContactsPicker} from "app/features/transport/transport-form/address-and-contacts-picker/CarrierAndContactsPicker";

import type {CarrierIdAndContactUid} from "./types";

type Props = {
    title: ReactNode;
    addContactLabel: ReactNode;
    onChange: (requestReceivers: CarrierIdAndContactUid[]) => void;
};

// TODO: should be collocated in rfq (only used in rfq)
export function CarriersAndContactsPicker({title, addContactLabel, onChange}: Props) {
    const {selections, onAdd, onDelete, onUpdate} = useCarrierSelections(onChange);
    const isValid = selections.every(({carrier}) => carrier !== null);
    return (
        <Box flexGrow={1}>
            <Text variant="h1" fontWeight="bold" mb={2}>
                {title}
            </Text>
            <Box flexGrow={1}>
                {selections.map((selection, index) => (
                    <Flex mt={2} key={selection.key}>
                        <Flex flexDirection="column" flexGrow={1}>
                            <CarrierAndContactsPicker
                                direction="row"
                                isClearable
                                isMulti={false}
                                carrier={selection.carrier}
                                contacts={selection.contacts}
                                onCarrierChange={(value) => {
                                    onUpdate(index, value, []);
                                }}
                                onContactsChange={(contacts: SimpleContact[]) => {
                                    onUpdate(index, selection.carrier, contacts);
                                }}
                            />
                        </Flex>

                        <Box
                            style={
                                index <= 0 && selections.length <= 1
                                    ? {
                                          visibility: "hidden",
                                      } /* To get the same layout for the first row*/
                                    : {}
                            }
                        >
                            <IconButton
                                name="delete"
                                m="auto"
                                fontSize={5}
                                title={t("common.delete")}
                                color="grey.dark"
                                onClick={() => onDelete(index)}
                            />
                        </Box>
                    </Flex>
                ))}
                <Button disabled={!isValid} type="button" variant="plain" onClick={onAdd}>
                    {addContactLabel}
                </Button>
            </Box>
        </Box>
    );
}
