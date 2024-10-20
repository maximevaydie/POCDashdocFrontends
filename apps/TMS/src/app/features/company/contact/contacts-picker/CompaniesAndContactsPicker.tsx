import {t} from "@dashdoc/web-core";
import {Box, Button, Flex, IconButton, Text} from "@dashdoc/web-ui";
import React, {ReactNode} from "react";

import {CompanyAndContactPicker} from "./CompanyAndContactPicker";
import {contactService} from "./contact.service";
import {useSelections} from "./useSelections";

import type {CarrierIdAndContactUid} from "./types";

type Props = {
    title: ReactNode;
    addContactLabel: ReactNode;
    onChange: (requestReceivers: CarrierIdAndContactUid[]) => void;
};

/**
 * TODO: to remove with betterCompanyRoles FF
 * @deprecated use PartnersAndContactsPicker instead
 */
export function CompaniesAndContactsPicker({title, addContactLabel, onChange}: Props) {
    const {selections, onAdd, onDelete, onUpdate} = useSelections(onChange);
    const isValid = selections.every(contactService.isValid);
    return (
        <Box flexGrow={1}>
            <Text variant="h1" fontWeight="bold" mb={2}>
                {title}
            </Text>
            <Box flexGrow={1}>
                {selections.map((selection, index) => (
                    <Flex mt={2} key={selection.key}>
                        <CompanyAndContactPicker
                            initialSendToCarrier="disabled"
                            initialSelection={selection}
                            onUpdate={(newReceiver) => onUpdate(index, newReceiver)}
                            displayTooltip
                        />
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
