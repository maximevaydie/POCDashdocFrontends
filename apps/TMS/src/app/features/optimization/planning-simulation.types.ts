export interface TruckerIndicators {
    user_last_name: string;
    user_first_name: string;
    display_name: string;
    last_trip_scheduled_order: number | null;
    simulated_scheduled_start: string | null;
    last_activity: LastActivity | null;
    distance_to_trip: number | null; //km
    driving_time_to_trip: number | null; //s
    trip_distance: number | null; //km
    trip_driving_time: number | null; //s
}

export interface LastActivity {
    address: LastActivityAddress | null;
}

interface LastActivityAddress {
    city: string;
    postcode: string;
    country: string;
}
