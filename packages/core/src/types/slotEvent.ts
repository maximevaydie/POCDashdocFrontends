export type SlotEventCategory =
    | "created" // has a creation date
    | "rescheduled" // has a previous and next date
    | "cancelled" // has a reason
    | "arrived"
    | "arrival_cancelled"
    | "handled"
    | "handling_cancelled"
    | "completed"
    | "completion_cancelled";

export type DefaultSlotEventCategory = Exclude<
    SlotEventCategory,
    "created" | "rescheduled" | "cancelled"
>;

type CommonSlotEvent = {
    id: number;
    slot: number;
    author: {
        email: string;
        first_name: string;
        last_name: string;
    };
    created_at: string;
};

export type DefaultSlotEvent = {
    category: DefaultSlotEventCategory;
} & CommonSlotEvent;

export type CreatedSlotEvent = {
    category: Extract<SlotEventCategory, "created">;
    data: {
        start_time: string;
    };
} & CommonSlotEvent;

export type ArrivedSlotEvent = {
    category: Extract<SlotEventCategory, "arrived">;
    data: {
        timestamp?: string;
    };
} & CommonSlotEvent;

export type HandledSlotEvent = {
    category: Extract<SlotEventCategory, "handled">;
    data: {
        timestamp?: string;
    };
} & CommonSlotEvent;

export type CompletedSlotEvent = {
    category: Extract<SlotEventCategory, "completed">;
    data: {
        timestamp?: string;
    };
} & CommonSlotEvent;

export type RescheduledSlotEvent = {
    category: Extract<SlotEventCategory, "rescheduled">;
    data: {
        new: string;
        previous: string;
    };
} & CommonSlotEvent;

export type CancelledSlotEvent = {
    category: Extract<SlotEventCategory, "cancelled">;
    data: {
        reason: string;
    };
} & CommonSlotEvent;

export type SlotEvent =
    | DefaultSlotEvent
    | CreatedSlotEvent
    | RescheduledSlotEvent
    | CancelledSlotEvent;
