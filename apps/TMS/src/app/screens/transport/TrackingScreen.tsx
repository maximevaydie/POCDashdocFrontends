import {apiService} from "@dashdoc/web-common";
import {BuildConstants} from "@dashdoc/web-core";
import {t} from "@dashdoc/web-core";
import {LoadingWheel} from "@dashdoc/web-ui";
import {css} from "@emotion/react";
import {formatDate} from "dashdoc-utils";
import Leaflet from "leaflet";
import React from "react";
import {MapContainer, Marker, Popup, TileLayer} from "react-leaflet";

interface TrackingPosition {
    created: Date;
    import_id: string;
    data_source: string;
    timestamp: Date;
    latitude: number;
    longitude: number;
    speed?: number;
    vehicle_license_plate: string;
    trailer_license_plate: string;
    trucker: number | null;
}

interface TrackingScreenProps {}

interface TrackingScreenState {
    positions: TrackingPosition[] | null;
    loading: boolean;
    error: boolean;
}

export class TrackingScreen extends React.Component<TrackingScreenProps, TrackingScreenState> {
    constructor(props: TrackingScreenProps) {
        super(props);
        this.state = {positions: null, loading: true, error: false};
    }

    componentDidMount = () => {
        this.fetchPositions();
        setTimeout(this.fetchPositions, 30 * 1000);
    };

    fetchPositions = async () => {
        try {
            const response = await apiService.get("/tracking-positions/last/", {apiVersion: "v4"});
            this.setState({positions: response.results, loading: false});
        } catch (error) {
            this.setState({loading: false, error: true});
        }
    };

    getMarkerIcon = (name: string) => {
        return Leaflet.icon({
            iconUrl: `${BuildConstants.staticUrl}img/marker_${name}.png`,
            iconSize: [35, 50],
            iconAnchor: [17.5, 47],
            popupAnchor: [0, -45],
        });
    };

    getMapElements = () => {
        let mapElements = [];
        let bounds = new Leaflet.LatLngBounds([]);

        if (!this.state.positions || this.state.positions.length === 0) {
            return {mapElements: null, bounds: null};
        }

        for (let trackingPosition of this.state.positions) {
            const lastTruckerPosition = {
                lat: trackingPosition.latitude,
                lng: trackingPosition.longitude,
            };
            mapElements.push(
                <Marker
                    key="trucker"
                    icon={this.getMarkerIcon("truck")}
                    position={lastTruckerPosition}
                >
                    <Popup>
                        <span>
                            {trackingPosition.vehicle_license_plate}
                            <br />
                            {formatDate(trackingPosition.timestamp, "PPpp")}
                        </span>
                    </Popup>
                </Marker>
            );
            bounds.extend(lastTruckerPosition);
        }
        return {mapElements, bounds};
    };

    _renderMap = () => {
        let {mapElements, bounds} = this.getMapElements();
        if (!bounds) {
            bounds = new Leaflet.LatLngBounds([58, -13], [34, 25]);
        }
        return (
            <MapContainer bounds={bounds} className="shipment-map-container">
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                />
                {mapElements}
            </MapContainer>
        );
    };

    render = () => {
        return (
            <div
                css={css`
                    display: flex;
                    flex: 1;
                    height: 100%;
                    position: relative;
                `}
            >
                {this.state.positions && !this.state.loading && this._renderMap()}
                {this.state.loading && <LoadingWheel />}
                {this.state.error && <p>{t("common.error")}</p>}
            </div>
        );
    };
}
