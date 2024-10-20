export type SelectOptionValue = string | number | boolean;

export type SelectOption<TValue = SelectOptionValue> = {
    label?: string;
    value?: TValue;
    [property: string]: any;
};

export type SelectOptions<TValue = SelectOptionValue> = Array<SelectOption<TValue>>;
