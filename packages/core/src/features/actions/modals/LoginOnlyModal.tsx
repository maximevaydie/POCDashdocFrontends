import {ProductLogo, authService} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Box, Flex, Modal} from "@dashdoc/web-ui";
import React from "react";

import {LoginOnlyForm} from "../forms/LoginOnlyForm";

export function LoginOnlyModal({onClose, onSubmit}: {onClose: () => void; onSubmit: () => void}) {
    return (
        <Modal title={t("common.login")} onClose={onClose} size="medium" mainButton={null}>
            <Flex flexDirection="column" flex={1} alignItems="center">
                <ProductLogo />
                <Box px={8} py={4} width="100%">
                    <LoginOnlyForm onSubmit={submit} />
                </Box>
            </Flex>
        </Modal>
    );

    async function submit(payload: {username: string; password: string}): Promise<void> {
        await authService.loginByForm(payload);
        onSubmit();
    }
}
