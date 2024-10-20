import {cookiesService} from "@dashdoc/web-core";
import {Api as ApiFromUtils} from "dashdoc-utils";

export const Api = new ApiFromUtils({
    host: window.location.origin,
    headers: {
        // @ts-ignore
        "X-CSRFToken": cookiesService.getCookie("csrftoken"),
    },
});
