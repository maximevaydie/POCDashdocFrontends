import {t} from "@dashdoc/web-core";
import {Box, Callout, DocumentDropzone, Flex, IconButton, Text} from "@dashdoc/web-ui";
import {SecurityProtocolLink} from "features/security-protocol/SecurityProtocolLink";
import React, {useState} from "react";
import {Controller, useFormContext} from "react-hook-form";
import {SecurityProtocol} from "types/securityProtocol";

import {SettingsFormSection} from "../../SettingsFormSection";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MiB

type Props = {
    securityProtocol: SecurityProtocol | null;
};

export function SettingsSiteSecurityProtocolFields({
    securityProtocol: initialSecurityProtocol,
}: Props) {
    const [securityProtocol, setSecurityProtocol] = useState<SecurityProtocol | undefined>(
        initialSecurityProtocol ?? undefined
    );
    const {setValue, trigger} = useFormContext();

    return (
        <SettingsFormSection title={t("common.securityProtocol")} maxWidth="auto">
            <Text color="grey.dark">{t("flow.securityProtocol.formDetails")}</Text>
            <Controller
                name="file"
                render={({field}) => (
                    <Box mt={6}>
                        {securityProtocol ? (
                            <Flex alignItems="center">
                                <SecurityProtocolLink securityProtocol={securityProtocol} />
                                <IconButton
                                    type="button"
                                    onClick={() => {
                                        // revoke the security protocol state and let the dropzone handle the rest
                                        setSecurityProtocol(undefined);
                                        setValue("file", null, {shouldTouch: true});
                                        trigger();
                                    }}
                                    name="bin"
                                    modalProps={{
                                        title: t("components.deleteSecurityProtocol"),
                                        mainButton: {
                                            children: t("common.delete"),
                                        },
                                    }}
                                />
                            </Flex>
                        ) : (
                            <DocumentDropzone
                                {...field}
                                file={field.value}
                                supportedFileFormats={[".pdf", "application/pdf"]}
                                supportedFileFormatsDisplayString={"PDF"}
                                maxFileSize={MAX_FILE_SIZE}
                                onAcceptedFile={(file) => {
                                    setValue("file", file, {shouldTouch: true});
                                    trigger();
                                }}
                                onRemoveFile={() => {
                                    setValue("file", null, {shouldTouch: true});
                                    trigger();
                                }}
                            />
                        )}
                        {(securityProtocol || field.value) && (
                            <Callout mt={2}>{t("flow.securityProtocol.onPublicPage")}</Callout>
                        )}
                    </Box>
                )}
            />
        </SettingsFormSection>
    );
}
