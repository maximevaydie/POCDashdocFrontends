import {t} from "@dashdoc/web-core";
import {Select, Modal, Text} from "@dashdoc/web-ui";
import {ManagerRole} from "dashdoc-utils";
import React, {FunctionComponent, useState} from "react";
import cloneDeep from "rfdc/default";

type CompanyRole = {
    company_pk: number;
    company_name: string;
    role: ManagerRole.Admin | ManagerRole.User | ManagerRole.ReadOnly | null;
};

type EditManagerRolesModalProps = {
    roles: CompanyRole[];
    onClose: () => void;
    onClick: (companyRoles: CompanyRole[]) => void;
};

export const EditManagerRolesModal: FunctionComponent<EditManagerRolesModalProps> = ({
    roles,
    onClick,
    onClose,
}) => {
    const [updatedRoles, setUpdatedRoles] = useState<CompanyRole[]>(cloneDeep(roles));

    const getPrettyLabel = (role: CompanyRole["role"]) => {
        if (role == ManagerRole.Admin) {
            return t("settings.adminRole");
        } else if (role == ManagerRole.User) {
            return t("settings.userRole");
        } else if (role == ManagerRole.ReadOnly) {
            return t("settings.readOnlyRole");
        } else {
            return t("settings.noAccess");
        }
    };

    return (
        <Modal
            title={"Edit permissions"}
            mainButton={{
                onClick: () => {
                    onClick(updatedRoles);
                },
            }}
            onClose={onClose}
        >
            <table>
                <tbody>
                    {updatedRoles.map((companyRole) => {
                        return (
                            <tr key={companyRole.company_pk}>
                                <td>
                                    <Text textOverflow="ellipsis">{companyRole.company_name}</Text>
                                </td>
                                <td width="250px">
                                    <Select
                                        data-testid="select-company-role"
                                        onChange={(
                                            option: {
                                                value: CompanyRole["role"];
                                                label: string;
                                            } | null
                                        ) => {
                                            const role = option?.value;
                                            const tmp = cloneDeep(updatedRoles);
                                            const idx = tmp.findIndex(
                                                (r) => r.company_pk == companyRole.company_pk
                                            );
                                            tmp[idx].role = role ?? null;
                                            setUpdatedRoles(tmp);
                                        }}
                                        options={[
                                            {
                                                value: ManagerRole.Admin,
                                                label: getPrettyLabel(ManagerRole.Admin),
                                            },
                                            {
                                                value: ManagerRole.User,
                                                label: getPrettyLabel(ManagerRole.User),
                                            },
                                            {
                                                value: ManagerRole.ReadOnly,
                                                label: getPrettyLabel(ManagerRole.ReadOnly),
                                            },
                                            {value: null, label: "Pas d'acces"},
                                        ]}
                                        value={{
                                            value: companyRole.role,
                                            label: getPrettyLabel(companyRole.role),
                                        }}
                                    />
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </Modal>
    );
};
