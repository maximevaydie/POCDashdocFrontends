import {useDevice} from "../../device/useDevice";
import {TRUCKER_CELL_WIDTH, REVENUE_CELL_WIDTH} from "../gridStyles";

export function useResourceOffset() {
    const device = useDevice();
    return TRUCKER_CELL_WIDTH + (device === "mobile" ? 0 : REVENUE_CELL_WIDTH) + 4;
}
