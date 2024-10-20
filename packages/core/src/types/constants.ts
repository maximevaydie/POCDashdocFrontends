import {cookiesService} from "../services/cookies.service";

type BuildConstants = {
    isTraining: boolean;
    staticUrl: string;
    language: string;
    chargebeeSiteName: string;
    intercomAppID: string;
};
export const BuildConstants: BuildConstants = {
    isTraining: import.meta.env.MODE === "training",
    staticUrl: import.meta.env.VITE_ASSETS_BASE_PATH,
    language:
        cookiesService.getCookie("django_language") || window.navigator.language.split("-")[0],
    chargebeeSiteName: import.meta.env.VITE_CHARGEBEE_APP,
    intercomAppID: import.meta.env.VITE_INTERCOM_APP_ID,
};
