import {t} from "@dashdoc/web-core";
import {Callout, Flex, HorizontalLine, Modal, Text, toast} from "@dashdoc/web-ui";
import {zodResolver} from "@hookform/resolvers/zod";
import React from "react";
import {useForm} from "react-hook-form";

import {fetchDeleteLogisticPoints} from "app/redux/actions/logisticPoints";
import {useDispatch} from "app/redux/hooks";

import {
    DeleteBulkForm,
    getDefaultValues,
    deleteBulkSchema,
    type DeleteBulkFormType,
} from "./DeleteBulkForm";

import type {LogisticPointSelection} from "app/features/address-book/logistic-points/types";

type Props = {
    selection: LogisticPointSelection;
    onDeleted: () => void;
    onClose: () => void;
};

export function DeleteConfirmationModal({selection, onDeleted, onClose}: Props) {
    const dispatch = useDispatch();

    const form = useForm<DeleteBulkFormType>({
        defaultValues: getDefaultValues(),
        resolver: zodResolver(deleteBulkSchema),
    });
    const loading = form.formState.isLoading || form.formState.isSubmitting;
    const disabled = loading;
    const nbSelected =
        "pk__in" in selection ? (selection.pk__in as number[]).length : selection.allCount;
    const needConfirmation = nbSelected > 1;

    return (
        <Modal
            title={t("components.deleteLogisticPoints", {smart_count: nbSelected})}
            onClose={onClose}
            mainButton={{
                children: t("common.delete"),
                severity: "danger",
                onClick: needConfirmation ? form.handleSubmit(handleSubmit) : handleSubmit,
                loading,
                disabled,
                "data-testid": "main-button",
            }}
            secondaryButton={{
                children: t("common.cancel"),
                disabled,
                "data-testid": "secondary-button",
            }}
            data-testid="delete-logistic-points-confirmation-modal"
        >
            <Flex flexDirection="column">
                {needConfirmation && (
                    <Callout variant="danger" mb={3}>
                        {t("components.xLogisticPointsSelected", {smart_count: nbSelected})}
                    </Callout>
                )}
                <Text>
                    {t("components.logisticPointBulkDeleteWarn", {
                        smart_count: nbSelected,
                    })}
                </Text>
                {needConfirmation && (
                    <>
                        <HorizontalLine my={3} />
                        <DeleteBulkForm form={form} />
                    </>
                )}
            </Flex>
        </Modal>
    );
    async function handleSubmit() {
        const {allCount: _, ...deletionQuery} = selection;
        await dispatch(fetchDeleteLogisticPoints(deletionQuery));
        toast.success(t("components.xLogisticPointsDeleted", {smart_count: nbSelected}));
        onDeleted();
    }
}
