import type {
  Balance,
  Dispute,
  Expense,
  ExpenseMember,
  Group,
  Payment,
  Reminder,
  Roommate,
  RoommateSession,
} from "./app";

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type TableDefinition<Row, Insert = Partial<Row>, Update = Partial<Row>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      groups: TableDefinition<Group>;
      roommates: TableDefinition<Roommate>;
      roommate_sessions: TableDefinition<RoommateSession>;
      expenses: TableDefinition<Expense>;
      expense_members: TableDefinition<ExpenseMember>;
      balances: TableDefinition<Balance>;
      payments: TableDefinition<Payment>;
      disputes: TableDefinition<Dispute>;
      reminders: TableDefinition<Reminder>;
      audit_logs: TableDefinition<{
        id: string;
        group_id: string | null;
        actor_roommate_id: string | null;
        event_type: string;
        entity_type: string;
        entity_id: string | null;
        metadata: Json;
        created_at: string;
      }>;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      roommate_role: "admin" | "member";
      split_type: "equal" | "custom";
      payment_status: "confirmed" | "pending_confirmation" | "disputed";
      dispute_status: "pending" | "resolved" | "rejected";
    };
    CompositeTypes: Record<string, never>;
  };
};
