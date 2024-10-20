import {Manager, User, ManagerRole, SchedulerCardSettingsData} from "dashdoc-utils";

const user: User = {
    pk: 1,
    first_name: "John",
    last_name: "Doe",
    username: "jdoe",
    display_name: "JohnDoe",
    email: "johndoe@world.com",
    last_login: null,
    date_joined: null,
};
const schedulerSettings: SchedulerCardSettingsData = {
    display_shipper_name: true,
    display_activities: true,
    activity_list_mode: "expand",
    activity_label_mode: "city",
    display_activity_type: true,
    display_means: true,
    display_vehicle_requested: true,
    display_global_instructions: true,
    display_tags: true,
    display_tag_text: true,
};

export const readOnlyManager: Manager = {
    pk: 1,
    user,
    role: ManagerRole.ReadOnly,
    display_name: "ReadOnly manager",
    language: "en",
    shipment_columns: [],
    transport_columns: {},
    waste_shipment_columns: [],
    pool_of_unplanned_transports_columns: [],
    pool_of_unplanned_trips_columns: [],
    pool_of_unplanned_transports_initial_ordering: "",
    pool_of_unplanned_trips_initial_ordering: "",
    scheduler_card_display_settings: schedulerSettings,
    fleet_columns: {},
    invoice_columns: [],
    address_book_columns: {
        logistic_points: [],
        partners: [],
    },
    profile_picture: null,
};
