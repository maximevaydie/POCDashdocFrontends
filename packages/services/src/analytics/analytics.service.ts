import {Company, ManagerMe} from "dashdoc-utils";

import {screebService} from "./screeb.service";
import {segmentService} from "./segment.service";
import {sessionRewindService} from "./sessionRewind.service";

async function setup(manager: ManagerMe, company: Company) {
    sessionRewindService.setup(manager, company);
    // setup screeb and segment in parallel but wait for both to be done!
    await Promise.all([screebService.setup(manager, company), segmentService.setup(manager)]);
}

function cleanup() {
    sessionRewindService.cleanup();
    screebService.cleanup();
    segmentService.cleanup();
}

export const analyticsService = {
    setup,
    cleanup,
    sendEvent: segmentService.sendEvent,
};
