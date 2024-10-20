import {Box, theme} from "@dashdoc/web-ui";
import {css} from "@emotion/react";
import styled from "@emotion/styled";

export const SCHEDULER_CARD_HEIGHT_MARGIN = 3;

// This is fixed for now, we need to review a bit the calculation of the width
const CELL_WIDTH = 240;
export const TIME_CELL_WIDTH = 40;
export const TRUCKER_CELL_WIDTH = 196;
export const REVENUE_CELL_WIDTH = 54;
export const MIN_CELL_HEIGHT = 54;
export const COLLAPSED_TIME_WIDTH = 20;

const BORDER_COLOR = theme.colors.grey.light;
const EVEN_ROW_COLOR = theme.colors.grey.ultralight;
const ODD_ROW_COLOR = theme.colors.grey.white;
const EVEN_TRUCKER_CELL_COLOR = theme.colors.grey.ultralight;
const ODD_TRUCKER_CELL_COLOR = theme.colors.grey.white;

const Flex = styled("div")`
    display: flex;
`;

const LoadingPlaceholder = styled(Box)`
    animation-duration: 1.8s;
    animation-fill-mode: forwards;
    animation-iteration-count: infinite;
    animation-name: placeHolderShimmer;
    animation-timing-function: linear;
    background: ${theme.colors.grey.light};
    background: linear-gradient(to right, #fafafa 8%, #f4f4f4 38%, #fafafa 54%);
    background-size: 1000px 640px;

    position: relative;

    @keyframes placeHolderShimmer {
        0% {
            background-position: -468px 0;
        }
        100% {
            background-position: 468px 0;
        }
    }

    border-radius: ${theme.radii[1]}px;
`;

export const LoadingTextPlaceholder = styled(LoadingPlaceholder)`
    width: 100%;
    height: 20px;
`;

export const CarrierRevenueCell = styled(Flex)<{isOddRow: boolean; sticky?: boolean}>`
    min-width: ${REVENUE_CELL_WIDTH}px;
    width: ${REVENUE_CELL_WIDTH}px;
    margin: 0;
    padding: ${theme.space[1]}px;
    border-bottom: 1px solid ${BORDER_COLOR};
    border-right: 1px solid ${BORDER_COLOR};
    align-items: center;
    justify-content: flex-end;
    font-size: ${theme.fontSizes[1]}px;

    box-sizing: border-box;
    position: ${(props) => (props.sticky ? "sticky" : "unset")};
    left: ${TRUCKER_CELL_WIDTH}px;
    z-index: ${(props) => (props.sticky ? 3 : 0)};
    background-color: ${(props) => (props.isOddRow ? ODD_ROW_COLOR : EVEN_ROW_COLOR)};
`;

const showFromSide = css`
    animation-duration: 0.1s;
    animation-timing-function: ease-in-out;
    @keyframes show-scheduler-right {
        from {
            transform: translateX(5px);
        }
        to {
            transform: none;
        }
    }

    @keyframes show-scheduler-left {
        from {
            transform: translateX(-5px);
        }
        to {
            transform: none;
        }
    }
`;
export const CarrierSchedulerTableContainer = styled(Flex)`
    flex: 1;
    flex-flow: wrap;
    flex-basis: 100%;
    overflow: auto;
`;

export const CarrierSchedulerTable = styled(Flex)`
    flex: 1;
    flex-flow: column;
    flex-wrap: nowrap;
    border-spacing: 0;
`;

export const CarrierSchedulerHeaderCell = styled(Flex)<{animation?: string}>`
    min-width: ${CELL_WIDTH}px;
    flex: 1;
    position: sticky;
    left: 0;
    font-weight: 500;
    padding-left: ${theme.space[7]}px;
    padding-right: ${theme.space[5]}px;
    align-items: center;
    ${showFromSide}
    ${(props) =>
        props.animation == "right"
            ? "animation-name: show-scheduler-right;"
            : props.animation == "left"
              ? "animation-name: show-scheduler-left;"
              : ""};

    background: ${theme.colors.grey.ultralight};
    border-right: 1px solid ${BORDER_COLOR};
    border-bottom: 1px solid ${BORDER_COLOR};
`;

export const CarrierSchedulerBodyStyle = styled(Flex)`
    flex-flow: column;
    flex-grow: 1;
`;

export const CarrierSchedulerBodyRow = styled(Flex)<{
    isOddRow: boolean;
    width?: string;
}>`
    flex-flow: row;
    flex-grow: 1;
    background-color: ${(props) => (props.isOddRow ? ODD_ROW_COLOR : EVEN_ROW_COLOR)};
    ${(props) => (props.width ? "width:" + props.width + ";" : "")};
    > div:first-of-type {
        background-color: ${(props) =>
            props.isOddRow ? ODD_TRUCKER_CELL_COLOR : EVEN_TRUCKER_CELL_COLOR};
    }
`;

export const CarrierSchedulerRowHeadingCell = styled("div")`
    padding: ${theme.space[2]}px;
    word-break: break-all;
    z-index: 3;
    min-width: ${TRUCKER_CELL_WIDTH}px;
    width: ${TRUCKER_CELL_WIDTH}px;
    border-right: 1px solid ${BORDER_COLOR};
    border-bottom: 1px solid ${BORDER_COLOR};
    font-weight: bold;
    font-size: ${theme.fontSizes[1]}px;
    line-height: ${theme.lineHeights[1]}px;
    font-weight: 700;

    box-sizing: border-box;
    margin: 0;
    position: sticky;
    left: 0;
`;

const draggingOver = (props: {isDraggingOver?: boolean; animation?: string}) => css`
    ${props.isDraggingOver ? `background-color: ${theme.colors.blue.ultralight};` : ""}
    ${props.animation == "right"
        ? "animation-name: show-scheduler-right;"
        : props.animation == "left"
          ? "animation-name: show-scheduler-left;"
          : ""}
        ${showFromSide}
`;

export const CarrierSchedulerBodyCell = styled("div")`
    min-width: ${CELL_WIDTH}px;
    min-height: ${MIN_CELL_HEIGHT}px;
    margin: 0;
    padding: ${theme.space[1]}px;
    border-bottom: 1px solid ${BORDER_COLOR};
    border-right: 1px solid ${BORDER_COLOR};
    ${draggingOver}
    position: relative;
    flex: 1;
    text-align: left;
`;
