import {t} from "@dashdoc/web-core";
import {useToggle} from "dashdoc-utils";
import React, {useCallback, useMemo} from "react";

import {ConfirmationModal} from "./ConfirmationModal";

/**
 * Easy to use hook to confirm before leaving a modal or a side panel.
 * The hook will wrap the onClose by a onConfirm function
 * and give you a confirmModal to display when it makes sense.
 *
 * @example
 *  const {onConfirm, confirmModal} = useConfirmLeaving(
 *      formik.dirty,
 *      confirmationLabels,
 *      onClose
 *  );
 *  //...
 *  return (
 *      <>
 *          <Modal
 *              onClose={onConfirm}
 *              //...
 *          >
 *          //...
 *          </Modal>
 *          {confirmModal}
 *      </>
 * );
 */
export function useConfirmLeaving(
    confirm: boolean,
    onLeave: () => void,
    label: {title: string; message: string; submitButton: string} = {
        title: t("common.closeWithoutSaving"),
        message: t("confirmLeaving.message"),
        submitButton: t("common.closeWithoutSaving"),
    }
) {
    const {title, message, submitButton} = label;
    const [isConfirming, setIsConfirming, abortIsConfirming] = useToggle(false);

    const onConfirm = useCallback(async () => {
        if (confirm) {
            if (isConfirming) {
                onLeave();
            } else {
                setIsConfirming();
            }
        } else {
            onLeave();
        }
    }, [isConfirming, setIsConfirming, confirm, onLeave]);

    const confirmModal = useMemo(() => {
        if (!isConfirming) {
            return null;
        }
        return (
            <ConfirmationModal
                title={title}
                confirmationMessage={
                    <>
                        {message}
                        <br /> <br />
                        {t("common.doYouWishToProceed")}
                    </>
                }
                onClose={abortIsConfirming}
                mainButton={{
                    children: submitButton,
                    onClick: onLeave,
                    severity: "danger",
                }}
                secondaryButton={{
                    children: t("common.cancel"),
                    onClick: abortIsConfirming,
                }}
            />
        );
    }, [message, submitButton, title, isConfirming, onLeave, abortIsConfirming]);

    return {
        onConfirm,
        confirmModal,
    };
}
