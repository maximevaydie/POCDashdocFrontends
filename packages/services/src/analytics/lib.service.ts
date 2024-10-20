const CHECK_INTERVAL = 250; // ms

async function waitingFor(libIsLoaded: () => boolean) {
    while (!libIsLoaded()) {
        await new Promise((resolve) => setTimeout(resolve, CHECK_INTERVAL));
    }
}

export const libService = {
    waitingFor,
};
