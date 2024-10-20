import {Box} from "@dashdoc/web-ui";
import {theme} from "@dashdoc/web-ui";
import styled from "@emotion/styled";

const ActivityCell = styled(Box)`
    flex: ${({flex = "1"}) => flex};
    position: relative;
    min-height: 20px;
    overflow: hidden;
    padding: 0 ${theme.space[3]}px;
    vertical-align: top;
`;

ActivityCell.displayName = "ActivityCell";

export default ActivityCell;
