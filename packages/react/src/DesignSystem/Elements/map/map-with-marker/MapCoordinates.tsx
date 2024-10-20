import {t} from "@dashdoc/web-core";
import {theme} from "@dashdoc/web-ui";
import styled from "@emotion/styled";
import React from "react";

import {LatLng} from "./map.types";

type Props = {
    latLng: LatLng;
};
export function MapCoordinates({latLng}: Props) {
    return (
        <CoordinatesContainer>
            <div className="col-md-12">
                <label style={{fontWeight: "bold"}}>{t("components.gpsCoordinates")}</label>
            </div>
            <div className="inputs">
                <input
                    className="form-control"
                    name="latitude"
                    placeholder={t("common.latitude")}
                    value={latLng?.latitude}
                    data-testid="map-marker-latitude"
                    disabled
                />
                <input
                    className="form-control"
                    name="longitude"
                    style={{marginLeft: "10px"}}
                    placeholder={t("common.longitude")}
                    value={latLng?.longitude}
                    data-testid="map-marker-longitude"
                    disabled
                />
            </div>
        </CoordinatesContainer>
    );
}

const CoordinatesContainer = styled("div")`
    position: absolute;
    background-color: ${theme.colors.grey.white};
    z-index: 1000;
    bottom: 20px;
    left: 20px;
    width: 235px;
    border: 1px solid ${theme.colors.grey.light};
    border-radius: 4px;
    padding: 10px;
    transition: background-color 0.3s ease-out;

    & input {
        background-color: transparent;
        width: 100px;
    }

    & > .inputs > input {
        display: inline-block;
        margin-left: "10px";
    }
`;
