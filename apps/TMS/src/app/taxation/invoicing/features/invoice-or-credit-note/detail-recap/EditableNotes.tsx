import {t} from "@dashdoc/web-core";
import {Flex, Text} from "@dashdoc/web-ui";
import React from "react";

import {EditableField} from "app/taxation/invoicing/features/invoice-or-credit-note/detail-recap/EditableField";

type NotesContentProps = {
    value: string;
    onUpdate?: () => void;
};

export const EditableNotes: React.FunctionComponent<NotesContentProps> = ({value, onUpdate}) => {
    return (
        <>
            {(value || onUpdate !== undefined) && (
                <Flex mt={5} flexDirection="column" width={"100%"}>
                    {value && <Text color="grey.dark">{t("invoice.notes")}</Text>}
                    <EditableField
                        data-testid="invoice-notes"
                        placeholder={t("common.addNotes")}
                        value={value}
                        onClick={onUpdate}
                        clickable={onUpdate !== undefined}
                    />
                </Flex>
            )}
        </>
    );
};
