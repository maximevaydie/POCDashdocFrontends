import {getLocale} from "dashdoc-utils";

function zeroPad(num: number, size: number) {
    var s = `${num}`;

    while (s.length < size) {
        s = "0" + s;
    }

    return s;
}

function isImage(url: string) {
    return /\.(jpg|gif|png|jpeg|svg)$/i.test(url);
}

function isDownload(url: string) {
    return !/\.(jpg|gif|png|jpeg|svg|pdf)$/i.test(url);
}

function isPdf(url: string) {
    return /\.pdf$/i.test(url);
}

function validateEmail(email: string) {
    const re =
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

function isDeviceIos() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}

function getCurrencySymbol(currency: string, {locale = getLocale()} = {}): string {
    const parts = new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
    }).formatToParts(0);

    return parts
        .filter((p) => p.type == "currency")
        .map((p) => p.value)
        .join();
}

export const utilsService = {
    zeroPad,
    isImage,
    isDownload,
    validateEmail,
    isDeviceIos,
    isPdf,
    getCurrencySymbol,
};
