import {AvailabilityStatus} from "./availability";
import {Slot} from "./slot";
import {PartialUnavailability, Unavailability} from "./unavailability";

export type BookingStatus = {
    id: number;
    availability_status: AvailabilityStatus[];
    unavailabilities: Unavailability[];
    scheduled_slots: Slot[];
};

export type PartialBookingStatus = {
    availability_status: AvailabilityStatus[];
    unavailabilities: (Unavailability | PartialUnavailability)[];
};
