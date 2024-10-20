export interface DaySimulationTrip {
    activities: DaySimulationActivity[];
}

export type DaySimulationActivity = {
    address: DaySimulationAddress | null;
    scheduled_range: DaySimulationRange | null;
    slots_range: DaySimulationRange | null;
    estimated_distance_to_next_activity: number | null;
    estimated_driving_time_to_next_activity: number | null;
    simulated_break_before_next_activity: number | null;
    is_distance_to_next_activity_empty_km: boolean | null;
} & (
    | {real_datetime_range: DaySimulationRange; simulated_start: null; simulated_duration: null}
    | {
          real_datetime_range: null;
          simulated_start: string | null;
          simulated_duration: number;
      }
);

export interface DaySimulationRange {
    start: string;
    end: string;
}

export interface DaySimulationAddress {
    name: string;
    postcode: string;
    city: string;
    country: string;
    company: DaySimulationCompany | null;
    latitude: number | null;
    longitude: number | null;
    theoretical_activity_duration_in_min: number | null;
}

interface DaySimulationCompany {
    name: string;
}
