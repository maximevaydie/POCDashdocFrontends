import {HereSuggestField} from "@dashdoc/web-common";
import {Place, t} from "@dashdoc/web-core";
import {Box, SelectCountry} from "@dashdoc/web-ui";
import React from "react";
import {Controller, useFormContext} from "react-hook-form";
import {Site} from "types";

import {SettingsFormSection} from "../../SettingsFormSection";
import {SettingsSiteTabMap} from "../SettingsSiteMap";

export function SettingsSiteAddressFields({site}: {site: Site}) {
    const {getValues, setValue, trigger} = useFormContext();
    if (site.address == null) {
        return null;
    }
    const longitude = getValues("address.longitude") ?? site.address.longitude;
    const latitude = getValues("address.latitude") ?? site.address.latitude;
    return (
        <SettingsFormSection title={t("common.address")} mt={4}>
            <Controller
                name="address.address"
                render={({field, fieldState}) => (
                    <Box mb={2}>
                        <HereSuggestField
                            {...field}
                            searchMode={"discover"}
                            error={fieldState.error?.message}
                            complementaryDataAutocomplete={{
                                postcode: getValues("address.postcode"),
                                city: getValues("address.city"),
                            }}
                            onSuggestionClick={handleHereSuggest}
                            label={t("common.address")}
                            required
                            data-testid="settings-site-tab-address-input"
                        />
                    </Box>
                )}
            />
            <Box
                style={{
                    display: "grid",
                    gridTemplateColumns: `minmax(min-content, 130px) 1fr 1fr `,
                    gridGap: "8px",
                }}
            >
                <Controller
                    name="address.postcode"
                    render={({field, fieldState}) => (
                        <HereSuggestField
                            {...field}
                            searchMode={"discover"}
                            complementaryDataAutocomplete={{
                                address: getValues("address.address"),
                                city: getValues("address.city"),
                            }}
                            onSuggestionClick={handleHereSuggest}
                            error={fieldState.error?.message}
                            label={t("common.postcode")}
                            required
                            data-testid="settings-site-tab-postcode-input"
                        />
                    )}
                />
                <Controller
                    name="address.city"
                    render={({field, fieldState}) => (
                        <HereSuggestField
                            {...field}
                            searchMode={"discover"}
                            complementaryDataAutocomplete={{
                                address: getValues("address.address"),
                                postcode: getValues("address.postcode"),
                            }}
                            onSuggestionClick={handleHereSuggest}
                            error={fieldState.error?.message}
                            label={t("common.city")}
                            required
                            data-testid="settings-site-tab-city-input"
                        />
                    )}
                />
                <Controller
                    name="address.country"
                    render={({field, fieldState}) => (
                        <SelectCountry
                            {...field}
                            error={fieldState.error?.message}
                            isClearable={false}
                            menuPortalTarget={document.body}
                            styles={{
                                valueContainer: ({...provided}) => ({
                                    ...provided,
                                    height: 48,
                                }),
                            }}
                        />
                    )}
                />
            </Box>
            {longitude && latitude && <SettingsSiteTabMap latLng={{latitude, longitude}} mt={2} />}
        </SettingsFormSection>
    );

    function handleHereSuggest(place: Place) {
        const {address, city, countryCode, postcode, longitude, latitude} = place;
        setValue("address.address", address, {shouldTouch: true});
        setValue("address.city", city, {shouldTouch: true});
        setValue("address.country", countryCode?.toUpperCase() ?? "FR", {shouldTouch: true});
        setValue("address.postcode", postcode ?? "", {shouldTouch: true});
        setValue("address.longitude", longitude, {shouldTouch: true});
        setValue("address.latitude", latitude, {shouldTouch: true});
        trigger();
    }
}
