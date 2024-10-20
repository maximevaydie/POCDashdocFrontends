import {syncSetupI18n} from "@dashdoc/web-core";

import {getStatusUpdateText, getStatusUpdateRelatedObjectInfo} from "../transportStatus.service";

import type {Transport, Site, TransportStatus} from "app/types/transport";

syncSetupI18n();

describe("Test getStatusUpdateText method", () => {
    let status: TransportStatus;
    beforeEach(() => {
        status = {
            author: {
                display_name: "Jean Martin",
                company: 102,
                pk: 63,
                phone_number: "",
                email: "",
            },
            author_email: "",
            category: "done",
            uid: "469a1a68-b460-11ea-829e-0242ac150005",
            created: "2020-06-22T08:13:38.267376Z",
            created_device: null,
            creation_method: "auto",
            content: "",
            content_signatory: "",
            target: null,
            site: null,
            delivery: null,
            segment: null,
            transport: "190fcd86-b460-11ea-b113-0242ac150007",
            signature: null,
            latitude: null,
            longitude: null,
            update_details: {
                round_id: 42,
            },
            author_company: null,
            credit_note: null,
            invoice: null,
        };
    });

    test("should return default text", () => {
        const expected_text_by_categories: {
            [status in TransportStatus["category"]]: {
                expected_text: string;
                status_change: Record<string, unknown>;
            };
        } = {
            created: {
                expected_text: "Jean Martin a créé le transport.",
                status_change: {},
            },
            updated: {
                expected_text: "Jean Martin a mis à jour la lettre de voiture.",
                status_change: {},
            },
            confirmed: {
                expected_text: "Jean Martin a accepté la demande de transport.",
                status_change: {},
            },
            declined: {
                expected_text:
                    "Jean Martin a refusé la demande de transport. Raison du refus : Pas bon",
                status_change: {
                    content: "Pas bon",
                },
            },
            cancelled: {
                expected_text:
                    "Jean Martin a annulé le transport pour la raison suivante : Pas bon.",
                status_change: {
                    content: "Pas bon",
                },
            },
            assigned: {
                expected_text: "Jean Martin a planifié le transport à Paul Dupont.",
                status_change: {
                    target: {
                        display_name: "Paul Dupont",
                        company: 103,
                        pk: 64,
                    },
                },
            },
            unassigned: {
                expected_text: "Jean Martin a déplanifié le transport assigné à Paul Dupont.",
                status_change: {
                    target: {
                        display_name: "Paul Dupont",
                        company: 103,
                        pk: 64,
                    },
                },
            },
            sent_to_trucker: {
                expected_text: "Jean Martin a envoyé le transport à Paul Dupont.",
                status_change: {
                    target: {
                        display_name: "Paul Dupont",
                        company: 103,
                        pk: 64,
                    },
                },
            },
            acknowledged: {
                expected_text: "Jean Martin a reçu le transport.",
                status_change: {},
            },
            truck_wash: {
                expected_text:
                    "Jean Martin a indiqué ne pas avoir eu besoin de laver sa remorque.",
                status_change: {
                    update_details: {
                        truck_wash: {
                            method: "none",
                        },
                    },
                },
            },
            on_the_way: {
                expected_text: "Jean Martin a indiqué être en route vers SuperCompany (44000).",
                status_change: {},
            },
            rounds_started: {
                expected_text: "Jean Martin a démarré la tournée.",
                status_change: {},
            },
            round_added: {
                expected_text: "Jean Martin a ajouté un tour.",
                status_change: {},
            },
            round_added_v2: {
                expected_text: "Jean Martin a ajouté le tour n°42.",
                status_change: {},
            },
            round_edited: {
                expected_text: "Jean Martin a édité le tour n°42.",
                status_change: {},
            },
            round_deleted: {
                expected_text: "Jean Martin a supprimé le tour n°42.",
                status_change: {},
            },
            rounds_complete: {
                expected_text: "Jean Martin a terminé la tournée.",
                status_change: {},
            },
            checklist_filled: {
                expected_text: "Jean Martin a réalisé les tâches suivantes :",
                status_change: {},
            },
            on_loading_site: {
                expected_text:
                    "Jean Martin a indiqué l'arrivée du conducteur sur site d'enlèvement.",
                status_change: {},
            },
            loading_complete: {
                expected_text: "Jean Martin a marqué l'enlèvement (Activité n°1) comme terminé.",
                status_change: {},
            },
            departed: {
                expected_text: "Le véhicule a quitté le site.",
                status_change: {},
            },
            bulking_break_started: {
                expected_text: "Jean Martin a effectué la rupture de charge.",
                status_change: {},
            },
            bulking_break_complete: {
                expected_text: "Jean Martin a repris le transport.",
                status_change: {},
            },
            on_unloading_site: {
                expected_text:
                    "Jean Martin a indiqué l'arrivée du conducteur sur site de livraison.",
                status_change: {},
            },
            unloading_complete: {
                expected_text: "Jean Martin a marqué la livraison (Activité n°1) comme terminée.",
                status_change: {},
            },
            done: {
                expected_text: "Le transport a été marqué comme terminé.",
                status_change: {},
            },
            verified: {
                expected_text: "Jean Martin a marqué le transport comme contrôlé.",
                status_change: {},
            },
            unverified: {
                expected_text: "Jean Martin a marqué le transport comme non contrôlé.",
                status_change: {},
            },
            invoiced: {
                expected_text: "Jean Martin a marqué le transport comme facturé",
                status_change: {},
            },
            uninvoiced: {
                expected_text: "Jean Martin a marqué le transport comme non facturé",
                status_change: {},
            },
            paid: {
                expected_text: "Jean Martin a marqué le transport comme payé",
                status_change: {},
            },
            credited: {
                expected_text: "Jean Martin a généré un avoir contenant ce transport",
                status_change: {},
            },
            handling_started: {
                expected_text: "Jean Martin a indiqué avoir démarré la manutention.",
                status_change: {},
            },
            deleted: {
                expected_text: "Jean Martin a supprimé le transport.",
                status_change: {},
            },
            restored: {
                expected_text: "Jean Martin a restauré le transport.",
                status_change: {},
            },
            event: {
                expected_text: "",
                status_change: {},
            },
            loading_plan_completed: {
                expected_text: "",
                status_change: {},
            },
            break_time: {
                expected_text: "Jean Martin a effectué une pause entre 10:00 et 12:00.",
                status_change: {
                    update_details: {
                        break_time: {
                            start: Date.parse("2021-01-01T10:00:00Z"),
                            end: Date.parse("2021-01-01T12:00:00Z"),
                        },
                    },
                },
            },
            amended: {
                expected_text: "Jean Martin a ajouté  .",
                status_change: {},
            },
            "activity.amended": {
                expected_text: "Jean Martin a modifié l'heure réelle d'arrivée sur site.",
                status_change: {
                    update_details: {
                        real_start: {old: "2021-01-01T10:00:00Z", new: "2021-01-01T13:00:00Z"},
                    },
                },
            },
            "delivery_load.amended": {
                expected_text: "Jean Martin a ajouté  .",
                status_change: {},
            },
            "rest.amended": {
                expected_text: "Jean Martin a modifié les horaires de pauses.",
                status_change: {
                    update_details: {
                        old: {start: "2021-01-01T10:00:00Z", end: "2021-01-01T13:00:00Z"},
                        new: {start: "2021-01-01T11:00:00Z", end: "2021-01-01T14:00:00Z"},
                    },
                },
            },
            "activity.undone": {
                expected_text:
                    "Jean Martin a marqué l'enlèvement (Activité n°1) comme non terminé.",
                status_change: {},
            },
            "carbon_footprint.manual_added": {
                expected_text:
                    "Jean Martin a mis à jour manuellement l'empreinte carbone à 100.25 kg CO₂e.",
                status_change: {
                    update_details: {
                        manual_carbon_footprint: {
                            old: null,
                            new: 100.252,
                        },
                    },
                },
            },
            "carbon_footprint.manual_deleted": {
                expected_text:
                    "Jean Martin a supprimé l'empreinte carbone manuelle pour utiliser l'estimation.",
                status_change: {
                    update_details: {
                        manual_carbon_footprint: {
                            old: 100.25,
                            new: null,
                        },
                    },
                },
            },
            "supports_exchange.amended": {
                expected_text: "Jean Martin a mis à jour les échanges de support (Activité n°1).",
                status_change: {
                    update_details: {
                        actual_retrieved: {old: 10, new: 20},
                        actual_delivered: {old: 10, new: 20},
                    },
                },
            },
            invoice_number_added: {
                expected_text: "Jean Martin a ajouté un numéro de facture",
                status_change: {
                    update_details: {
                        invoice_number: "F-2024-123",
                    },
                },
            },
            invoice_number_removed: {
                expected_text: "Jean Martin a supprimé le numéro de la facture",
                status_change: {},
            },
            "delivery.added": {
                expected_text: "Jean Martin a ajouté un enlèvement / livraison",
                status_change: {
                    update_details: {
                        origin_address: {
                            new: "2 rue de la bretelle 85660 Saint-Philbert-de-Bouaine FR (Chantier 236)",
                            old: null,
                        },
                        destination_address: {
                            new: "4 Route de la Bretagnerie 44860 Saint-Aignan-Grandlieu FR (Boyer)",
                            old: null,
                        },
                    },
                },
            },
        };
        const additionalInfo = {
            companyName: "SuperCompany",
            postCode: "44000",
            timezone: "utc",
            siteIndex: 1,
            siteCategory: "loading" as Site["category"],
        };

        for (const category in expected_text_by_categories) {
            const tested_category = category as Transport["status"];
            const tested_status = {
                ...status,
                ...expected_text_by_categories[tested_category].status_change,
                category: tested_category,
            };

            const result = getStatusUpdateText(tested_status, false, additionalInfo);
            const expected_text = expected_text_by_categories[tested_category].expected_text;
            expect(result).toBe(expected_text);
        }
    });
});

describe("Test getStatusUpdateRelatedObjectInfo", () => {
    let status: TransportStatus;
    beforeEach(() => {
        status = {
            author: {
                display_name: "Jean Martin",
                company: 102,
                pk: 63,
                phone_number: "",
                email: "",
            },
            author_email: "",
            category: "done",
            uid: "469a1a68-b460-11ea-829e-0242ac150005",
            created: "2020-06-22T08:13:38.267376Z",
            created_device: null,
            creation_method: "auto",
            content: "",
            content_signatory: "",
            target: null,
            site: null,
            delivery: null,
            segment: null,
            transport: "190fcd86-b460-11ea-b113-0242ac150007",
            signature: null,
            latitude: null,
            longitude: null,
            update_details: {
                round_id: 42,
            },
            author_company: null,
            credit_note: null,
            invoice: null,
        };
    });

    describe("for credited event", () => {
        test("as the owner, it returns the correct information", () => {
            const uid = "the-uid";
            const documentNumber = "the-document-number";
            const ownerId = 1;
            const tested_status = {
                ...status,
                category: "credited" as Transport["status"],
                credit_note: {uid, document_number: documentNumber, created_by: ownerId},
            };

            const result = getStatusUpdateRelatedObjectInfo(tested_status, ownerId);
            expect(result).toStrictEqual({
                prefix: "Avoir n°",
                text: documentNumber,
                target: `/app/credit-notes/${uid}/`,
            });
        });

        test("as *not* the owner, it returns the correct information", () => {
            const uid = "the-uid";
            const documentNumber = "the-document-number";
            const ownerId = 1;
            const viewerId = 2;
            const tested_status = {
                ...status,
                category: "credited" as Transport["status"],
                credit_note: {uid, document_number: documentNumber, created_by: ownerId},
            };

            const result = getStatusUpdateRelatedObjectInfo(tested_status, viewerId);
            expect(result).toStrictEqual({
                prefix: "Avoir n°",
                text: documentNumber,
                target: `/shared-credit-notes/${uid}/`,
            });
        });

        // Older events without the associated information
        test("without the related credit note, it returns no information", () => {
            const tested_status = {
                ...status,
                category: "credited" as Transport["status"],
                credit_note: null,
            };
            const result = getStatusUpdateRelatedObjectInfo(tested_status, 1);
            expect(result).toBe(undefined);
        });
    });

    describe("for invoiced event", () => {
        // The invoice is in draft
        describe("without a document number", () => {
            test("as the owner, it returns the correct information", () => {
                const uid = "the-uid";
                const ownerId = 1;
                const tested_status = {
                    ...status,
                    category: "invoiced" as Transport["status"],
                    invoice: {uid, document_number: null, created_by: ownerId},
                };

                const result = getStatusUpdateRelatedObjectInfo(tested_status, ownerId);
                expect(result).toStrictEqual({
                    prefix: "Facture ",
                    text: "Brouillon",
                    target: `/app/invoices/${uid}/`,
                });
            });

            test("as *not* the owner, it returns no information", () => {
                const uid = "the-uid";
                const ownerId = 1;
                const viewerId = 2;
                const tested_status = {
                    ...status,
                    category: "invoiced" as Transport["status"],
                    invoice: {uid, document_number: null, created_by: ownerId},
                };

                const result = getStatusUpdateRelatedObjectInfo(tested_status, viewerId);
                expect(result).toBe(undefined);
            });
        });

        // The invoice is finalized/paid
        describe("with a document number", () => {
            test("as the owner, it returns the correct information", () => {
                const uid = "the-uid";
                const documentNumber = "the-document-number";
                const ownerId = 1;
                const tested_status = {
                    ...status,
                    category: "invoiced" as Transport["status"],
                    invoice: {uid, document_number: documentNumber, created_by: ownerId},
                };

                const result = getStatusUpdateRelatedObjectInfo(tested_status, ownerId);
                expect(result).toStrictEqual({
                    prefix: "Facture n°",
                    text: documentNumber,
                    target: `/app/invoices/${uid}/`,
                });
            });

            test("as *not* the owner, it returns the correct information", () => {
                const uid = "the-uid";
                const documentNumber = "the-document-number";
                const ownerId = 1;
                const viewerId = 2;
                const tested_status = {
                    ...status,
                    category: "invoiced" as Transport["status"],
                    invoice: {uid, document_number: documentNumber, created_by: ownerId},
                };

                const result = getStatusUpdateRelatedObjectInfo(tested_status, viewerId);
                expect(result).toStrictEqual({
                    prefix: "Facture n°",
                    text: documentNumber,
                    target: `/shared-invoices/${uid}/`,
                });
            });
        });

        // Older events without the associated information
        test("without the related invoice, it returns no information", () => {
            const tested_status = {
                ...status,
                category: "invoiced" as Transport["status"],
                invoice: null,
            };
            const result = getStatusUpdateRelatedObjectInfo(tested_status, 1);
            expect(result).toBe(undefined);
        });
    });

    describe("for paid event", () => {
        // The invoice is in draft
        describe("without a document number", () => {
            test("as the owner, it returns the correct information", () => {
                const uid = "the-uid";
                const ownerId = 1;
                const tested_status = {
                    ...status,
                    category: "paid" as Transport["status"],
                    invoice: {uid, document_number: null, created_by: ownerId},
                };

                const result = getStatusUpdateRelatedObjectInfo(tested_status, ownerId);
                expect(result).toStrictEqual({
                    prefix: "Facture ",
                    text: "Brouillon",
                    target: `/app/invoices/${uid}/`,
                });
            });

            test("as *not* the owner, it returns no information", () => {
                const uid = "the-uid";
                const ownerId = 1;
                const viewerId = 2;
                const tested_status = {
                    ...status,
                    category: "paid" as Transport["status"],
                    invoice: {uid, document_number: null, created_by: ownerId},
                };

                const result = getStatusUpdateRelatedObjectInfo(tested_status, viewerId);
                expect(result).toBe(undefined);
            });
        });

        // The invoice is finalized/paid
        describe("with a document number", () => {
            test("as the owner, it returns the correct information", () => {
                const uid = "the-uid";
                const documentNumber = "the-document-number";
                const ownerId = 1;
                const tested_status = {
                    ...status,
                    category: "paid" as Transport["status"],
                    invoice: {uid, document_number: documentNumber, created_by: ownerId},
                };

                const result = getStatusUpdateRelatedObjectInfo(tested_status, ownerId);
                expect(result).toStrictEqual({
                    prefix: "Facture n°",
                    text: documentNumber,
                    target: `/app/invoices/${uid}/`,
                });
            });

            test("as *not* the owner, it returns the correct information", () => {
                const uid = "the-uid";
                const documentNumber = "the-document-number";
                const ownerId = 1;
                const viewerId = 2;
                const tested_status = {
                    ...status,
                    category: "paid" as Transport["status"],
                    invoice: {uid, document_number: documentNumber, created_by: ownerId},
                };

                const result = getStatusUpdateRelatedObjectInfo(tested_status, viewerId);
                expect(result).toStrictEqual({
                    prefix: "Facture n°",
                    text: documentNumber,
                    target: `/shared-invoices/${uid}/`,
                });
            });
        });

        // Older events without the associated information
        test("without the related invoice, it returns no information", () => {
            const tested_status = {
                ...status,
                category: "paid" as Transport["status"],
                invoice: null,
            };
            const result = getStatusUpdateRelatedObjectInfo(tested_status, 1);
            expect(result).toBe(undefined);
        });
    });

    test("for other event categories, it should not return any info", () => {
        const otherCategories: Exclude<
            TransportStatus["category"],
            "credited" | "invoiced" | "paid"
        >[] = [
            "acknowledged",
            "activity.amended",
            "activity.undone",
            "amended",
            "assigned",
            "break_time",
            "bulking_break_complete",
            "bulking_break_started",
            "cancelled",
            "checklist_filled",
            "confirmed",
            "created",
            "declined",
            "deleted",
            "delivery_load.amended",
            "departed",
            "done",
            "event",
            "handling_started",
            "loading_complete",
            "loading_plan_completed",
            "on_loading_site",
            "on_the_way",
            "on_unloading_site",
            "restored",
            "round_added_v2",
            "round_added",
            "round_deleted",
            "round_edited",
            "rounds_complete",
            "rounds_started",
            "sent_to_trucker",
            "truck_wash",
            "unassigned",
            "unloading_complete",
            "unverified",
            "updated",
            "verified",
        ];

        for (const category in otherCategories) {
            const tested_category = category as Transport["status"];
            const tested_status = {...status, category: tested_category};

            const result = getStatusUpdateRelatedObjectInfo(tested_status, 1);
            expect(result).toBe(undefined);
        }
    });
});
