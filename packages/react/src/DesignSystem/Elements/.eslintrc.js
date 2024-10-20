module.exports = {
    rules: {
        "no-restricted-imports": [
            "error",
            {
                paths: [
                    {
                        name: "@dashdoc/web-common",
                        message:
                            "You are not allowed to import business logic. You can only import from @dashdoc/web-core which is business logic free",
                    },
                    {
                        name: "app",
                        message: "You are not allowed to import business logic",
                    },
                ],
            },
        ],
    },
};
