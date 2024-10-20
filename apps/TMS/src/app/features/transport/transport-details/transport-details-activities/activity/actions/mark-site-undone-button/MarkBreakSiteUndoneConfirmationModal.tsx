import {t} from "@dashdoc/web-core";
import {Flex, Icon, Modal, Text} from "@dashdoc/web-ui";
import React, {FC} from "react";

type MarkBreaksSiteUndoneModalProps = {
    onSubmit: () => void;
    onClose: () => void;
    breakIsDone?: boolean;
    resumeIsDone?: boolean;
};

export const MarkBreakSiteUndoneConfirmationModal: FC<MarkBreaksSiteUndoneModalProps> = ({
    onSubmit,
    onClose,
    breakIsDone,
    resumeIsDone,
}) => {
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            await onSubmit();
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal
            title={t("markActivityUndoneModal.changeOfStatus")}
            onClose={onClose}
            mainButton={{
                children: t("markActivityUndoneModal.changeStatus"),
                onClick: handleSubmit,
                severity: "warning",
                disabled: isSubmitting,
            }}
            secondaryButton={{
                children: t("common.cancel"),
            }}
            data-testid="mark-break-undone-modal"
        >
            <Text mb={3}>{t("markActivityUndoneModal.modifyBreakWillRemoveFollowingData")}</Text>

            {breakIsDone && (
                <Flex mb={2}>
                    <Icon name="removeCircle" color="red.dark" mr={1} />
                    <Text>{t("markActivityUndoneModal.dateAndTimeOfBreaking")}</Text>
                </Flex>
            )}

            {resumeIsDone && (
                <Flex>
                    <Icon name="removeCircle" color="red.dark" mr={1} />
                    <Text>{t("markActivityUndoneModal.dateAndTimeOfResuming")}</Text>
                </Flex>
            )}

            <Flex backgroundColor="grey.light" p={3} mt={5}>
                <Flex minWidth="unset" flexDirection="column" pt={1}>
                    <Icon name="info" color="grey.dark" />
                </Flex>
                <Text ml={3}>{t("markActivityUndoneModal.dataNeedToBeRefilled")}</Text>
            </Flex>
        </Modal>
    );
};
