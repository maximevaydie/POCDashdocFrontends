import {t} from "@dashdoc/web-core";
import {Box, Flex, Icon, OnMobile, Text, theme, themeAwareCss} from "@dashdoc/web-ui";
import {SecurityProtocolLink} from "features/security-protocol/SecurityProtocolLink";
import React from "react";
import {MapContainer, Marker, TileLayer} from "react-leaflet";
import {useSelector} from "redux/hooks";
import {selectSite} from "redux/reducers/flow/site.slice";

export function PublicContent() {
    const site = useSelector(selectSite);
    if (site === null) {
        return null;
    }
    const {contact_email, contact_phone} = site;
    const {address, city, country, postcode, latitude, longitude} = site.address;
    const cityAndCountry = `${postcode} ${city} (${country})`;
    const position = latitude && longitude ? {lat: latitude, lng: longitude} : null;
    return (
        <>
            <Box mx={[2, 3, 3]} py={5} borderBottom="1px solid" borderColor="grey.light">
                {position && (
                    <Box mt={3} mb={5}>
                        <OnMobile>
                            <Text variant="h1" color="grey.dark" mb={2}>
                                {t("common.informations")}
                            </Text>
                        </OnMobile>
                        <SiteMap position={position} />
                    </Box>
                )}

                <Text variant="h1" color="grey.dark" mb={2}>
                    {t("common.address")}
                </Text>

                <Text fontWeight={600}>{site.name}</Text>
                <Text>{address}</Text>
                <Text>{cityAndCountry}</Text>
            </Box>

            <Box mx={[2, 3, 3]} py={5} borderBottom="1px solid" borderColor="grey.light">
                <Text variant="h1" color="grey.dark" mb={2}>
                    {t("sidebar.home")}
                </Text>

                <Flex alignItems="center">
                    <Icon mr={1} name="envelope" />
                    <Text>{contact_email || t("common.unspecified")}</Text>
                </Flex>

                <Flex alignItems="center">
                    <Icon mr={1} name="phone" />
                    <Text>{contact_phone || t("common.unspecified")}</Text>
                </Flex>
            </Box>

            {/* TODO: Add opening time */}

            {site.security_protocol && (
                <Box mx={[2, 3, 3]} py={5} borderBottom="1px solid" borderColor="grey.light">
                    <Text variant="h1" color="grey.dark" mb={2}>
                        {t("common.securityProtocol")}
                    </Text>

                    <Flex alignItems="center">
                        <SecurityProtocolLink securityProtocol={site.security_protocol} />
                    </Flex>
                </Box>
            )}
        </>
    );
}

function SiteMap({
    position,
}: {
    position: {
        lat: number;
        lng: number;
    };
}) {
    return (
        <Box mt={3} mb={5}>
            <MapContainer
                center={position}
                zoom={12}
                style={themeAwareCss({height: "250px", width: "100%", zIndex: "level1"})(theme)}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                />
                <Marker position={position} />
            </MapContainer>
        </Box>
    );
}
