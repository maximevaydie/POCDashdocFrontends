import {t} from "@dashdoc/web-core";
import {Modal, Icon, Text, Box, Callout, Flex} from "@dashdoc/web-ui";
import React, {FC} from "react";

type DisableTruckerConfirmationModalProps = {
    truckerDisplayName: string;
    onSubmit: () => void;
    onClose: () => void;
};

export const DisableTruckerConfirmationModal: FC<DisableTruckerConfirmationModalProps> = ({
    truckerDisplayName,
    onSubmit,
    onClose,
}) => {
    return (
        <Modal
            title={t("components.disableTruckerModalTitle", {truckerName: truckerDisplayName})}
            onClose={onClose}
            mainButton={{
                onClick: () => {
                    onClose();
                    onSubmit();
                },
                children: t("components.disableTrucker"),
                type: "submit",
                form: "disable-trucker-confirmation",
                severity: "warning",
            }}
            secondaryButton={{
                children: t("common.cancel"),
                type: "button",
            }}
            data-testid="mark-site-undone-confirmation-modal"
        >
            <Flex flexDirection="column">
                <Callout variant="warning">
                    <Text>
                        {t("components.disableTruckerModalYouAreGoingToDisableThisTrucker")}
                    </Text>
                </Callout>

                <Box mt={5}>
                    <Text mb={3}>{t("components.disableTruckerModalByValidatingThisAction")}</Text>
                    <Flex alignItems="baseline">
                        <Icon name="removeCircle" color="red.dark" mr={1} />
                        <Text>
                            {t(
                                "components.disableTruckerModalTheTruckerWillBeLogoutOfTheMobileApp"
                            )}
                        </Text>
                    </Flex>
                    <Flex mt={2} alignItems="baseline">
                        <Icon name="removeCircle" color="red.dark" mr={1} />
                        <Text>{t("components.disableTruckerModalNoMoreMissions")}</Text>
                    </Flex>
                    <Flex mt={2} alignItems="baseline">
                        <Icon name="checkCircle" color="green.dark" mr={1} />
                        <Text>{t("components.disableTruckerModalHistoryKept")}</Text>
                    </Flex>
                </Box>
            </Flex>
        </Modal>
    );
};
