import {apiService} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Box, Flex, Icon, IconButton, Modal, Text} from "@dashdoc/web-ui";
import {Callout} from "@dashdoc/web-ui";
import {formatDate, NewSignatory} from "dashdoc-utils";
import React, {useCallback, useEffect, useState} from "react";

import {getAddressSignatories} from "./query";

const SignatoryRow = ({
    originalAddressId,
    signatory,
    onEdit,
    onDelete,
}: {
    originalAddressId: number;
    signatory: NewSignatory;
    onEdit?: (signatory: NewSignatory) => void;
    onDelete?: (signatory: NewSignatory) => void;
}) => {
    return (
        <Flex mt="1">
            <Flex flex={1} mb={2} flexDirection="column">
                <Box>
                    <Text fontWeight="bold">
                        <Icon name="user" mr={2} />
                        {signatory.first_name} {signatory.last_name}
                    </Text>
                </Box>
                <Box>
                    <Icon name="envelope" mr={2} />
                    {signatory.email || "-"}
                </Box>
                <Box>
                    <Icon name="phone" mr={2} />
                    {signatory.phone_number || "-"}
                </Box>
            </Flex>
            <Flex flex={1} flexDirection="column">
                <Flex>
                    <Text mr={2}>{t("signatories.latestSignatureDate")}</Text>
                    <Text>
                        {signatory.latest_signature
                            ? formatDate(signatory.latest_signature, "P")
                            : "-"}
                    </Text>
                </Flex>
                <Flex>
                    <Text mr={2}>{t("signatories.numberOfSignatures")}</Text>
                    <Text>
                        {/*
// @ts-ignore */}
                        {signatory.address_data[originalAddressId]?.signature_count || "-"}
                    </Text>
                </Flex>
            </Flex>
            <Flex flexDirection="column">
                <Flex justifyContent="flex-end">
                    {onEdit && (
                        <Box>
                            <IconButton
                                name="edit"
                                onClick={() => {
                                    onEdit(signatory);
                                }}
                            ></IconButton>
                        </Box>
                    )}
                    {onDelete && (
                        <Box>
                            <IconButton
                                name="delete"
                                onClick={async () => {
                                    await apiService.TransportSignatories.delete(
                                        signatory.uid,
                                        undefined,
                                        {apiVersion: "web"}
                                    );
                                    onDelete(signatory);
                                }}
                                withConfirmation
                                confirmationMessage={t("signatories.confirmDeleteSignatories")}
                            ></IconButton>
                        </Box>
                    )}
                </Flex>
            </Flex>
        </Flex>
    );
};

type SignatoryListProps = {
    originalAddressId: number;
    addressName: string;
    onClose: () => void;
    onEditSignatory: (signatory: NewSignatory) => void;
};

type LoadingState = "still" | "loading" | "error";

export const ListSignatoriesModal = ({
    originalAddressId,
    addressName,
    onClose,
    onEditSignatory,
}: SignatoryListProps) => {
    const [signatories, setSignatories] = useState<NewSignatory[]>([]);
    const [loadingState, setLoadingState] = useState<LoadingState>("still");

    const getAllSignatories = useCallback(async () => {
        try {
            setLoadingState("loading");
            setSignatories(await getAddressSignatories(originalAddressId));
            setLoadingState("still");
        } catch (error) {
            setLoadingState("error");
        }
    }, [originalAddressId, setSignatories]);

    useEffect(() => {
        getAllSignatories();
    }, []);

    return (
        <Modal
            title={t("signatories.signatoriesAtAddress", {address: addressName})}
            mainButton={null}
            secondaryButton={null}
            onClose={onClose}
        >
            <Text>{t("signatories.addressModalHeader")}</Text>
            <Callout pt={4} pb={4}>
                {t("signatories.addressModalHeaderCaption")}
            </Callout>
            <Box>
                {loadingState === "still"
                    ? signatories.map((signatory) => {
                          return (
                              <SignatoryRow
                                  key={signatory.uid}
                                  originalAddressId={originalAddressId}
                                  signatory={signatory}
                                  onEdit={onEditSignatory}
                                  onDelete={getAllSignatories}
                              />
                          );
                      })
                    : loadingState === "loading"
                      ? t("common.loading")
                      : t("common.error")}
            </Box>
        </Modal>
    );
};
