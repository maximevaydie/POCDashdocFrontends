import {t} from "@dashdoc/web-core";
import {Text} from "@dashdoc/web-ui";
import React from "react";

export const ZonesPrecisionSVG = () => (
    <svg
        width="333"
        height="226"
        viewBox="0 0 333 226"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
    >
        <mask id="path-1-inside-1_1660_40020" fill="white">
            <path d="M103 0H333V25H103V0Z" />
        </mask>
        <path d="M103 0H333V25H103V0Z" fill="#DFE3E8" />
        <path
            d="M103 0V-1H102V0H103ZM103 25H102V26H103V25ZM103 1H333V-1H103V1ZM333 24H103V26H333V24ZM104 25V0H102V25H104Z"
            fill="#C4CDD5"
            mask="url(#path-1-inside-1_1660_40020)"
        />
        <rect x="103.5" y="24.5" width="170" height="200" fill="#F4F6F8" stroke="#C4CDD5" />
        <line x1="103" y1="64.5" x2="320" y2="64.5" stroke="#C3C9D0" />
        <line x1="103" y1="104.5" x2="320" y2="104.5" stroke="#C3C9D0" />
        <line x1="103" y1="144.5" x2="320" y2="144.5" stroke="#C3C9D0" />
        <line x1="103" y1="184.5" x2="320" y2="184.5" stroke="#C3C9D0" />
        <path
            d="M85.2929 225.707C85.6834 226.098 86.3166 226.098 86.7071 225.707L93.0711 219.343C93.4616 218.953 93.4616 218.319 93.0711 217.929C92.6805 217.538 92.0474 217.538 91.6569 217.929L86 223.586L80.3431 217.929C79.9526 217.538 79.3195 217.538 78.9289 217.929C78.5384 218.319 78.5384 218.953 78.9289 219.343L85.2929 225.707ZM85 24L85 225H87L87 24H85Z"
            fill="#C6BFBF"
        />
        <foreignObject x="114" y="35" width="225" height="200">
            <Text variant="caption" fontWeight="bold">
                {t("tariffGrids.buildingGuide.firstLineAddressExample")}
            </Text>
        </foreignObject>
        <foreignObject x="114" y="75" width="225" height="200">
            <Text variant="caption" fontWeight="bold">
                {t("tariffGrids.buildingGuide.secondLineAddressExample")}
            </Text>
        </foreignObject>
        <foreignObject x="114" y="115" width="225" height="200">
            <Text variant="caption" fontWeight="bold">
                {t("tariffGrids.buildingGuide.thirdLineCityExample")}
            </Text>
        </foreignObject>
        <foreignObject x="114" y="155" width="225" height="200">
            <Text variant="caption" fontWeight="bold">
                {t("tariffGrids.buildingGuide.fourthLineDepartmentExample")}
            </Text>
        </foreignObject>
        <foreignObject x="114" y="195" width="225" height="200">
            <Text variant="caption" fontWeight="bold">
                {t("tariffGrids.buildingGuide.fifthLineCountryExample")}
            </Text>
        </foreignObject>
        <foreignObject x="0" y="35" width="225" height="200">
            <Text variant="caption" fontWeight="bold">
                {t("tariffGrids.buildingGuide.morePrecise")}
            </Text>
        </foreignObject>
        <foreignObject x="0" y="200" width="225" height="200">
            <Text variant="caption" fontWeight="bold">
                {t("tariffGrids.buildingGuide.largerScale")}
            </Text>
        </foreignObject>
    </svg>
);
