import {
    getConnectedCompany,
    updateCompanySettings,
    useDispatch,
    usePaginatedFetch,
    useSelector,
} from "@dashdoc/web-common";
import {Logger, t} from "@dashdoc/web-core";
import {
    Box,
    Button,
    Flex,
    Icon,
    IconButton,
    IconLink,
    Popover,
    SwitchInput,
    Table,
    Text,
    toast,
} from "@dashdoc/web-ui";
import {useToggle} from "dashdoc-utils";
import React, {useState} from "react";

import {AddOrUpdatePaymentMethodModal} from "app/taxation/invoicing/features/invoice-settings/payment-methods/AddOrUpdatePaymentMethodModal";
import {PaymentMethodApiService} from "app/taxation/invoicing/services/paymentMethodsApi.service";
import {PaymentMethod} from "app/taxation/invoicing/types/paymentMethods.types";

type PaymentMethodColumnName = "name" | "description" | "actions";

export function PaymentMethodsTab() {
    const dispatch = useDispatch();
    const company = useSelector(getConnectedCompany);
    const hasInvoicePaymentSettingEnabled = company?.settings
        ? (company.settings.invoice_payment ?? true)
        : false;

    const [isUpdatingInvoicePaymentSetting, setIsUpdatingInvoicePaymentSetting] = useState(false);

    const {
        items: paymentMethods,
        hasNext,
        isLoading,
        loadNext,
        reload,
    } = usePaginatedFetch<PaymentMethod>(
        "payment-methods/",
        {ordering: "name"},
        {apiVersion: "web"}
    );

    const [paymentMethodToEdit, setPaymentMethodToEdit] = React.useState<
        PaymentMethod | undefined
    >();

    const [
        showAddOrUpdatePaymentMethodModal,
        openAddOrUpdatePaymentMethodModal,
        closeAddOrUpdatePaymentMethodModal,
    ] = useToggle();

    const paymentMethodColumns = [
        {width: "auto", getLabel: () => t("common.name"), name: "name"},
        {
            width: "auto",
            getLabel: () => t("common.description"),
            name: "description",
        },
        {
            width: "auto",
            getLabel: () => "",
            name: "actions",
        },
    ];

    const getRowCellContent = (
        paymentMethod: PaymentMethod,
        columnName: PaymentMethodColumnName
    ) => {
        switch (columnName) {
            case "name":
                return (
                    <Flex alignItems={"center"}>
                        <Text>{paymentMethod.name}</Text>
                    </Flex>
                );
            case "description":
                return (
                    <Flex alignItems={"center"}>
                        <Text>{paymentMethod.description}</Text>
                    </Flex>
                );
            case "actions":
                return (
                    <Flex justifyContent={"flex-end"} alignItems={"center"}>
                        <Popover>
                            <Popover.Trigger>
                                <IconButton name="moreActions" />
                            </Popover.Trigger>
                            <Popover.Content>
                                <Button
                                    onClick={() => {
                                        setPaymentMethodToEdit(paymentMethod);
                                        openAddOrUpdatePaymentMethodModal();
                                    }}
                                    variant="plain"
                                    data-testid="edit-payment-method"
                                    width="100%"
                                    justifyContent={"flex-start"}
                                >
                                    <Icon name="edit" mr={2} />
                                    {t("common.edit")}
                                </Button>
                                <Button
                                    onClick={async () => {
                                        await PaymentMethodApiService.delete(paymentMethod.uid);
                                        reload();
                                    }}
                                    variant="plain"
                                    severity="danger"
                                    data-testid="delete-payment-method"
                                    width={"100%"}
                                    justifyContent={"flex-start"}
                                >
                                    <Icon name="delete" mr={2} />
                                    {t("common.delete")}
                                </Button>
                            </Popover.Content>
                        </Popover>
                    </Flex>
                );
        }
    };

    return (
        <Box mt={5}>
            <Text variant="h2">{t("components.advancedPayment")}</Text>
            <Text variant="body" my={3}>
                {t("components.activatingAdvancedPaymentInfo")}
            </Text>
            <SwitchInput
                disabled={isUpdatingInvoicePaymentSetting}
                labelRight={t("components.enableAdvancedPayment")}
                value={hasInvoicePaymentSettingEnabled}
                onChange={updateInvoicePaymentSetting}
            />
            {hasInvoicePaymentSettingEnabled && (
                <>
                    <Flex alignItems={"center"} mt={5}>
                        <Text variant="h2">{t("components.paymentMethods")}</Text>
                        <Button
                            onClick={() => openAddOrUpdatePaymentMethodModal()}
                            variant="secondary"
                            ml="auto"
                            data-testid="add-payment-method"
                        >
                            <Icon name="add" mr={2} color="blue.default" />
                            {t("components.addPaymentMethod")}
                        </Button>
                    </Flex>
                    <Table
                        mt={3}
                        height="auto"
                        flexGrow={1}
                        columns={paymentMethodColumns}
                        rows={paymentMethods}
                        getRowId={(paymentMethod) => paymentMethod.uid}
                        getRowTestId={(paymentMethod) => `payment-method-${paymentMethod.name}`}
                        getRowKey={(paymentMethod) => paymentMethod.uid}
                        getRowCellContent={getRowCellContent}
                        isLoading={isLoading}
                        hasNextPage={hasNext}
                        onEndReached={() => {
                            hasNext && loadNext();
                        }}
                        ListEmptyComponent={() => (
                            <EmptyPaymentMethodsList
                                onClickOnAddPaymentMethod={openAddOrUpdatePaymentMethodModal}
                            />
                        )}
                        data-testid="payment-methods-table"
                    />
                </>
            )}

            {showAddOrUpdatePaymentMethodModal && (
                <AddOrUpdatePaymentMethodModal
                    paymentMethod={paymentMethodToEdit}
                    onClose={() => {
                        closeAddOrUpdatePaymentMethodModal();
                        setPaymentMethodToEdit(undefined);
                    }}
                    onSubmit={async (data) => {
                        if (paymentMethodToEdit) {
                            await PaymentMethodApiService.patch(paymentMethodToEdit.uid, {data});
                            setPaymentMethodToEdit(undefined);
                        } else {
                            await PaymentMethodApiService.post({data});
                        }
                        closeAddOrUpdatePaymentMethodModal();
                        reload();
                    }}
                />
            )}
        </Box>
    );

    async function updateInvoicePaymentSetting(value: boolean) {
        if (!company) {
            Logger.error("Can't update invoice payment setting without a company");
            toast.error(t("common.error"));
            return;
        }
        setIsUpdatingInvoicePaymentSetting(true);
        await dispatch(
            updateCompanySettings({
                companyId: company.pk,
                settings: {
                    invoice_payment: value,
                },
            })
        );
        setIsUpdatingInvoicePaymentSetting(false);
    }
}

const EmptyPaymentMethodsList = ({
    onClickOnAddPaymentMethod,
}: {
    onClickOnAddPaymentMethod: () => void;
}) => (
    <Flex alignItems={"center"} my={8} flexDirection="column">
        <Text variant="h1" color="grey.dark">
            {t("components.noPaymentMethods")}
        </Text>
        <IconLink
            text={t("components.addPaymentMethod")}
            iconName="add"
            onClick={onClickOnAddPaymentMethod}
            data-testid="add-payment-method-link"
        />
    </Flex>
);
