import {
    NotFoundScreen,
    PartnerInListOutput,
    fetchSearchPartners,
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
    ColumnDirection,
} from "@dashdoc/web-ui";
import {useToggle} from "dashdoc-utils";
import React, {useCallback, useEffect, useState} from "react";
import createPersistedState from "use-persisted-state";

import {PartnerDetails} from "app/features/address-book/partner/PartnerDetails";
import {EntityList} from "app/features/core/entity-list/entity-list";
import {getPartnersQueryParamsFromFilterQuery} from "app/features/filters/deprecated/utils";
import {selectRows} from "app/redux/actions";
import {useDispatch, useSelector} from "app/redux/hooks";
import {
    getPartnersForCurrentQuery,
    getPartnersSelectionForCurrentQuery,
} from "app/redux/selectors";
import {usePartner} from "app/screens/address-book/hooks/usePartner";
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
    const [allPartnersSelected, selectAllPartners, unselectAllPartners] = useToggle();

    const {partners = [], totalCount: allPartnersCount} = useSelector(getPartnersForCurrentQuery);
    const manager = useSelector(getConnectedManager);

    const [predefinedColumnsWidth, setPredefinedColumnsWidth] =
        predefinedColumnsWidthState<ColumnsSizeByColumn>({});

    const currentSelection = useSelector(getPartnersSelectionForCurrentQuery);
    const onSelectAllVisiblePartners = useCallback(
        (selected: boolean) => {
            dispatch(selectRows(selected, "partnersList", partners?.map(({pk}) => pk) ?? []));
            unselectAllPartners();
        },
        [partners, dispatch, unselectAllPartners]
    );

    const onSelectRow = useCallback(
        (partner: BaseRowProps, selected: boolean) => {
            dispatch(selectRows(selected, "partnersList", [partner.pk]));
            unselectAllPartners();
        },
        [dispatch, unselectAllPartners]
    );

    const fetchPartners = useCallback(
        (query: PartnersScreenQuery, page = 1) => {
            dispatch(
                fetchSearchPartners(
                    PARTNER_QUERY_NAME,
                    {
                        ...getPartnersQueryParamsFromFilterQuery(query, timezone),
                    },
                    page
                )
            );
        },
        [dispatch, timezone]
    );

    // fetch first page of partners on mount and as soon as the query change
    useEffect(() => {
        fetchPartners(currentQuery);
    }, [currentQuery, fetchPartners]);

    let overrideHeader: React.ReactNode | null = null;
    const columns = tableBehavior.getColumns();
    const selectedColumnNames =
        manager?.address_book_columns?.partners ??
        (columns.map((column) => column.name).filter(Boolean) as string[]);

    const currentOrdering: Record<string, ColumnDirection> | undefined = currentQuery.ordering
        ? {
              [currentQuery.ordering.replace("-", "")]: currentQuery.ordering.includes("-")
                  ? "desc"
                  : "asc",
          }
        : undefined;

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
                    allSelected={allPartnersSelected}
                    currentSelection={currentSelection}
                    allCount={allPartnersCount ?? 0}
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
                onSelectAllVisibleRows={onSelectAllVisiblePartners}
                onSelectAllRows={selectAllPartners}
                allRowsSelected={allPartnersSelected}
                tableBehavior={tableBehavior}
                dataBehavior={dataBehavior}
                data-testid="partners-list"
                getRowTestId={() => "partner-row"}
                getColumnWidth={getColumnWidth}
                setColumnWidth={setColumnWidth}
                onOrderingChange={handleOrderingChange}
                ordering={currentOrdering}
                withSelectableColumns
                selectedColumnNames={selectedColumnNames}
                onSelectColumns={handleSelectColumns}
                overrideHeader={overrideHeader}
            />
            {partnerPk && (
                <PartnerSidePanel
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

    function handleOpenPanel(partner: PartnerInListOutput) {
        setPartnerPk(partner.pk);
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

function PartnerSidePanel({
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
    const {loading, partner} = usePartner(partnerPk);
    return (
        <FloatingPanel width={0.7} minWidth={1120} onClose={onClose}>
            {loading ? (
                <LoadingWheel />
            ) : (
                <>
                    {partner === null && <NotFoundScreen />}
                    {partner !== null && (
                        <PartnerDetails
                            partner={partner}
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
