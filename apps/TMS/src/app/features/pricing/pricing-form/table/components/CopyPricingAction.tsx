import {Logger, t} from "@dashdoc/web-core";
import {Button, Modal, toast, Text, Icon, Flex} from "@dashdoc/web-ui";
import {useToggle} from "dashdoc-utils";
import React from "react";

type Props = {
    buttonText: string;
    onCopyPrice: () => void;
};

export function CopyPricingAction({buttonText, onCopyPrice}: Props) {
    const [isModalOpen, openModal, closeModal] = useToggle();
    const [isSubmitting, setIsSubmitting, setSubmitted] = useToggle();
    return (
        <>
            <Button
                data-testid="copy-pricing-open-modal-button"
                variant="secondary"
                type="button"
                disabled={isSubmitting}
                onClick={openModal}
            >
                <Icon name="copy" mr={2} />
                {buttonText}
            </Button>
            {isModalOpen && (
                <Modal
                    title={t("pricesModal.copyPrice")}
                    onClose={closeModal}
                    mainButton={{
                        ["data-testid"]: "copy-price-modal-confirm-button",
                        children: t("pricesModal.copyPrice"),
                        onClick: handleSubmit,
                        disabled: isSubmitting,
                    }}
                    secondaryButton={{
                        ["data-testid"]: "copy-price-modal-cancel-button",
                    }}
                    size="large"
                >
                    <Flex style={{gap: "12px"}} flexDirection="column">
                        <Flex
                            style={{gap: "8px"}}
                            alignItems="center"
                            p={3}
                            borderRadius={1}
                            backgroundColor="yellow.ultralight"
                        >
                            <Icon name="warning" color="yellow.dark" />
                            <Text color="yellow.dark">
                                {t("pricesModal.copyModal.body.copyWillOverwriteCurrentPrice")}
                            </Text>
                        </Flex>
                        <Flex style={{gap: "8px"}} alignItems="center">
                            <Icon name="alert" color="yellow.default" />
                            <Text>{t("pricesModal.copyModal.body.willCopyAllLines")}</Text>
                        </Flex>
                        <Flex style={{gap: "8px"}} alignItems="center">
                            <Icon name="checkCircle" color="green.default" />
                            <Text>{t("pricesModal.copyModal.body.canModifyAfterCopy")}</Text>
                        </Flex>
                        <Text>{t("pricesModal.copyModal.body.confirmCopy")}</Text>
                    </Flex>
                </Modal>
            )}
        </>
    );

    function handleSubmit() {
        try {
            setIsSubmitting();
            onCopyPrice();
            closeModal();
        } catch (error) {
            Logger.error(error);
            toast.error(t("common.error"));
        } finally {
            setSubmitted();
        }
    }
}
