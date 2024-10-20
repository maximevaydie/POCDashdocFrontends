import {Box, Input, Select} from "@dashdoc/web-ui";
import React from "react";
import {Controller} from "react-hook-form";

type ModerationQuoteProps = {
    products: Array<any>;
    languages: string;
    deal_id: string;
    name: string;
    company_id: string;
    quote_name: string;
    contact: string;
    date: string;
    exp_date: string;
    billing_frequency_options: string;
};

type Option = {
    label: string;
    value: string;
};

type QuoteDetailsFormProps = {
    quote: ModerationQuoteProps;
    languageOptions: Option[];
    contactOptions: Option[];
    termsOptions: Option[];
    onLanguageChange: (language: string) => void;
    onTermsChange: (terms: string) => void;
};

export function QuoteDetailsForm({
    quote,
    languageOptions,
    contactOptions,
    termsOptions,
    onLanguageChange,
    onTermsChange,
}: QuoteDetailsFormProps) {
    return (
        <>
            <h5>Company Name*</h5>
            <Controller
                name="company_name"
                render={({field, fieldState: {error}}) => (
                    <Input {...field} error={error?.message} required disabled mb={2} />
                )}
            />
            <h5>Company Id*</h5>
            <Controller
                name="company_id"
                render={({field, fieldState: {error}}) => (
                    <Input {...field} error={error?.message} required disabled mb={2} />
                )}
            />
            <h5>Quote Name*</h5>
            <Controller
                name="quote_name"
                render={({field, fieldState: {error}}) => (
                    <Input {...field} error={error?.message} required mb={2} />
                )}
            />
            <h5>Start date*</h5>
            <Controller
                name="start_date"
                render={({field, fieldState: {error}}) => (
                    <Input
                        {...field}
                        type="date"
                        min={quote.date}
                        error={error?.message}
                        required
                        mb={2}
                    />
                )}
            />
            <h5>Expiration date*</h5>
            <Controller
                name="expiration_date"
                render={({field, fieldState: {error}}) => (
                    <Input
                        {...field}
                        type="date"
                        min={quote.date}
                        error={error?.message}
                        required
                        mb={2}
                    />
                )}
            />
            <h5>Language*</h5>
            <Box mb={2}>
                <Controller
                    name="language"
                    render={({field, fieldState: {error}}) => (
                        <Select
                            {...field}
                            options={languageOptions}
                            value={languageOptions.find((option) => option.value === field.value)}
                            onChange={(option) => {
                                field.onChange((option as Option)?.value);
                                onLanguageChange((option as Option)?.value);
                            }}
                            error={error?.message}
                            required
                        />
                    )}
                />
            </Box>
            {quote.contact && (
                <>
                    <h5>Contact*</h5>
                    <Box mb={2}>
                        <Controller
                            name="contact"
                            render={({field, fieldState: {error}}) => (
                                <Select
                                    {...field}
                                    options={contactOptions}
                                    value={contactOptions.find(
                                        (option) => option.value === field.value
                                    )}
                                    onChange={(option) => {
                                        field.onChange((option as Option)?.value);
                                    }}
                                    error={error?.message}
                                    required
                                />
                            )}
                        />
                    </Box>
                    <h5>Project Manager*</h5>
                    <Box mb={2}>
                        <Controller
                            name="project_manager"
                            render={({field, fieldState: {error}}) => (
                                <Input {...field} error={error?.message} required mb={2} />
                            )}
                        />
                    </Box>
                </>
            )}
            <h5>Terms and conditions</h5>
            <Box mb={2}>
                <Controller
                    name="terms_conditions"
                    render={({field, fieldState: {error}}) => (
                        <Select
                            {...field}
                            options={termsOptions}
                            value={termsOptions.find((option) => option.value === field.value)}
                            onChange={(option) => {
                                field.onChange((option as Option)?.value);
                                onTermsChange((option as Option)?.value);
                            }}
                            error={error?.message}
                            required
                        />
                    )}
                />
            </Box>
        </>
    );
}
