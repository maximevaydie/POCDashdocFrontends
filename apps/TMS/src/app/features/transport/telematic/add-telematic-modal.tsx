import {apiService} from "@dashdoc/web-common";
import {getConnectedManager} from "@dashdoc/web-common";
import {managerService} from "@dashdoc/web-common";
import {Logger} from "@dashdoc/web-core";
import {t} from "@dashdoc/web-core";
import {
    Box,
    Checkbox,
    Link,
    Modal,
    Select,
    Text,
    TextInput,
    toast,
    SelectOption,
} from "@dashdoc/web-ui";
import {TextInputType} from "@dashdoc/web-ui";
import {LoadingWheel} from "@dashdoc/web-ui";
import React, {FunctionComponent, useState} from "react";
import {renderToStaticMarkup} from "react-dom/server";
import {useSelector} from "react-redux";

const TELEMATIC_VENDORS = [
    {value: "astrata", label: "Astrata"},
    {value: "addsecure", label: "AddSecure"},
    {value: "dashdoc", label: "Dashdoc"},
    {value: "eliott", label: "Eliott"},
    {value: "fleetboard", label: "Fleetboard"},
    {value: "alertgasoil", label: "FleetEnergies (Alertgasoil)"},
    {value: "geotracer", label: "Geotracer"},
    {value: "koovea", label: "Koovea"},
    {value: "mapon", label: "Mapon"},
    {value: "mappingcontrol", label: "Mapping Control"},
    {value: "mapandtruck", label: "Map and Truck"},
    {value: "masternaut", label: "Masternaut Michelin Connected Fleet"},
    {value: "masternautsasweb", label: "Masternaut SAS Web"},
    {value: "qeos", label: "Qeos"},
    {value: "quartix", label: "Quartix"},
    {value: "rio", label: "Rio"},
    {value: "scania", label: "Scania"},
    {value: "strada", label: "Strada"},
    {value: "sudtelematique", label: "Sud TéléMatique"},
    {value: "transics", label: "Transics"},
    {value: "trimble", label: "Trimble"},
    {value: "truckonline", label: "Truckonline"},
    {value: "vehizen", label: "Vehizen"},
    {value: "volvo", label: "Volvo"},
    {value: "verizon", label: "Verizon"},
    {value: "webfleet", label: "Webfleet"},
    {value: "bump", label: "Bump"},
    {value: "geodynamics", label: "Geodynamics"},
    {value: "webeye", label: "WebEye"},
    {value: "hermes", label: "Hermes"},
    {value: "pass_tracabilite", label: "Pass Traçabilité (S3P Web)"},
    {value: "bizztrack", label: "BizzTrack"},
    {value: "wialon", label: "Wialon"},
    // telematic working with map&truck's connection
    {value: "acron_mapandtruck", label: "Acron"},
    {value: "actia_mapandtruck", label: "Actia"},
    {value: "ags_mapandtruck", label: "Ags"},
    {
        value: "aktkc_etransportas_mapandtruck",
        label: "Aktkc Etransportas",
    },
    {value: "anima_mapandtruck", label: "Anima"},
    {value: "anloc_mapandtruck", label: "Anloc"},
    {value: "arobs_mapandtruck", label: "Arobs"},
    {value: "arvento_mapandtruck", label: "Arvento"},
    {value: "as24_mapandtruck", label: "As24"},
    {
        value: "ascent_solutions_mapandtruck",
        label: "Ascent Solutions",
    },
    {
        value: "asset_monitoring_system_mapandtruck",
        label: "Asset Monitoring System",
    },
    {value: "atrom_mapandtruck", label: "Atrom"},
    {value: "autogps_mapandtruck", label: "Autogps"},
    {
        value: "automaticaplus_sl_mapandtruck",
        label: "Automaticaplus Sl",
    },
    {value: "autopatrol_mapandtruck", label: "Autopatrol"},
    {value: "autotrak_mapandtruck", label: "Autotrak"},
    {value: "axxess_mapandtruck", label: "Axxes"},
    {value: "bimsat_mapandtruck", label: "Bimsat"},
    {value: "bm_mobil_mapandtruck", label: "Bm Mobil"},
    {
        value: "bornemann_infleet_mapandtruck",
        label: "Bornemann Infleet",
    },
    {value: "bpw_mapandtruck", label: "Bpw"},
    {value: "busiraks_mapandtruck", label: "Busiraks"},
    {value: "carrier_mapandtruck", label: "Carrier"},
    {value: "cartrack_mapandtruck", label: "Cartrack"},
    {value: "cms_supatrak_mapandtruck", label: "Cms Supatrak"},
    {
        value: "commander_services_mapandtruck",
        label: "Commander Services",
    },
    {
        value: "control_position_mapandtruck",
        label: "Control Position",
    },
    {value: "cvs_mobile_mapandtruck", label: "Cvs Mobile"},
    {value: "daf_connect_mapandtruck", label: "Daf Connect"},
    {value: "dafrfms3_mapandtruck", label: "Dafrfms3"},
    {value: "dako_mapandtruck", label: "Dako"},
    {
        value: "dams_tracking_mapandtruck",
        label: "Dams Tracking (Tomtom)",
    },
    {value: "dbk_mapandtruck", label: "Dbk"},
    {value: "bluetrax_mapandtruck", label: "Bluetrax"},
    {value: "dbs_mapandtruck", label: "Dbs"},
    {
        value: "digital_telematics_mapandtruck",
        label: "Digital Telematics",
    },
    {value: "dispecer_mapandtruck", label: "Dispecer"},
    {
        value: "distribution_est_equipements_etudes_electronique_mapandtruck",
        label: "Distribution Est Equipements Etudes Electronique",
    },
    {value: "dkv_mapandtruck", label: "Dkv"},
    {value: "easytrack_mapandtruck", label: "Easytrack"},
    {value: "echotrack_mapandtruck", label: "Echotrack"},
    {value: "eco_truck_mapandtruck", label: "Eco Truck"},
    {value: "ecofleet_mapandtruck", label: "Ecofleet"},
    {value: "edrive_mapandtruck", label: "Edrive"},
    {
        value: "effitrailer_mapandtruck",
        label: "Effitrailer (Michelin)",
    },
    {value: "ekolis_mapandtruck", label: "Ekolis"},
    {value: "elcar_mapandtruck", label: "Elcar"},
    {value: "elocaliza_mapandtruck", label: "Elocaliza"},
    {value: "etec_mapandtruck", label: "Etec"},
    {value: "eup_mapandtruck", label: "Eup"},
    {
        value: "euro_sped_online_mapandtruck",
        label: "Euro Sped Online",
    },
    {value: "eurotoll_mapandtruck", label: "Eurotoll"},
    {value: "eurotracs_mapandtruck", label: "Eurotracs"},
    {value: "eurowag_mapandtruck", label: "Eurowag"},
    {
        value: "eutracker_v2_mapandtruck",
        label: "Eutracker V2 (Truck Data Technology)",
    },
    {value: "evo_gps_mapandtruck", label: "Evo Gps"},
    {value: "fanset_mapandtruck", label: "Fanset"},
    {value: "findit_mapandtruck", label: "Findit (Stela / As24)"},
    {
        value: "fleet_commander_mapandtruck",
        label: "Fleet Commander",
    },
    {value: "fleet_hunt_mapandtruck", label: "Fleet Hunt"},
    {value: "fleetgo_mapandtruck", label: "Fleetgo"},
    {value: "fleethand_mapandtruck", label: "Fleethand"},
    {value: "fleeti_mapandtruck", label: "Fleeti"},
    {value: "fleetmaster_mapandtruck", label: "Fleetmaster"},
    {value: "flota_online_mapandtruck", label: "Flota Online"},
    {value: "flotis_mapandtruck", label: "Flotis"},
    {value: "flottaweb_mapandtruck", label: "Flottaweb"},
    {value: "fm_solutions_mapandtruck", label: "Fm Solutions"},
    {value: "fomco_mapandtruck", label: "Fomco"},
    {value: "framelogic_mapandtruck", label: "Framelogic"},
    {value: "frotcom_mapandtruck", label: "Frotcom"},
    {
        value: "galileo_satellite_control_systems_mapandtruck",
        label: "Galileo Satellite Control Systems",
    },
    {
        value: "geoclic_solutions_mapandtruck",
        label: "Geoclic Solutions",
    },
    {value: "geoloc_systems_mapandtruck", label: "Geoloc Systems"},
    {value: "geotab_mapandtruck", label: "Geotab"},
    {value: "geotraceur_mapandtruck", label: "Geotraceur"},
    {value: "gesinflot_mapandtruck", label: "Gesinflot"},
    {value: "gesinflotpush_mapandtruck", label: "Gesinflotpush"},
    {value: "gestracking_mapandtruck", label: "Gestracking"},
    {value: "globalsat_mapandtruck", label: "Globalsat"},
    {value: "globaltrack_mapandtruck", label: "Globaltrack"},
    {value: "globspot_mapandtruck", label: "Globspot"},
    {
        value: "goodyear_france_mapandtruck",
        label: "Goodyear France",
    },
    {value: "gps_buddy_mapandtruck", label: "Gps Buddy"},
    {value: "gps_dozor_mapandtruck", label: "Gps Dozor"},
    {value: "gps_logistic_mapandtruck", label: "Gps Logistic"},
    {value: "gps_mobile_mapandtruck", label: "Gps Mobile"},
    {value: "grizzli_mapandtruck", label: "Grizzli"},
    {value: "gx_solutions_mapandtruck", label: "Gx Solutions"},
    {value: "hdm_mapandtruck", label: "Hdm"},
    {value: "hostabee_mapandtruck", label: "Hostabee"},
    {value: "i_mapandtruck-track", label: "I-Track"},
    {value: "icell_mapandtruck", label: "Icell"},
    {value: "ims_telematics_mapandtruck", label: "Ims Telematics"},
    {value: "inelo_mapandtruck", label: "Inelo"},
    {value: "infis_mapandtruck", label: "Infis"},
    {value: "info_car_mapandtruck", label: "Info Car"},
    {
        value: "integre_trans_uab_mapandtruck",
        label: "Integre Trans Uab",
    },
    {value: "intellitrac_mapandtruck", label: "Intellitrac"},
    {value: "intendia_mapandtruck", label: "Intendia"},
    {value: "ispyafrica_mapandtruck", label: "Ispyafrica"},
    {value: "itrack_mapandtruck", label: "Itrack"},
    {value: "iveconnect_mapandtruck", label: "Iveconnect (Iveco)"},
    {value: "jaltest_mapandtruck", label: "Jaltest"},
    {
        value: "keeptrace_mapandtruck",
        label: "Keeptrace",
    },
    {value: "keratronik_mapandtruck", label: "Keratronik"},
    {value: "kinesis_mapandtruck", label: "Kinesis / Dkv"},
    {value: "konsalnet_mapandtruck", label: "Konsalnet"},
    {
        value: "krone_telematic_mapandtruck",
        label: "Krone Telematic",
    },
    {
        value: "la_chaine_du_froid_mapandtruck",
        label: "La Chaine Du Froid",
    },
    {
        value: "landmark_tracking_mapandtruck",
        label: "Landmark Tracking",
    },
    {
        value: "legal_telematics_mapandtruck",
        label: "Legal Telematics",
    },
    {value: "linqo_mapandtruck", label: "Linqo"},
    {value: "localizador_mapandtruck", label: "Localizador"},
    {value: "localizare_mapandtruck", label: "Localizare"},
    {value: "locatel_mapandtruck", label: "Locatel"},
    {
        value: "locationsolutions_mapandtruck",
        label: "Locationsolutions",
    },
    {value: "loclog_mapandtruck", label: "Loclog"},
    {value: "loctracker_mapandtruck", label: "Loctracker"},
    {value: "logisat_mapandtruck", label: "Logisat"},
    {value: "lontex_mapandtruck", label: "Lontex"},
    {value: "matiasat_mapandtruck", label: "Matiasat / Efcolia"},
    {value: "maxtrack_mapandtruck", label: "Maxtrack"},
    {value: "mecomo_mapandtruck", label: "Mecomo"},
    {value: "microlise_mapandtruck", label: "Microlise"},
    {value: "mix_telematics_mapandtruck", label: "Mix Telematics"},
    {value: "mobilisis_mapandtruck", label: "Mobilisis"},
    {value: "mobiliz_mapandtruck", label: "Mobiliz"},
    {value: "mobiltrust_mapandtruck", label: "Mobiltrust"},
    {value: "movertis_mapandtruck", label: "Movertis"},
    {value: "movildata_mapandtruck", label: "Movildata"},
    {value: "mtrack_mapandtruck", label: "Mtrack"},
    {value: "mygps_service_mapandtruck", label: "Mygps Service"},
    {value: "n2mobil_mapandtruck", label: "N2Mobil"},
    {value: "naocom_mapandtruck", label: "Naocom"},
    {value: "navifleet_mapandtruck", label: "Navifleet"},
    {value: "navigate_mapandtruck", label: "Navigate"},
    {value: "navirec_mapandtruck", label: "Navirec"},
    {value: "navisat_gps_mapandtruck", label: "Navisat Gps"},
    {value: "navitel_mapandtruck", label: "Navitel"},
    {value: "netfleet_mapandtruck", label: "Netfleet"},
    {value: "nextgal_mapandtruck", label: "Nextgal"},
    {value: "nexus_mapandtruck", label: "Nexus"},
    {
        value: "nipo_electronics_mapandtruck",
        label: "Nipo Electronics",
    },
    {value: "nomadsys_mapandtruck", label: "Nomadsys"},
    {value: "novacom_mapandtruck", label: "Novacom"},
    {value: "oak_and_gold_mapandtruck", label: "Oak And Gold"},
    {value: "ocean_mapandtruck", label: "Ocean (Orange)"},
    {value: "omp_mapandtruck-eliot", label: "Omp - Eliot"},
    {value: "optifleet_mapandtruck", label: "Optifleet (Renault)"},
    {value: "optimo_gps_mapandtruck", label: "Optimo Gps"},
    {value: "orbcomm_mapandtruck", label: "Orbcomm"},
    {value: "orbcomm_africa_mapandtruck", label: "Orbcomm Africa"},
    {value: "ovelan_mapandtruck", label: "Ovelan"},
    {
        value: "pentest_customer_mapandtruck",
        label: "Pentest_Customer",
    },
    {value: "pharox_mapandtruck", label: "Pharox"},
    {value: "pico_gps_mapandtruck", label: "Pico Gps"},
    {value: "primafrio_mapandtruck", label: "Primafrio"},
    {value: "protrac_africa_mapandtruck", label: "Protrac Africa"},
    {value: "protrack_mapandtruck", label: "Protrack"},
    {
        value: "pulsit_electronics_mapandtruck",
        label: "Pulsit Electronics",
    },
    {value: "quake_tracking_mapandtruck", label: "Quake Tracking"},
    {value: "rdtronic_mapandtruck", label: "Rdtronic"},
    {value: "restrata_mapandtruck", label: "Restrata"},
    {value: "riverlong_mapandtruck", label: "Riverlong"},
    {value: "rmcontrol_mapandtruck", label: "Rmcontrol"},
    {value: "rmsassist_mapandtruck", label: "Rmsassist"},
    {
        value: "rte_technologies_mapandtruck",
        label: "Rte Technologies",
    },
    {value: "ruptela_mapandtruck", label: "Ruptela"},
    {value: "safefleet_mapandtruck", label: "Safefleet"},
    {
        value: "samsara_mapandtruck",
        label: "Samsara",
    },
    {value: "sas_fleet_mapandtruck", label: "Sas Fleet"},
    {value: "satis_gps_mapandtruck", label: "Satis Gps"},
    {value: "satko_mapandtruck", label: "Satko"},
    {
        value: "schmitz_cargobull_mapandtruck",
        label: "Schmitz Cargobull",
    },
    {value: "seccom_mapandtruck", label: "Seccom"},
    {value: "sensolus_mapandtruck", label: "Sensolus"},
    {value: "seyir_mobil_mapandtruck", label: "Seyir Mobil"},
    {value: "siberyazilim_mapandtruck", label: "Siberyazilim"},
    {value: "simplciti_mapandtruck", label: "Simplciti (Sabatier)"},
    {value: "sinaps_mapandtruck", label: "Sinaps"},
    {value: "skywatch_mapandtruck", label: "Skywatch"},
    {value: "solid_security_mapandtruck", label: "Solid Security"},
    {value: "solustop_mapandtruck", label: "Solustop"},
    {value: "spedion_mapandtruck", label: "Spedion"},
    {
        value: "speedtelematics_mapandtruck",
        label: "Speedtelematics",
    },
    {value: "starcom_mapandtruck", label: "Starcom"},
    {
        value: "suivi_de_flotte_mapandtruck",
        label: "Suivi De Flotte",
    },
    {value: "supervisor_mapandtruck", label: "Supervisor"},
    {value: "sycada_mapandtruck", label: "Sycada"},
    {value: "t_cars_system_mapandtruck", label: "T Cars System"},
    {value: "t_comm_mapandtruck", label: "T Comm"},
    {value: "tcom_mapandtruck", label: "Tcom"},
    {value: "tekom_mapandtruck", label: "Tekom"},
    {value: "teksat_mapandtruck", label: "Teksat"},
    {value: "tekwise_mapandtruck", label: "Tekwise"},
    {value: "telepass_mapandtruck", label: "Telepass"},
    {
        value: "terramar_networks_mapandtruck",
        label: "Terramar Networks",
    },
    {value: "tg2s_mapandtruck", label: "Tg2S"},
    {value: "thermoking_mapandtruck", label: "Thermoking"},
    {value: "tracker_mapandtruck", label: "Tracker"},
    {value: "tracking_diary_mapandtruck", label: "Tracking Diary"},
    {value: "trackit_mapandtruck", label: "Trackit"},
    {value: "tracknamic_mapandtruck", label: "Tracknamic"},
    {
        value: "traffic_control_mapandtruck",
        label: "Traffic Control",
    },
    {value: "trakmy_mapandtruck", label: "Trakmy"},
    {value: "transpoco_mapandtruck", label: "Transpoco"},
    {value: "tronik_mapandtruck", label: "Tronik"},
    {value: "trucksters_mapandtruck", label: "Trucksters"},
    {value: "uefora_mapandtruck", label: "Uefora"},
    {value: "unity_plan_mapandtruck", label: "Unity Plan"},
    {value: "universalgps_mapandtruck", label: "Universalgps"},
    {
        value: "v3_smart_technologies_mapandtruck",
        label: "V3 Smart Technologies",
    },
    {value: "vehco_mapandtruck", label: "Vehco (Groeneveld)"},
    {
        value: "vektor_teknoloji_mapandtruck",
        label: "Vektor Teknoloji",
    },
    {value: "viafleet_mapandtruck", label: "Viafleet"},
    {value: "viasat_mapandtruck", label: "Viasat"},
    {value: "visirun_mapandtruck", label: "Visirun"},
    {value: "vsu_truck_mapandtruck", label: "Vsu Truck"},
    {value: "wabco_mapandtruck", label: "Wabco - Traxee"},
    {
        value: "watchsystem_mapandtruck",
        label: "Watchsystem / Futur Sat",
    },
    {value: "waynet_mapandtruck", label: "Waynet"},
    {value: "wayzz_mapandtruck", label: "Wayzz"},
    {value: "webdispecink_mapandtruck", label: "Webdispecink"},
    {value: "wemob_mapandtruck", label: "Wemob"},
];

enum TelematicVendor {
    alertgasoil,
    astrata,
    addsecure,
    dashdoc,
    eliott,
    fleetboard,
    geodynamics,
    geotracer,
    koovea,
    mappingcontrol,
    mapandtruck,
    masternaut,
    masternautsasweb,
    qeos,
    quartix,
    rio,
    scania,
    sudtelematique,
    transics,
    trimble,
    truckonline,
    vehizen,
    volvo,
    webfleet,
    strada,
    verizon,
    mapon,
    bump,
    webeye,
    hermes,
    pass_tracabilite,
    bizztrack,
    wialon,
}

// telematic working with map&truck's connection
enum MapAndTruckVendor {
    acron_mapandtruck,
    actia_mapandtruck,
    ags_mapandtruck,
    aktkc_etransportas_mapandtruck,
    anima_mapandtruck,
    anloc_mapandtruck,
    arobs_mapandtruck,
    arvento_mapandtruck,
    as24_mapandtruck,
    ascent_solutions_mapandtruck,
    asset_monitoring_system_mapandtruck,
    atrom_mapandtruck,
    autogps_mapandtruck,
    automaticaplus_sl_mapandtruck,
    autopatrol_mapandtruck,
    autotrak_mapandtruck,
    axxess_mapandtruck,
    bimsat_mapandtruck,
    bluetrax_mapandtruck,
    bm_mobil_mapandtruck,
    bornemann_infleet_mapandtruck,
    bpw_mapandtruck,
    busiraks_mapandtruck,
    carrier_mapandtruck,
    cartrack_mapandtruck,
    cms_supatrak_mapandtruck,
    commander_services_mapandtruck,
    control_position_mapandtruck,
    cvs_mobile_mapandtruck,
    daf_connect_mapandtruck,
    dafrfms3_mapandtruck,
    dako_mapandtruck,
    dams_tracking_mapandtruck,
    dbk_mapandtruck,
    dbs_mapandtruck,
    digital_telematics_mapandtruck,
    dispecer_mapandtruck,
    distribution_est_equipements_etudes_electronique_mapandtruck,
    dkv_mapandtruck,
    easytrack_mapandtruck,
    echotrack_mapandtruck,
    eco_truck_mapandtruck,
    ecofleet_mapandtruck,
    edrive_mapandtruck,
    effitrailer_mapandtruck,
    ekolis_mapandtruck,
    elcar_mapandtruck,
    elocaliza_mapandtruck,
    etec_mapandtruck,
    eup_mapandtruck,
    euro_sped_online_mapandtruck,
    eurotoll_mapandtruck,
    eurotracs_mapandtruck,
    eurowag_mapandtruck,
    eutracker_v2_mapandtruck,
    evo_gps_mapandtruck,
    fanset_mapandtruck,
    findit_mapandtruck,
    fleet_commander_mapandtruck,
    fleet_hunt_mapandtruck,
    fleetgo_mapandtruck,
    fleethand_mapandtruck,
    fleeti_mapandtruck,
    fleetmaster_mapandtruck,
    flota_online_mapandtruck,
    flotis_mapandtruck,
    flottaweb_mapandtruck,
    fm_solutions_mapandtruck,
    fomco_mapandtruck,
    framelogic_mapandtruck,
    frotcom_mapandtruck,
    galileo_satellite_control_systems_mapandtruck,
    geoclic_solutions_mapandtruck,
    geoloc_systems_mapandtruck,
    geotab_mapandtruck,
    geotraceur_mapandtruck,
    gesinflot_mapandtruck,
    gesinflotpush_mapandtruck,
    gestracking_mapandtruck,
    globalsat_mapandtruck,
    globaltrack_mapandtruck,
    globspot_mapandtruck,
    goodyear_france_mapandtruck,
    gps_buddy_mapandtruck,
    gps_dozor_mapandtruck,
    gps_logistic_mapandtruck,
    gps_mobile_mapandtruck,
    grizzli_mapandtruck,
    gx_solutions_mapandtruck,
    hdm_mapandtruck,
    hostabee_mapandtruck,
    i_track_mapandtruck,
    icell_mapandtruck,
    ims_telematics_mapandtruck,
    inelo_mapandtruck,
    infis_mapandtruck,
    info_car_mapandtruck,
    integre_trans_uab_mapandtruck,
    intellitrac_mapandtruck,
    intendia_mapandtruck,
    ispyafrica_mapandtruck,
    itrack_mapandtruck,
    iveconnect_mapandtruck,
    jaltest_mapandtruck,
    keeptrace_mapandtruck,
    keratronik_mapandtruck,
    kinesis_mapandtruck,
    konsalnet_mapandtruck,
    krone_telematic_mapandtruck,
    la_chaine_du_froid_mapandtruck,
    landmark_tracking_mapandtruck,
    legal_telematics_mapandtruck,
    linqo_mapandtruck,
    localizador_mapandtruck,
    localizare_mapandtruck,
    locatel_mapandtruck,
    locationsolutions_mapandtruck,
    loclog_mapandtruck,
    loctracker_mapandtruck,
    logisat_mapandtruck,
    lontex_mapandtruck,
    matiasat_mapandtruck,
    maxtrack_mapandtruck,
    mecomo_mapandtruck,
    microlise_mapandtruck,
    mix_telematics_mapandtruck,
    mobilisis_mapandtruck,
    mobiliz_mapandtruck,
    mobiltrust_mapandtruck,
    movertis_mapandtruck,
    movildata_mapandtruck,
    mtrack_mapandtruck,
    mygps_service_mapandtruck,
    n2mobil_mapandtruck,
    naocom_mapandtruck,
    navifleet_mapandtruck,
    navigate_mapandtruck,
    navirec_mapandtruck,
    navisat_gps_mapandtruck,
    navitel_mapandtruck,
    netfleet_mapandtruck,
    nextgal_mapandtruck,
    nexus_mapandtruck,
    nipo_electronics_mapandtruck,
    nomadsys_mapandtruck,
    novacom_mapandtruck,
    oak_and_gold_mapandtruck,
    ocean_mapandtruck,
    omp_eliot_mapandtruck,
    optifleet_mapandtruck,
    optimo_gps_mapandtruck,
    orbcomm_mapandtruck,
    orbcomm_africa_mapandtruck,
    ovelan_mapandtruck,
    pentest_customer_mapandtruck,
    pharox_mapandtruck,
    pico_gps_mapandtruck,
    primafrio_mapandtruck,
    protrac_africa_mapandtruck,
    protrack_mapandtruck,
    pulsit_electronics_mapandtruck,
    quake_tracking_mapandtruck,
    rdtronic_mapandtruck,
    restrata_mapandtruck,
    riverlong_mapandtruck,
    rmcontrol_mapandtruck,
    rmsassist_mapandtruck,
    rte_technologies_mapandtruck,
    ruptela_mapandtruck,
    safefleet_mapandtruck,
    samsara_mapandtruck,
    sas_fleet_mapandtruck,
    satis_gps_mapandtruck,
    satko_mapandtruck,
    schmitz_cargobull_mapandtruck,
    seccom_mapandtruck,
    sensolus_mapandtruck,
    seyir_mobil_mapandtruck,
    siberyazilim_mapandtruck,
    simplciti_mapandtruck,
    sinaps_mapandtruck,
    skywatch_mapandtruck,
    solid_security_mapandtruck,
    solustop_mapandtruck,
    spedion_mapandtruck,
    speedtelematics_mapandtruck,
    starcom_mapandtruck,
    suivi_de_flotte_mapandtruck,
    supervisor_mapandtruck,
    sycada_mapandtruck,
    t_cars_system_mapandtruck,
    t_comm_mapandtruck,
    tcom_mapandtruck,
    tekom_mapandtruck,
    teksat_mapandtruck,
    tekwise_mapandtruck,
    telepass_mapandtruck,
    terramar_networks_mapandtruck,
    tg2s_mapandtruck,
    thermoking_mapandtruck,
    tracker_mapandtruck,
    tracking_diary_mapandtruck,
    trackit_mapandtruck,
    tracknamic_mapandtruck,
    traffic_control_mapandtruck,
    trakmy_mapandtruck,
    transpoco_mapandtruck,
    tronik_mapandtruck,
    trucksters_mapandtruck,
    uefora_mapandtruck,
    unity_plan_mapandtruck,
    universalgps_mapandtruck,
    v3_smart_technologies_mapandtruck,
    vehco_mapandtruck,
    vektor_teknoloji_mapandtruck,
    viafleet_mapandtruck,
    viasat_mapandtruck,
    visirun_mapandtruck,
    vsu_truck_mapandtruck,
    wabco_mapandtruck,
    watchsystem_mapandtruck,
    waynet_mapandtruck,
    wayzz_mapandtruck,
    webdispecink_mapandtruck,
    wemob_mapandtruck,
}

type AllTelematicVendor = keyof typeof TelematicVendor | keyof typeof MapAndTruckVendor;

const timezones = [
    // Values here should be compatible with pytz
    {value: "Europe/Amsterdam", label: "Europe/Amsterdam"},
    {value: "Europe/Andorra", label: "Europe/Andorra"},
    {value: "Europe/Astrakhan", label: "Europe/Astrakhan"},
    {value: "Europe/Athens", label: "Europe/Athens"},
    {value: "Europe/Belfast", label: "Europe/Belfast"},
    {value: "Europe/Belgrade", label: "Europe/Belgrade"},
    {value: "Europe/Berlin", label: "Europe/Berlin"},
    {value: "Europe/Bratislava", label: "Europe/Bratislava"},
    {value: "Europe/Brussels", label: "Europe/Brussels"},
    {value: "Europe/Bucharest", label: "Europe/Bucharest"},
    {value: "Europe/Budapest", label: "Europe/Budapest"},
    {value: "Europe/Busingen", label: "Europe/Busingen"},
    {value: "Europe/Chisinau", label: "Europe/Chisinau"},
    {value: "Europe/Copenhagen", label: "Europe/Copenhagen"},
    {value: "Europe/Dublin", label: "Europe/Dublin"},
    {value: "Europe/Gibraltar", label: "Europe/Gibraltar"},
    {value: "Europe/Guernsey", label: "Europe/Guernsey"},
    {value: "Europe/Helsinki", label: "Europe/Helsinki"},
    {value: "Europe/Isle_of_Man", label: "Europe/Isle_of_Man"},
    {value: "Europe/Istanbul", label: "Europe/Istanbul"},
    {value: "Europe/Jersey", label: "Europe/Jersey"},
    {value: "Europe/Kaliningrad", label: "Europe/Kaliningrad"},
    {value: "Europe/Kiev", label: "Europe/Kiev"},
    {value: "Europe/Kirov", label: "Europe/Kirov"},
    {value: "Europe/Lisbon", label: "Europe/Lisbon"},
    {value: "Europe/Ljubljana", label: "Europe/Ljubljana"},
    {value: "Europe/London", label: "Europe/London"},
    {value: "Europe/Luxembourg", label: "Europe/Luxembourg"},
    {value: "Europe/Madrid", label: "Europe/Madrid"},
    {value: "Europe/Malta", label: "Europe/Malta"},
    {value: "Europe/Mariehamn", label: "Europe/Mariehamn"},
    {value: "Europe/Minsk", label: "Europe/Minsk"},
    {value: "Europe/Monaco", label: "Europe/Monaco"},
    {value: "Europe/Moscow", label: "Europe/Moscow"},
    {value: "Europe/Nicosia", label: "Europe/Nicosia"},
    {value: "Europe/Oslo", label: "Europe/Oslo"},
    {value: "Europe/Paris", label: "Europe/Paris"},
    {value: "Europe/Podgorica", label: "Europe/Podgorica"},
    {value: "Europe/Prague", label: "Europe/Prague"},
    {value: "Europe/Riga", label: "Europe/Riga"},
    {value: "Europe/Rome", label: "Europe/Rome"},
    {value: "Europe/Samara", label: "Europe/Samara"},
    {value: "Europe/San_Marino", label: "Europe/San_Marino"},
    {value: "Europe/Sarajevo", label: "Europe/Sarajevo"},
    {value: "Europe/Saratov", label: "Europe/Saratov"},
    {value: "Europe/Simferopol", label: "Europe/Simferopol"},
    {value: "Europe/Skopje", label: "Europe/Skopje"},
    {value: "Europe/Sofia", label: "Europe/Sofia"},
    {value: "Europe/Stockholm", label: "Europe/Stockholm"},
    {value: "Europe/Tallinn", label: "Europe/Tallinn"},
    {value: "Europe/Tirane", label: "Europe/Tirane"},
    {value: "Europe/Tiraspol", label: "Europe/Tiraspol"},
    {value: "Europe/Ulyanovsk", label: "Europe/Ulyanovsk"},
    {value: "Europe/Uzhgorod", label: "Europe/Uzhgorod"},
    {value: "Europe/Vaduz", label: "Europe/Vaduz"},
    {value: "Europe/Vatican", label: "Europe/Vatican"},
    {value: "Europe/Vienna", label: "Europe/Vienna"},
    {value: "Europe/Vilnius", label: "Europe/Vilnius"},
    {value: "Europe/Volgograd", label: "Europe/Volgograd"},
    {value: "Europe/Warsaw", label: "Europe/Warsaw"},
    {value: "Europe/Zagreb", label: "Europe/Zagreb"},
    {value: "Europe/Zaporozhye", label: "Europe/Zaporozhye"},
    {value: "Europe/Zurich", label: "Europe/Zurich"},
];

const TELEMATIC_REQUIRED_CREDENTIALS: {
    [key in AllTelematicVendor]: {
        id: string;
        label: string;
        type: TextInputType | "select";
        options?: any;
    }[];
} = {
    geotracer: [{id: "external_telematic", label: "Geotracer", type: "text"}],
    eliott: [{id: "external_telematic", label: "Eliott", type: "text"}],
    trimble: [
        {id: "user", label: "User", type: "text"},
        {id: "customer", label: "Customer", type: "text"},
        {id: "password", label: "Password", type: "password"},
    ],
    transics: [
        {
            id: "timezone",
            label: "Timezone",
            type: "select",
            options: timezones,
        },
        {id: "dispatcher", label: "Dispatcher", type: "text"},
        {id: "system_number", label: "System NR", type: "text"},
        {id: "integrator", label: "Integrator", type: "text"},
        {
            id: "wsdl",
            label: "WSDL",
            type: "select",
            options: [
                {
                    value: "https://txtangob.tx-connect.com/IWS_ASMX/Service.asmx?WSDL",
                    label: "https://txtangob.tx-connect.com/IWS_ASMX/Service.asmx?WSDL (Prod B, SKY)",
                },
                {
                    value: "https://ww3.tx-connect.com/IWS_ASMX/Service.asmx?WSDL",
                    label: "https://ww3.tx-connect.com/IWS_ASMX/Service.asmx?WSDL (Prod A)",
                },
            ],
        },
        {id: "password", label: "Password", type: "password"},
        {
            id: "interval_duration",
            label: "Traces fetching latency",
            type: "select",
            options: [
                {value: "5", label: " 5 minutes"},
                {value: "10", label: "10 minutes"},
                {value: "20", label: "20 minutes"},
                {value: "30", label: "30 minutes"},
            ],
        },
    ],
    fleetboard: [
        {id: "fleetname", label: "Fleet name", type: "text"},
        {id: "user", label: "User", type: "text"},
        {id: "password", label: "Password", type: "password"},
    ],
    astrata: [
        {id: "customer", label: "Customer", type: "text"},
        {id: "user", label: "User", type: "text"},
        {id: "password", label: "Password", type: "password"},
    ],
    webfleet: [
        {
            id: "timezone",
            label: "Timezone",
            type: "select",
            options: timezones,
        },
        {id: "account", label: "Account", type: "text"},
        {id: "user", label: "User", type: "text"},
        {id: "password", label: "Password", type: "password"},
    ],
    rio: [{id: "integration_id", label: "Integration ID", type: "text"}],
    alertgasoil: [
        {id: "user", label: "User", type: "text"},
        {id: "password", label: "Password", type: "password"},
    ],
    scania: [
        {id: "client_id", label: "Client ID", type: "text"},
        {id: "secret_key", label: "Secret key", type: "password"},
    ],
    volvo: [
        {id: "user", label: "User", type: "text"},
        {id: "password", label: "Password", type: "password"},
    ],
    quartix: [
        {id: "customer", label: "Customer", type: "text"},
        {id: "user", label: "User", type: "text"},
        {id: "password", label: "Password", type: "password"},
        {id: "application", label: "Application", type: "text"},
    ],
    dashdoc: [
        {id: "user", label: "User", type: "text"},
        {id: "password", label: "Password", type: "password"},
    ],
    masternaut: [
        {id: "username", label: "Username", type: "text"},
        {id: "client_id", label: "Client ID", type: "text"},
        {id: "password", label: "Password", type: "password"},
    ],
    masternautsasweb: [
        {id: "user", label: "User", type: "text"},
        {id: "password", label: "Password", type: "password"},
    ],
    koovea: [
        {id: "email", label: "Email", type: "email"},
        {id: "password", label: "Password", type: "password"},
    ],
    truckonline: [
        {id: "client_id", label: "Client ID", type: "text"},
        {id: "client_secret", label: "Client Secret", type: "password"},
    ],
    sudtelematique: [{id: "token", label: "Token", type: "text"}],
    vehizen: [{id: "token", label: "Token", type: "text"}],
    strada: [
        {id: "user", label: "User", type: "text"},
        {id: "password", label: "Password", type: "password"},
    ],
    verizon: [
        {id: "user", label: "Username", type: "text"},
        {id: "password", label: "Password", type: "password"},
        {id: "app_id", label: "App ID", type: "text"},
    ],
    mappingcontrol: [
        {id: "user", label: "User", type: "text"},
        {id: "password", label: "Password", type: "password"},
    ],
    mapandtruck: [{id: "token", label: "Token", type: "text"}],
    qeos: [
        {id: "user", label: "User", type: "text"},
        {id: "password", label: "Password", type: "password"},
    ],
    mapon: [{id: "token", label: "Token", type: "text"}],
    addsecure: [
        {id: "username", label: "User", type: "text"},
        {id: "password", label: "Password", type: "password"},
        {id: "database", label: "Database Name", type: "text"},
    ],
    bump: [
        {id: "username", label: "User", type: "text"},
        {id: "password", label: "Password", type: "password"},
    ],
    geodynamics: [
        {id: "company", label: "Company", type: "text"},
        {id: "login", label: "Login", type: "text"},
        {id: "password", label: "Password", type: "password"},
    ],
    samsara_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    keeptrace_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    webeye: [
        {id: "user", label: "User", type: "text"},
        {id: "password", label: "Password", type: "password"},
    ],
    hermes: [{id: "token", label: "Token", type: "text"}],
    pass_tracabilite: [{id: "token", label: "Token", type: "text"}],
    bizztrack: [
        {id: "user", label: "User", type: "text"},
        {id: "password", label: "Password", type: "password"},
    ],
    wialon: [{id: "token", label: "Token", type: "text"}],
    // telematic working with map&truck's connection
    acron_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    actia_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    ags_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    aktkc_etransportas_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    anima_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    anloc_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    arobs_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    arvento_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    as24_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    ascent_solutions_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    asset_monitoring_system_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    atrom_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    autogps_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    automaticaplus_sl_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    autopatrol_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    autotrak_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    axxess_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    bimsat_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    bluetrax_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    bm_mobil_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    bornemann_infleet_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    bpw_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    busiraks_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    carrier_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    cartrack_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    cms_supatrak_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    commander_services_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    control_position_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    cvs_mobile_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    daf_connect_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    dafrfms3_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    dako_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    dams_tracking_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    dbk_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    dbs_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    digital_telematics_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    dispecer_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    distribution_est_equipements_etudes_electronique_mapandtruck: [
        {id: "token", label: "Token", type: "text"},
    ],
    dkv_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    easytrack_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    echotrack_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    eco_truck_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    ecofleet_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    edrive_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    effitrailer_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    ekolis_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    elcar_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    elocaliza_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    etec_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    eup_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    euro_sped_online_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    eurotoll_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    eurotracs_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    eurowag_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    eutracker_v2_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    evo_gps_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    fanset_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    findit_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    fleet_commander_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    fleet_hunt_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    fleetgo_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    fleethand_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    fleeti_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    fleetmaster_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    flota_online_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    flotis_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    flottaweb_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    fm_solutions_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    fomco_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    framelogic_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    frotcom_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    galileo_satellite_control_systems_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    geoclic_solutions_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    geoloc_systems_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    geotab_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    geotraceur_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    gesinflot_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    gesinflotpush_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    gestracking_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    globalsat_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    globaltrack_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    globspot_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    goodyear_france_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    gps_buddy_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    gps_dozor_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    gps_logistic_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    gps_mobile_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    grizzli_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    gx_solutions_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    hdm_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    hostabee_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    i_track_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    icell_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    ims_telematics_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    inelo_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    infis_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    info_car_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    integre_trans_uab_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    intellitrac_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    intendia_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    ispyafrica_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    itrack_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    iveconnect_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    jaltest_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    keratronik_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    kinesis_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    konsalnet_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    krone_telematic_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    la_chaine_du_froid_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    landmark_tracking_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    legal_telematics_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    linqo_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    localizador_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    localizare_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    locatel_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    locationsolutions_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    loclog_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    loctracker_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    logisat_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    lontex_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    matiasat_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    maxtrack_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    mecomo_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    microlise_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    mix_telematics_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    mobilisis_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    mobiliz_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    mobiltrust_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    movertis_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    movildata_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    mtrack_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    mygps_service_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    n2mobil_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    naocom_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    navifleet_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    navigate_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    navirec_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    navisat_gps_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    navitel_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    netfleet_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    nextgal_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    nexus_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    nipo_electronics_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    nomadsys_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    novacom_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    oak_and_gold_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    ocean_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    omp_eliot_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    optifleet_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    optimo_gps_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    orbcomm_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    orbcomm_africa_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    ovelan_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    pentest_customer_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    pharox_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    pico_gps_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    primafrio_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    protrac_africa_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    protrack_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    pulsit_electronics_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    quake_tracking_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    rdtronic_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    restrata_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    riverlong_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    rmcontrol_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    rmsassist_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    rte_technologies_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    ruptela_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    safefleet_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    sas_fleet_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    satis_gps_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    satko_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    schmitz_cargobull_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    seccom_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    sensolus_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    seyir_mobil_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    siberyazilim_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    simplciti_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    sinaps_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    skywatch_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    solid_security_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    solustop_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    spedion_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    speedtelematics_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    starcom_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    suivi_de_flotte_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    supervisor_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    sycada_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    t_cars_system_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    t_comm_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    tcom_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    tekom_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    teksat_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    tekwise_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    telepass_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    terramar_networks_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    tg2s_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    thermoking_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    tracker_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    tracking_diary_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    trackit_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    tracknamic_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    traffic_control_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    trakmy_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    transpoco_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    tronik_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    trucksters_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    uefora_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    unity_plan_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    universalgps_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    v3_smart_technologies_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    vehco_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    vektor_teknoloji_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    viafleet_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    viasat_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    visirun_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    vsu_truck_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    wabco_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    watchsystem_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    waynet_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    wayzz_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    webdispecink_mapandtruck: [{id: "token", label: "Token", type: "text"}],
    wemob_mapandtruck: [{id: "token", label: "Token", type: "text"}],
};

const TELEMATIC_DOC_LINK: {
    [key in AllTelematicVendor]: string;
} = {
    trimble: "http://help.dashdoc.eu/fr/articles/4729173-retrouver-vos-identifiants-trimble",
    transics: "http://help.dashdoc.eu/fr/articles/4729172-retrouver-vos-identifiants-transics",
    fleetboard:
        "https://help.dashdoc.eu/fr/articles/5098814-retrouver-vos-identifiants-fleetboard",
    astrata: "https://help.dashdoc.eu/fr/articles/5144426-retrouver-vos-identifiants-astrata",
    webfleet: "https://help.dashdoc.eu/fr/articles/5207107-retrouver-vos-identifiants-webfleet",
    rio: "https://help.dashdoc.eu/fr/articles/5158041-retrouver-vos-identifiants-rio-man",
    alertgasoil:
        "https://help.dashdoc.eu/fr/articles/5152134-retrouvez-vos-identifiants-alertgasoil",
    scania: "https://help.dashdoc.eu/fr/articles/6044318-retrouver-vos-identifiants-scania",
    volvo: "https://help.dashdoc.eu/fr/articles/6084841-retrouver-vos-identifiants-volvo",
    quartix: "https://help.dashdoc.eu/fr/articles/5213586-retrouvez-vos-identifiants-quartix",
    dashdoc: "",
    masternaut:
        "https://help.dashdoc.eu/fr/articles/5338245-retrouver-vos-identifiants-masternaut",
    masternautsasweb:
        "https://help.dashdoc.com/fr/articles/8402930-masternaut-sas-web-connecter-masternaut-sas-web-a-dashdoc",
    koovea: "https://help.dashdoc.eu/fr/articles/5342222-retrouver-vos-identifiants-koovea",
    truckonline:
        "https://help.dashdoc.eu/fr/articles/5685186-retrouver-vos-identifiants-truckonline",
    sudtelematique:
        "https://help.dashdoc.eu/fr/articles/5907412-retrouver-vos-identifiants-sud-telematique",
    vehizen: "https://help.dashdoc.eu/fr/articles/5951376-retrouver-vos-identifiants-vehizen",
    strada: "https://help.dashdoc.eu/fr/articles/6299525-connexion-a-votre-telematique-strada",
    verizon: "https://help.dashdoc.com/fr/articles/6683624-connexion-a-verizon",
    qeos: "https://help.dashdoc.com/fr/articles/6708211-connexion-a-qeos",
    mappingcontrol: "https://help.dashdoc.com/fr/articles/6612463-connexion-a-mapping-control",
    mapon: "https://help.dashdoc.com/fr/articles/6608776-connexion-mapon",
    geotracer:
        "https://help.dashdoc.com/fr/articles/6921775-connecter-votre-telematique-geotracer",
    eliott: "https://help.dashdoc.com/fr/articles/6921797-connecter-votre-telematique-eliott",
    mapandtruck: "https://help.dashdoc.com/fr/articles/6615625-connexion-a-map-and-truck",
    addsecure: "https://help.dashdoc.com/fr/articles/7211308-connecter-addsecure-a-dashdoc",
    bump: "https://help.dashdoc.com/fr/articles/7882687-connecter-geo-bump-a-dashdoc",
    geodynamics: "https://help.dashdoc.com/fr/articles/7946643-connectez-geodynamics-a-dashdoc",
    samsara_mapandtruck:
        "https://help.dashdoc.com/fr/articles/7982973-samsara-connecter-map-truck-a-dashdoc",
    keeptrace_mapandtruck:
        "https://help.dashdoc.com/fr/articles/7982978-keeptrace-connecter-map-truck-a-dashdoc",
    webeye: "https://help.dashdoc.com/fr/articles/8333153-webeye-connecter-webeye-a-dashdoc",
    hermes: "https://help.dashdoc.com/fr/articles/8402900-hermes-connecter-hermes-a-dashdoc",
    pass_tracabilite:
        "https://help.dashdoc.com/fr/articles/8575093-pass-tracabilite-connecter-pass-tracabilite-a-dashdoc",
    bizztrack:
        "https://help.dashdoc.com/fr/articles/8597083-bizztrack-connecter-bizztrack-a-dashdoc",
    wialon: "https://help.dashdoc.eu/fr/articles/5907412-retrouver-vos-identifiants-sud-telematique",
    // telematic working with map&truck's connection
    acron_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    actia_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    ags_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    aktkc_etransportas_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    anima_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    anloc_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    arobs_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    arvento_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    as24_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    ascent_solutions_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    asset_monitoring_system_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    atrom_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    autogps_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    automaticaplus_sl_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    autopatrol_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    autotrak_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    axxess_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    bimsat_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    bluetrax_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    bm_mobil_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    bornemann_infleet_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    bpw_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    busiraks_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    carrier_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    cartrack_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    cms_supatrak_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    commander_services_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    control_position_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    cvs_mobile_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    daf_connect_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    dafrfms3_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    dako_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    dams_tracking_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    dbk_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    dbs_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    digital_telematics_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    dispecer_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    distribution_est_equipements_etudes_electronique_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    dkv_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    easytrack_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    echotrack_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    eco_truck_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    ecofleet_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    edrive_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    effitrailer_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    ekolis_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    elcar_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    elocaliza_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    etec_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    eup_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    euro_sped_online_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    eurotoll_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    eurotracs_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    eurowag_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    eutracker_v2_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    evo_gps_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    fanset_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    findit_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    fleet_commander_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    fleet_hunt_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    fleetgo_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    fleethand_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    fleeti_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    fleetmaster_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    flota_online_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    flotis_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    flottaweb_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    fm_solutions_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    fomco_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    framelogic_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    frotcom_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    galileo_satellite_control_systems_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    geoclic_solutions_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    geoloc_systems_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    geotab_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    geotraceur_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    gesinflot_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    gesinflotpush_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    gestracking_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    globalsat_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    globaltrack_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    globspot_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    goodyear_france_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    gps_buddy_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    gps_dozor_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    gps_logistic_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    gps_mobile_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    grizzli_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    gx_solutions_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    hdm_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    hostabee_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    i_track_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    icell_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    ims_telematics_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    inelo_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    infis_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    info_car_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    integre_trans_uab_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    intellitrac_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    intendia_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    ispyafrica_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    itrack_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    iveconnect_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    jaltest_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    keratronik_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    kinesis_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    konsalnet_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    krone_telematic_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    la_chaine_du_froid_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    landmark_tracking_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    legal_telematics_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    linqo_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    localizador_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    localizare_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    locatel_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    locationsolutions_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    loclog_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    loctracker_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    logisat_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    lontex_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    matiasat_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    maxtrack_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    mecomo_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    microlise_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    mix_telematics_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    mobilisis_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    mobiliz_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    mobiltrust_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    movertis_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    movildata_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    mtrack_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    mygps_service_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    n2mobil_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    naocom_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    navifleet_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    navigate_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    navirec_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    navisat_gps_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    navitel_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    netfleet_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    nextgal_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    nexus_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    nipo_electronics_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    nomadsys_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    novacom_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    oak_and_gold_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    ocean_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    omp_eliot_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    optifleet_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    optimo_gps_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    orbcomm_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    orbcomm_africa_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    ovelan_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    pentest_customer_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    pharox_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    pico_gps_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    primafrio_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    protrac_africa_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    protrack_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    pulsit_electronics_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    quake_tracking_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    rdtronic_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    restrata_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    riverlong_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    rmcontrol_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    rmsassist_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    rte_technologies_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    ruptela_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    safefleet_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    sas_fleet_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    satis_gps_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    satko_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    schmitz_cargobull_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    seccom_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    sensolus_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    seyir_mobil_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    siberyazilim_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    simplciti_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    sinaps_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    skywatch_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    solid_security_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    solustop_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    spedion_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    speedtelematics_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    starcom_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    suivi_de_flotte_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    supervisor_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    sycada_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    t_cars_system_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    t_comm_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    tcom_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    tekom_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    teksat_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    tekwise_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    telepass_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    terramar_networks_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    tg2s_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    thermoking_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    tracker_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    tracking_diary_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    trackit_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    tracknamic_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    traffic_control_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    trakmy_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    transpoco_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    tronik_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    trucksters_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    uefora_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    unity_plan_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    universalgps_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    v3_smart_technologies_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    vehco_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    vektor_teknoloji_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    viafleet_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    viasat_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    visirun_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    vsu_truck_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    wabco_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    watchsystem_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    waynet_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    wayzz_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    webdispecink_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
    wemob_mapandtruck:
        "https://help.dashdoc.com/fr/articles/9822418-connecter-une-telematique-via-l-agregateur-map-truck",
};

const TELEMATIC_REQUIRED_PARAMETERS: {
    [key in AllTelematicVendor]: {
        id: string;
        label: string;
        type: TextInputType | "select";
        options?: any;
    }[];
} = {
    alertgasoil: [],
    astrata: [],
    addsecure: [],
    dashdoc: [],
    eliott: [],
    fleetboard: [],
    geodynamics: [],
    geotracer: [],
    koovea: [],
    mappingcontrol: [
        {
            id: "platform",
            label: "Platform",
            type: "select",
            options: [
                {
                    value: "connect",
                    label: "Connect",
                },
                {
                    value: "fleet",
                    label: "Fleet",
                },
            ],
        },
    ],
    mapandtruck: [],
    masternaut: [],
    masternautsasweb: [],
    qeos: [],
    quartix: [],
    rio: [],
    scania: [],
    sudtelematique: [],
    transics: [],
    trimble: [],
    truckonline: [],
    vehizen: [],
    volvo: [],
    webfleet: [],
    strada: [],
    verizon: [],
    mapon: [],
    bump: [],
    samsara_mapandtruck: [],
    keeptrace_mapandtruck: [],
    webeye: [],
    hermes: [],
    pass_tracabilite: [],
    bizztrack: [],
    wialon: [],
    // telematic working with map&truck's connection
    acron_mapandtruck: [],
    actia_mapandtruck: [],
    ags_mapandtruck: [],
    aktkc_etransportas_mapandtruck: [],
    anima_mapandtruck: [],
    anloc_mapandtruck: [],
    arobs_mapandtruck: [],
    arvento_mapandtruck: [],
    as24_mapandtruck: [],
    ascent_solutions_mapandtruck: [],
    asset_monitoring_system_mapandtruck: [],
    atrom_mapandtruck: [],
    autogps_mapandtruck: [],
    automaticaplus_sl_mapandtruck: [],
    autopatrol_mapandtruck: [],
    autotrak_mapandtruck: [],
    axxess_mapandtruck: [],
    bimsat_mapandtruck: [],
    bluetrax_mapandtruck: [],
    bm_mobil_mapandtruck: [],
    bornemann_infleet_mapandtruck: [],
    bpw_mapandtruck: [],
    busiraks_mapandtruck: [],
    carrier_mapandtruck: [],
    cartrack_mapandtruck: [],
    cms_supatrak_mapandtruck: [],
    commander_services_mapandtruck: [],
    control_position_mapandtruck: [],
    cvs_mobile_mapandtruck: [],
    daf_connect_mapandtruck: [],
    dafrfms3_mapandtruck: [],
    dako_mapandtruck: [],
    dams_tracking_mapandtruck: [],
    dbk_mapandtruck: [],
    dbs_mapandtruck: [],
    digital_telematics_mapandtruck: [],
    dispecer_mapandtruck: [],
    distribution_est_equipements_etudes_electronique_mapandtruck: [],
    dkv_mapandtruck: [],
    easytrack_mapandtruck: [],
    echotrack_mapandtruck: [],
    eco_truck_mapandtruck: [],
    ecofleet_mapandtruck: [],
    edrive_mapandtruck: [],
    effitrailer_mapandtruck: [],
    ekolis_mapandtruck: [],
    elcar_mapandtruck: [],
    elocaliza_mapandtruck: [],
    etec_mapandtruck: [],
    eup_mapandtruck: [],
    euro_sped_online_mapandtruck: [],
    eurotoll_mapandtruck: [],
    eurotracs_mapandtruck: [],
    eurowag_mapandtruck: [],
    eutracker_v2_mapandtruck: [],
    evo_gps_mapandtruck: [],
    fanset_mapandtruck: [],
    findit_mapandtruck: [],
    fleet_commander_mapandtruck: [],
    fleet_hunt_mapandtruck: [],
    fleetgo_mapandtruck: [],
    fleethand_mapandtruck: [],
    fleeti_mapandtruck: [],
    fleetmaster_mapandtruck: [],
    flota_online_mapandtruck: [],
    flotis_mapandtruck: [],
    flottaweb_mapandtruck: [],
    fm_solutions_mapandtruck: [],
    fomco_mapandtruck: [],
    framelogic_mapandtruck: [],
    frotcom_mapandtruck: [],
    galileo_satellite_control_systems_mapandtruck: [],
    geoclic_solutions_mapandtruck: [],
    geoloc_systems_mapandtruck: [],
    geotab_mapandtruck: [],
    geotraceur_mapandtruck: [],
    gesinflot_mapandtruck: [],
    gesinflotpush_mapandtruck: [],
    gestracking_mapandtruck: [],
    globalsat_mapandtruck: [],
    globaltrack_mapandtruck: [],
    globspot_mapandtruck: [],
    goodyear_france_mapandtruck: [],
    gps_buddy_mapandtruck: [],
    gps_dozor_mapandtruck: [],
    gps_logistic_mapandtruck: [],
    gps_mobile_mapandtruck: [],
    grizzli_mapandtruck: [],
    gx_solutions_mapandtruck: [],
    hdm_mapandtruck: [],
    hostabee_mapandtruck: [],
    i_track_mapandtruck: [],
    icell_mapandtruck: [],
    ims_telematics_mapandtruck: [],
    inelo_mapandtruck: [],
    infis_mapandtruck: [],
    info_car_mapandtruck: [],
    integre_trans_uab_mapandtruck: [],
    intellitrac_mapandtruck: [],
    intendia_mapandtruck: [],
    ispyafrica_mapandtruck: [],
    itrack_mapandtruck: [],
    iveconnect_mapandtruck: [],
    jaltest_mapandtruck: [],
    keratronik_mapandtruck: [],
    kinesis_mapandtruck: [],
    konsalnet_mapandtruck: [],
    krone_telematic_mapandtruck: [],
    la_chaine_du_froid_mapandtruck: [],
    landmark_tracking_mapandtruck: [],
    legal_telematics_mapandtruck: [],
    linqo_mapandtruck: [],
    localizador_mapandtruck: [],
    localizare_mapandtruck: [],
    locatel_mapandtruck: [],
    locationsolutions_mapandtruck: [],
    loclog_mapandtruck: [],
    loctracker_mapandtruck: [],
    logisat_mapandtruck: [],
    lontex_mapandtruck: [],
    matiasat_mapandtruck: [],
    maxtrack_mapandtruck: [],
    mecomo_mapandtruck: [],
    microlise_mapandtruck: [],
    mix_telematics_mapandtruck: [],
    mobilisis_mapandtruck: [],
    mobiliz_mapandtruck: [],
    mobiltrust_mapandtruck: [],
    movertis_mapandtruck: [],
    movildata_mapandtruck: [],
    mtrack_mapandtruck: [],
    mygps_service_mapandtruck: [],
    n2mobil_mapandtruck: [],
    naocom_mapandtruck: [],
    navifleet_mapandtruck: [],
    navigate_mapandtruck: [],
    navirec_mapandtruck: [],
    navisat_gps_mapandtruck: [],
    navitel_mapandtruck: [],
    netfleet_mapandtruck: [],
    nextgal_mapandtruck: [],
    nexus_mapandtruck: [],
    nipo_electronics_mapandtruck: [],
    nomadsys_mapandtruck: [],
    novacom_mapandtruck: [],
    oak_and_gold_mapandtruck: [],
    ocean_mapandtruck: [],
    omp_eliot_mapandtruck: [],
    optifleet_mapandtruck: [],
    optimo_gps_mapandtruck: [],
    orbcomm_mapandtruck: [],
    orbcomm_africa_mapandtruck: [],
    ovelan_mapandtruck: [],
    pentest_customer_mapandtruck: [],
    pharox_mapandtruck: [],
    pico_gps_mapandtruck: [],
    primafrio_mapandtruck: [],
    protrac_africa_mapandtruck: [],
    protrack_mapandtruck: [],
    pulsit_electronics_mapandtruck: [],
    quake_tracking_mapandtruck: [],
    rdtronic_mapandtruck: [],
    restrata_mapandtruck: [],
    riverlong_mapandtruck: [],
    rmcontrol_mapandtruck: [],
    rmsassist_mapandtruck: [],
    rte_technologies_mapandtruck: [],
    ruptela_mapandtruck: [],
    safefleet_mapandtruck: [],
    sas_fleet_mapandtruck: [],
    satis_gps_mapandtruck: [],
    satko_mapandtruck: [],
    schmitz_cargobull_mapandtruck: [],
    seccom_mapandtruck: [],
    sensolus_mapandtruck: [],
    seyir_mobil_mapandtruck: [],
    siberyazilim_mapandtruck: [],
    simplciti_mapandtruck: [],
    sinaps_mapandtruck: [],
    skywatch_mapandtruck: [],
    solid_security_mapandtruck: [],
    solustop_mapandtruck: [],
    spedion_mapandtruck: [],
    speedtelematics_mapandtruck: [],
    starcom_mapandtruck: [],
    suivi_de_flotte_mapandtruck: [],
    supervisor_mapandtruck: [],
    sycada_mapandtruck: [],
    t_cars_system_mapandtruck: [],
    t_comm_mapandtruck: [],
    tcom_mapandtruck: [],
    tekom_mapandtruck: [],
    teksat_mapandtruck: [],
    tekwise_mapandtruck: [],
    telepass_mapandtruck: [],
    terramar_networks_mapandtruck: [],
    tg2s_mapandtruck: [],
    thermoking_mapandtruck: [],
    tracker_mapandtruck: [],
    tracking_diary_mapandtruck: [],
    trackit_mapandtruck: [],
    tracknamic_mapandtruck: [],
    traffic_control_mapandtruck: [],
    trakmy_mapandtruck: [],
    transpoco_mapandtruck: [],
    tronik_mapandtruck: [],
    trucksters_mapandtruck: [],
    uefora_mapandtruck: [],
    unity_plan_mapandtruck: [],
    universalgps_mapandtruck: [],
    v3_smart_technologies_mapandtruck: [],
    vehco_mapandtruck: [],
    vektor_teknoloji_mapandtruck: [],
    viafleet_mapandtruck: [],
    viasat_mapandtruck: [],
    visirun_mapandtruck: [],
    vsu_truck_mapandtruck: [],
    wabco_mapandtruck: [],
    watchsystem_mapandtruck: [],
    waynet_mapandtruck: [],
    wayzz_mapandtruck: [],
    webdispecink_mapandtruck: [],
    wemob_mapandtruck: [],
};
interface Props {
    onClose: () => void;
    onCreation: () => void;
}

type Credentials = {
    timezone?: string;
    wsdl?: string;
    user?: string;
    customer?: string;
    password?: string;
    dispatcher?: string;
    system_number?: string;
    integrator?: string;
    fleetname?: string;
    account?: string;
    api_key?: string;
    integration_id?: string;
    client_id?: string;
    secret_key?: string;
    application?: string;
    interval_duration?: string;
};

type Parameters = {
    platform?: string;
};

type ConnectedAddTelematicModal = Props;

export const AddTelematicModal: FunctionComponent<ConnectedAddTelematicModal> = ({
    onClose,
    onCreation,
}) => {
    const connectedManager = useSelector(getConnectedManager);
    const isStaff = managerService.isDashdocStaff(connectedManager);
    const [vendor, setVendor] = useState<AllTelematicVendor>();
    const [isLoading, setIsLoading] = useState(false);
    const [credentials, setCredentials] = useState<Credentials>({
        timezone: "Europe/Paris",
        wsdl: undefined,
        interval_duration: undefined,
    });
    const [parameters, setParameters] = useState<Parameters>({
        platform: undefined,
    });

    const getCredentialFields = () => {
        const fields = [];
        const dot = ".";
        if (vendor != undefined) {
            if (vendor in MapAndTruckVendor) {
                fields.push(<Text mt={1}>{t("settings.addTelematicMapAndTruckInfo")}</Text>);
            }
            fields.push(
                <Text variant="h1" fontSize={3} mb={3} mt={3}>
                    {t("settings.addTelematicConnectionParameterTitle")}
                </Text>
            );
            if (vendor in MapAndTruckVendor) {
                let documentationLink = renderToStaticMarkup(
                    <Link href={TELEMATIC_DOC_LINK[vendor]} target="_blank" rel="noreferrer">
                        {t("common.documentation")}
                    </Link>
                );

                fields.push(
                    <Text
                        mt={1}
                        dangerouslySetInnerHTML={{
                            __html: t("settings.addTelematicMapAndTruckCredentialsExplanation", {
                                documentationLink: documentationLink,
                            }),
                        }}
                        key="credential-explanation"
                    />
                );
            } else {
                fields.push(
                    <Text mt={1} key="credential-explanation">
                        {t("settings.addTelematicCredentialsExplanation")}
                        <Link href={TELEMATIC_DOC_LINK[vendor]} target="_blank" rel="noreferrer">
                            {t("common.documentation")}
                        </Link>
                        {dot}
                    </Text>
                );
            }
            for (let field_data of TELEMATIC_REQUIRED_CREDENTIALS[vendor]) {
                let input;
                if (field_data["id"] === "timezone") {
                    input = (
                        <Box mt={2}>
                            <Select
                                options={field_data["options"]}
                                data-testid="select-timezone"
                                key="telematic-timezone"
                                value={{value: credentials.timezone, label: credentials.timezone}}
                                id={field_data["id"]}
                                label={field_data["label"]}
                                required={true}
                                onChange={(option: SelectOption<string>) => {
                                    setCredentials({
                                        ...credentials,
                                        timezone: option?.value,
                                    });
                                }}
                            />
                        </Box>
                    );
                } else if (field_data["id"] === "external_telematic") {
                    // If the connection is made by the telematic itself (API), redirect on dashdoc documentation link
                    input = (
                        <>
                            <Box mt={2} key={"external-connection-explanation"}>
                                <p>
                                    {t("settings.explanations.externalTelematicConnection", {
                                        telematic_name: field_data["label"],
                                    })}
                                </p>
                            </Box>
                        </>
                    );
                } else if (field_data["id"] === "wsdl") {
                    input = (
                        <Box mt={2}>
                            <Select
                                options={field_data["options"]}
                                data-testid="select-wsdl"
                                key="telematic-wsdl"
                                id={field_data["id"]}
                                label={field_data["label"]}
                                required={true}
                                onChange={(option: SelectOption<string>) => {
                                    setCredentials({
                                        ...credentials,
                                        wsdl: option?.value,
                                    });
                                }}
                            />
                        </Box>
                    );
                } else if (field_data["id"] === "interval_duration") {
                    input = (
                        <Box mt={2}>
                            <Select
                                options={field_data["options"]}
                                data-testid="select-interval-duration"
                                key="telematic-interval_duration"
                                id={field_data["id"]}
                                label={field_data["label"]}
                                required={true}
                                onChange={(option: SelectOption<string>) => {
                                    setCredentials({
                                        ...credentials,
                                        interval_duration: option?.value,
                                    });
                                }}
                            />
                        </Box>
                    );
                } else if (field_data["type"] !== "select") {
                    input = (
                        <Box mt={2} key={"box-telematic-" + field_data["id"]}>
                            <TextInput
                                // @ts-ignore
                                value={credentials[field_data["id"] as keyof Credentials]}
                                id={field_data["id"]}
                                key={"telematic-" + field_data["id"]}
                                autoComplete="off"
                                label={field_data["label"]}
                                type={field_data["type"]}
                                required={true}
                                onChange={(value, event) => {
                                    setCredentials({
                                        ...credentials,
                                        [event.target.id]: value,
                                    });
                                }}
                            />
                        </Box>
                    );
                }
                fields.push(input);
            }
        }
        return <>{fields}</>;
    };

    const getParametersFields = () => {
        const fields = [];
        if (vendor != undefined) {
            for (let field_data of TELEMATIC_REQUIRED_PARAMETERS[vendor]) {
                let input;
                if (field_data["id"] === "platform") {
                    input = (
                        <Box mt={2}>
                            <Select
                                options={field_data["options"]}
                                data-testid="select-platform"
                                key="telematic-platform"
                                id={field_data["id"]}
                                label={field_data["label"]}
                                required={true}
                                onChange={(option: SelectOption<string>) => {
                                    setParameters({
                                        ...parameters,
                                        platform: option?.value,
                                    });
                                }}
                            />
                        </Box>
                    );
                }
                fields.push(input);
            }
        }
        return <>{fields}</>;
    };

    const handleSubmit = async (event: React.FormEvent) => {
        setIsLoading(true);
        event.preventDefault();
        try {
            await apiService.post(
                `/telematics/links/`,
                {
                    vendor,
                    credentials,
                    parameters,
                },
                {apiVersion: "v4"}
            );
            toast.success(t("settings.telematicAdded"));
            setIsLoading(false);
            onCreation();
            onClose();
        } catch (response) {
            try {
                let body: any = await response.json();
                const error = body.error;
                toast.error(t("settings.addTelematic.error", {error}));
                setIsLoading(false);
            } catch (error: any) {
                Logger.error(error);
                toast.error(t("settings.addTelematic.error"));
                setIsLoading(false);
            }
        }
    };

    const onVendorChange = (option: SelectOption<string>) => {
        setVendor(option?.value as any);
    };

    const telematic_vendors = isStaff
        ? TELEMATIC_VENDORS
        : TELEMATIC_VENDORS.filter((vendor) => vendor.value != "dashdoc");
    telematic_vendors.sort(function (a, b) {
        var valueA = a.value.toUpperCase();
        var valueB = b.value.toUpperCase();
        return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
    });

    return (
        <Modal
            id="add-telematic-modal"
            title={t("settings.addTelematic")}
            onClose={onClose}
            mainButton={{
                type: "submit",
                form: "add-telematic-form",
                disabled: !vendor,
                children: t("common.add"),
            }}
            secondaryButton={{}}
        >
            {isLoading && <LoadingWheel />}
            <form id="add-telematic-form" onSubmit={handleSubmit}>
                <Text variant="h1" fontSize={3} mb={3}>
                    {t("settings.addTelematicVendorTitle")}
                </Text>
                <Select
                    label={t("settings.telematicsAddVendor")}
                    options={telematic_vendors}
                    data-testid="select-vendor"
                    key="telematic-vendor"
                    onChange={onVendorChange}
                />
                {getCredentialFields()}
                {getParametersFields()}
                {vendor && (
                    <Box>
                        <Box mt={2} key="connect-telematic-info">
                            <Text mb={2}>{t("settings.addTelematicDataCollection")}</Text>
                            <Box display="flex" flexDirection="column">
                                {/* We are currently not doing anything with those 3 checkbox */}
                                <Checkbox
                                    disabled={true}
                                    onChange={() => {}}
                                    checked={true}
                                    label={t("settings.addTelematicVehicleGeolocation")}
                                    data-testid="select-all-traces"
                                ></Checkbox>
                                <Checkbox
                                    disabled={true}
                                    onChange={() => {}}
                                    checked={true}
                                    label={t("settings.addTelematicMileageData")}
                                    data-testid="select-all-traces"
                                ></Checkbox>
                                <Checkbox
                                    disabled={true}
                                    onChange={() => {}}
                                    checked={true}
                                    label={t("settings.addTelematicConsumptionData")}
                                    data-testid="select-all-traces"
                                ></Checkbox>
                            </Box>
                            <Link
                                href={
                                    "https://help.dashdoc.com/fr/articles/8279082-la-gestion-des-donnees-de-telematique-dans-dashdoc"
                                }
                                target="_blank"
                                rel="noreferrer"
                            >
                                {t("settings.addTelematicFindOutMore")}
                            </Link>
                        </Box>
                    </Box>
                )}
            </form>
        </Modal>
    );
};
