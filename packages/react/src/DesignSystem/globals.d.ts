// Window
interface Window {
    Screeb: Function;
    MSStream: any;
    analytics: any;
    sessionRewind: any;
}

// Third party modules
declare module "algoliasearch" {
    export function initPlaces(applicationId: string, apiKey: string): any;
}

interface Chargebee {
    init: (config: any) => void;
    getInstance: () => ChargebeeInstance;
    getPortalSections: Function;
}

interface ChargebeeInstance {
    setPortalSession: Function;
    createChargebeePortal: Function;
    openCheckout: Function;
}

declare var Chargebee: Chargebee;

declare namespace rfdc {
    interface Options {
        proto?: boolean;
        circles?: boolean;
    }
}

declare module "rfdc" {
    export default function rfdc(options?: rfdc.Options): <T>(input: T) => T;
}

declare module "rfdc/default" {
    export default function rfdc<T>(obj: T): T;
}
