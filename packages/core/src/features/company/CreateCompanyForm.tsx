import {apiService, HereSuggestField} from "@dashdoc/web-common";
import {Place, t} from "@dashdoc/web-core";
import {
    Box,
    Button,
    Callout,
    ClickableFlex,
    Flex,
    Icon,
    SelectCountry,
    Text,
    TextInput,
    FlexProps,
} from "@dashdoc/web-ui";
import {css} from "@emotion/react";
import {zodResolver} from "@hookform/resolvers/zod";
import {CompanyFound} from "features/company/components/CompanyFound";
import {AvailableCompany} from "features/company/SelectCompanyForm";
import debounce from "lodash.debounce";
import React, {useCallback, useMemo, useState} from "react";
import {Controller, useForm} from "react-hook-form";
import {useSelector} from "react-redux";
import {selectProfile} from "redux/reducers/flow";
import {Site} from "types";
import {z} from "zod";

type QueryResponse = {
    count: number;
    next: string | null;
    previous: string | null;
    results: AvailableCompany[];
};
const initialState: QueryResponse = {
    count: 0,
    next: null,
    previous: null,
    results: [],
};

export type CreateCompanyForm = {
    name: string;
    address: string;
    postcode: string;
    city: string;
    country: string;
    longitude?: number | undefined;
    latitude?: number | undefined;
};

export type Props = {
    name?: string;
    site: Site;
    submitLabel?: string;
    onSelectCompany: (companyId: number, companyName: string) => void;
    onCreateCompany: (payload: CreateCompanyForm) => void;
};

export function CreateCompanyForm({
    name,
    site,
    submitLabel,
    onSelectCompany,
    onCreateCompany,
}: Props) {
    const validationSchema = z.object({
        name: z.string().min(3).nonempty(t("errors.field_cannot_be_empty")),
        address: z.string(),
        postcode: z.string().nonempty(t("errors.field_cannot_be_empty")),
        city: z.string().nonempty(t("errors.field_cannot_be_empty")),
        country: z.string().nonempty(t("errors.field_cannot_be_empty")),
        longitude: z.number().optional(),
        latitude: z.number().optional(),
    });

    type FormType = z.infer<typeof validationSchema>;

    const [selectedCompanyId, setSelectedCompanyId] = useState<null | number>(null);
    const [selectedCompanyName, setSelectedCompanyName] = useState<null | string>(null);
    const [data, setData] = useState<QueryResponse>(initialState);

    const profile = useSelector(selectProfile);
    const searchCompaniesCallback = useCallback(searchCompanies, [
        site.id,
        selectedCompanyId,
        setSelectedCompanyId,
    ]);
    const debouncedSearch = useMemo(
        () => debounce(searchCompaniesCallback, 400),
        [searchCompaniesCallback]
    );

    const disabled = selectedCompanyId !== null;

    const methods = useForm<FormType>({
        resolver: zodResolver(validationSchema),
        defaultValues: {
            name: name ?? "",
            address: "",
            postcode: "",
            city: "",
            country: "FR",
        },
        mode: "onChange",
    });

    const {
        control,
        trigger,
        getValues,
        setValue,
        formState: {isValid, isSubmitting},
    } = methods;

    const disableSubmit = !(isValid || selectedCompanyId !== null) && isSubmitting;

    return (
        <Box>
            <Box maxWidth="480px" margin="auto">
                <Flex flexDirection="column" style={{gap: "16px"}}>
                    <Text variant="h1">
                        {profile === "siteManager"
                            ? t("flow.createCompanyForm.fillInNewCompany")
                            : t("flow.createCompanyForm.fillInYourCompany")}
                    </Text>

                    <Text>
                        {profile === "siteManager"
                            ? t("flow.createCompanyForm.newCompanyInformation")
                            : t("flow.createCompanyForm.yourCompanyInformation")}
                    </Text>

                    <Controller
                        name="name"
                        control={control}
                        render={({field}) => (
                            <TextInput
                                label={t("common.name")}
                                data-testid="company-name"
                                {...field}
                                onChange={(value) => {
                                    field.onChange(value);
                                    handleTextChange(value);
                                }}
                                required
                                disabled={disabled}
                            />
                        )}
                    />

                    <Controller
                        name="address"
                        control={control}
                        render={({field}) => (
                            <HereSuggestField
                                searchMode={"discover"}
                                label={t("common.address")}
                                data-testid="company-address"
                                complementaryDataAutocomplete={{
                                    postcode: getValues("postcode"),
                                    city: getValues("city"),
                                }}
                                {...field}
                                onSuggestionClick={handleHereSuggest}
                                disabled={disabled}
                            />
                        )}
                    />

                    <Flex justifyContent="space-between" mb={2}>
                        <Box flexBasis="38%">
                            <Controller
                                name="postcode"
                                control={control}
                                render={({field}) => (
                                    <HereSuggestField
                                        label={t("common.postalCode")}
                                        searchMode={"discover"}
                                        data-testid="company-postcode"
                                        complementaryDataAutocomplete={{
                                            address: getValues("address"),
                                            city: getValues("city"),
                                        }}
                                        {...field}
                                        onSuggestionClick={handleHereSuggest}
                                        required
                                        disabled={disabled}
                                    />
                                )}
                            />
                        </Box>
                        <Box flexBasis="60%">
                            <Controller
                                name="city"
                                control={control}
                                render={({field}) => (
                                    <HereSuggestField
                                        label={t("common.city")}
                                        data-testid="company-city"
                                        searchMode={"discover"}
                                        complementaryDataAutocomplete={{
                                            address: getValues("address"),
                                            postcode: getValues("postcode"),
                                        }}
                                        {...field}
                                        onSuggestionClick={handleHereSuggest}
                                        required
                                        disabled={disabled}
                                    />
                                )}
                            />
                        </Box>
                    </Flex>
                    <Controller
                        name="country"
                        control={control}
                        render={({field}) => (
                            <SelectCountry
                                label={t("common.country")}
                                {...field}
                                required
                                isDisabled={disabled}
                            />
                        )}
                    />
                    {data.count > 0 && (
                        <Callout iconDisabled>
                            <Text mb={2}>{t("flow.company.looksLikeCompanyAlreadyExists")}</Text>
                            {
                                /* We use the first array item, but we could expect more than once */
                                [data.results[0]].map((availableCompany) => {
                                    const selected = selectedCompanyId === availableCompany.pk;
                                    let flexProps: FlexProps = {
                                        border: "1px solid",
                                        borderColor: "grey.light",
                                    };
                                    if (selected) {
                                        flexProps = {
                                            border: "1px solid",
                                            borderColor: "blue.default",
                                            backgroundColor: "blue.ultralight",
                                        };
                                    }
                                    return (
                                        <ClickableFlex
                                            key={availableCompany.pk}
                                            onClick={() => {
                                                selectExistingCompany(availableCompany.pk);
                                                setSelectedCompanyName(availableCompany.name);
                                            }}
                                            boxShadow="small"
                                            justifyContent="space-between"
                                            px={4}
                                            py={2}
                                            backgroundColor="grey.white"
                                            hoverStyle={{bg: "grey.white"}}
                                            css={css`
                                                & .select {
                                                    visibility: hidden;
                                                }
                                                &:hover .select {
                                                    visibility: visible;
                                                }
                                            `}
                                            {...flexProps}
                                        >
                                            <Flex flexGrow={1}>
                                                <CompanyFound
                                                    availableCompany={availableCompany}
                                                />
                                            </Flex>
                                            <Box margin="auto">
                                                {selectedCompanyId === availableCompany.pk ? (
                                                    <Icon
                                                        name="check"
                                                        ml={2}
                                                        mr={4}
                                                        color="blue.default"
                                                    />
                                                ) : (
                                                    <Button
                                                        className="select"
                                                        variant="secondary"
                                                        ml={2}
                                                    >
                                                        {t("common.select")}
                                                    </Button>
                                                )}
                                            </Box>
                                        </ClickableFlex>
                                    );
                                })
                            }
                            <Text mt={4}>{t("flow.company.clickOnCompanyToSelect")}</Text>
                        </Callout>
                    )}
                </Flex>
            </Box>
            <Flex mt={3} justifyContent="flex-end">
                <Button
                    type="button"
                    onClick={handleSubmit}
                    disabled={disableSubmit}
                    data-testid="add-button"
                >
                    {submitLabel ?? t("flow.company.validateSelectedCompany")}
                </Button>
            </Flex>
        </Box>
    );

    function handleHereSuggest(place: Place) {
        const {address, city, countryCode, postcode, longitude, latitude} = place;
        setValue("address", address);
        setValue("city", city);
        setValue("country", countryCode?.toUpperCase() ?? "FR");
        setValue("postcode", postcode ?? "");
        setValue("longitude", longitude);
        setValue("latitude", latitude);
        trigger();
    }

    function selectExistingCompany(companyId: number) {
        setSelectedCompanyId((prev) => {
            if (prev === companyId) {
                return null;
            }
            return companyId;
        });
    }

    function handleSubmit() {
        if (selectedCompanyId) {
            onSelectCompany(selectedCompanyId, selectedCompanyName ?? t("common.notDefined"));
        } else {
            methods.handleSubmit(submit)();
        }
    }

    async function submit() {
        const isValidForm = await trigger();
        if (!isValidForm) {
            return;
        }
        const formData = methods.getValues();
        await onCreateCompany(formData);
    }

    function handleTextChange(value: string) {
        if (value.length > 2) {
            debouncedSearch(value);
        } else {
            setData(initialState);
        }
    }

    async function searchCompanies(search: string) {
        const payload = {site: site.id, search, page_size: 5};
        const params = new URLSearchParams(payload as any).toString();
        const response: QueryResponse = await apiService.get(`/flow/companies/?${params}`, {
            apiVersion: "web",
        });
        setData(response);
        setSelectedCompanyId((prev) => {
            if (response.results.find((c) => c.pk === selectedCompanyId)) {
                // keep the selected company if it is still in the search results
                return prev;
            }
            // remove selected company when the search results change without the selected company
            return null;
        });
    }
}
