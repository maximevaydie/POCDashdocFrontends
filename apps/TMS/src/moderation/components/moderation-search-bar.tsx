import {LoadingWheel} from "@dashdoc/web-ui";
import debounce from "lodash.debounce";
import React, {useEffect, useRef, useState} from "react";

interface SearchBarProps {
    placeholder: string;
    onQueryChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    inputClassName?: string;
    containerClassName?: string;
    value?: string;
    "data-testid"?: string;
    loading?: boolean;
    autofocus?: boolean;
    minLength?: number;
    resetOnChange?: string;
    onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
}

function ModerationSearchBar(props: SearchBarProps) {
    const [value, setValue] = useState("");
    const {inputClassName, autofocus = false, minLength = 0} = props;

    const debouncedOnQueryChange = useRef(
        debounce(async (event: any) => {
            props.onQueryChange(event);
        }, 500)
    );

    useEffect(() => {
        setValue(props.value || "");
    }, [props.resetOnChange, props.value]);

    const handleChange = (event: any) => {
        const text = event.target.value;
        setValue(text);
        if (text.length >= minLength || text.length == 0) {
            debouncedOnQueryChange.current(event);
        }
    };

    return (
        <div className={props.containerClassName || "form-group has-feedback"}>
            <input
                autoFocus={autofocus}
                type="text"
                className={`form-control shipment-filters-text-input ${inputClassName || ""}`}
                placeholder={props.placeholder}
                onChange={handleChange}
                value={value}
                onKeyDown={(e) => {
                    if (e.keyCode === 13) {
                        // Do nothing when "Enter" is pressed
                        e.preventDefault();
                    }
                }}
                data-testid={props["data-testid"]}
                onFocus={props.onFocus}
            />
            <span className="form-control-feedback">
                <i className="fa fa-search fa-fw" />
            </span>
            {props.loading && (
                <div className="input-group-addon">
                    <LoadingWheel small />
                </div>
            )}
        </div>
    );
}

export default ModerationSearchBar;
