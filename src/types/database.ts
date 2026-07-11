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
    Functions: {
      create_expense_v1: {
        Args: {
          p_group_id: string;
          p_title: string;
          p_amount_paisa: number;
          p_paid_by_roommate_id: string;
          p_created_by_roommate_id: string;
          p_split_type: "equal" | "custom";
          p_expense_date: string;
          p_note: string | null;
          p_receipt_url: string | null;
          p_receipt_public_id: string | null;
          p_shares: Json;
        };
        Returns: string;
      };
      confirm_payment_v1: {
        Args: {
          p_payment_id: string;
          p_confirmed_by_roommate_id: string;
          p_note: string | null;
        };
        Returns: undefined;
      };
      record_payment_received_v1: {
        Args: {
          p_group_id: string;
          p_from_roommate_id: string;
          p_to_roommate_id: string;
          p_amount_paisa: number;
          p_note: string | null;
        };
        Returns: undefined;
      };
    };
    Enums: {
      roommate_role: "admin" | "member";
      split_type: "equal" | "custom";
      payment_status: "confirmed" | "pending_confirmation" | "disputed";
      dispute_status: "pending" | "resolved" | "rejected";
    };
    CompositeTypes: Record<string, never>;
  };
};
