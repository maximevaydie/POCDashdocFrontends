import {ApiModels, useDispatch} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Callout, Modal, ModalProps, toast} from "@dashdoc/web-ui";
import {zodResolver} from "@hookform/resolvers/zod";
import React from "react";
import {useForm} from "react-hook-form";

import {
    SendToNetworkForm,
    sendToNetworkFormSchema,
    SendToNetworkFormValues,
} from "app/features/extensions/SendToNetworkForm";
import {fetchTriggerTripSendToNetwork} from "app/redux/reducers/extensions";

type Props = {
    extension: ApiModels.Extensions.ShortExtension;
    tripUid: string;
    onClose: ModalProps["onClose"];
    onSentToNetwork: () => void;
};

export function SendToNetworkModal({tripUid, onSentToNetwork, onClose, extension}: Props) {
    const dispatch = useDispatch();
    const form = useForm<SendToNetworkFormValues>({
        defaultValues: {
            instructions: "",
        },
        resolver: zodResolver(sendToNetworkFormSchema),
    });
    const loading = form.formState.isLoading || form.formState.isSubmitting;
    const disabled = form.formState.isSubmitting;

    return (
        <Modal
            title={t("extensions.triggers.trip_send_to_network_button", {
                name: extension.name,
            })}
            onClose={onClose}
            mainButton={{
                children: t("extensions.triggers.trip_send_to_network_button", {
                    name: extension.name,
                }),
                loading: loading,
                disabled: disabled,
                onClick: form.handleSubmit(handleSendToNetwork),
            }}
            secondaryButton={{
                onClick: onClose,
            }}
        >
            <SendToNetworkForm form={form} />
            <Callout mt={4} variant="warning">
                {t("extensions.triggers.trip_send_to_network.warning_no_sync", {
                    network: extension.name,
                })}
            </Callout>
        </Modal>
    );

    async function handleSendToNetwork({instructions}: {instructions: string}) {
        try {
            // We don't await because we don't want to block the user
            dispatch(
                fetchTriggerTripSendToNetwork({
                    extension,
                    parameters: {
                        instructions,
                    },
                    tripUid,
                })
            );

            onSentToNetwork();
        } catch (error) {
            toast.error(t("common.error"));
        }
    }
}
