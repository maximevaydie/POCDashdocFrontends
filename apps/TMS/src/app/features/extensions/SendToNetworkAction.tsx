import {ApiModels} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Box, ClickableFlex, Icon, Text} from "@dashdoc/web-ui";
import {useToggle} from "dashdoc-utils";
import React from "react";

import {SendToNetworkModal} from "app/features/extensions/SendToNetworkModal";

type Props = {
    extension: ApiModels.Extensions.ShortExtension;
    tripUid: string;
    disabled: boolean;
    onClose: () => void;
    onSentToNetwork: () => void;
};

export function SendToNetworkAction({
    extension,
    tripUid,
    disabled,
    onClose,
    onSentToNetwork,
}: Props) {
    const [isModalOpen, openModal, closeModal] = useToggle();

    return (
        <>
            <ClickableFlex
                p={3}
                onClick={disabled ? () => {} : openModal}
                data-testid="extension-trigger-send-to-network-button"
                disabled={disabled}
            >
                <Icon name="transfer" mr={3} />
                <Box>
                    <Text color={disabled ? "grey.default" : "inherit"}>
                        {t("extensions.triggers.trip_send_to_network_button", {
                            name: extension.name,
                        })}
                    </Text>
                </Box>
            </ClickableFlex>

            {isModalOpen && (
                <SendToNetworkModal
                    onClose={() => {
                        closeModal();
                        onClose();
                    }}
                    onSentToNetwork={onSentToNetwork}
                    extension={extension}
                    tripUid={tripUid}
                />
            )}
        </>
    );
}
