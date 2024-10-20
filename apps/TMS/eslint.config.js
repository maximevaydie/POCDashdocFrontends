module.export = {
    extends: ['eslint-config/base.js'],
    root: true,
    rules: {
        "no-restricted-imports": [
            "error",
            {
                paths: [
                    {
                        name: "app/redux/selectors",
                        importNames: ["getConnectedCompanies"],
                        message:
                            "Please use getConnectedCompanies instead of getConnectedCompaniesWithAccess",
                    },
                    {
                        name: "dashdoc-utils",
                        importNames: [
                            "Transport",
                            "TransportPost",
                            "Site",
                            "Delivery",
                            "Round",
                            "Load",
                            "Activity",
                            "SchedulerSegment",
                            "Segment",
                            "SegmentPost",
                            "TransportStatusValue",
                            "TransportStatus",
                            "SubcontractingChildTransport",
                        ],
                        message: 'Please use the web import "app/types/transport" instead.',
                    },
                ],
            },
        ],
    },
}
