import {Logger, t} from "@dashdoc/web-core";
import {AsyncCreatableSelect, Flex, Icon, IconLink, Text} from "@dashdoc/web-ui";
import React, {FC, useState} from "react";
import {components} from "react-select";

import {AddOrUpdatePaymentMethodModal} from "app/taxation/invoicing/features/invoice-settings/payment-methods/AddOrUpdatePaymentMethodModal";
import {PaymentMethodApiService} from "app/taxation/invoicing/services/paymentMethodsApi.service";
import {PaymentMethod} from "app/taxation/invoicing/types/paymentMethods.types";

type PaymentMethodOption = PaymentMethod & {isSuggestion?: boolean};

export const PaymentMethodAsyncCreatableSelect: FC<{
    required?: boolean;
    value: PaymentMethod;
    "data-testid"?: string;
    autoSuggest?: boolean;
    debtorId?: number;
    onChange: (value: PaymentMethod | null) => unknown;
}> = ({required, value, autoSuggest, debtorId, onChange, ...props}) => {
    const [key, setKey] = useState(0);
    const [newPaymentMethod, setNewPaymentMethod] = useState<string | null>(null);

    const searchPaymentMethods = async (input: string): Promise<PaymentMethodOption[]> => {
        const requestPromises: Promise<any>[] = [
            PaymentMethodApiService.getAll({query: {text: input, ordering: "name"}}),
        ];

        if (autoSuggest && debtorId) {
            requestPromises.push(PaymentMethodApiService.autoSuggest(debtorId));
        }

        try {
            const [searchResponse, suggestionResponse] = await Promise.all(requestPromises);
            let items: PaymentMethodOption[] = searchResponse.results;

            const suggestedItem = suggestionResponse?.uid
                ? {...suggestionResponse, isSuggestion: true}
                : null;
            if (suggestedItem) {
                const matchingItemIdx = items.findIndex(({uid}) => uid === suggestedItem.uid);
                if (matchingItemIdx !== -1) {
                    items.splice(matchingItemIdx, 1, suggestedItem);
                } else {
                    items.push(suggestedItem);
                }

                // Only apply the auto suggest when mounting the component
                if (key === 0) {
                    onChange(suggestedItem);
                }
            }

            return items;
        } catch (error) {
            Logger.error(error);
            return [];
        }
    };

    return (
        <>
            <AsyncCreatableSelect<PaymentMethodOption>
                key={key}
                required={required}
                isClearable={true}
                placeholder={t("invoice.selectAPaymentMethod")}
                data-testid={props["data-testid"]}
                label={t("invoice.paymentMethod")}
                defaultOptions={true}
                loadOptions={searchPaymentMethods}
                value={value}
                onChange={onChange}
                getOptionValue={({uid}) => uid}
                getOptionLabel={({name}) => name}
                formatOptionLabel={(paymentMethod, labelMeta) => {
                    if (labelMeta.context === "value") {
                        return (
                            <Flex style={{gap: "8px"}}>
                                {paymentMethod.isSuggestion && (
                                    <Icon name="robot" flexShrink={0} />
                                )}
                                <Text>{paymentMethod.name}</Text>
                            </Flex>
                        );
                    }

                    return (
                        <Flex>
                            <Flex flexDirection="column" width="100%">
                                <Text variant="captionBold">{paymentMethod.name}</Text>
                                <Text variant="caption">{paymentMethod.description}</Text>
                            </Flex>
                            {paymentMethod.isSuggestion && <Icon name="robot" flexShrink={0} />}
                        </Flex>
                    );
                }}
                onCreateOption={setNewPaymentMethod}
                components={{
                    Option: ({children, ...props}) => {
                        // Add new option case
                        if (props.data.__isNew__) {
                            return (
                                <AddPaymentMethodLink
                                    onClickOnAddPaymentMethod={() =>
                                        setNewPaymentMethod(props.data.value)
                                    }
                                />
                            );
                        }

                        // Select existing option case
                        return <components.Option {...props}>{children}</components.Option>;
                    },
                }}
                isValidNewOption={() => true}
            />

            {newPaymentMethod !== null && (
                <AddOrUpdatePaymentMethodModal
                    paymentMethod={{uid: "", name: newPaymentMethod, description: ""}}
                    onClose={() => setNewPaymentMethod(null)}
                    onSubmit={async (data) => {
                        const newPaymentMethod = await PaymentMethodApiService.post({data});
                        onChange(newPaymentMethod);
                        setNewPaymentMethod(null);
                        setKey((prevKey) => prevKey + 1);
                    }}
                />
            )}
        </>
    );
};

const AddPaymentMethodLink = ({
    onClickOnAddPaymentMethod,
}: {
    onClickOnAddPaymentMethod: () => void;
}) => (
    <Flex m={3} flexDirection="column" width="fit-content">
        <IconLink
            text={t("components.addPaymentMethod")}
            iconName="add"
            onClick={onClickOnAddPaymentMethod}
            data-testid="add-payment-method-link"
        />
    </Flex>
);
