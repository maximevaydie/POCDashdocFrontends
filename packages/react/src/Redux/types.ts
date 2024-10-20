import {Account} from "./reducers/accountReducer";
import {Auth} from "./reducers/authReducer";
import {RealtimeState} from "./reducers/realtime.slice";

export type CommonRootState = {
    auth: Auth;
    account: Account;
    realtime: RealtimeState;
};
