import {TemplatePickerWrapper} from "@dashdoc/frontend/src/app/features/transport/transport-form/templates-lines/templates/TemplatePicker";
import {
    PartnerDetailOutput,
    getConnectedManager,
    managerService,
    useFeatureFlag,
} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Box, Button, Card, Flex, Icon, MultipleActionsButton, Text} from "@dashdoc/web-ui";
import {Address, Company} from "dashdoc-utils";
import React from "react";
import {useHistory} from "react-router";

import {useSelector} from "app/redux/hooks";

import {ShipperOnlyDecorator} from "../ShipperOnlyDecorator";

type Props = {
    company: Company | PartnerDetailOutput;
};

export function TemplateTab({company}: Props) {
    const history = useHistory();
    const connectedManager = useSelector(getConnectedManager);
    const hasBetterCompanyRoles = useFeatureFlag("betterCompanyRoles");

    return (
        <Card p={4}>
            <Box width="70%">
                <Flex justifyContent="space-between" mb={2}>
                    <Flex alignItems="center">
                        <Text variant="title">{t("transportTemplates.templateListTitle")}</Text>
                        <ShipperOnlyDecorator company={company} />
                    </Flex>
                    {managerService.hasAtLeastUserRole(connectedManager) && (
                        <AddNewTemplateButton
                            handleCreateTransportTemplate={handleCreateTransportTemplate}
                        />
                    )}
                </Flex>
                <TemplatePickerWrapper shipperCompanyPk={company.pk} />
            </Box>
        </Card>
    );

    function handleCreateTransportTemplate(isComplex?: boolean) {
        let path = `/app/transport-templates/new`;

        if (hasBetterCompanyRoles) {
            const partner = company as PartnerDetailOutput;
            path += `?shipperPk=${partner.pk}`;
        } else {
            const shipperAddress = (company as Company).addresses
                ?.filter((address) => !!address.is_shipper)
                ?.sort(
                    (addressA, addressB) =>
                        _getAddressLastUsedShipperOr0(addressA) -
                        _getAddressLastUsedShipperOr0(addressB)
                )
                ?.shift();
            if (shipperAddress) {
                path += `?shipperAddressPk=${shipperAddress.pk}`;
            }
        }
        if (isComplex) {
            path += `&complex=true`;
        }
        history.push(path);
    }

    function _getAddressLastUsedShipperOr0(address: Address) {
        if (!address.last_used_shipper) {
            return 0;
        }
        return new Date(address.last_used_shipper).getTime();
    }
}

function AddNewTemplateButton({
    handleCreateTransportTemplate,
}: {
    handleCreateTransportTemplate: (isComplex?: boolean) => void;
}) {
    return (
        <Flex>
            <Button
                variant="secondary"
                onClick={() => handleCreateTransportTemplate()}
                data-testid="add-new-template"
            >
                <Icon name="add" mr={3} />
                {t("transportTemplates.newTemplateButtonLabel")}
            </Button>
            <MultipleActionsButton
                ButtonComponent={({onClick}: {onClick: () => void}) => (
                    <Button
                        height="100%"
                        padding={1}
                        variant="secondary"
                        onClick={onClick}
                        data-testid="add-new-multi-point-template"
                    >
                        <Icon name="arrowDown" lineHeight={1} m={0} />
                    </Button>
                )}
                options={[
                    {
                        name: t("transportTemplates.newMultipointTemplateButtonLabel"),
                        onClick: () => handleCreateTransportTemplate(true),
                        testId: "add-new-template-options",
                    },
                ]}
            />
        </Flex>
    );
}
