import {t} from "@dashdoc/web-core";
import {Button, Flex, Header, NoWrap, TooltipWrapper} from "@dashdoc/web-ui";
import React from "react";

import {useDeleteQuotationRequest} from "../useQuotationRequest";

import type {SlimQuotationRequest} from "dashdoc-utils";

export type Props = {
    quotationRequest: SlimQuotationRequest;
    onDeleted: () => void;
};

export function DeleteQuotationRequest({quotationRequest, onDeleted}: Props) {
    const deleteQuotationRequest = useDeleteQuotationRequest(quotationRequest.pk);
    return (
        <Flex justifyContent="space-between">
            <Header title={t("rfq.delete.header")} icon="edit"></Header>
            <Flex flexBasis="max-content" justifyContent="end" mb={4}>
                <Button
                    variant="plain"
                    severity="danger"
                    onClick={handleDelete}
                    ml={2}
                    mt={2}
                    data-testid="delete-quotation-request-button"
                    withConfirmation
                    modalProps={{
                        title: t("rfq.delete.confirm.title"),
                        mainButton: {
                            children: t("common.abortDemand"),
                        },
                    }}
                    confirmationMessage={t("rfq.delete.confirm.message")}
                >
                    <TooltipWrapper content={t("common.abortDemand")}>
                        <NoWrap>{t("common.abortDemand")}</NoWrap>
                    </TooltipWrapper>
                </Button>
            </Flex>
        </Flex>
    );

    async function handleDelete() {
        await deleteQuotationRequest();
        onDeleted();
    }
}
