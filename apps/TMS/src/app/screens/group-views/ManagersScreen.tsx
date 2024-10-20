import {Arrayify, FilteringBar, apiService, getConnectedManager} from "@dashdoc/web-common";
import {usePaginatedFetch} from "@dashdoc/web-common/src/hooks/usePaginatedFetch";
import {t} from "@dashdoc/web-core";
import {
    Badge,
    Box,
    Button,
    Flex,
    Icon,
    Modal,
    TabTitle,
    Table,
    Text,
    TooltipWrapper,
    toast,
} from "@dashdoc/web-ui";
import {FullHeightMinWidthScreen} from "@dashdoc/web-ui";
import {css} from "@emotion/react";
import {
    ManagerRole,
    copyToClipboard,
    formatNumber,
    parseQueryString,
    stringifyQueryObject,
    useEffectExceptOnMount,
    useToggle,
} from "dashdoc-utils";
import React, {FunctionComponent, useCallback, useEffect, useState} from "react";
import {RouteComponentProps} from "react-router";

import {getTabTranslations} from "app/common/tabs";
import {AddEditManagerPanel} from "app/features/groupviews/add-edit-manager-panel";
import {ManagerRoleBadge} from "app/features/groupviews/badges";
import {useSelector} from "app/redux/hooks";
import {SidebarTabNames} from "app/types/constants";

type ManagersScreenQuery = {
    text: string[];
};

type ManagersScreenProps = RouteComponentProps;

export type CompanyRole = {
    company_pk: number;
    company_name: string;
    role: ManagerRole.Admin | ManagerRole.User | ManagerRole.ReadOnly | null;
};

export type RowManager = {
    pk: number;
    first_name: string;
    last_name: string;
    email: string;
    language: string;
    is_group_admin: boolean;
    company_roles: CompanyRole[];
};

type ManagerColumn = {
    id: "name" | "email" | "access" | "delete" | "invite_link";
    name: string;
    width: string;
};
let managersColumns: ManagerColumn[] = [
    {id: "name", name: "name", width: "18em"},
    {id: "email", name: "email", width: "16em"},
    {id: "access", name: "access", width: "auto"},
    {id: "delete", name: "delete", width: "4em"},
];

const isTrainingEnv = import.meta.env.MODE === "training";

if (isTrainingEnv) {
    managersColumns.splice(managersColumns.length - 1, 0, {
        id: "invite_link",
        name: "invite_link",
        width: "16em",
    });
}

const parseQuery = (queryString: string): ManagersScreenQuery => {
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

export const ManagersScreen: FunctionComponent<ManagersScreenProps> = ({location, history}) => {
    const connectedManager = useSelector(getConnectedManager);

    const [currentQuery, setCurrentQuery] = useState(parseQuery(location.search));
    const [currentManager, setCurrentManager] = useState<RowManager | null>(null);
    const [isAddEditManagerPanel, openAddEditManagerPanel, closeAddEditManagerPanel] = useToggle();
    const [isDeleteManagerModal, openDeleteManagerModal, closeDeleteManagerModal] = useToggle();
    const [managersInviteLinks, setManagersInviteLinks] = useState<Record<string, string>>({});

    const {
        items: managers,
        loadNext: onEndReached,
        isLoading: isLoadingManagers,
        hasNext: hasNextManagers,
        totalCount: managersTotalCount,
        reload: reloadManagers,
    } = usePaginatedFetch<RowManager>("/groupviews/managers/", currentQuery, {apiVersion: "web"});

    useEffectExceptOnMount(() => {
        const newQuery = parseQuery(location.search);
        setCurrentQuery(newQuery);
    }, [location.search]);

    const refreshInviteLinks = async () => {
        if (!isTrainingEnv) {
            return;
        }
        const fetchedLinks: Record<string, string> = await apiService.get(
            "groupviews/managers/invite-links/",
            {
                apiVersion: "web",
            }
        );
        setManagersInviteLinks(fetchedLinks);
    };

    useEffect(() => {
        refreshInviteLinks();
    }, []);

    const updateQuery = useCallback(
        (newQuery: ManagersScreenQuery) =>
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

    const getColumnWidth = (column: ManagerColumn) => column.width;

    const getColumnLabel = (column: ManagerColumn) => {
        switch (column.id) {
            case "name":
                return t("common.name");
            case "email":
                return t("common.email");
            case "access":
                return (
                    <TooltipWrapper
                        content={
                            <Box maxWidth="300px" minWidth="150px" maxHeight="300px">
                                <Text variant="h1" mb={1}>
                                    {t("common.legend")}
                                </Text>
                                <ManagerRoleBadge role={ManagerRole.GroupViewAdmin} mb={2} />
                                <ManagerRoleBadge
                                    role={ManagerRole.Admin}
                                    companyName={t("settings.adminRole")}
                                    mb={2}
                                />
                                <ManagerRoleBadge
                                    role={ManagerRole.User}
                                    companyName={t("settings.userRole")}
                                    mb={2}
                                />
                                <ManagerRoleBadge
                                    role={ManagerRole.ReadOnly}
                                    companyName={t("settings.readOnlyRole")}
                                />
                            </Box>
                        }
                        placement="right"
                    >
                        {t("common.access")}
                        <Icon name="info" ml={2} />
                    </TooltipWrapper>
                );
            case "delete":
                return "";
            case "invite_link":
                return t("components.invitationLink");
            default:
                return "";
        }
    };

    const handleDeleteManager = async () => {
        // check did to please the linter, currentManager should always be defined in this case
        if (currentManager != null) {
            await apiService.delete(`/groupviews/managers/${currentManager.pk}/`, {
                apiVersion: "web",
            });
            setCurrentManager(null);
            closeDeleteManagerModal();
            reloadManagers();
        }
    };

    const getManagerAccessTooltipContent = (manager: RowManager) => {
        const rolesAdmin = manager.company_roles.filter((cr) => cr.role == ManagerRole.Admin);
        const rolesUser = manager.company_roles.filter((cr) => cr.role == ManagerRole.User);
        const rolesReadonly = manager.company_roles.filter(
            (cr) => cr.role == ManagerRole.ReadOnly
        );

        if (manager.is_group_admin) {
            return (
                <Box>
                    <Text fontWeight={"bold"}>
                        {manager.first_name} {manager.last_name}
                    </Text>
                    <ManagerRoleBadge role={ManagerRole.GroupViewAdmin} />
                </Box>
            );
        } else {
            return (
                <Box maxWidth="300px" minWidth="150px" maxHeight="300px">
                    <Text variant="h1" mb={1}>
                        {manager.first_name} {manager.last_name}
                    </Text>

                    <Text variant="captionBold">{t("settings.adminRole")}</Text>
                    {rolesAdmin.map((companyRole, index) => {
                        return (
                            <ManagerRoleBadge
                                key={index}
                                companyName={companyRole.company_name}
                                role={ManagerRole.Admin}
                                mb={2}
                            />
                        );
                    })}

                    <Text variant="captionBold">{t("settings.userRole")}</Text>
                    {rolesUser.map((companyRole, index) => {
                        return (
                            <ManagerRoleBadge
                                key={index}
                                companyName={companyRole.company_name}
                                role={ManagerRole.User}
                                mb={2}
                            />
                        );
                    })}
                    <Text variant="captionBold">{t("settings.readOnlyRole")}</Text>
                    {rolesReadonly.map((companyRole, index) => {
                        return (
                            <ManagerRoleBadge
                                key={index}
                                companyName={companyRole.company_name}
                                role={ManagerRole.ReadOnly}
                                mb={2}
                            />
                        );
                    })}
                </Box>
            );
        }
    };

    const getAccessibleCompanies = (manager: RowManager) => {
        if (manager.is_group_admin) {
            return (
                <Box>
                    <ManagerRoleBadge role={ManagerRole.GroupViewAdmin} />
                </Box>
            );
        }

        const rolesNotNull = manager.company_roles.filter((cr) => cr.role != null);
        const hasMore = Math.max(rolesNotNull.length - 3, 0);
        const firstThreeRoles = rolesNotNull.slice(0, 3);

        return (
            <Flex>
                {firstThreeRoles.map((companyRole, index) => {
                    const role = companyRole.role;
                    return (
                        <ManagerRoleBadge
                            key={index}
                            companyName={companyRole.company_name}
                            // @ts-ignore because `null` roles are filtered just above
                            role={role}
                        />
                    );
                })}
                {hasMore != 0 && (
                    <Badge variant="neutral">
                        {"+"} {hasMore}
                    </Badge>
                )}
            </Flex>
        );
    };

    const getRowCellContent = (manager: RowManager, columnName: string) => {
        switch (columnName) {
            case "name":
                return `${manager.first_name} ${manager.last_name}`;
            case "email":
                return manager.email;
            case "access":
                return (
                    <TooltipWrapper
                        content={getManagerAccessTooltipContent(manager)}
                        placement="right"
                    >
                        {getAccessibleCompanies(manager)}
                    </TooltipWrapper>
                );
            case "delete":
                return connectedManager && manager.pk !== connectedManager?.pk ? (
                    <Icon
                        data-testid="delete-manager-button"
                        name="delete"
                        onClick={(e) => {
                            e.stopPropagation();
                            setCurrentManager(manager);
                            openDeleteManagerModal();
                        }}
                        color="grey.dark"
                        css={css`
                            padding: 8px;
                            font-size: 16px;
                            float: right;
                            margin-right: 8px;
                        `}
                    />
                ) : null;
            case "invite_link":
                if (!(manager.pk in managersInviteLinks)) {
                    return "";
                }
                return (
                    <Button
                        variant="plain"
                        onClick={() =>
                            copyToClipboard(
                                managersInviteLinks[manager.pk],
                                () => {
                                    closeAddEditManagerPanel(); // Very (ou)hacky but does the job
                                    toast.success(t("common.linkCopied"));
                                },
                                () => {
                                    closeAddEditManagerPanel();
                                    toast.error(t("common.linkCopyFailed"));
                                }
                            )
                        }
                    >
                        {t("common.copyLink")}
                    </Button>
                );
            default:
                return null;
        }
    };

    const getDefaultCompanyRoles = () => {
        if (managers && managers.length > 0) {
            return managers[0].company_roles.map((r) => {
                return {
                    company_pk: r.company_pk,
                    company_name: r.company_name,
                    role: null,
                };
            });
        } else {
            return [];
        }
    };

    return (
        <FullHeightMinWidthScreen p={3}>
            <Flex justifyContent="space-between" alignItems="center" mb={3}>
                <TabTitle
                    title={getTabTranslations(SidebarTabNames.USERS)}
                    detailText={`- ${formatNumber(managersTotalCount)} ${t("common.managers", {
                        smart_count: managersTotalCount ?? 2,
                    })}`}
                />
                <Button
                    onClick={() => {
                        setCurrentManager(null);
                        openAddEditManagerPanel();
                    }}
                    data-testid="add-manager-button"
                >
                    <Icon name="add" mr={3} />
                    {t("settings.inviteUser")}
                </Button>
            </Flex>

            <FilteringBar<ManagersScreenQuery>
                filters={[]}
                query={currentQuery}
                updateQuery={updateQuery}
                resetQuery={{text: []}}
                searchEnabled
                searchPlaceholder={t("components.searchUsersList")}
                data-testid={"managers-search-bar"}
            />

            <Flex overflow="hidden" flexDirection="column" mt={3}>
                <Table
                    mt={3}
                    data-testid="table-managers"
                    isLoading={isLoadingManagers}
                    columns={managersColumns}
                    getColumnLabel={getColumnLabel}
                    getColumnWidth={getColumnWidth}
                    getRowId={(manager) => `${manager.pk}`}
                    getRowCellContent={getRowCellContent}
                    rows={managers}
                    hasNextPage={hasNextManagers}
                    onEndReached={onEndReached}
                    onClickOnRow={(manager) => {
                        setCurrentManager(manager);
                        openAddEditManagerPanel();
                    }}
                ></Table>
            </Flex>
            {isAddEditManagerPanel && (
                <AddEditManagerPanel
                    manager={currentManager}
                    defaultCompanyRoles={getDefaultCompanyRoles()}
                    onClose={() => {
                        closeAddEditManagerPanel();
                        setCurrentManager(null);
                    }}
                    onSubmit={() => {
                        reloadManagers();
                    }}
                />
            )}
            {isDeleteManagerModal && (
                <Modal
                    title={t("settings.deleteUser")}
                    mainButton={{
                        children: t("common.delete"),
                        severity: "danger",
                        "data-testid": "delete-manager-modal-button",
                        onClick: handleDeleteManager,
                    }}
                    onClose={closeDeleteManagerModal}
                    secondaryButton={{
                        onClick: closeDeleteManagerModal,
                    }}
                >
                    <Text>
                        <p>{t("settings.informationDeleteUser")}</p>
                        <p>{t("settings.confirmDeleteUser")}</p>
                    </Text>
                </Modal>
            )}
        </FullHeightMinWidthScreen>
    );
};
