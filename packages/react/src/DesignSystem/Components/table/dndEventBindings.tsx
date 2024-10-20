export type EventOptions = {
    passive?: boolean;
    capture?: boolean;
    // sometimes an event might only want to be bound once
    once?: boolean;
};

export type EventBinding = {
    eventName: string;
    fn: Function;
    options?: EventOptions;
};

type UnbindFn = () => void;

function getOptions(shared?: EventOptions, fromBinding?: EventOptions): EventOptions {
    return {
        ...shared,
        ...fromBinding,
    };
}

export function bindEvents(
    el: any,
    bindings: EventBinding[],
    sharedOptions?: EventOptions
): Function {
    const unbindings: UnbindFn[] = bindings.map((binding: EventBinding): UnbindFn => {
        const options: Object = getOptions(sharedOptions, binding.options);

        el.addEventListener(binding.eventName, binding.fn, options);

        return function unbind() {
            el.removeEventListener(binding.eventName, binding.fn, options);
        };
    });

    // Return a function to unbind events
    return function unbindAll() {
        unbindings.forEach((unbind: UnbindFn) => {
            unbind();
        });
    };
}
