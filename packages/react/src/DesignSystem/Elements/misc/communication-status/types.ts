export interface CommunicationStatus {
    pk: number;
    status: "submitted" | "delivered" | "bounced";
    email: string;
    status_updated_at: Date;
}
