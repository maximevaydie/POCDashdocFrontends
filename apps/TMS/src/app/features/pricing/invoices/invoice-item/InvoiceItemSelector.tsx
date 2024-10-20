import {HasFeatureFlag} from "@dashdoc/web-common";
import {Logger, t} from "@dashdoc/web-core";
import {
    AsyncPaginatedSelect,
    Flex,
    Icon,
    FiltersSelectAsyncPaginatedProps,
    theme,
} from "@dashdoc/web-ui";
import {InvoiceItem} from "dashdoc-utils";
import React, {useCallback, useContext, useRef} from "react";

import {fetchSearchInvoiceItems} from "app/redux/actions";
import {useDispatch} from "app/redux/hooks";

import {
    InvoiceItemSuggestionArgumentsContext,
    fetchInvoiceItemSuggestion,
} from "./invoice-item-suggestion";

type InvoiceItemOption = InvoiceItem & {isSuggestion?: boolean};

type Props = {
    selectedInvoiceItem: InvoiceItem | null;
    errorMessage?: string;
    "data-testid"?: string;
    onChange: (
        value: InvoiceItem | null,
        autoCompleted: boolean,
        dismissedSuggestion?: boolean
    ) => unknown;
    menuPortalTarget?: HTMLElement;
    shouldAutoComplete?: boolean; // If true, the component will automatically select the first item in the list
    shouldAutoFocus?: boolean;
    shouldAutoSuggest?: boolean; // If true, the component will automatically select the suggested item
    previouslyDismissedSuggestion?: boolean | null;
    emptyContent?: React.ReactNode; // Optional custom content when the catalog is empty
    required?: boolean;
};

export const InvoiceItemSelector = ({
    selectedInvoiceItem,
    errorMessage,
    onChange: _onChange,
    menuPortalTarget,
    required,
    shouldAutoComplete = false,
    shouldAutoFocus = false,
    shouldAutoSuggest = false,
    previouslyDismissedSuggestion,
    ...props
}: Props) => {
    const dispatch = useDispatch();
    const someItemHaveBeenSelectedInThePast = useRef(selectedInvoiceItem != null);
    const suggestedInvoiceItem = useRef<InvoiceItemOption | undefined>(undefined);
    const selectItemRef = useRef<HTMLDivElement | null>(null);

    const invoiceItemSuggestionArguments = useContext(InvoiceItemSuggestionArgumentsContext);

    const onChange = (invoiceItem: InvoiceItemOption | null, autoCompleted: boolean) => {
        if (invoiceItem != null) {
            someItemHaveBeenSelectedInThePast.current = false;
        }

        let dismissedSuggestion: boolean | undefined = undefined;
        if (previouslyDismissedSuggestion) {
            // It already had a suggestion which was dismissed, continue to consider it dismissed.
            dismissedSuggestion = true;
        } else if (previouslyDismissedSuggestion === false) {
            // It already had a suggestion which was not dismissed, but the value is changing now, so it's dismissed.
            dismissedSuggestion = true;
        } else if (previouslyDismissedSuggestion === undefined) {
            // It never had a suggestion, compute the value based on the current suggestion.
            dismissedSuggestion = suggestedInvoiceItem.current
                ? invoiceItem?.uid !== suggestedInvoiceItem.current.uid
                : undefined;
        }

        _onChange(invoiceItem, autoCompleted, dismissedSuggestion);
    };

    /** The function that is triggered if the fetching function discovers that the company only has one invoice item.
     *
     * Triggers the autocomplete mechanism.
     */
    const handleOnlyOneItemInTheList = (item: InvoiceItem) => {
        // The autocomplete mechanism is triggered only if theres only one item in the list...
        // ...and no item was previously selected either via the props or by calling the onChange function
        if (shouldAutoComplete && !someItemHaveBeenSelectedInThePast.current) {
            onChange(item, true);
        }
    };

    /** The function fetching items for the async select component.
     *
     * Note that this will be called on mount.
     */
    const loadItemsOptions: FiltersSelectAsyncPaginatedProps["loadOptions"] = async (
        text: string,
        previousItems: InvoiceItemOption[],
        additional: undefined | {page: number}
    ): Promise<{
        options: InvoiceItemOption[];
        hasMore: boolean | undefined;
        additional?: {page: number};
    }> => {
        const page = additional?.page || 1;
        const requestPromises = [dispatch(fetchSearchInvoiceItems(text, page))];

        if (
            shouldAutoSuggest &&
            !previouslyDismissedSuggestion &&
            page === 1 &&
            !text &&
            !selectedInvoiceItem
        ) {
            requestPromises.push(fetchInvoiceItemSuggestion(invoiceItemSuggestionArguments));
        }

        try {
            const [searchResponse, suggestionResponse] = await Promise.all(requestPromises);
            let items: InvoiceItemOption[] = searchResponse.response.results;
            if (!searchResponse.response.results) {
                items = [];
            }

            // Check in the previous items (from previous pages) if there was a suggested item
            // and remove it from this page items to avoid duplicates in the list.
            const previousSuggestedItem = previousItems.find(({isSuggestion}) => isSuggestion);
            if (previousSuggestedItem) {
                items = items.filter(({uid}) => uid !== previousSuggestedItem.uid);
            }

            // If there is a suggested item (only fetched for the first page with no search text)
            // update the matching one from the list of items or add it if not present.
            const suggestedItem = suggestionResponse?.suggested_invoice_item
                ? {...suggestionResponse.suggested_invoice_item, isSuggestion: true}
                : null;
            if (suggestedItem) {
                suggestedInvoiceItem.current = suggestedItem;

                const matchingItemIdx = items.findIndex(({uid}) => uid === suggestedItem.uid);
                if (matchingItemIdx !== -1) {
                    items.splice(matchingItemIdx, 1, suggestedItem);
                } else {
                    items.push(suggestedItem);
                }
            }

            // If we discover that the company only has one invoice item, we trigger the corresponding handler
            const hasOnlyOneInvoiceItem = text === "" && page === 1 && items.length === 1;
            if (hasOnlyOneInvoiceItem) {
                handleOnlyOneItemInTheList(items[0]);
            }
            // Auto-suggest if possible/available
            else if (shouldAutoSuggest && !selectedInvoiceItem && suggestedItem) {
                onChange(suggestedItem, true);
            }
            // Focus empty select if applicable
            else if (
                shouldAutoFocus &&
                items.length > 0 &&
                selectItemRef.current !== null &&
                document.activeElement == document.body // check if some other input field is already focused
            ) {
                selectItemRef.current.focus();
            }

            return {
                options: items,
                hasMore: searchResponse.response.next != null,
                additional: {
                    page: page + 1,
                },
            };
        } catch (error) {
            Logger.error(error);
            return {
                options: [],
                hasMore: undefined,
            };
        }
    };

    const getOptionValue = useCallback(({uid}: InvoiceItemOption) => uid ?? "", []);
    const formatOptionLabel = useCallback(
        (invoiceItemOption: InvoiceItemOption) => (
            <Flex style={{gap: "8px"}}>
                {invoiceItemOption.isSuggestion && <Icon name="robot" />}
                {invoiceItemOption.description}
            </Flex>
        ),
        []
    );

    return (
        <HasFeatureFlag flagName="invoice-entity">
            <AsyncPaginatedSelect
                required={required}
                menuPortalTarget={menuPortalTarget}
                placeholder={t("common.invoiceItem")}
                loadOptions={loadItemsOptions}
                defaultOptions={true}
                getOptionValue={getOptionValue}
                formatOptionLabel={formatOptionLabel}
                debounceTimeout={300}
                onChange={(item: InvoiceItemOption | null) => onChange(item, false)}
                styles={{
                    control: (base) => ({
                        ...base,
                        lineHeight: theme.lineHeights[3],
                        padding: "2px 2px",
                    }),
                    singleValue: (base) => ({
                        ...base,
                        fontSize: theme.fontSizes[1],
                    }),
                }}
                value={selectedInvoiceItem}
                data-testid={props["data-testid"]}
                error={errorMessage}
                ref={selectItemRef}
            />
        </HasFeatureFlag>
    );
};
