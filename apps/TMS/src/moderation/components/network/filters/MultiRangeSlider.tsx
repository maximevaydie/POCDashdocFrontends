import {Icon} from "@dashdoc/web-ui";
import {css} from "@emotion/react";
import styled from "@emotion/styled";
import React, {ChangeEvent, FC, useCallback, useEffect, useRef, useState} from "react";

const dynamicWidth = (props: any) => css`
    width: ${props["data-width"]}px;
`;

const dynamicColor = (props: any) => `${props.color}`;

const Container = styled.div`
    ${dynamicWidth}
    height: 20px;
    position: relative;
    margin: 0 auto;

    .slider {
        position: relative;
        height: 100%;
        ${dynamicWidth}
    }

    .slider__track,
    .slider__range,
    .slider__left-value,
    .slider__right-value {
        position: absolute;
        top: 50%;
    }

    .slider__track,
    .slider__range {
        border-radius: 3px;
        height: 5px;
    }

    .slider__track {
        background-color: #f1f1f1;
        width: 100%;
        z-index: 1;
    }

    .slider__range {
        background-color: ${dynamicColor};
        z-index: 2;
    }

    .slider__left-value,
    .slider__right-value {
        font-size: 12px;
        margin-top: 15px;
        font-weight: 600;
    }

    .slider__left-value {
        left: 0px;
    }

    .slider__right-value {
        right: 0px;
    }

    /* Removing the default appearance */
    .thumb,
    .thumb::-webkit-slider-thumb {
        -webkit-appearance: none;
        -webkit-tap-highlight-color: transparent;
    }

    .thumb {
        pointer-events: none;
        position: absolute;
        height: 0;
        top: 50%;
        ${dynamicWidth}
        outline: none;
    }

    .thumb--zindex-3 {
        z-index: 3;
    }

    .thumb--zindex-4 {
        z-index: 4;
    }

    .thumb--zindex-5 {
        z-index: 5;
    }

    /* For Chrome browsers */
    .thumb::-webkit-slider-thumb {
        background-color: #f1f5f7;
        border: none;
        border-radius: 2px;
        border: 1px solid ${dynamicColor};
        cursor: pointer;
        height: 20px;
        width: 10px;
        margin-top: 4px;
        pointer-events: all;
        position: relative;
    }

    /* For Firefox browsers */
    .thumb::-moz-range-thumb {
        background-color: #f1f5f7;
        border: none;
        border-radius: 50%;
        box-shadow: 0 0 1px 1px #ced4da;
        cursor: pointer;
        height: 20px;
        width: 10px;
        margin-top: 4px;
        pointer-events: all;
        position: relative;
    }
`;

interface MultiRangeSliderProps {
    label?: string;
    width?: number;
    min: number;
    max: number;
    onChange: (value: {min: number | undefined; max: number | undefined}) => void;
    onReset?: () => void;
}

export const MultiRangeSlider: FC<MultiRangeSliderProps> = ({
    label,
    width,
    min,
    max,
    onChange,
    onReset,
}) => {
    const [minVal, setMinVal] = useState(min);
    const [maxVal, setMaxVal] = useState(max);
    const minValRef = useRef<HTMLInputElement>(null);
    const maxValRef = useRef<HTMLInputElement>(null);
    const range = useRef<HTMLDivElement>(null);
    const [color, setColor] = useState<string>("gray");

    // Convert to percentage
    const getPercent = useCallback(
        (value: number) => Math.round(((value - min) / (max - min)) * 100),
        [min, max]
    );

    // Set width of the range to decrease from the left side
    useEffect(() => {
        if (maxValRef.current) {
            const minPercent = getPercent(minVal);
            const maxPercent = getPercent(+maxValRef.current.value); // Precede with '+' to convert the value from type string to type number

            if (range.current) {
                range.current.style.left = `${minPercent}%`;
                range.current.style.width = `${maxPercent - minPercent}%`;
            }
        }
    }, [minVal, getPercent]);

    // Set width of the range to decrease from the right side
    useEffect(() => {
        if (minValRef.current) {
            const minPercent = getPercent(+minValRef.current.value);
            const maxPercent = getPercent(maxVal);

            if (range.current) {
                range.current.style.width = `${maxPercent - minPercent}%`;
            }
        }
    }, [maxVal, getPercent]);

    const handleMinChange = (event: ChangeEvent<HTMLInputElement>) => {
        const value = Math.min(+event.target.value, maxVal - 1);
        setMinVal(value);
        event.target.value = value.toString();
    };

    const handleMaxChange = (event: ChangeEvent<HTMLInputElement>) => {
        const value = Math.max(+event.target.value, minVal + 1);
        setMaxVal(value);
        event.target.value = value.toString();
    };

    useEffect(() => {
        if (minVal === min && maxVal === max) {
            setColor("gray");
            onChange({
                min: undefined,
                max: undefined,
            });
        } else {
            setColor("#3b64f4");
            onChange({
                min: minVal === min ? undefined : minVal,
                max: maxVal === max ? undefined : maxVal,
            });
        }
    }, [minVal, maxVal]);

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                justifyContent: "center",
            }}
        >
            {label && (
                <div
                    style={{
                        fontSize: 12,
                        fontWeight: 600,
                        marginBottom: 5,
                        height: 10,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                    }}
                >
                    <Icon
                        name="refresh"
                        style={{
                            marginRight: 5,
                            cursor: "pointer",
                        }}
                        onClick={() => {
                            onReset && onReset();
                            setMinVal(min);
                            setMaxVal(max);
                        }}
                    />
                    {label}
                </div>
            )}
            <Container data-width={width || 200} color={color}>
                <input
                    type="range"
                    min={min}
                    max={max}
                    value={minVal}
                    ref={minValRef}
                    onChange={handleMinChange}
                    className="thumb thumb--zindex-4"
                />
                <input
                    type="range"
                    min={min}
                    max={max}
                    value={maxVal}
                    ref={maxValRef}
                    onChange={handleMaxChange}
                    className="thumb thumb--zindex-4"
                />

                <div className="slider">
                    <div className="slider__track"></div>
                    <div ref={range} className="slider__range"></div>
                    <div className="slider__left-value">{minVal}</div>
                    <div className="slider__right-value">{maxVal === max ? "Any" : maxVal}</div>
                </div>
            </Container>
        </div>
    );
};
