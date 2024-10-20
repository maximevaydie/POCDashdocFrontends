import {managerService} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Box, Flex, Table, Text} from "@dashdoc/web-ui";
import {Company, Manager, Trucker} from "dashdoc-utils";
import React, {FunctionComponent} from "react";

import {CompanyDetail} from "app/features/company/company-detail-panel";

import {CompanyInformationRow} from "../company/company-information-row";

type EntityInGroupView = Company & {managers: Manager[]; truckers: Trucker[]};

type EntityDetailPanelProps = {
    entity: EntityInGroupView;
};

type ManagerColumn = "display_name" | "email" | "role";

const managerColumns = [{id: "display_name"}, {id: "email"}, {id: "role"}];

const EntityDetailPanel: FunctionComponent<EntityDetailPanelProps> = ({entity}) => {
    const getColumnName = (column: Record<string, any>) => column.id;

    const getColumnLabel = (column: Record<string, ManagerColumn>) => {
        switch (column.id) {
            case "display_name":
                return t("common.name");
            case "email":
                return t("common.email");
            case "role":
                return t("common.role");
            default:
                return "";
        }
    };

    const getRowCellContent = (manager: Manager, columnName: string) => {
        switch (columnName) {
            case "display_name":
                return manager.display_name;
            case "email":
                return manager.user.email;
            case "role":
                return managerService.getRoleLabels()[manager.role];
            default:
                return "";
        }
    };

    return (
        <Flex flexDirection="column" m={4}>
            <Box bg="grey.white" p={4} mb={4} borderRadius={2}>
                <Text variant="title" display="inline-block" mb={2}>
                    {entity.name}
                </Text>
                <CompanyDetail company={entity} />
                <CompanyInformationRow
                    data-testid="company-information-row-id-dashdoc"
                    label={t("common.idDashdoc")}
                    icon="link"
                    value={`${entity.pk}`}
                />
            </Box>
            <Box bg="grey.white" p={4} mb={4} borderRadius={2}>
                <Text variant="title" display="inline-block" mb={2}>
                    {t("common.managers", {smart_count: 2}, {capitalize: true})}
                </Text>
                <Table
                    maxHeight="65vh"
                    getRowCellIsClickable={() => false}
                    overflow="auto"
                    columns={managerColumns}
                    rows={entity.managers}
                    getColumnLabel={getColumnLabel}
                    getColumnName={getColumnName}
                    getRowCellContent={getRowCellContent}
                />
            </Box>
        </Flex>
    );
};

export default EntityDetailPanel;
