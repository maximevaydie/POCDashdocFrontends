/* eslint-disable no-console */
import {resolve} from "path";
import {env as processEnv} from "process";

import {sentryVitePlugin} from "@sentry/vite-plugin";
import react from "@vitejs/plugin-react";
import {visualizer} from "rollup-plugin-visualizer";
import {defineConfig, loadEnv, PluginOption} from "vite";
import {createHtmlPlugin} from "vite-plugin-html";
import svgr from "vite-plugin-svgr";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vitejs.dev/config/
export default defineConfig(({mode}) => {
    const env = loadEnv(mode, "env"); // reuse vite's env parser to inject into our index.html

    console.log(`Using env mode '${mode}'`, env);

    /**
     * [issue-code-137] We have an issue `error Command failed with exit code 137` on CI without resource_class=medium+ for the setup-e2e step.
     * Seems related to https://github.com/vitejs/vite/issues/2433
     * This is overkill to use resource_class=medium+ only for sourcemap in a setup-e2e step!
     * As workaround, we disable the sourcemap excepted for these modes: test, staging, prod.
     * (Obviously, we need tu set resource_class=medium+ for related steps : deploy-test deploy-staging deploy-prod)
     */
    const sourcemap = ["test", "staging", "prod"].includes(mode) && !!env.VITE_COMMIT_HASH; // required to get readable stacktrace on sentry web app

    const optionalPlugins: PluginOption[] = [];
    if (sourcemap) {
        // We setup sentryVitePlugin to upload sourcemaps to sentry only when we produce a sourcemap.
        optionalPlugins.push(
            // @see https://docs.sentry.io/platforms/javascript/sourcemaps/uploading/vite/
            sentryVitePlugin({
                org: "dashdoc",
                project: "dashdoc-frontend",
                include: "./dist",
                // Auth tokens can be obtained from https://sentry.io/settings/account/api/auth-tokens/
                // and needs the `project:releases` and `org:read` scopes
                authToken: env.VITE_SENTRY_AUTH_TOKEN,
                telemetry: false,
                release: env.VITE_COMMIT_HASH,
            })
        );
        console.log(
            `Source map enabled (mode '${mode}', release '${env.VITE_COMMIT_HASH}') and will be uploaded to sentry`
        );
    } else {
        console.log(`Source map disabled (mode '${mode}', release '${env.VITE_COMMIT_HASH}')`);
    }

    if (processEnv.VISUALIZE) {
        optionalPlugins.push(visualizer());
    }

    return {
        plugins: [
            {
                name: "rewrite-root",
                configureServer(server) {
                    server.middlewares.use((req, res, next) => {
                        // mimick the behavior of the app engine config that rewrites all requests to /flow.* to /flow/index.html
                        if (req.originalUrl?.startsWith("/flow")) {
                            req.url = "/flow/index.html";
                        }
                        // mimick the behavior of the app engine config that rewrites all requests to /waste.* to the waste index.html
                        else if (req.originalUrl?.startsWith("/wam")) {
                            req.url = "/waste/index.html";
                        }
                        // redirect to the frontends folder for monorepo projects
                        else if (req.originalUrl?.startsWith("/frontends")) {
                            req.url = ".." + req.originalUrl;
                        }
                        next();
                    });
                },
            },
            react({
                jsxImportSource: "@emotion/react",
                babel: {
                    plugins: ["@emotion/babel-plugin"],
                },
            }),
            tsconfigPaths(),
            createHtmlPlugin({inject: {data: {...env, MODE: mode}}}),
            svgr(),
            ...optionalPlugins,
        ],
        envDir: "env",
        server: {port: 3001},
        build: {
            sourcemap,
            rollupOptions: {
                input: {
                    app: resolve(__dirname, "index.html"),
                    flow: resolve(__dirname, "flow/index.html"),
                    waste: resolve(__dirname, "waste/index.html"),
                },
                output: {
                    manualChunks: (id) => {
                        if (id.includes("lodash")) {
                            return "lodash";
                        } else if (id.includes("date-fns")) {
                            return "date-fns";
                        } else if (id.includes("libphonenumber")) {
                            return "libphonenumber";
                        } else if (id.includes("maps-api-for-javascript")) {
                            return "heremaps";
                        } else if (id.includes("lottie-web")) {
                            return "lottie-web";
                        } else if (id.includes("draftjs")) {
                            return "draftjs";
                        }
                    },
                },
            },
        },
    };
});
