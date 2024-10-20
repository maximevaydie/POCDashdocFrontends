import {getErrorMessagesFromServerError} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Button, ErrorMessage, Flex, LoadingWheel} from "@dashdoc/web-ui";
import {zodResolver} from "@hookform/resolvers/zod";
import {useToggle} from "dashdoc-utils";
import React, {useCallback, useState} from "react";
import {FormProvider, useForm} from "react-hook-form";
import {z} from "zod";

import {AddLineItemsModal} from "moderation/components/quote-creation/AddLineItemsModal";
import {LineItemsTable} from "moderation/components/quote-creation/LineItemsTable";
import {QuoteDetailsForm} from "moderation/components/quote-creation/QuoteDetailsForm";

import {Api} from "../../Api";

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
    plan: string;
};

type ModerationQuoteProps = {
    products: Array<Product>;
    languages: string;
    deal_id: string;
    name: string;
    company_id: string;
    quote_name: string;
    contact: string;
    date: string;
    exp_date: string;
    billing_frequency_options: string;
    terms_conditions_type: string;
    country: string;
    project_manager: string;
};

type Option = {
    label: string;
    value: string;
};

type Props = {
    quote: ModerationQuoteProps;
};

export function ModerationQuoteForm({quote}: Props) {
    const languageOptions = mapJsonToSelectOptions(quote.languages);
    const contactOptions = quote.contact ? mapJsonToSelectOptions(quote.contact) : [];
    const billingFreqOptions = mapJsonToSelectOptions(quote.billing_frequency_options);
    const termsOptions = mapJsonToSelectOptions(quote.terms_conditions_type);

    const [isEditModalOpen, openEditModal, closeEditModal] = useToggle();
    const [termsConditions, setTermsConditions] = useState(
        quote?.terms_conditions_type ? Object.keys(quote.terms_conditions_type)[0] : ""
    );
    const [filteredProducts, setFilteredProducts] = useState<Product[]>(
        quote.products.filter((product) => product.plan === termsConditions || product.plan === "")
    );
    const [selectedProducts, setSelectedProducts] = useState<Product[]>(filteredProducts);
    const [selectedLanguage, setSelectedLanguage] = useState(
        quote.languages ? Object.keys(quote.languages)[0] : ""
    );
    const [globalDiscount, setGlobalDiscount] = useState(0);
    const [subtotalRecurring, setSubtotalRecurring] = useState(0);
    const [subtotalOneTime, setSubtotalOneTime] = useState(0);
    const [total, setTotal] = useState(0);
    const [isLoading, setLoading] = useState<boolean>(false);

    const form = useForm<QuoteFormType>({
        defaultValues: getDefaultValues(quote),
        resolver: zodResolver(schema),
    });

    const {handleSubmit, formState, setError} = form;

    const handleLineItemsAdd = () => {
        openEditModal();
    };

    const handleLineItemsSubmit = (products: Array<Product>) => {
        setSelectedProducts(products);
        closeEditModal();
    };

    const handleLineItemsChange = useCallback((updatedProducts: Array<Product>) => {
        setSelectedProducts(updatedProducts);
    }, []);

    const handleGlobalDiscountChange = useCallback((discount: number) => {
        setGlobalDiscount(discount);
    }, []);

    const handleTotalChange = useCallback(
        (total: number, subtotalRecurring: number, subtotalOneTime: number) => {
            setTotal(total);
            setSubtotalRecurring(subtotalRecurring);
            setSubtotalOneTime(subtotalOneTime);
        },
        []
    );

    const handleLanguageChange = useCallback(
        async (newLanguage: string, productsToTranslate: Product[] = selectedProducts) => {
            setSelectedLanguage(newLanguage);

            try {
                setLoading(true);
                const response = await Api.post(
                    `/translate-products/`,
                    {
                        language: newLanguage,
                        products: productsToTranslate,
                    },
                    {apiVersion: "moderation"}
                );
                const translatedProducts = response.translatedProducts;
                setSelectedProducts(translatedProducts);
            } catch (error) {
                const errorMessage = await getErrorMessagesFromServerError(error);
                if (errorMessage) {
                    setError("root", {type: "onSubmit", message: errorMessage});
                } else {
                    setError("root", {type: "onSubmit", message: t("common.error")});
                }
            } finally {
                setLoading(false);
            }
        },
        [selectedProducts, setError]
    );

    const handleTermsChange = (value: string) => {
        setTermsConditions(value);
        const filtered = quote.products.filter(
            (product) => product.plan === value || product.plan === ""
        );
        setFilteredProducts(filtered);
        setSelectedProducts(filtered);
        handleLanguageChange(selectedLanguage, filtered);
    };

    const onSubmit = useCallback(
        async (values: QuoteFormType) => {
            try {
                setLoading(true);
                const response = await Api.post(
                    `/quote/`,
                    {
                        ...values,
                        global_discount: globalDiscount,
                        subtotal_recurring: subtotalRecurring,
                        subtotal_one_time: subtotalOneTime,
                        total: total,
                        country: quote.country,
                        products: selectedProducts.filter((product) => {
                            product.billing_frequency =
                                product.billing_frequency == "one_time"
                                    ? ""
                                    : product.billing_frequency;
                            return product.checked;
                        }),
                    },
                    {apiVersion: "moderation"}
                );
                const quote_id = response["quote_id"];
                const portal_id = response["portal_id"];
                window.location.href =
                    "https://app.hubspot.com/quotes/" + portal_id + "/edit/" + quote_id;
            } catch (error) {
                const errorMessage = await getErrorMessagesFromServerError(error);
                if (errorMessage) {
                    setError("root", {type: "onSubmit", message: errorMessage});
                } else {
                    setError("root", {type: "onSubmit", message: t("common.error")});
                }
            } finally {
                setLoading(false);
            }
        },
        [
            globalDiscount,
            subtotalRecurring,
            subtotalOneTime,
            total,
            quote.country,
            selectedProducts,
            setError,
        ]
    );

    return (
        <>
            <FormProvider {...form}>
                <Flex>
                    <Flex flexDirection="column" width="25%">
                        <QuoteDetailsForm
                            quote={quote}
                            languageOptions={languageOptions}
                            contactOptions={contactOptions}
                            termsOptions={termsOptions}
                            onLanguageChange={handleLanguageChange}
                            onTermsChange={handleTermsChange}
                        />
                    </Flex>
                    <Flex flexDirection="column" width="75%" ml="8" alignItems="end">
                        <Button
                            type="button"
                            className="btn btn-primary"
                            id="add-product-button"
                            onClick={handleLineItemsAdd}
                            mb={4}
                        >
                            Add Line Item
                        </Button>
                        <LineItemsTable
                            products={selectedProducts}
                            billingFreqOptions={billingFreqOptions}
                            onLineItemsChange={handleLineItemsChange}
                            onGlobalDiscountChange={handleGlobalDiscountChange}
                            onTotalChange={handleTotalChange}
                        />
                        <Button
                            type="button"
                            className="btn btn-primary"
                            id="submit-quote-button"
                            onClick={handleSubmit(onSubmit)}
                            disabled={isLoading}
                        >
                            {isLoading ? <LoadingWheel noMargin small /> : "Create Quote"}
                        </Button>
                    </Flex>
                </Flex>
                {isEditModalOpen && (
                    <AddLineItemsModal
                        products={selectedProducts}
                        billingFrequencyOptions={quote.billing_frequency_options}
                        onClose={closeEditModal}
                        onSubmitLineItems={handleLineItemsSubmit}
                    />
                )}
                {formState.errors?.root?.message && (
                    <ErrorMessage error={formState.errors.root.message} />
                )}
            </FormProvider>
        </>
    );
}

const schema = z.object({
    deal_id: z.string().nonempty("errors.field_cannot_be_empty"),
    company_name: z.string().nonempty("errors.field_cannot_be_empty"),
    company_id: z.string().nonempty("errors.field_cannot_be_empty"),
    quote_name: z.string().nonempty("errors.field_cannot_be_empty"),
    start_date: z.string().nonempty("errors.field_cannot_be_empty"),
    expiration_date: z.string().nonempty("errors.field_cannot_be_empty"),
    language: z.string().nonempty("errors.field_cannot_be_empty"),
    contact: z.string().nonempty("errors.field_cannot_be_empty"),
    project_manager: z.string().nonempty("errors.field_cannot_be_empty"),
    terms_conditions: z.string().nonempty("errors.field_cannot_be_empty"),
});

type QuoteFormType = z.infer<typeof schema>;

function getDefaultValues(quote?: ModerationQuoteProps): QuoteFormType {
    return {
        deal_id: quote?.deal_id || "",
        company_name: quote?.name || "",
        company_id: quote?.company_id || "",
        quote_name: quote?.quote_name || "",
        start_date: quote?.date || "",
        expiration_date: quote?.exp_date || "",
        language: quote?.languages ? Object.keys(quote.languages)[0] : "",
        contact: quote?.contact ? Object.keys(quote.contact)[0] : "",
        project_manager: quote?.project_manager || "",
        terms_conditions: quote?.terms_conditions_type
            ? Object.keys(quote.terms_conditions_type)[0]
            : "",
    };
}

function mapJsonToSelectOptions(options: any): Option[] {
    return Object.entries(options).map(([value, label]) => ({
        value,
        label: label as string,
    }));
}
