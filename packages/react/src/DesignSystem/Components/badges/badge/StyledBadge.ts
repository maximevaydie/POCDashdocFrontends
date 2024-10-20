import {Flex} from "@dashdoc/web-ui";
import styled from "@emotion/styled";
import {variant} from "styled-system";

import {BADGE_COLOR_VARIANTS} from "./constants";
import {StyledBadgeProps} from "./types";

export const StyledBadge = styled(Flex)<StyledBadgeProps>(
    variant({prop: "variant", variants: BADGE_COLOR_VARIANTS})
);
