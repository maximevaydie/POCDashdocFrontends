import {Flex, Link, TooltipWrapper} from "@dashdoc/web-ui";
import {NoWrap} from "@dashdoc/web-ui";
import styled from "@emotion/styled";
import React, {FunctionComponent, useMemo, useState} from "react";

const Tr = styled.tr`
    &:hover {
        background-color: #f3f3f3;
        cursor: pointer;
        border-radius: 3px;
    }
`;

const Td = styled.td`
    padding: 5px;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const Tag = styled.span`
    background-color: #f3f3f3;
    padding: 3px 5px;
    border-radius: 5px;
    margin-right: 5px;
    font-size: 14px;
    font-weight: bold;
`;
interface CustomDividerProps {
    label: string;
    pins?: number;
}

const CustomDivider: React.FC<CustomDividerProps> = ({label, pins}) => {
    return (
        <Flex flexDirection={"row"} alignItems={"center"}>
            <div style={{width: "100%", border: ".1px solid #f3f3f3", margin: "15px 0px"}} />
            <div
                style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    margin: "10px",
                }}
            >
                <strong>{label}</strong>
                {pins ? (
                    <div
                        style={{
                            margin: "5px",
                            backgroundColor: "#f3f3f3",
                            borderRadius: "10px",
                            width: "20px",
                            height: "20px",
                            fontWeight: "bold",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                        }}
                    >
                        {pins}
                    </div>
                ) : null}
            </div>
            <div style={{width: "100%", border: ".1px solid #f3f3f3", margin: "15px 0px"}} />
        </Flex>
    );
};

interface CustomTrProps {
    value: string | number | string[];
    label: string;
    icon: string;
    link?: string;
    popUpOpen: boolean;
}

const CustomTr: React.FC<CustomTrProps> = ({value, label, icon, link, popUpOpen}) => {
    return (
        <Tr>
            <TooltipWrapper content={label}>
                <i className={icon} style={{opacity: 0.3}}></i>
            </TooltipWrapper>
            {popUpOpen ? (
                <td style={{padding: "3px", opacity: 0.3, width: "120px"}}>{label}</td>
            ) : null}
            <td style={{padding: "3px", textAlign: "center", width: "20px"}}>
                {link ? (
                    <Link href={link} target="_blank" rel="noopener noreferrer">
                        <i className="fa fa-link" style={{opacity: 0.3}}></i>
                    </Link>
                ) : null}
            </td>
            <Td
                style={{padding: "5px", width: "auto"}}
                onClick={() => {
                    if (value !== null) {
                        navigator.clipboard.writeText(String(value));
                    }
                }}
            >
                <TooltipWrapper content={value}>
                    <NoWrap>
                        {Array.isArray(value) ? (
                            value.length > 0 ? (
                                value.map((item: string) => {
                                    return <Tag key={item}>{item}</Tag>;
                                })
                            ) : (
                                <i style={{opacity: 0.3}}>No data</i>
                            )
                        ) : value ? (
                            <strong>{value}</strong>
                        ) : (
                            <i style={{opacity: 0.3}}>No data</i>
                        )}
                    </NoWrap>
                </TooltipWrapper>
            </Td>
        </Tr>
    );
};

export interface NetworkMapPopupTableProps {
    tableName: string;
    collapse?: boolean;
    rows: CustomTrProps[];
}

export const NetworkMapPopupTable: FunctionComponent<NetworkMapPopupTableProps> = ({
    tableName,
    collapse = false,
    rows,
}) => {
    const [isCollapsed, setIsCollapsed] = useState(collapse);

    const numberOfPins = useMemo(() => {
        return rows.reduce((pins, row) => {
            if (Array.isArray(row.value)) {
                return pins + row.value.length;
            } else if (row.value !== null && row.value !== "") {
                return pins + 1;
            }
            return pins;
        }, 0);
    }, [rows]);

    return (
        <>
            <div onClick={() => setIsCollapsed(!isCollapsed)} style={{cursor: "pointer"}}>
                <CustomDivider label={tableName} pins={numberOfPins} />
            </div>
            <div
                style={
                    isCollapsed
                        ? {
                              height: "0px",
                              overflow: "hidden",
                              transition: "height 0.3s ease-in-out",
                          }
                        : {
                              height: "auto",
                          }
                }
            >
                <table style={{border: "none", width: "100%", textAlign: "left"}}>
                    <tbody>
                        {rows.map((row, index) => (
                            <CustomTr
                                key={index}
                                value={row.value}
                                label={row.label}
                                icon={row.icon}
                                link={row.link}
                                popUpOpen={row.popUpOpen}
                            />
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
};
