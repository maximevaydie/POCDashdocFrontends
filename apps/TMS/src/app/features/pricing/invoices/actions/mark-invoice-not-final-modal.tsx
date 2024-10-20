import {t} from "@dashdoc/web-core";
import {Flex, Icon, Modal, Text} from "@dashdoc/web-ui";
import React from "react";

type MarkInvoiceNotFinalModal = {
    onSubmit: () => void;
    onClose: () => void;
};

const MarkInvoiceNotFinalModal: React.VFC<MarkInvoiceNotFinalModal> = ({onClose, onSubmit}) => {
    return (
        <Modal
            title={t("invoice.markNotFinal")}
            onClose={onClose}
            mainButton={{
                children: t("invoice.markNotFinal"),
                severity: "danger",
                onClick: onSubmit,
            }}
        >
            <Text>{t("invoice.markNotFinalConfirmHeaderMessage")}</Text>

            <Flex alignItems="center" backgroundColor="red.ultralight" p={2} my={2}>
                <Icon
                    name="warning"
                    color="red.default"
                    round
                    backgroundColor="red.ultralight"
                    mr={2}
                />
                <Text>{t("invoice.markNotFinalConfirmBodyMessage")}</Text>
            </Flex>
            <Text>{t("invoice.markNotFinalConfirmFooterMessage")}</Text>
        </Modal>
    );
};

export default MarkInvoiceNotFinalModal;
