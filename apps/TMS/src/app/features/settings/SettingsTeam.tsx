import {
    Arrayify,
    FilteringBar,
    SearchQuery,
    fetchSearchManagers,
    fetchUsages,
    getConnectedCompany,
    getConnectedManager,
    getManagersUsage,
    managerService,
} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {
    Box,
    Button,
    Flex,
    Icon,
    ColumnDirection,
    Table,
    Text,
    TooltipWrapper,
    UserAvatar,
} from "@dashdoc/web-ui";
import {
    Manager,
    ManagerRole,
    formatNumber,
    parseQueryString,
    stringifyQueryObject,
    useEffectExceptOnMount,
    useToggle,
} from "dashdoc-utils";
import React, {FunctionComponent, useCallback, useEffect, useState} from "react";
import {RouteComponentProps, withRouter} from "react-router";

import {ManagersUsageBadge} from "app/features/subscription/ManagersUsageBadge";
import {useDispatch, useSelector} from "app/redux/hooks";
import {
    getManagersCurrentQueryLoadingStatus,
    getManagersForCurrentQuery,
} from "app/redux/selectors";

import {AddEditManagerModal} from "./AddEditManagerModal";

const parseQuery = (queryString: string): {text: string[]} => {
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

type ManagerColumn = "display_name" | "email" | "role" | "edit";

let managersColumns = [{id: "display_name"}, {id: "email"}, {id: "role"}, {id: "edit"}];

type SettingsTeamProps = RouteComponentProps;

type TeamQuery = {
    text: string[];
    ordering?: string;
};

const SettingsTeam: FunctionComponent<SettingsTeamProps> = ({location, history}) => {
    const dispatch = useDispatch();

    const isLoading = useSelector(getManagersCurrentQueryLoadingStatus);
    const {managers = [], page, hasNextPage, pageCount} = useSelector(getManagersForCurrentQuery);

    // @ts-ignore
    const connectedManagerPk = useSelector(getConnectedManager).pk;
    const connectedCompany = useSelector(getConnectedCompany);
    const managersUsage = useSelector(getManagersUsage);
    const managedByName = connectedCompany?.managed_by_name;
    const canInviteManagers = !managedByName;
    const [isAddEditManagerModalOpen, openAddEditManagerModal, closeAddEditManagerModal] =
        useToggle();

    const [selectedManagerPk, setSelectedManagerPk] = useState<number | null>(null);

    const sortableColumns = {
        display_name: true,
        email: true,
    };
    const [ordering, setOrdering] = useState<Record<string, ColumnDirection> | null>({});

    useEffect(() => {
        dispatch(fetchUsages());
    }, []);

    const [currentQuery, setCurrentQuery] = useState({
        ...parseQuery(location.search),
    });

    const fetchManagers = useCallback(
        async (query: TeamQuery, page = 1) =>
            await dispatch(fetchSearchManagers("managers", query, page)),
        []
    );

    useEffect(() => {
        fetchManagers(currentQuery, page);
    }, [currentQuery]);

    const updateQuery = useCallback(
        (newQuery: TeamQuery) =>
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

    useEffectExceptOnMount(() => {
        const newQuery = parseQuery(location.search);
        setCurrentQuery(newQuery);
    }, [location.search]);

    useEffect(() => {
        if (ordering && Object.keys(ordering).length) {
            const [columnName, direction] = Object.entries(ordering)[0];
            const queryParameter = getQueryParameter(columnName as ManagerColumn);
            updateQuery({
                ...currentQuery,
                ordering: (direction === "desc" ? "-" : "") + queryParameter,
            });
        } else {
            updateQuery({
                ...currentQuery,
                ordering: undefined,
            });
        }
    }, [ordering]);

    const onEndReached = () => hasNextPage && fetchManagers(currentQuery, page + 1);

    const getEditButton = (index: number, manager: Manager) => {
        if (
            // It is not possible to edit it self
            connectedManagerPk == manager.pk ||
            // It is not possible to invite managers when the company is managed by another company
            !canInviteManagers
        ) {
            return <></>;
        }

        const isGroupViewAdmin = manager.role == ManagerRole.GroupViewAdmin;
        const button = (
            <Flex>
                <Button
                    data-testid={`settings-team-edit-${index}`}
                    variant="secondary"
                    mr={2}
                    onClick={() => {
                        setSelectedManagerPk(manager.pk);
                        openAddEditManagerModal();
                    }}
                    disabled={isGroupViewAdmin}
                >
                    {t("common.edit")}
                </Button>
            </Flex>
        );

        if (isGroupViewAdmin) {
            return (
                <TooltipWrapper
                    content={t("components.cannotEditGroupAdminFromCompanySettings")}
                    placement="left"
                    boxProps={{display: "inline-block"}}
                >
                    {button}
                </TooltipWrapper>
            );
        } else {
            return button;
        }
    };

    const getQueryParameter = (column: ManagerColumn) => {
        switch (column) {
            case "display_name":
                return "user__last_name";
            case "email":
                return "user__email";
            default:
                return "";
        }
    };
    const getColumnName = (column: Record<string, any>) => column.id;
    const getColumnLabel = (column: Record<string, ManagerColumn>) => {
        switch (column.id) {
            case "display_name":
                return t("common.name");
            case "email":
                return t("common.email");
            case "role":
                return t("settings.roleLabel");
            case "edit":
                return t("common.edit");
            default:
                return "";
        }
    };
    const getRowId = (row: Manager) => row.pk.toString();
    const getRowKey = (row: Manager) => row.pk.toString();
    const getRowCellContent = (manager: Manager, columnName: string, index: number) => {
        switch (columnName) {
            case "display_name":
                return (
                    <Flex alignItems="center">
                        <UserAvatar
                            name={manager.user.display_name}
                            picture={manager.profile_picture}
                        />
                        <Text ml={2}>{manager.user.display_name}</Text>
                    </Flex>
                );
            case "email":
                return (
                    <Text height="38px" lineHeight="38px">
                        {manager.user.email}
                    </Text>
                );
            case "role":
                return (
                    <Text height="38px" lineHeight="38px">
                        {managerService.getRoleLabels()[manager.role]}
                    </Text>
                );
            case "edit":
                return getEditButton(index, manager);
            default:
                if (
                    columnName in manager &&
                    typeof manager[columnName as keyof Manager] === "string"
                ) {
                    return manager[columnName as keyof Manager] as string;
                }
                return null;
        }
    };

    return (
        <Box>
            <Box>
                <Flex>
                    <Text variant="title" mb={2}>
                        {t("settings.team")}
                    </Text>
                    <Box ml={2}>
                        {managersUsage !== null && (
                            <ManagersUsageBadge
                                managers={managersUsage.used}
                                managersSoftLimit={managersUsage.soft_limit}
                                periodStartDate={managersUsage.period_start_date}
                                periodEndDate={managersUsage.period_end_date}
                            />
                        )}
                    </Box>
                </Flex>
                <Text>
                    {canInviteManagers
                        ? t("settings.teamDescription")
                        : t("settings.team.cannotInviteManagers", {
                              managedByName,
                          })}
                </Text>
            </Box>
            <Flex height={"calc(90vh - 10em)"} flexDirection="column" overflow="hidden" pb={3}>
                <Flex my={3} justifyContent="space-between" alignItems="center" flexWrap="wrap">
                    <Box flex={1}>
                        <Flex alignItems="center" mb={1} justifyContent="space-between">
                            <Box width="50%" my={1}>
                                <FilteringBar<SearchQuery>
                                    filters={[]}
                                    query={currentQuery}
                                    updateQuery={updateQuery}
                                    resetQuery={{text: []}}
                                    searchEnabled
                                    searchPlaceholder={t("settings.searchByName")}
                                    data-testid={"settings-managers-search-bar"}
                                />
                            </Box>
                            <Flex alignItems="center">
                                <Box ml={2}>
                                    {canInviteManagers && (
                                        <Button
                                            onClick={() => {
                                                setSelectedManagerPk(null);
                                                openAddEditManagerModal();
                                            }}
                                            data-testid="settings-team-add"
                                        >
                                            <Icon name="add" mr={2} />
                                            {t("settings.inviteUser")}
                                        </Button>
                                    )}
                                </Box>
                            </Flex>
                        </Flex>

                        <Box alignItems="center">
                            <Text mx={4}>
                                {formatNumber(pageCount)}{" "}
                                {t("common.managers", {
                                    smart_count: pageCount ?? 2,
                                })}
                            </Text>
                        </Box>
                    </Box>
                </Flex>
                <Table
                    mb={4}
                    height="auto"
                    data-testid="settings-team-table"
                    columns={managersColumns}
                    sortableColumns={sortableColumns}
                    getColumnLabel={getColumnLabel}
                    getColumnName={getColumnName}
                    isLoading={isLoading}
                    rows={managers}
                    getRowId={getRowId}
                    getRowKey={getRowKey}
                    getRowCellContent={getRowCellContent}
                    ordering={ordering}
                    onOrderingChange={(newOrdering) => setOrdering(newOrdering)}
                    hasNextPage={hasNextPage}
                    onEndReached={onEndReached}
                />
                {isAddEditManagerModalOpen && (
                    <AddEditManagerModal
                        managerPk={selectedManagerPk}
                        companyCountry={connectedCompany?.country ?? "EN"}
                        onClose={() => {
                            closeAddEditManagerModal();
                            fetchManagers(currentQuery);
                        }}
                        usage={managersUsage}
                    />
                )}
                <Box mt={2}>
                    {t("settings.roleDescriptions")} :
                    <Box as="ul">
                        <Box as="li">
                            <Text display="inline" fontWeight={600}>
                                {t("settings.adminRole")}
                            </Text>
                            <Text display="inline">
                                {": " + t("settings.adminRoleDescription")}
                            </Text>
                        </Box>
                        <Box as="li">
                            <Box>
                                <Text display="inline" fontWeight={600}>
                                    {t("common.user")}
                                </Text>
                                <Text display="inline">
                                    {": " + t("settings.userRoleDescription")}
                                </Text>
                            </Box>
                        </Box>
                        <Box as="li">
                            <Box>
                                <Text display="inline" fontWeight={600}>
                                    {t("settings.readOnlyRole")}
                                </Text>
                                <Text display="inline">
                                    {": " + t("settings.readOnlyRoleDescription")}
                                </Text>
                            </Box>
                        </Box>
                    </Box>
                </Box>
            </Flex>
        </Box>
    );
};

export default withRouter(SettingsTeam);
