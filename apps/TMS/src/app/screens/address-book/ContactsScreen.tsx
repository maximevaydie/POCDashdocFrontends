import {
    Arrayify,
    FilteringBar,
    companyService,
    getContactInvitationStatus,
    useBaseUrl,
} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Flex, FullHeightMinWidthScreen, TabTitle, Table, Text} from "@dashdoc/web-ui";
import {
    Contact,
    formatNumber,
    parseQueryString,
    stringifyQueryObject,
    useEffectExceptOnMount,
} from "dashdoc-utils";
import React, {useCallback, useEffect, useState} from "react";
import Highlighter from "react-highlight-words";
import {useHistory, useLocation} from "react-router";

import {getTabTranslations} from "app/common/tabs";
import {AddContactModal} from "app/features/company/contact/AddContactModal";
import {InvitationBadge} from "app/features/company/contact/invitation/invitation-badge";
import {fetchContactSearch} from "app/redux/actions/contacts";
import {useDispatch, useSelector} from "app/redux/hooks";
import {
    getContactsCurrentQueryLoadingStatus,
    getContactsForCurrentQuery,
} from "app/redux/selectors/searches";
import {CONTACT_QUERY_NAME, SidebarTabNames} from "app/types/constants";

type ContactsScreenQuery = {
    text: string[];
};

const parseQuery = (queryString: string): ContactsScreenQuery => {
    const parsedParams = parseQueryString(queryString, {
        parseBooleans: true,
        parseNumbers: true,
        arrayFormat: "comma",
    });

    return {
        text: Arrayify(parsedParams.text || []).map((t) => t.toString()),
    };
};

export function ContactsScreen() {
    const history = useHistory();
    const location = useLocation();
    const dispatch = useDispatch();
    const baseUrl = useBaseUrl();

    const [currentQuery, setCurrentQuery] = useState(parseQuery(location.search));

    const updateQuery = useCallback(
        (newQuery: ContactsScreenQuery) =>
            history.replace({
                ...location,
                search: stringifyQueryObject(
                    {...currentQuery, ...newQuery},
                    {skipEmptyString: true, skipNull: true, arrayFormat: "comma"}
                ),
            }),
        [currentQuery]
    );

    // set query to fetch on location.search change
    useEffectExceptOnMount(() => {
        const newQuery = parseQuery(location.search);
        setCurrentQuery(newQuery);
    }, [location.search]);

    const fetchContacts = useCallback((query: ContactsScreenQuery, page = 1) => {
        dispatch(fetchContactSearch(CONTACT_QUERY_NAME, query, page));
    }, []);

    // fetch first page of contacts on mount and as soon as the query change
    useEffect(() => {
        fetchContacts(currentQuery);
    }, [currentQuery]);

    const isLoading = useSelector(getContactsCurrentQueryLoadingStatus);
    const {
        contacts = [],
        page: lastFetchedPage = 1,
        hasNextPage,
        totalCount: allContactsCount,
    } = useSelector(getContactsForCurrentQuery);

    const onEndReached = useCallback(
        () => hasNextPage && fetchContacts(currentQuery, lastFetchedPage + 1),
        [currentQuery, lastFetchedPage, hasNextPage]
    );

    const refetchContacts = useCallback(
        () => fetchContacts(currentQuery, lastFetchedPage),
        [currentQuery, lastFetchedPage]
    );

    const [contactToEdit, setContactToEdit] = useState<Contact>();

    return (
        <FullHeightMinWidthScreen p={3}>
            <Flex justifyContent="space-between" alignItems="center" mb={3}>
                <TabTitle
                    title={getTabTranslations(SidebarTabNames.CONTACTS)}
                    detailText={`- ${formatNumber(allContactsCount)} ${t("common.contacts", {
                        smart_count: allContactsCount ?? 2,
                    })}`}
                />
            </Flex>

            <FilteringBar<ContactsScreenQuery>
                filters={[]}
                query={currentQuery}
                updateQuery={updateQuery}
                resetQuery={{text: []}}
                searchEnabled
                searchPlaceholder={t("components.searchCompaniesList")}
                data-testid={"contacts-search-bar"}
            />

            <Flex overflow="hidden" flexDirection="column" mt={3}>
                <Table
                    mt={3}
                    isLoading={isLoading}
                    hasNextPage={hasNextPage}
                    onEndReached={onEndReached}
                    columns={[
                        {name: "last_name", label: t("settings.lastNameLabel")},
                        {name: "first_name", label: t("settings.firstNameLabel")},
                        {name: "company", label: t("common.company")},
                        {name: "email", label: t("common.email")},
                        {name: "remote_id", label: t("components.remoteId")},
                        {name: "phone_number", label: t("common.phoneNumber")},
                        {name: "invitation_status", label: t("components.invitationStatus")},
                    ]}
                    rows={contacts}
                    getRowId={(contact) => contact.uid}
                    getRowCellContent={(contact, column) => {
                        if (column === "invitation_status") {
                            return (
                                <InvitationBadge
                                    invitationStatus={getContactInvitationStatus(contact)}
                                />
                            );
                        }
                        return (
                            <Text variant="caption" ellipsis>
                                <Highlighter
                                    autoEscape={true}
                                    searchWords={currentQuery.text}
                                    textToHighlight={
                                        column === "company"
                                            ? contact.company.name
                                            : (contact[column as keyof Contact] as string)
                                    }
                                />
                            </Text>
                        );
                    }}
                    getRowCellIsClickable={(_, columnName) => columnName !== "invitation_status"}
                    getColumnWidth={(column) => {
                        if (column.name === "invitation_status") {
                            return "23em";
                        }
                        if (column.name === "phone_number") {
                            return "8em";
                        }
                        return "auto";
                    }}
                    onClickOnRow={(contact) => {
                        history.push(
                            `${companyService.getPartnerLink(
                                baseUrl,
                                contact.company
                            )}?contact_uid=${contact.uid}`
                        );
                    }}
                />
            </Flex>
            {contactToEdit && (
                <AddContactModal
                    contact={contactToEdit}
                    onClose={() => {
                        // @ts-ignore
                        setContactToEdit(null);
                        refetchContacts();
                    }}
                />
            )}
        </FullHeightMinWidthScreen>
    );
}
