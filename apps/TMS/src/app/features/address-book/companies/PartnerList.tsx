import {
    NotFoundScreen,
    fetchUpdateManager,
    getConnectedManager,
    useTimezone,
} from "@dashdoc/web-common";
import {Logger, t} from "@dashdoc/web-core";
import {
    Box,
    Flex,
    FloatingPanel,
    LoadingWheel,
    ColumnProps,
    BaseRowProps,
    Text,
} from "@dashdoc/web-ui";
import {Company, useToggle} from "dashdoc-utils";
import React, {useCallback, useEffect, useState} from "react";
import createPersistedState from "use-persisted-state";

import {PartnerDetails} from "app/features/address-book/partner/PartnerDetails";
import {EntityList} from "app/features/core/entity-list/entity-list";
import {getPartnersQueryParamsFromFilterQuery} from "app/features/filters/deprecated/utils";
import {fetchSearchCompanies, selectRows} from "app/redux/actions";
import {useDispatch, useSelector} from "app/redux/hooks";
import {
    getCompaniesForCurrentQuery,
    getCompaniesSelectionForCurrentQuery,
} from "app/redux/selectors";
import {useCompany} from "app/screens/address-book/hooks/useCompany";
import {PARTNER_QUERY_NAME} from "app/types/constants";

import {BulkActions} from "./actions/BulkActions";
import {dataBehavior} from "./behavior/dataBehavior";
import {tableBehavior, PartnerListColumn} from "./behavior/tableBehavior";
import {PartnersScreenQuery} from "./types";

const PREDEFINED_COLUMNS_WIDTH_STORAGE_KEY = "partners.predefinedColumnsWidth";
const predefinedColumnsWidthState = createPersistedState(PREDEFINED_COLUMNS_WIDTH_STORAGE_KEY);
type ColumnsSizeByColumn = {[name: string]: number | string};

type Props = {
    currentQuery: PartnersScreenQuery;
    updateQuery: (newQuery: PartnersScreenQuery) => void;
    onDelete: () => void;
};
export function PartnerList({currentQuery, updateQuery, onDelete}: Props) {
    const dispatch = useDispatch();
    const timezone = useTimezone();
    const [partnerPk, setPartnerPk] = useState<number | null>();
    const [allCompaniesSelected, selectAllCompanies, unselectAllCompanies] = useToggle();

    const {companies = [], totalCount: allCompaniesCount} = useSelector(
        getCompaniesForCurrentQuery
    );
    const manager = useSelector(getConnectedManager);

    const [predefinedColumnsWidth, setPredefinedColumnsWidth] =
        predefinedColumnsWidthState<ColumnsSizeByColumn>({});

    const currentSelection = useSelector(getCompaniesSelectionForCurrentQuery);
    const onSelectAllVisibleCompanies = useCallback(
        (selected: boolean) => {
            dispatch(selectRows(selected, "companies", companies?.map(({pk}) => pk) ?? []));
            unselectAllCompanies();
        },
        [companies, dispatch, unselectAllCompanies]
    );

    const onSelectRow = useCallback(
        (company: BaseRowProps, selected: boolean) => {
            dispatch(selectRows(selected, "companies", [company.pk]));
            unselectAllCompanies();
        },
        [dispatch, unselectAllCompanies]
    );

    const fetchPartners = useCallback(
        (query: PartnersScreenQuery, page = 1) => {
            dispatch(
                fetchSearchCompanies(
                    PARTNER_QUERY_NAME,
                    {
                        ...getPartnersQueryParamsFromFilterQuery(query, timezone),
                        company__isnull: false,
                        ordering: "name",
                    },
                    page,
                    false,
                    "web"
                )
            );
        },
        [dispatch, timezone]
    );

    // fetch first page of companies on mount and as soon as the query change
    useEffect(() => {
        fetchPartners(currentQuery);
    }, [currentQuery, fetchPartners]);

    let overrideHeader: React.ReactNode | null = null;
    const columns = tableBehavior.getColumns();
    const selectedColumnNames =
        manager?.address_book_columns?.partners ??
        (columns.map((column) => column.name).filter(Boolean) as string[]);

    if (currentSelection.length > 0) {
        overrideHeader = (
            <Flex alignItems="center">
                <Text>
                    {t("newBulkActions.countSelectedPartners", {
                        smart_count: currentSelection.length,
                    })}
                </Text>
                <Box
                    ml={3}
                    height="2em"
                    borderLeftWidth={1}
                    borderLeftStyle="solid"
                    borderLeftColor="grey.dark"
                />
                <BulkActions
                    allSelected={allCompaniesSelected}
                    currentSelection={currentSelection}
                    allCount={allCompaniesCount ?? 0}
                />
            </Flex>
        );
    }

    return (
        <>
            <EntityList
                currentQuery={currentQuery}
                onClick={handleOpenPanel}
                onSelectRow={onSelectRow}
                onSelectAllVisibleRows={onSelectAllVisibleCompanies}
                onSelectAllRows={selectAllCompanies}
                allRowsSelected={allCompaniesSelected}
                tableBehavior={tableBehavior}
                dataBehavior={dataBehavior}
                data-testid="companies-list"
                getRowTestId={() => "company-row"}
                getColumnWidth={getColumnWidth}
                setColumnWidth={setColumnWidth}
                onOrderingChange={handleOrderingChange}
                withSelectableColumns
                selectedColumnNames={selectedColumnNames}
                onSelectColumns={handleSelectColumns}
                overrideHeader={overrideHeader}
            />
            {partnerPk && (
                <CompanySidePanel
                    partnerPk={partnerPk}
                    onClose={handleClosePanel}
                    onDelete={onDelete}
                    onUpdate={fetchFirstPage}
                />
            )}
        </>
    );

    function fetchFirstPage() {
        fetchPartners(currentQuery);
    }

    function handleOpenPanel(company: Company) {
        setPartnerPk(company.pk);
    }

    function handleClosePanel() {
        setPartnerPk(null);
    }

    function getColumnWidth(column: PartnerListColumn) {
        return predefinedColumnsWidth[column.name] ?? column.width ?? "auto";
    }
    function setColumnWidth(column: PartnerListColumn, width: string) {
        setPredefinedColumnsWidth((prev) => ({
            ...(prev ?? {}),
            [column.name]: width,
        }));
    }

    function handleOrderingChange(
        newOrdering: Record<string, ColumnProps<PartnerListColumn>["direction"]> | null
    ) {
        updateQuery({
            ordering: !newOrdering
                ? undefined
                : `${Object.values(newOrdering)[0] === "desc" ? "-" : ""}${
                      Object.keys(newOrdering)[0]
                  }`,
        });
    }

    function handleSelectColumns(newSelection: string[]) {
        if (!manager) {
            Logger.error("No manager found");
            return;
        }
        dispatch(
            fetchUpdateManager(
                manager.pk,
                {
                    address_book_columns: {
                        ...manager.address_book_columns,
                        partners: newSelection,
                    },
                },
                t("components.updatedColumns")
            )
        );
    }
}

function CompanySidePanel({
    partnerPk,
    onClose,
    onDelete,
    onUpdate,
}: {
    partnerPk: number;
    onClose: () => void;
    onDelete: () => void;
    onUpdate: () => void;
}) {
    const {loading, company} = useCompany(partnerPk);
    return (
        <FloatingPanel width={0.7} minWidth={1120} onClose={onClose}>
            {loading ? (
                <LoadingWheel />
            ) : (
                <>
                    {company === null && <NotFoundScreen />}
                    {company !== null && (
                        <PartnerDetails
                            partner={company}
                            fromAddressBook
                            tabTemplateSelected={false}
                            onDelete={onDelete}
                            onUpdate={onUpdate}
                        />
                    )}
                </>
            )}
        </FloatingPanel>
    );
}
