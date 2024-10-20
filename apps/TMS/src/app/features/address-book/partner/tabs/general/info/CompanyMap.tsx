import {getAdministrativeAddress, PartnerDetailOutput} from "@dashdoc/web-common";
import {theme, themeAwareCss} from "@dashdoc/web-ui";
import {Company} from "dashdoc-utils";
import isNil from "lodash.isnil";
import React from "react";
import {MapContainer, Marker, TileLayer} from "react-leaflet";

type Props = {
    company: Company | PartnerDetailOutput;
};

const BRUSSELS_POSITION = {lat: 50.8503396, lng: 4.3517103};
export function CompanyMap({company}: Props) {
    const address: {latitude: number | null; longitude: number | null} | undefined | null =
        getAdministrativeAddress(company);
    const position =
        isNil(address) || address.latitude === null || address.longitude === null
            ? null
            : {lat: address.latitude, lng: address.longitude};
    return (
        <MapContainer
            center={position || BRUSSELS_POSITION} // Center around europe if no position
            zoom={position === null ? 2 : 12} // Dezoom if no position
            style={themeAwareCss({height: "250px", width: "100%", zIndex: "level1"})(theme)}
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            />

            {position && <Marker position={position} />}
        </MapContainer>
    );
}
