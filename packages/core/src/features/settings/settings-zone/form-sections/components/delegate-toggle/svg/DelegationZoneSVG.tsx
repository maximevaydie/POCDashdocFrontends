import React from "react";

interface SvgProps extends React.SVGProps<SVGSVGElement> {
    color: string;
}

export function DelegationZoneSVG({color, ...props}: SvgProps) {
    return (
        <svg
            width="29"
            height="29"
            viewBox="0 0 29 29"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            {...props}
        >
            <g clipPath="url(#clip0_3838_63612)">
                <path
                    d="M13.248 20.5645C13.248 22.3049 13.9395 23.9741 15.1702 25.2048C16.4009 26.4355 18.0701 27.127 19.8105 27.127C21.551 27.127 23.2202 26.4355 24.4509 25.2048C25.6816 23.9741 26.373 22.3049 26.373 20.5645C26.373 18.824 25.6816 17.1548 24.4509 15.9241C23.2202 14.6934 21.551 14.002 19.8105 14.002C18.0701 14.002 16.4009 14.6934 15.1702 15.9241C13.9395 17.1548 13.248 18.824 13.248 20.5645Z"
                    stroke={color}
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <path
                    d="M22.7355 18.6572L19.5586 22.8934C19.488 22.9872 19.398 23.0648 19.2948 23.121C19.1917 23.1771 19.0776 23.2105 18.9605 23.2189C18.8433 23.2273 18.7257 23.2106 18.6156 23.1697C18.5054 23.1288 18.4053 23.0649 18.322 22.9821L16.6816 21.3417"
                    stroke={color}
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <path
                    d="M9.96651 20.5646H3.40401C2.96896 20.5646 2.55174 20.3918 2.24411 20.0842C1.93649 19.7766 1.76367 19.3593 1.76367 18.9243V5.81563C1.76367 5.38058 1.93649 4.96336 2.24411 4.65574C2.55174 4.34811 2.96896 4.17529 3.40401 4.17529H18.1693C18.6044 4.17529 19.0216 4.34811 19.3292 4.65574C19.6369 4.96336 19.8097 5.38058 19.8097 5.81563V10.7203"
                    stroke={color}
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <path
                    d="M1.76367 9.08008H19.8108"
                    stroke={color}
                    strokeWidth="1.75"
                    strokeLinejoin="round"
                />
                <path
                    d="M6.67773 5.79941V2.51758"
                    stroke={color}
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <path
                    d="M14.8809 5.79941V2.51758"
                    stroke={color}
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </g>
            <defs>
                <clipPath id="clip0_3838_63612">
                    <rect
                        width="28"
                        height="28"
                        fill="white"
                        transform="translate(0.0683594 0.822266)"
                    />
                </clipPath>
            </defs>
        </svg>
    );
}
