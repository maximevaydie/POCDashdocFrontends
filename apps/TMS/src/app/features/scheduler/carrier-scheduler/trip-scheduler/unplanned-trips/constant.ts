import {PoolOfUnplannedSettings} from "app/features/scheduler/carrier-scheduler/schedulerSettingsView.types";

export const DEFAULT_POOL_SETTINGS: PoolOfUnplannedSettings = {
    pool_period: undefined,
    pool_start_date: undefined,
    pool_end_date: undefined,
    pool_loading_period: undefined,
    pool_loading_start_date: undefined,
    pool_loading_end_date: undefined,
    pool_unloading_period: undefined,
    pool_unloading_start_date: undefined,
    pool_unloading_end_date: undefined,
    shipper__in: [],
    address__in: [],
    origin_address__in: [],
    destination_address__in: [],
    tags__in: [],
    address_text: "",
    address_postcode__in: "",
    address_country__in: "",
    origin_address_text: "",
    origin_address_postcode__in: "",
    origin_address_country__in: "",
    destination_address_text: "",
    destination_address_postcode__in: "",
    destination_address_country__in: "",
    text: [],
};
