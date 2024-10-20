import {Arrayify, FilteringBar} from "@dashdoc/web-common";
import {getReadableAddress, t} from "@dashdoc/web-core";
import {
    Button,
    Flex,
    FloatingPanel,
    FullHeightMinWidthScreen,
    Icon,
    TabTitle,
    Table,
    theme,
} from "@dashdoc/web-ui";
import {
    Company,
    Manager,
    Trucker,
    formatNumber,
    parseQueryString,
    stringifyQueryObject,
    useEffectExceptOnMount,
    useToggle,
} from "dashdoc-utils";
import React, {useCallback, useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {useHistory, useLocation} from "react-router";

import {getTabTranslations} from "app/common/tabs";
import AddEntityPanel from "app/features/groupviews/add-entity-panel";
import EntityDetailPanel from "app/features/groupviews/entity-detail-panel";
import {fetchSearchGroupViewCompanies} from "app/redux/actions/companies";
import {
    getCompaniesCurrentQueryLoadingStatus,
    getCompaniesForCurrentQuery,
} from "app/redux/selectors/searches";
import {PARTNER_QUERY_NAME, SidebarTabNames} from "app/types/constants";

type EntitiesScreenQuery = {
    text: string[];
};

type EntityInGroupView = Company & {managers: Manager[]; truckers: Trucker[]};

type EntityColumn = "name" | "trade_number" | "vat_number" | "address" | "managers" | "truckers";
const entityColumns = [
    {id: "name"},
    {id: "trade_number"},
    {id: "vat_number"},
    {id: "address"},
    {id: "managers"},
    {id: "truckers"},
];

const parseQuery = (queryString: string): EntitiesScreenQuery => {
    const parsedParams = parseQueryString(queryString, {
        parseBooleans: true,
        parseNumbers: true,
        arrayFormat: "comma",
    });

    return {
        ...parsedParams,
        text: Arrayify(parsedParams.text || []).map((t) => t.toString()),
    };
};

export function EntitiesScreen() {
    const location = useLocation();
    const history = useHistory();
    const dispatch = useDispatch();
    const [currentQuery, setCurrentQuery] = useState(parseQuery(location.search));

    const {
        companies: entities = [],
        page,
        hasNextPage,
        totalCount,
    }: any = useSelector(getCompaniesForCurrentQuery);

    const isLoading = useSelector(getCompaniesCurrentQueryLoadingStatus);

    const [currentEntity, setCurrentEntity] = useState<EntityInGroupView | null>(null);
    const [isAddEntityPanel, openAddEntityPanel, closeAddEntityPanel] = useToggle();
    const [isEntityDetailPanel, openEntityDetailPanel, closeEntityDetailPanel] = useToggle();
    const fetchEntities = useCallback((query: EntitiesScreenQuery, page = 1) => {
        dispatch(fetchSearchGroupViewCompanies(PARTNER_QUERY_NAME, query, page));
    }, []);

    useEffect(() => {
        fetchEntities(currentQuery);
    }, [currentQuery]);

    useEffectExceptOnMount(() => {
        const newQuery = parseQuery(location.search);
        setCurrentQuery(newQuery);
    }, [location.search]);

    const onEndReached = useCallback(
        () => hasNextPage && fetchEntities(currentQuery, page + 1),
        [currentQuery, page, hasNextPage]
    );

    const updateQuery = useCallback(
        (newQuery: EntitiesScreenQuery) =>
            history.replace({
                ...location,
                search: stringifyQueryObject(
                    {...currentQuery, ...newQuery},
                    {
                        skipEmptyString: true,
                        skipNull: true,
                        arrayFormat: "comma",
                    }
                ),
            }),
        [currentQuery]
    );

    const getColumnName = (column: Record<string, any>) => column.id;

    const getColumnLabel = (column: Record<string, EntityColumn>) => {
        switch (column.id) {
            case "name":
                return t("common.name");
            case "trade_number":
                return t("components.tradeNumber");
            case "vat_number":
                return t("components.VATNumber");
            case "address":
                return t("common.address");
            case "managers":
                return t("common.managers", {smart_count: 2});
            case "truckers":
                return t("common.truckers", {smart_count: 2});
            default:
                return "";
        }
    };

    const getRowCellContent = (entity: EntityInGroupView, columnName: string) => {
        switch (columnName) {
            case "name":
                return entity.name;
            case "trade_number":
                return entity.trade_number;
            case "vat_number":
                return entity.vat_number;
            case "address":
                return getReadableAddress(entity.primary_address);
            case "managers":
                return entity?.managers?.length ?? 0;
            case "truckers":
                return entity?.truckers?.length ?? 0;
            default:
                return null;
        }
    };
    return (
        <FullHeightMinWidthScreen p={3}>
            <Flex justifyContent="space-between" alignItems="center" mb={3}>
                <TabTitle
                    title={getTabTranslations(SidebarTabNames.ENTITIES)}
                    detailText={`- ${formatNumber(totalCount)} ${t("common.entities", {
                        smart_count: totalCount ?? 2,
                    })}`}
                />
                <Button onClick={openAddEntityPanel} data-testid="add-entity-button">
                    <Icon name="add" mr={3} />
                    {t("components.addAnEntity")}
                </Button>
            </Flex>

            <FilteringBar<EntitiesScreenQuery>
                filters={[]}
                query={currentQuery}
                updateQuery={updateQuery}
                resetQuery={{text: []}}
                searchEnabled
                searchPlaceholder={t("components.searchEntitiesList")}
                data-testid={"entities-search-bar"}
            />

            <Flex overflow="hidden" flexDirection="column" mt={3}>
                <Table
                    mt={3}
                    data-testid="table-entities"
                    isLoading={isLoading}
                    columns={entityColumns}
                    getColumnLabel={getColumnLabel}
                    getColumnName={getColumnName}
                    getRowId={(entity) => `${entity.pk}`}
                    getRowCellContent={getRowCellContent}
                    rows={entities}
                    hasNextPage={hasNextPage}
                    onClickOnRow={(entity) => {
                        setCurrentEntity(entity);
                        openEntityDetailPanel();
                    }}
                    onEndReached={onEndReached}
                ></Table>
            </Flex>
            {isAddEntityPanel && (
                <FloatingPanel width={0.33} minWidth={528} onClose={closeAddEntityPanel}>
                    <AddEntityPanel
                        onSubmit={() => {
                            fetchEntities(currentQuery, page);
                        }}
                        onClose={() => {
                            closeAddEntityPanel();
                        }}
                    />
                </FloatingPanel>
            )}
            {isEntityDetailPanel && currentEntity && (
                <FloatingPanel
                    bg={theme.colors.grey.light}
                    width={0.5}
                    minWidth={528}
                    onClose={() => {
                        setCurrentEntity(null);
                        closeEntityDetailPanel();
                    }}
                >
                    <EntityDetailPanel entity={currentEntity} />
                </FloatingPanel>
            )}
        </FullHeightMinWidthScreen>
    );
}
