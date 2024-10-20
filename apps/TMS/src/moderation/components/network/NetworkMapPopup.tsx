import {Box, Button, Card, Flex, Link, LoadingWheel, Text} from "@dashdoc/web-ui";
import {formatDateDistance, useToggle, formatDateRelative} from "dashdoc-utils";
import React from "react";

import {Api} from "moderation/Api";
import {NetworkMapPopupTable} from "moderation/components/network/NetworkMapPopupTable";
import {DirectoryCompany, DirectoryCompanySimple} from "moderation/network-map/types";

function addHTTPS(url: string): string {
    if (!url.startsWith("https://")) {
        url = "https://" + url;
    }
    return url;
}

interface CustomButtonLinkProps {
    label: string;
    link: string;
    color: string;
    icon: string;
}

const CustomButtonLink: React.FC<CustomButtonLinkProps> = ({label, link, color, icon}) => {
    return (
        <Link
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            style={{
                color: color,
                padding: "5px",
                marginLeft: "10px",
                fontWeight: "bold",
                outline: "none",
                textDecoration: "none",
                border: "none",
                whiteSpace: "nowrap",
            }}
        >
            <i className={icon} style={{marginRight: "5px"}}></i>
            {label}
        </Link>
    );
};

export interface NetworkMapPopUpProps {
    directoryCompany: DirectoryCompanySimple;
    open?: boolean;
}

export const NetworkMapPopUp = ({directoryCompany, open = false}: NetworkMapPopUpProps) => {
    const [detailedDirectoryCompany, setDetailedDirectoryCompany] = React.useState<
        DirectoryCompany | undefined
    >(undefined);

    const handleGetDirectoryCompany = async () => {
        const response = await Api.get(`/directory-company/${directoryCompany.id}/`, {
            apiVersion: "web",
        });
        setDetailedDirectoryCompany(response);
    };

    React.useEffect(() => {
        setDetailedDirectoryCompany(undefined);
        handleGetDirectoryCompany();

        return () => {
            setDetailedDirectoryCompany(undefined);
        };
    }, [directoryCompany.id]);

    const [dropdownIsOpen, openDropdown, closeDropdown] = useToggle();

    const dashdoc_created_time = formatDateRelative(
        detailedDirectoryCompany?.dashdoc_created_time
    );

    const manager_last_login = formatDateDistance(detailedDirectoryCompany?.manager_last_login);

    return detailedDirectoryCompany ? (
        <Box width={"100%"} height={"100%"}>
            <Flex flexDirection={"column"} justifyContent={"space-between"} alignItems={"center"}>
                <Text variant="h1" mb={2} mt={2}>
                    {detailedDirectoryCompany.denomination}{" "}
                    {detailedDirectoryCompany.is_headquarters ? (
                        <span
                            style={{
                                backgroundColor: "#f3f3f3",
                                padding: "3px 5px",
                                borderRadius: "3px",
                                marginRight: "5px",
                                fontSize: "14px",
                                fontWeight: "bold",
                            }}
                        >
                            {"HQ"}
                        </span>
                    ) : null}
                    {detailedDirectoryCompany.dashdoc_account_type == "subscribed" ? (
                        <span
                            color="green.default"
                            style={{
                                backgroundColor: "#63d368",
                                color: "white",
                                padding: "3px 5px",
                                borderRadius: "3px",
                                marginRight: "5px",
                                fontSize: "14px",
                                fontWeight: "bold",
                            }}
                        >
                            {"Subscribed"}
                        </span>
                    ) : null}
                    {detailedDirectoryCompany.dashdoc_account_type == "invited" ? (
                        <span
                            style={{
                                backgroundColor: "#6eb3f7",
                                color: "white",
                                padding: "3px 5px",
                                borderRadius: "3px",
                                marginRight: "5px",
                                fontSize: "14px",
                                fontWeight: "bold",
                            }}
                        >
                            {"Invited"}
                        </span>
                    ) : null}
                </Text>

                <Flex flexDirection={"row"} alignItems={"center"} flexWrap={"wrap"}>
                    {detailedDirectoryCompany.crm_id ? (
                        <CustomButtonLink
                            label={"HubSpot"}
                            link={
                                "https://app.hubspot.com/contacts/9184177/company/" +
                                detailedDirectoryCompany.crm_id
                            }
                            color={"#ff704d"}
                            icon={"fa fa-link"}
                        />
                    ) : null}

                    {detailedDirectoryCompany.country == "FR" ? (
                        <CustomButtonLink
                            label={"Societe.com"}
                            link={`https://www.societe.com/societe/-${detailedDirectoryCompany.company_identification_number}.html`}
                            color={"#4666d4"}
                            icon={"fa fa-paperclip"}
                        />
                    ) : null}
                    {detailedDirectoryCompany.address ? (
                        <CustomButtonLink
                            label={"Maps"}
                            link={`https://www.google.com/maps/search/?api=1&query=${detailedDirectoryCompany.address},${detailedDirectoryCompany.city},${detailedDirectoryCompany.postcode},${detailedDirectoryCompany.country}`}
                            // maps://www.google.com/maps/dir/?api=1&travelmode=driving&layer=traffic&destination=[YOUR_LAT],[YOUR_LNG]
                            color={"green"}
                            icon={"fa fa-map"}
                        />
                    ) : null}
                    {detailedDirectoryCompany.latitude && detailedDirectoryCompany.longitude ? (
                        <CustomButtonLink
                            label={"Waze"}
                            link={`https://www.waze.com/ul?ll=${detailedDirectoryCompany.latitude},${detailedDirectoryCompany.longitude}&navigate=yes&zoom=17`}
                            // maps://www.google.com/maps/dir/?api=1&travelmode=driving&layer=traffic&destination=[YOUR_LAT],[YOUR_LNG]
                            color={"#4666d4"}
                            icon={"fa fa-map-marker"}
                        />
                    ) : null}
                </Flex>
                <Box position={"relative"} width={"100%"}>
                    <Button
                        variant="secondary"
                        onClick={() => {
                            if (dropdownIsOpen) {
                                closeDropdown();
                            } else {
                                openDropdown();
                            }
                        }}
                        width={"100%"}
                    >
                        {`${dropdownIsOpen ? "Hide" : "Show"} ${
                            detailedDirectoryCompany.dashdoc_companies.length
                        } linked companies `}
                    </Button>
                    <Card
                        position={"absolute"}
                        left={0}
                        right={0}
                        mt={2}
                        py={2}
                        zIndex="level1"
                        display={dropdownIsOpen ? "block" : "none"}
                        border={"1px solid #eaeaea"}
                    >
                        {detailedDirectoryCompany.dashdoc_companies ? (
                            <Flex
                                flexDirection={"column"}
                                alignItems={"left"}
                                maxHeight={"300px"}
                                overflowY={"scroll"}
                                overflowX={"hidden"}
                                style={{
                                    gap: "5px",
                                }}
                            >
                                {detailedDirectoryCompany.dashdoc_companies.map(
                                    (dashdoc_company) => (
                                        <Link
                                            key={dashdoc_company.id}
                                            href={`/moderation/companies/${dashdoc_company.id}/`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{
                                                color: "blue.default",
                                                padding: "5px",
                                                marginLeft: "10px",
                                                fontWeight: "bold",
                                                outline: "none",
                                                textDecoration: "none",
                                                border: "none",
                                                whiteSpace: "nowrap",
                                                width: "100%",
                                            }}
                                        >
                                            <Flex flexDirection={"column"} alignItems={"start"}>
                                                <Text variant="caption">
                                                    {dashdoc_company.name}
                                                </Text>
                                                <Text
                                                    variant="caption"
                                                    style={{
                                                        opacity: 0.5,
                                                    }}
                                                >
                                                    {dashdoc_company.created_by && (
                                                        <span>
                                                            invited by{" "}
                                                            {dashdoc_company.created_by.name}{" "}
                                                        </span>
                                                    )}
                                                </Text>
                                            </Flex>
                                        </Link>
                                    )
                                )}
                            </Flex>
                        ) : (
                            <Text>No Dashdoc company</Text>
                        )}
                    </Card>
                </Box>
            </Flex>

            <NetworkMapPopupTable
                tableName="Contact"
                rows={[
                    {
                        label: "Phone",
                        value: detailedDirectoryCompany.phone,
                        icon: "fa fa-phone",
                        link: detailedDirectoryCompany.phone
                            ? "tel:" + detailedDirectoryCompany.phone
                            : undefined,
                        popUpOpen: open,
                    },
                    {
                        label: "Email",
                        value: detailedDirectoryCompany.email,
                        icon: "fa fa-envelope",
                        link: detailedDirectoryCompany.email
                            ? "mailto:" + detailedDirectoryCompany.email
                            : undefined,
                        popUpOpen: open,
                    },
                    {
                        label: "Website",
                        value: detailedDirectoryCompany.website,
                        icon: "fa fa-globe",
                        link: detailedDirectoryCompany.website
                            ? addHTTPS(detailedDirectoryCompany.website)
                            : undefined,
                        popUpOpen: open,
                    },
                    {
                        label: "Address",
                        value: [
                            detailedDirectoryCompany.address,
                            detailedDirectoryCompany.city,
                            detailedDirectoryCompany.postcode,
                        ]
                            .filter(Boolean) // remove empty value
                            .join(", "),
                        icon: "fa fa-map-marker",
                        popUpOpen: open,
                    },
                ]}
            />

            <NetworkMapPopupTable
                tableName="Company"
                rows={[
                    {
                        label: "Company Type",
                        value: detailedDirectoryCompany.company_type,
                        icon: "fa fa-building",
                        popUpOpen: open,
                    },
                    {
                        label: "Lead Status",
                        value: detailedDirectoryCompany.lead_status,
                        icon: "fa fa-sun",
                        popUpOpen: open,
                    },
                    {
                        label: "company creation date in dashdoc",
                        value: dashdoc_created_time || "",
                        icon: "fa fa-clock",
                        popUpOpen: open,
                    },
                    {
                        label: "days since last manager login",
                        value: manager_last_login || "",
                        icon: "fa-solid fa-stopwatch",
                        popUpOpen: open,
                    },
                    {
                        label: "CRM Owner",
                        value: detailedDirectoryCompany.crm_owner_name,
                        icon: "fa fa-user",
                        popUpOpen: open,
                    },
                    {
                        label: "Official number of trucks",
                        value: detailedDirectoryCompany.official_vehicle_count,
                        icon: "fa fa-truck",
                        popUpOpen: open,
                    },
                    {
                        label: "Heavy Truck",
                        value: detailedDirectoryCompany.heavy_vehicle_count,
                        icon: "fa fa-truck",
                        popUpOpen: open,
                    },
                    {
                        label: "Light Truck",
                        value: detailedDirectoryCompany.light_vehicle_count,
                        icon: "fa fa-truck",
                        popUpOpen: open,
                    },
                    {
                        label: "Number of truckers",
                        value: detailedDirectoryCompany.truckers_count,
                        icon: "fa fa-users",
                        popUpOpen: open,
                    },
                    {
                        label: "Employee",
                        value: detailedDirectoryCompany.employee_count,
                        icon: "fa fa-users",
                        popUpOpen: open,
                    },
                    {
                        label: "Nace Code",
                        value: detailedDirectoryCompany.nace_code,
                        icon: "fa fa-folder",
                        popUpOpen: open,
                    },
                ]}
            />

            <NetworkMapPopupTable
                tableName="Tags"
                rows={[
                    {
                        label: "Business Sector",
                        value: detailedDirectoryCompany.business_sector,
                        icon: "fa fa-tag",
                        popUpOpen: open,
                    },
                    {
                        label: "TMS",
                        value: detailedDirectoryCompany.tms,
                        icon: "fa fa-tag",
                        popUpOpen: open,
                    },
                    {
                        label: "Telematics",
                        value: detailedDirectoryCompany.telematics_provider,
                        icon: "fa fa-tag",
                        popUpOpen: open,
                    },
                ]}
            />

            <NetworkMapPopupTable
                tableName="Legal"
                collapse={true}
                rows={[
                    {
                        label: "Siren",
                        value: detailedDirectoryCompany.company_identification_number,
                        icon: "fa fa-id-card",
                        popUpOpen: open,
                    },
                    {
                        label: "Siret",
                        value: detailedDirectoryCompany.trade_number,
                        icon: "fa fa-id-card",
                        popUpOpen: open,
                    },
                    {
                        label: "Vat",
                        value: detailedDirectoryCompany.vat_number,
                        icon: "fa fa-id-card",
                        popUpOpen: open,
                    },
                ]}
            />

            <Box margin={2}>
                <Text textAlign={"center"} fontStyle={"italic"} style={{opacity: 0.5}}>
                    last update {new Date(detailedDirectoryCompany.updated).toLocaleString()}
                </Text>
                <Flex justifyContent={"center"}></Flex>
            </Box>
        </Box>
    ) : (
        <LoadingWheel />
    );
};
