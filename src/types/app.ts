export type RoommateRole = "admin" | "member";
export type SplitType = "equal" | "custom";
export type PaymentStatus = "confirmed" | "pending_confirmation" | "disputed";
export type DisputeStatus = "pending" | "resolved" | "rejected";

export type Group = {
  id: string;
  name: string;
  room_code: string;
  created_by_roommate_id: string | null;
  created_at: string;
  updated_at: string;
};

export type Roommate = {
  id: string;
  group_id: string;
  name: string;
  login_id: string;
  phone: string | null;
  pin_hash: string;
  role: RoommateRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type CurrentRoommate = Roommate & {
  group: Pick<Group, "id" | "name" | "room_code">;
};

export type RoommateListItem = Omit<Roommate, "pin_hash">;

export type Expense = {
  id: string;
  group_id: string;
  title: string;
  amount_paisa: number;
  paid_by_roommate_id: string;
  created_by_roommate_id: string;
  split_type: SplitType;
  expense_date: string;
  note: string | null;
  receipt_url: string | null;
  receipt_public_id: string | null;
  created_at: string;
  updated_at: string;
};

export type ExpenseMember = {
  id: string;
  expense_id: string;
  roommate_id: string;
  share_paisa: number;
  created_at: string;
};

export type Balance = {
  id: string;
  group_id: string;
  roommate_one_id: string;
  roommate_two_id: string;
  debtor_roommate_id: string;
  creditor_roommate_id: string;
  amount_paisa: number;
  created_at: string;
  updated_at: string;
};

export type Payment = {
  id: string;
  group_id: string;
  from_roommate_id: string;
  to_roommate_id: string;
  amount_paisa: number;
  status: PaymentStatus;
  initiated_by_roommate_id: string;
  confirmed_by_roommate_id: string | null;
  note: string | null;
  confirmed_at: string | null;
  disputed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type Dispute = {
  id: string;
  expense_id: string;
  group_id: string;
  raised_by_roommate_id: string;
  reason: string;
  suggested_correction_paisa: number | null;
  status: DisputeStatus;
  resolution_note: string | null;
  created_at: string;
  updated_at: string;
};

export type Reminder = {
  id: string;
  group_id: string;
  from_roommate_id: string;
  to_roommate_id: string;
  amount_paisa: number;
  message: string;
  created_at: string;
};

export type RoommateSession = {
  id: string;
  roommate_id: string;
  token_hash: string;
  expires_at: string;
  created_at: string;
  last_seen_at: string;
};

export type RoommateNameMap = Record<string, Pick<RoommateListItem, "id" | "name" | "phone">>;
