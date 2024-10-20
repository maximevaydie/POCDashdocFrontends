import {Flex, NumberInput, Select, Table, Text} from "@dashdoc/web-ui";
import {formatNumber} from "dashdoc-utils";
import React, {useCallback, useEffect, useState} from "react";

const columns = [
    {name: "name", label: "Name"},
    {name: "billing", label: "Billing Frequency"},
    {name: "price", label: "Price"},
    {name: "quantity", label: "Quantity"},
    {name: "discount", label: "Discount(%)"},
];

type Product = {
    id: number;
    name: string;
    prices: Record<string, number>;
    checked: boolean;
    billing_frequency: string;
    quantity: number;
    discount: number;
    name_translation_key: string;
    description_translation_key: string;
    price: number;
    recurring: boolean;
};

type Option = {
    label: string;
    value: string;
};

type LineItemsProps = {
    products: Array<Product>;
    billingFreqOptions: Option[];
    onGlobalDiscountChange: (discount: number) => void;
    onLineItemsChange: (updatedProducts: Array<Product>) => void;
    onTotalChange: (total: number, subtotalRecurring: number, subtotalOneTime: number) => void;
};

export function LineItemsTable({
    products,
    billingFreqOptions,
    onGlobalDiscountChange,
    onLineItemsChange,
    onTotalChange,
}: LineItemsProps) {
    const [selectedProducts, setSelectedProducts] = useState(products);
    const [subtotalRecurring, setSubtotalRecurring] = useState(0);
    const [subtotalOneTime, setSubtotalOneTime] = useState(0);
    const [total, setTotal] = useState(0);
    const [globalDiscount, setGlobalDiscount] = useState(0);
    const [defaultBillingFreq, setDefaultBillingFreq] = useState("monthly");

    useEffect(() => {
        setSelectedProducts(products);
    }, [products]);

    const calculateSubtotalAndTotal = useCallback((products: Array<Product>, discount: number) => {
        let recurringSubtotal = 0;
        let oneTimeSubtotal = 0;

        products.forEach((product) => {
            if (product.checked) {
                const price = product.prices[product.billing_frequency];
                const discountedPrice = price * (1 - product.discount / 100);
                const productTotal = discountedPrice * product.quantity;

                if (product.billing_frequency === "one_time") {
                    oneTimeSubtotal += productTotal;
                } else {
                    recurringSubtotal += productTotal;
                }
            }
        });

        const newTotal = (recurringSubtotal + oneTimeSubtotal) * (1 - discount / 100);

        setSubtotalRecurring(parseFloat(recurringSubtotal.toFixed(2)));
        setSubtotalOneTime(parseFloat(oneTimeSubtotal.toFixed(2)));
        setTotal(parseFloat(newTotal.toFixed(2)));
    }, []);

    useEffect(() => {
        calculateSubtotalAndTotal(selectedProducts, globalDiscount);
    }, [selectedProducts, globalDiscount, calculateSubtotalAndTotal]);

    useEffect(() => {
        onTotalChange(total, subtotalRecurring, subtotalOneTime);
    }, [total, onTotalChange, subtotalRecurring, subtotalOneTime]);

    const handleLineItemsChange = useCallback(
        (
            id: number,
            billingFrequency: string,
            quantity: number,
            discount: number,
            price: number
        ) => {
            const updatedProducts = selectedProducts.map((product) => {
                if (product.recurring && billingFrequency == "one_time") {
                    billingFrequency = defaultBillingFreq;
                }
                const new_billing = product.recurring ? billingFrequency : "one_time";
                price = product.prices[new_billing];
                if (product.id === id) {
                    if (product.recurring) {
                        setDefaultBillingFreq(billingFrequency);
                    }
                    return {
                        ...product,
                        billing_frequency: new_billing,
                        quantity,
                        discount,
                        price,
                    };
                }
                return {...product, billing_frequency: new_billing};
            });
            setSelectedProducts(updatedProducts);
            onLineItemsChange(updatedProducts);
        },
        [selectedProducts, onLineItemsChange, defaultBillingFreq]
    );

    const handleGlobalDiscountChange = useCallback(
        (discount: number) => {
            setGlobalDiscount(discount);
            onGlobalDiscountChange(discount);
        },
        [onGlobalDiscountChange]
    );

    const getRowCellContent = (
        row: Product,
        columnName: "name" | "billing" | "price" | "quantity" | "discount"
    ) => {
        if (columnName === "name") {
            return <Text>{row.name}</Text>;
        }
        if (columnName === "billing") {
            return (
                <Select
                    options={billingFreqOptions}
                    value={billingFreqOptions.find(
                        (option) => option.value === row.billing_frequency
                    )}
                    onChange={(e: Option) =>
                        handleLineItemsChange(
                            row.id,
                            e.value,
                            row.quantity,
                            row.discount,
                            row.prices[e.value]
                        )
                    }
                    required
                    isClearable={false}
                    isDisabled={!row.recurring}
                />
            );
        }
        if (columnName === "price") {
            return (
                <Text>
                    {formatNumber(row.prices[row.billing_frequency], {
                        style: "currency",
                        currency: "EUR",
                        maximumFractionDigits: 2,
                    })}
                </Text>
            );
        }
        if (columnName === "quantity") {
            return (
                <NumberInput
                    min={0}
                    value={row.quantity}
                    onChange={(value) =>
                        handleLineItemsChange(
                            row.id,
                            row.billing_frequency,
                            value || 0,
                            row.discount,
                            row.prices[row.billing_frequency]
                        )
                    }
                />
            );
        }
        if (columnName === "discount") {
            return (
                <NumberInput
                    min={0}
                    max={100}
                    value={row.discount}
                    onChange={(value) =>
                        handleLineItemsChange(
                            row.id,
                            row.billing_frequency,
                            row.quantity,
                            value || 0,
                            row.prices[row.billing_frequency]
                        )
                    }
                />
            );
        }
        return <Text>{row[columnName]}</Text>;
    };

    return (
        <>
            <Table
                overflow="initial"
                columns={columns}
                rows={selectedProducts.filter((product) => product.checked)}
                getRowCellContent={getRowCellContent}
                withSelectableRows={true}
                mb={4}
            />
            <Text variant="h2" pb={3}>
                Recurring Subtotal:{" "}
                {formatNumber(subtotalRecurring, {
                    style: "currency",
                    currency: "EUR",
                    maximumFractionDigits: 2,
                })}
            </Text>
            <Text variant="h2" pb={3}>
                One-Time Subtotal:{" "}
                {formatNumber(subtotalOneTime, {
                    style: "currency",
                    currency: "EUR",
                    maximumFractionDigits: 2,
                })}
            </Text>
            <Flex alignItems="center" pb={3}>
                <Text variant="h2" mr={3}>
                    Global discount (%):
                </Text>
                <NumberInput
                    min={0}
                    max={100}
                    value={globalDiscount}
                    onChange={(value) => handleGlobalDiscountChange(value || 0)}
                />
            </Flex>
            <Text variant="h2" pb={3}>
                Total:{" "}
                {formatNumber(total, {
                    style: "currency",
                    currency: "EUR",
                    maximumFractionDigits: 2,
                })}
            </Text>
        </>
    );
}
