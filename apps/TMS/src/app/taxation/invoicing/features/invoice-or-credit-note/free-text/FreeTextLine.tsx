import {Logger, t} from "@dashdoc/web-core";
import {Card, Flex, IconButton, Text} from "@dashdoc/web-ui";
import {WrapXLines} from "@dashdoc/web-ui";
import {useToggle} from "dashdoc-utils";
import React from "react";

import {useDispatch} from "app/redux/hooks";
import {
    FreeTextModal,
    SubmitFreeTextPayload,
} from "app/taxation/invoicing/features/invoice-or-credit-note/free-text/FreeTextModal";

import type {CreditNote} from "app/taxation/invoicing/types/creditNote.types";
import type {Invoice} from "app/taxation/invoicing/types/invoice.types";

type FreeTextLine = {
    freeText: string;
    itemUid: string;
    readOnly: boolean;
    fetchUpdate: (
        itemUid: string,
        payload: SubmitFreeTextPayload
    ) => (dispatch: Function) => Promise<Partial<Invoice> | Partial<CreditNote>>;
};
export function FreeTextLine({freeText, itemUid, readOnly, fetchUpdate}: FreeTextLine) {
    const dispatch = useDispatch();
    const [isFreeTextModalOpen, openFreeTextModal, closeFreeTextModal] = useToggle(false);
    const [mouseOnLine, setMouseOnLine, setMouseNotOnLine] = useToggle(false);
    const showEditButtons = mouseOnLine && !readOnly;
    if (!freeText) {
        return null;
    }
    return (
        <>
            <Flex
                justifyContent="space-between"
                flex={1}
                alignItems="center"
                onMouseEnter={setMouseOnLine}
                onMouseLeave={setMouseNotOnLine}
                minHeight="50px"
                data-testid="free-text-line"
                borderBottomStyle="solid"
                borderBottomWidth="1px"
                borderBottomColor="grey.light"
            >
                <WrapXLines numberOfLines={4}>
                    <Text pl={5} py={1}>
                        {freeText}
                    </Text>
                </WrapXLines>

                {showEditButtons && (
                    <Card
                        py="1"
                        px="2"
                        display="flex"
                        alignItems="center"
                        css={{
                            columnGap: "2px",
                            visibility: showEditButtons ? "inherit" : "hidden",
                        }}
                    >
                        <IconButton
                            name="edit"
                            color="blue.default"
                            scale={[1.33, 1.33]}
                            onClick={openFreeTextModal}
                            disabled={readOnly}
                            data-testid="free-text-line-edit-button"
                        />

                        <IconButton
                            scale={[1.33, 1.33]}
                            color="red.default"
                            name="bin"
                            disabled={readOnly}
                            onClick={handleDelete}
                            withConfirmation
                            confirmationMessage={t("invoicing.removeFreeTextConfirmation")}
                            data-testid={"remove-free-text-button"}
                        />
                    </Card>
                )}
            </Flex>

            {isFreeTextModalOpen && (
                <FreeTextModal
                    itemUid={itemUid}
                    fetchUpdate={fetchUpdate}
                    initialValue={freeText}
                    onClose={closeFreeTextModal}
                />
            )}
        </>
    );

    async function handleDelete() {
        try {
            await dispatch(fetchUpdate(itemUid, {free_text: ""}));
        } catch (error) {
            Logger.error("An error occurred while deleting the free text of the invoice !", error);
        }
    }
}
