import {t} from "@dashdoc/web-core";
import {Select} from "@dashdoc/web-ui";
import React, {FunctionComponent} from "react";
import {OptionTypeBase} from "react-select";

import type {Delivery, Transport} from "app/types/transport";

type SitePickerProps = {
    label?: string;
    value: string | null;
    transport: Transport;
    setSite: (value: string) => void;
};

type SitePickerOptions = {
    site: {
        label: string;
        value: string;
    }[];
};

const getSiteOptions = (deliveries: Delivery[]): SitePickerOptions["site"] => {
    const originArray = deliveries.map((delivery) => delivery.origin);
    const destinationArray = deliveries.map((delivery) => delivery.destination);
    const siteArray = [...new Set(originArray.concat(destinationArray))]; // concat and remove duplicates
    const options = siteArray
        .map((site) => ({
            label: site.address ? site.address.name + ", " + site.address.postcode : null,
            value: site.uid,
        }))
        .filter((option) => option.label !== null); // remove sites with no adress
    // @ts-ignore
    options.unshift({label: t("components.allSitesWillAccessDocument"), value: null});
    // @ts-ignore
    return options;
};

const SitePicker: FunctionComponent<SitePickerProps> = (props) => {
    const options = getSiteOptions(props.transport.deliveries);
    if (props.value === null) {
        // @ts-ignore
        options[0].value = null;
    }

    const onChange = (option: OptionTypeBase) => {
        props.setSite(option.value);
    };

    return (
        <Select
            label={props.label}
            options={options}
            isSearchable={false}
            isClearable={false}
            value={{
                value: props.value,
                label: options.filter((option) => option.value === props.value)[0].label,
            }}
            onChange={onChange}
        />
    );
};

export {SitePicker};
