import {apiService} from "@dashdoc/web-common";
import {Logger, queryService, t} from "@dashdoc/web-core";
import {
    Badge,
    BadgeList,
    Box,
    Button,
    ClickableUpdateRegionStyle,
    FiltersAsyncPaginatedSelect,
    FiltersSelectAsyncPaginatedProps,
    Flex,
    IconButton,
    Modal,
    Popover,
    Text,
    toast,
} from "@dashdoc/web-ui";
import {FuelSurchargeAgreementOwnerType} from "dashdoc-utils";
import React, {useCallback, useState} from "react";

import {FuelSurchargeAgreementWithSurchargeItems} from "app/screens/invoicing/hooks/useFuelSurchargeAgreement";

type FuelSurchargeAgreementClientsProps = {
    fuelSurchargeAgreement: FuelSurchargeAgreementWithSurchargeItems;
    onUpdate: (partners: PartnerForFuelSurchargeAgreement[]) => void;
};

export function FuelSurchargeAgreementClients({
    fuelSurchargeAgreement,
    onUpdate,
}: FuelSurchargeAgreementClientsProps) {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const defaultPartners = fuelSurchargeAgreement.clients;
    const isSaleAgreement =
        fuelSurchargeAgreement.owner_type === FuelSurchargeAgreementOwnerType.CARRIER;

    return (
        <Flex flexDirection="column">
            <Flex style={{columnGap: "4px"}} mb="8px">
                <Text variant="h1" color="grey.dark">
                    {t(isSaleAgreement ? "common.shippers" : "common.carriers")}
                </Text>
            </Flex>

            {defaultPartners.length > 0 ? (
                <BadgeList
                    values={defaultPartners.map((partner) => partner.name).slice(0, 5)}
                    isMultiLine={true}
                    showMoreButton={
                        defaultPartners.length > 5 ? (
                            <Popover placement="top">
                                <Popover.Trigger>
                                    <Button variant={"plain"}>
                                        {t("common.seeMore", {
                                            smart_count: defaultPartners.length - 5,
                                        })}
                                    </Button>
                                </Popover.Trigger>
                                <Popover.Content>
                                    <Box overflow="auto" maxHeight="16em" width="400px">
                                        <BadgeList
                                            isMultiLine={true}
                                            values={defaultPartners.map((partner) => partner.name)}
                                        />
                                    </Box>
                                </Popover.Content>
                            </Popover>
                        ) : null
                    }
                    onClick={handleEditClick}
                />
            ) : (
                <Flex onClick={handleEditClick} as={ClickableUpdateRegionStyle}>
                    <Text color="grey.default">
                        {t(
                            isSaleAgreement
                                ? "fuelSurcharges.noShipper"
                                : "fuelSurcharges.noCarrier"
                        )}
                    </Text>
                </Flex>
            )}

            {isEditModalOpen && (
                <EditModal
                    fuelSurchargeAgreement={fuelSurchargeAgreement}
                    onUpdate={onUpdate}
                    onClose={() => setIsEditModalOpen(false)}
                />
            )}
        </Flex>
    );

    function handleEditClick() {
        setIsEditModalOpen(true);
    }
}

type PartnerForFuelSurchargeAgreement = {
    pk: number;
    name: string;
    is_linked_to_another_fuel_surcharge_agreement: boolean;
};

type EditModalProps = {
    fuelSurchargeAgreement: FuelSurchargeAgreementWithSurchargeItems;
    onUpdate: (partners: PartnerForFuelSurchargeAgreement[]) => void;
    onClose: () => void;
};

function EditModal({fuelSurchargeAgreement, onUpdate, onClose}: EditModalProps) {
    const [selectedPartners, setSelectedPartners] = useState<PartnerForFuelSurchargeAgreement[]>(
        fuelSurchargeAgreement.clients.map((client) => ({
            pk: client.pk,
            name: client.name,
            is_linked_to_another_fuel_surcharge_agreement: false,
        }))
    );

    const isSaleAgreement =
        fuelSurchargeAgreement.owner_type === FuelSurchargeAgreementOwnerType.CARRIER;

    const loadOptions: FiltersSelectAsyncPaginatedProps["loadOptions"] = useCallback(
        async (query: string, _: any, {page}: {page: number}) => {
            try {
                const path = `fuel-surcharge-agreements/${fuelSurchargeAgreement.uid}/partners/?${queryService.toQueryString(
                    {
                        query,
                        page,
                        role: isSaleAgreement ? "shipper" : "carrier",
                    }
                )}`;

                const {
                    results,
                    next,
                }: {results: PartnerForFuelSurchargeAgreement[]; next: string} =
                    await apiService.get(path, {
                        apiVersion: "web",
                    });
                return {
                    options: results,
                    hasMore: !!next,
                    additional: {
                        page: page + 1,
                        is_shipper: isSaleAgreement,
                    },
                };
            } catch (error) {
                Logger.error(error);
                toast.error(t("common.error"));
                return {
                    options: [],
                    hasMore: undefined,
                };
            }
        },
        [isSaleAgreement]
    );

    const hasSelectedPartnersLinkedToAnotherFuelSurchargeAgreement = selectedPartners.some(
        (partner) => partner.is_linked_to_another_fuel_surcharge_agreement
    );

    return (
        <Modal
            title={t(
                isSaleAgreement ? "fuelSurcharges.editShippers" : "fuelSurcharges.editCarriers"
            )}
            size="large"
            onClose={onClose}
            mainButton={{
                children: t("common.save"),
                disabled: hasSelectedPartnersLinkedToAnotherFuelSurchargeAgreement,
                onClick: () => {
                    onUpdate(selectedPartners);
                    onClose();
                },
            }}
            secondaryButton={{
                onClick: onClose,
            }}
        >
            <Flex flexDirection="column" css={{rowGap: "1em"}}>
                <Text variant="h2">{t("fuelSurcharges.associatedClients")}</Text>
                <FiltersAsyncPaginatedSelect
                    label={t(
                        isSaleAgreement
                            ? "fuelSurcharges.selectShippers"
                            : "fuelSurcharges.selectCarriers"
                    )}
                    loadOptions={loadOptions}
                    defaultOptions
                    getOptionValue={(partner) => partner.pk}
                    getOptionLabel={(partner) => partner.name}
                    value={selectedPartners}
                    onChange={(partners: PartnerForFuelSurchargeAgreement[]) =>
                        setSelectedPartners(partners)
                    }
                    isMulti={true}
                    autoFocus
                />
                <Flex flexWrap="wrap">
                    {selectedPartners.map((partner) => (
                        <Badge
                            key={`tracking-client-badge-${partner.pk}`}
                            shape="squared"
                            variant={
                                partner.is_linked_to_another_fuel_surcharge_agreement
                                    ? "error"
                                    : "blue"
                            }
                            color="inherit"
                            size="small"
                            mr={2}
                            mb={2}
                        >
                            <Text whiteSpace="pre-wrap" overflowWrap="break-word">
                                {partner.name}
                            </Text>
                            <IconButton
                                name="close"
                                onClick={() => {
                                    setSelectedPartners((partners) =>
                                        partners.filter((p) => p.pk !== partner.pk)
                                    );
                                }}
                                fontSize={0}
                                ml={2}
                            />
                        </Badge>
                    ))}
                </Flex>
                {hasSelectedPartnersLinkedToAnotherFuelSurchargeAgreement && (
                    <Text color="red.default">
                        {t("fuelSurcharges.errorClientWithMultipleFuelSurcharge")}
                    </Text>
                )}
            </Flex>
        </Modal>
    );
}
