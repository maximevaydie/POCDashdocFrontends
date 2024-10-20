import {t} from "@dashdoc/web-core";
import {
    Box,
    ClickOutside,
    Flex,
    Icon,
    Text,
    TextInput,
    TooltipWrapper,
    getShortTitle,
    theme,
} from "@dashdoc/web-ui";
import styled from "@emotion/styled";
import {Company, GroupView, Manager, ManagerRole} from "dashdoc-utils";
import React, {useCallback, useState} from "react";

import {GROUP_VIEW_PATH} from "../../../constants/constants";
import {useDispatch} from "../../../hooks/useDispatch";
import {updateAccountCompany} from "../../../../../../react/Redux/reducers/accountReducer";
import {managerService} from "../../../services/manager.service";

import {CompanySwitcherContainer} from "./CompanySwitcherContainer";

import type {ManagerCompany} from "../../../types/types";

type GroupViewCompanies = {
    group_view: GroupView;
    companies: ManagerCompany[];
};

type CompanySwitcherProps = {
    connectedManager: Manager | null;
    connectedCompany: Company | null;
    connectedGroupViews: GroupView[];
    connectedCompanies: ManagerCompany[];
    redirectPath: string;
    displaySmall?: boolean;
};

const MenuItem = styled(Box)`
    background-color: white;
    cursor: pointer;
    display: flex;
    align-items: center;

    &:hover {
        background-color: ${theme.colors.grey.light};
    }
`;

const SwitchIcon = styled(Icon)`
    padding: 8px;
    border-radius: 50%;
    min-width: unset;
    line-height: 0px;
    font-size: 16px;
    margin-right: 8px;
`;

export function CompanySwitcher({
    connectedManager,
    connectedCompany,
    connectedGroupViews,
    connectedCompanies,
    redirectPath,
    displaySmall = false,
}: CompanySwitcherProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const dispatch = useDispatch();
    const isGroupView = managerService.isGroupView(connectedManager);
    const isOpenable =
        managerService.hasAtLeastGroupAdminRole(connectedManager) || connectedCompanies.length > 1;

    const handleQueryChange = (value: string): void => {
        setSearchQuery(value);
    };

    const handleContainerClick = () => setIsOpen((isOpen) => !isOpen);

    const switchCompanyTo = ({pk: companyId}: ManagerCompany, path: string) => {
        dispatch(updateAccountCompany({companyId, path}));
    };

    const getFrontName = (company: Company | null) => {
        if (!company) {
            return null;
        }
        const isInvited = company.managed_by_name !== null;

        let name = company.name;
        if (isGroupView && company?.group_view_id) {
            const groupView = connectedGroupViews.find(
                (group_view) => group_view.pk === company.group_view_id
            );
            if (groupView) {
                name = groupView.name;
            }
        }
        const nameInitials = getShortTitle(name).toUpperCase();

        return (
            <>
                <Box display={["none", displaySmall ? "block" : "none"]}>
                    <TooltipWrapper content={name}>
                        <Text color="blue.dark">{nameInitials}</Text>
                    </TooltipWrapper>
                </Box>
                <Box
                    display={["flex", displaySmall ? "none" : "block"]}
                    data-testid="company-switcher-name"
                >
                    <Text>
                        {name}
                        <br />
                        {isInvited && !isGroupView && (
                            <Text as="i" lineHeight={0} color="grey.dark" variant="captionBold">
                                {t("sidebar.invitedBy")}&nbsp;
                                {company.managed_by_name}
                            </Text>
                        )}
                    </Text>
                </Box>
            </>
        );
    };

    const getGroupViewCompanies = useCallback(() => {
        const combinedGroupViewCompanies = connectedCompanies
            .filter((company) => {
                return `${company.name}${company.managed_by_name}`
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase());
            })
            .reduce(
                (
                    groupViewToCompanies: {
                        [groupViewId: number]: GroupViewCompanies;
                    },
                    company: ManagerCompany
                ) => {
                    if (company.group_view_id) {
                        if (!groupViewToCompanies[company.group_view_id]) {
                            const group_view = connectedGroupViews.find(
                                (group_view: GroupView) => group_view.pk === company.group_view_id
                            );
                            if (group_view) {
                                groupViewToCompanies[company.group_view_id] = {
                                    group_view,
                                    companies: [],
                                };
                            }
                        }
                        groupViewToCompanies[company.group_view_id].companies.push(company);
                    }
                    return groupViewToCompanies;
                },
                {}
            );
        return Object.values(combinedGroupViewCompanies);
    }, [connectedGroupViews, connectedCompanies, searchQuery]);

    const groupViewCompanies = getGroupViewCompanies().map(
        ({group_view, companies}: GroupViewCompanies, index: number) => {
            const showGroupView =
                connectedManager?.role === ManagerRole.GroupViewAdmin && group_view;
            return (
                <Box key={index}>
                    {showGroupView && (
                        <Box>
                            <MenuItem
                                fontSize={2}
                                color="grey.ultradark"
                                py={2}
                                px={4}
                                onClick={() => switchCompanyTo(companies[0], GROUP_VIEW_PATH)}
                            >
                                <SwitchIcon
                                    name="account"
                                    color="blue.default"
                                    backgroundColor="blue.ultralight"
                                />

                                <Box flex={1}>{group_view?.name ?? t("common.account")}</Box>
                            </MenuItem>
                        </Box>
                    )}
                    <Box>
                        {companies.map((company) => {
                            return (
                                <MenuItem
                                    fontSize={2}
                                    color="grey.ultradark"
                                    py={2}
                                    px={4}
                                    key={company.pk}
                                    onClick={() => switchCompanyTo(company, redirectPath)}
                                >
                                    {company.managed_by_name ? (
                                        <SwitchIcon
                                            name="envelope"
                                            color="green.default"
                                            backgroundColor="green.ultralight"
                                        />
                                    ) : (
                                        <SwitchIcon
                                            name="house"
                                            color="purple.default"
                                            backgroundColor="purple.ultralight"
                                        />
                                    )}
                                    <Box flex={1}>
                                        {company.name}
                                        {company.managed_by_name && (
                                            <>
                                                &nbsp;-&nbsp;{t("sidebar.invitedBy")}&nbsp;
                                                {company.managed_by_name}
                                            </>
                                        )}
                                    </Box>
                                    {company.last_switch_date && (
                                        <Icon name="clockArrow" color="grey.dark" fontSize={3} />
                                    )}
                                </MenuItem>
                            );
                        })}
                    </Box>
                </Box>
            );
        }
    );

    return (
        <CompanySwitcherContainer
            isOpenable={isOpenable}
            displaySmall={displaySmall}
            onClick={isOpenable ? handleContainerClick : undefined}
            data-testid="company-switcher-container"
        >
            <Flex
                alignItems="center"
                justifyContent={["space-between", displaySmall ? "center" : "space-between"]}
            >
                {getFrontName(connectedCompany)}
                {isOpenable && (
                    <Box display={["block", displaySmall ? "none" : "block"]} ml={2}>
                        <Icon
                            color="grey.ultradark"
                            name="arrowDown"
                            verticalAlign="sub"
                            scale={displaySmall ? 0.5 : 0.8}
                        />
                    </Box>
                )}
            </Flex>
            {isOpen && (
                <ClickOutside
                    onClickOutside={(e) => {
                        e.preventDefault();
                        setIsOpen(false);
                    }}
                >
                    <Box
                        color="grey.ultradark"
                        border="1px solid"
                        borderColor="grey.light"
                        backgroundColor="grey.white"
                        boxShadow="medium"
                        borderRadius={1}
                        zIndex="navbar"
                        position="absolute"
                        left={0}
                        top="100%"
                        mt={1}
                        width={["100%", "300px"]}
                    >
                        <Box p={2}>
                            <TextInput
                                autoFocus
                                autoComplete="off"
                                value={searchQuery || ""}
                                onChange={handleQueryChange}
                                leftIcon="search"
                                placeholder={t("sidebar.search_entity_placeholder")}
                            />
                        </Box>
                        <Box overflowY="auto" minHeight="175px" maxHeight="300px">
                            {groupViewCompanies}
                        </Box>
                    </Box>
                </ClickOutside>
            )}
        </CompanySwitcherContainer>
    );
}
