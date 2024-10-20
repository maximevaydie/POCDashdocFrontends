import React from "react";

interface SvgProps extends React.SVGProps<SVGSVGElement> {
    color: string;
}

export function NoDelegationZoneSVG({color, ...props}: SvgProps) {
    return (
        <svg
            width="28"
            height="28"
            viewBox="0 0 28 28"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            {...props}
        >
            <g clipPath="url(#clip0_3838_63596)">
                <path
                    d="M13.1797 19.7422C13.1797 21.4827 13.8711 23.1519 15.1018 24.3826C16.3325 25.6133 18.0017 26.3047 19.7422 26.3047C21.4827 26.3047 23.1519 25.6133 24.3826 24.3826C25.6133 23.1519 26.3047 21.4827 26.3047 19.7422C26.3047 18.0017 25.6133 16.3325 24.3826 15.1018C23.1519 13.8711 21.4827 13.1797 19.7422 13.1797C18.0017 13.1797 16.3325 13.8711 15.1018 15.1018C13.8711 16.3325 13.1797 18.0017 13.1797 19.7422Z"
                    stroke={color}
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <path
                    d="M22.2032 17.2825L17.2822 22.2035"
                    stroke={color}
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <path
                    d="M17.2822 17.2825L22.2044 22.2046"
                    stroke={color}
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <path
                    d="M9.89815 19.7424H3.33565C2.9006 19.7424 2.48338 19.5695 2.17575 19.2619C1.86813 18.9543 1.69531 18.5371 1.69531 18.102V4.99336C1.69531 4.55832 1.86813 4.14109 2.17575 3.83347C2.48338 3.52585 2.9006 3.35303 3.33565 3.35303H18.101C18.536 3.35303 18.9532 3.52585 19.2609 3.83347C19.5685 4.14109 19.7413 4.55832 19.7413 4.99336V9.89803"
                    stroke={color}
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <path
                    d="M1.69531 8.25781H19.7425"
                    stroke={color}
                    strokeWidth="1.75"
                    strokeLinejoin="round"
                />
                <path
                    d="M6.60938 4.97715V1.69531"
                    stroke={color}
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <path
                    d="M14.8125 4.97715V1.69531"
                    stroke={color}
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </g>
            <defs>
                <clipPath id="clip0_3838_63596">
                    <rect width="28" height="28" fill="white" />
                </clipPath>
            </defs>
        </svg>
    );
}
