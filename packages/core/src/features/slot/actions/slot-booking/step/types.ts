export type Step = 1 | 2 | 3;
export type TurnToStep = (step: Step) => Promise<void>;

/**
 * Predefined slot time.
 */
export type RegularSlotTime = {startTime: string};

/**
 * Slot time with a custom start and end time (for site manager only!).
 */
export type IrregularSlotTime = {startTime: string; endTime: string};

export type SlotTime = RegularSlotTime | IrregularSlotTime;
