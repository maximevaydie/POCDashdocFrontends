import {SearchInput} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Box, Checkbox, Modal} from "@dashdoc/web-ui";
import React, {useCallback, useState} from "react";

type Product = {
    id: number;
    name: string;
    prices: Record<string, number>;
    checked: boolean;
    billing_frequency: string;
    quantity: number;
    discount: number;
    price: number;
    recurring: boolean;
};

type LineItemsProps = {
    products: Array<Product>;
    billingFrequencyOptions: {};
    onClose: () => void;
    onSubmitLineItems: (products: Array<Product>) => void;
};

export function AddLineItemsModal({
    products,
    billingFrequencyOptions,
    onClose,
    onSubmitLineItems,
}: LineItemsProps) {
    const [baseProductList, setBaseProductList] = useState(products);
    const [selectedProducts, setSelectedProducts] = useState(products);

    const doSearch = useCallback(
        (value: string) => {
            setSelectedProducts(
                baseProductList.filter((product) =>
                    product.name.toLowerCase().includes(value.toLowerCase())
                )
            );
        },
        [baseProductList]
    );

    const handleProductChange = (id: number, checked: boolean) => {
        const quantity = 1;
        const discount = 0;
        const updatedProducts = baseProductList.map((product) => {
            const billingFrequency = product.recurring
                ? Object.keys(billingFrequencyOptions)[0]
                : "one_time";
            const price = product.prices[billingFrequency];
            return product.id === id
                ? {
                      ...product,
                      checked,
                      billing_frequency: billingFrequency,
                      quantity,
                      discount,
                      price,
                  }
                : product;
        });
        setSelectedProducts(updatedProducts);
        setBaseProductList(updatedProducts);
    };

    const handleSubmit = () => {
        onSubmitLineItems(selectedProducts);
        onClose();
    };

    return (
        <Modal
            title={"Add Item-list"}
            data-testid="add-line-items"
            onClose={onClose}
            mainButton={{
                children: "Save",
                onClick: handleSubmit,
            }}
            secondaryButton={{
                children: "Cancel",
                onClick: onClose,
            }}
            size="medium"
        >
            <Box>
                <SearchInput
                    width={0.5}
                    onSubmit={doSearch}
                    placeholder={t("components.searchByExportName")}
                    data-testid="settings-exports-search"
                    flexWrap="wrap"
                    hideSubmitButton
                    onChange={doSearch}
                    mb={4}
                />
                {selectedProducts.map((item) => (
                    <Box key={item.id}>
                        <Checkbox
                            label={item.name}
                            checked={item.checked ? item.checked : false}
                            onChange={(checked) => handleProductChange(item.id, checked)}
                        />
                    </Box>
                ))}
            </Box>
        </Modal>
    );
}
