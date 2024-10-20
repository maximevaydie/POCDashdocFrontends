import {t} from "@dashdoc/web-core";
import {Button, Icon, MapWithMarker, type LatLng} from "@dashdoc/web-ui";
import React, {useState} from "react";

type Props = {
    latLng: LatLng;
};

export function DocumentGeolocation({latLng}: Props) {
    const [open, setOpen] = useState<boolean>(false);
    return (
        <div>
            <Button variant="plain" onClick={() => setOpen(!open)}>
                <Icon name="address" mr={1} />
                {open
                    ? t("documentGeolocation.hideDocumentGeolocation")
                    : t("documentGeolocation.showDocumentGeolocation")}
            </Button>
            {open && <MapWithMarker latLng={latLng} showCoordinates />}
        </div>
    );
}
