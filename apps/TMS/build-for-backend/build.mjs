import path, {dirname} from "path";
import {fileURLToPath} from "url";

import {min} from "date-fns";
import esbuild from "esbuild";

const __dirname = dirname(fileURLToPath(import.meta.url));

async function main() {
    const args = process.argv.slice(2);

    if (args.length > 1) {
        throw new Error("Only one argument supported, `--watch`");
    }

    const watch = args.length === 1 && args[0] === "--watch";

    const data = {
        bundle: true,
        entryPoints: [
            path.join(__dirname, "../src/moderation/moderation-base.tsx"),
            path.join(__dirname, "../src/moderation/moderation-company-settings.tsx"),
            path.join(__dirname, "../src/moderation/moderation-group-view-settings.tsx"),
            path.join(__dirname, "../src/moderation/moderation-network-directory-company-map.tsx"),
        ],
        outdir: path.resolve("../backend/dashdoc/platform/internals/assets/js/moderation/"),
        logLevel: "warning",
        sourcemap: true,
        // minifySyntax: !watch, // django whitenoise fails when minifySyntax is enabled
        minifyWhitespace: !watch,
        minifyIdentifiers: !watch,
        // this is needed to use emotion with the custom jsx transform
        jsxFactory: "jsx",
        inject: [path.join(__dirname, "emotion-react-shim.js")],
        loader: {
            ".svg": "dataurl",
            ".png": "dataurl",
        },
        define: {
            "import.meta.env.DEV": watch ? "true" : "false",
            "import.meta.env.MODE": watch ? "'development'" : "'prod'",
            "import.meta.env.VITE_ASSETS_BASE_PATH": '"/files-static/"',
            "import.meta.env.VITE_CHARGEBEE_APP": '""',
            "import.meta.env.VITE_INTERCOM_APP_ID": '""',
            "import.meta.env.VITE_API_HOST": "undefined",
            "import.meta.env.VITE_SENTRY_API_KEY": "undefined",
            "import.meta.env.VITE_PUSHER_KEY": "undefined",
            "import.meta.env.VITE_ALGOLIA_APP_ID": "undefined",
            "import.meta.env.VITE_ALGOLIA_KEY": "undefined",
            "import.meta.env.VITE_HERE_API_KEY": "undefined",
            "import.meta.env.VITE_SCREEB_APP_ID": "undefined",
            "import.meta.env.VITE_SEGMENT_KEY": "undefined",
            "import.meta.env.VITE_NUVO_API_KEY": "undefined",
            "import.meta.env.VITE_COMMIT_HASH": "undefined",
            global: "window",
        },
        target: ["chrome64"],
    };

    if (watch) {
        (await esbuild.context(data)).watch();
    } else {
        esbuild.buildSync(data);
    }
}

main();
