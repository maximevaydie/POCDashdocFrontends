import {getLocale} from "@dashdoc/web-core";
import {useState} from "react";

import {availableDateFormats, DateFormat} from "../features/fleet/DateFormatPicker";

export function useNuvoDateFormat() {
    const locale = getLocale();

    let guessedDateFormat =
        locale === "en"
            ? availableDateFormats.find(({key}) => key === "us")
            : availableDateFormats.find(({key}) => key === "standard");
    if (guessedDateFormat === undefined) {
        guessedDateFormat = availableDateFormats[0];
    }
    const [dateFormat, setDateFormat] = useState<DateFormat>(guessedDateFormat);
    return {dateFormat, setDateFormat};
}
