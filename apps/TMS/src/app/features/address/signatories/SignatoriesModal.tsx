import {t} from "@dashdoc/web-core";
import {Box, Flex, Icon, Select, Text, toast} from "@dashdoc/web-ui";
import {theme} from "@dashdoc/web-ui";
import {formatDate, NewSignatory} from "dashdoc-utils";
import {CountryCode} from "dashdoc-utils";
import React, {useCallback, useEffect, useState} from "react";

import {ListSignatoriesModal} from "./list-modal";
import {getAddressSignatories} from "./query";
import {UpdateOrCreateSignatoryModal} from "./update-or-create-modal";

export const SignatoriesSelect = ({
    addressPk,
    siteUID,
    signatory,
    setSignatory,
}: {
    addressPk: number;
    siteUID: string;
    signatory: NewSignatory | null;
    setSignatory: (signatory: NewSignatory | null) => void;
}) => {
    const [signatoryList, setSignatoryList] = useState<NewSignatory[]>([]);

    const getSignatories = useCallback(async () => {
        try {
            const signatories = await getAddressSignatories(addressPk, siteUID, false);
            const atThisAddress = signatories.filter(
                (_signatory) => _signatory.address_data?.[addressPk]?.awaiting_signature
            );
            setSignatoryList(signatories);
            if (atThisAddress.length) {
                const [signatory] = atThisAddress;
                setSignatory(signatory);
            }
        } catch (error) {
            toast.error(t("common.error"));
        }
    }, [addressPk]);

    useEffect(() => {
        setSignatory(null);
        getSignatories();
    }, [addressPk]);

    return (
        <Select
            label={t("signatories.signatory")}
            data-testid={"signatory-select"}
            value={signatory}
            placeholder={t("signatories.selectASignatory")}
            options={signatoryList}
            getOptionValue={({uid}) => uid}
            getOptionLabel={(signatory) =>
                t("signatories.selectLabel", {
                    ...signatory,
                    signature_count: signatory?.address_data?.[addressPk]?.signature_count || 0,
                    signature_date: formatDate(signatory?.latest_signature, "P"),
                })
            }
            formatOptionLabel={(signatory) => {
                return (
                    <Flex flexDirection="column" width="100%">
                        <Text color="inherit">
                            {signatory.uid
                                ? signatory?.latest_signature
                                    ? t("signatories.selectLabel", {
                                          ...signatory,
                                          signature_count:
                                              signatory?.address_data?.[addressPk]
                                                  ?.signature_count || 0,
                                          signature_date: formatDate(
                                              signatory?.latest_signature,
                                              "P"
                                          ),
                                      })
                                    : `${signatory.first_name} ${signatory.last_name} (${t(
                                          "signatories.signatoryNeverSigned"
                                      )})`
                                : `${signatory.first_name} ${signatory.last_name} (${t(
                                      "signatories.unsaved"
                                  )})`}
                        </Text>

                        <Flex>
                            <Box flex={1}>
                                <Text ellipsis>
                                    <Icon name="envelope" mr={2} />
                                    {signatory.email || "-"}
                                </Text>
                            </Box>
                            <Box flex={1}>
                                <Text ellipsis>
                                    <Icon name="phone" mr={2} />
                                    {signatory.phone_number || "-"}
                                </Text>
                            </Box>
                        </Flex>
                    </Flex>
                );
            }}
            onChange={async (newSignatory: NewSignatory) => {
                setSignatory(newSignatory);
            }}
            styles={{
                valueContainer: (provided, {selectProps: {label}}) => ({
                    ...provided,
                    height: label ? "5em" : "4em",
                }),
                singleValue: (provided, {selectProps: {label, value}}) => ({
                    ...provided,
                    ...(label && {top: "30%", width: "100%"}),
                    ...(!(value as NewSignatory).uid && {color: theme.colors.yellow.dark}),
                }),
                menu: (provided) => ({
                    ...provided,
                    maxHeight: "400px",
                }),
            }}
        />
    );
};

type SignatoryModalProps = {
    originalAddressId: number;
    addressName: string;
    country?: CountryCode;
    onClose: () => void;
};

export function SignatoriesModal({
    originalAddressId,
    addressName,
    onClose,
    country,
}: SignatoryModalProps) {
    const [isAdding, setIsAdding] = useState(false);
    // @ts-ignore
    const [editedSignatory, setEditedSignatory] = useState<NewSignatory>(null);

    if (isAdding) {
        return (
            <UpdateOrCreateSignatoryModal
                onCancel={() => {
                    setIsAdding(false);
                }}
                onConfirm={() => {
                    setIsAdding(false);
                }}
                country={country}
            />
        );
    } else if (editedSignatory) {
        return (
            <UpdateOrCreateSignatoryModal
                onCancel={() => {
                    // @ts-ignore
                    setEditedSignatory(null);
                }}
                onConfirm={() => {
                    // @ts-ignore
                    setEditedSignatory(null);
                }}
                signatory={editedSignatory}
                country={country}
            />
        );
    } else {
        return (
            <ListSignatoriesModal
                originalAddressId={originalAddressId}
                addressName={addressName}
                onClose={onClose}
                onEditSignatory={(signatory) => {
                    setEditedSignatory(signatory);
                }}
            />
        );
    }
}
