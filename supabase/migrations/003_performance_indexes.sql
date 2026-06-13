-- Create performance indexes for commonly searched/filtered/joined columns
CREATE INDEX IF NOT EXISTS roommates_group_phone_idx ON public.roommates(group_id, phone);
CREATE INDEX IF NOT EXISTS expenses_group_created_idx ON public.expenses(group_id, created_at desc);
CREATE INDEX IF NOT EXISTS expenses_paid_by_created_idx ON public.expenses(paid_by_roommate_id, created_at desc);
CREATE INDEX IF NOT EXISTS balances_group_idx ON public.balances(group_id);
CREATE INDEX IF NOT EXISTS balances_debtor_creditor_idx ON public.balances(debtor_roommate_id, creditor_roommate_id);
CREATE INDEX IF NOT EXISTS payments_group_created_idx ON public.payments(group_id, created_at desc);
CREATE INDEX IF NOT EXISTS payments_status_idx ON public.payments(status);
CREATE INDEX IF NOT EXISTS disputes_raised_by_idx ON public.disputes(raised_by_roommate_id);
CREATE INDEX IF NOT EXISTS reminders_group_created_idx ON public.reminders(group_id, created_at desc);

-- RPC for creating an expense + creating members + updating balances atomically in one roundtrip
CREATE OR REPLACE FUNCTION public.create_expense_v1(
  p_group_id uuid,
  p_title text,
  p_amount_paisa integer,
  p_paid_by_roommate_id uuid,
  p_created_by_roommate_id uuid,
  p_split_type public.split_type,
  p_expense_date date,
  p_note text,
  p_receipt_url text,
  p_receipt_public_id text,
  p_shares jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_expense_id uuid;
  v_share record;
  v_roommate_one_id uuid;
  v_roommate_two_id uuid;
  v_balance record;
  v_debtor_id uuid;
  v_payer_id uuid;
  v_share_paisa integer;
BEGIN
  -- Insert the expense record
  INSERT INTO public.expenses (
    group_id,
    title,
    amount_paisa,
    paid_by_roommate_id,
    created_by_roommate_id,
    split_type,
    expense_date,
    note,
    receipt_url,
    receipt_public_id
  ) VALUES (
    p_group_id,
    p_title,
    p_amount_paisa,
    p_paid_by_roommate_id,
    p_created_by_roommate_id,
    p_split_type,
    p_expense_date,
    p_note,
    p_receipt_url,
    p_receipt_public_id
  ) RETURNING id INTO v_expense_id;

  -- Loop through included roommates to insert members and apply balance calculations
  FOR v_share IN SELECT * FROM jsonb_to_recordset(p_shares) AS x(roommate_id uuid, share_paisa integer) LOOP
    INSERT INTO public.expense_members (
      expense_id,
      roommate_id,
      share_paisa
    ) VALUES (
      v_expense_id,
      v_share.roommate_id,
      v_share.share_paisa
    );

    v_debtor_id := v_share.roommate_id;
    v_payer_id := p_paid_by_roommate_id;
    v_share_paisa := v_share.share_paisa;

    IF v_share_paisa > 0 AND v_debtor_id <> v_payer_id THEN
      -- Sort roommate IDs to respect the balances_pair_unique constraint
      IF v_payer_id < v_debtor_id THEN
        v_roommate_one_id := v_payer_id;
        v_roommate_two_id := v_debtor_id;
      ELSE
        v_roommate_one_id := v_debtor_id;
        v_roommate_two_id := v_payer_id;
      END IF;

      -- Select existing balance with a row lock
      SELECT * INTO v_balance FROM public.balances
      WHERE group_id = p_group_id
        AND roommate_one_id = v_roommate_one_id
        AND roommate_two_id = v_roommate_two_id
      FOR UPDATE;

      IF NOT FOUND THEN
        -- Create a new balance pair if none exists
        INSERT INTO public.balances (
          group_id,
          roommate_one_id,
          roommate_two_id,
          debtor_roommate_id,
          creditor_roommate_id,
          amount_paisa
        ) VALUES (
          p_group_id,
          v_roommate_one_id,
          v_roommate_two_id,
          v_debtor_id,
          v_payer_id,
          v_share_paisa
        );
      ELSE
        -- Apply the split reduction or addition maths
        IF v_balance.amount_paisa = 0 THEN
          UPDATE public.balances
          SET debtor_roommate_id = v_debtor_id,
              creditor_roommate_id = v_payer_id,
              amount_paisa = v_share_paisa
          WHERE id = v_balance.id;
        ELSIF v_balance.debtor_roommate_id = v_debtor_id THEN
          UPDATE public.balances
          SET amount_paisa = v_balance.amount_paisa + v_share_paisa
          WHERE id = v_balance.id;
        ELSIF v_balance.amount_paisa > v_share_paisa THEN
          UPDATE public.balances
          SET amount_paisa = v_balance.amount_paisa - v_share_paisa
          WHERE id = v_balance.id;
        ELSIF v_balance.amount_paisa = v_share_paisa THEN
          UPDATE public.balances
          SET amount_paisa = 0
          WHERE id = v_balance.id;
        ELSE
          UPDATE public.balances
          SET debtor_roommate_id = v_debtor_id,
              creditor_roommate_id = v_payer_id,
              amount_paisa = v_share_paisa - v_balance.amount_paisa
          WHERE id = v_balance.id;
        END IF;
      END IF;
    END IF;
  END LOOP;

  RETURN v_expense_id;
END;
$$;

-- RPC for confirming a payment + updating balance atomically in one roundtrip
CREATE OR REPLACE FUNCTION public.confirm_payment_v1(
  p_payment_id uuid,
  p_confirmed_by_roommate_id uuid,
  p_note text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_payment record;
  v_balance record;
BEGIN
  -- Select and lock the payment record
  SELECT * INTO v_payment FROM public.payments
  WHERE id = p_payment_id
    AND to_roommate_id = p_confirmed_by_roommate_id
    AND status = 'pending_confirmation'
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Payment request not found or unauthorized.';
  END IF;

  -- Select and lock the associated pairwise balance
  SELECT * INTO v_balance FROM public.balances
  WHERE group_id = v_payment.group_id
    AND debtor_roommate_id = v_payment.from_roommate_id
    AND creditor_roommate_id = v_payment.to_roommate_id
  FOR UPDATE;

  IF NOT FOUND OR v_balance.amount_paisa < v_payment.amount_paisa THEN
    RAISE EXCEPTION 'Payment cannot be confirmed: insufficient balance.';
  END IF;

  -- Reduce the balance
  UPDATE public.balances
  SET amount_paisa = v_balance.amount_paisa - v_payment.amount_paisa
  WHERE id = v_balance.id;

  -- Confirm the payment status
  UPDATE public.payments
  SET status = 'confirmed',
      confirmed_by_roommate_id = p_confirmed_by_roommate_id,
      confirmed_at = now(),
      note = COALESCE(p_note, note)
  WHERE id = p_payment_id;
END;
$$;

-- RPC for recording a direct payment received + reducing balance atomically
CREATE OR REPLACE FUNCTION public.record_payment_received_v1(
  p_group_id uuid,
  p_from_roommate_id uuid,
  p_to_roommate_id uuid,
  p_amount_paisa integer,
  p_note text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_balance record;
BEGIN
  -- Select and lock the balance record
  SELECT * INTO v_balance FROM public.balances
  WHERE group_id = p_group_id
    AND debtor_roommate_id = p_from_roommate_id
    AND creditor_roommate_id = p_to_roommate_id
  FOR UPDATE;

  IF NOT FOUND OR v_balance.amount_paisa < p_amount_paisa THEN
    RAISE EXCEPTION 'Payment cannot exceed pending balance.';
  END IF;

  -- Reduce the balance
  UPDATE public.balances
  SET amount_paisa = v_balance.amount_paisa - p_amount_paisa
  WHERE id = v_balance.id;

  -- Insert a confirmed payment record
  INSERT INTO public.payments (
    group_id,
    from_roommate_id,
    to_roommate_id,
    amount_paisa,
    status,
    initiated_by_roommate_id,
    confirmed_by_roommate_id,
    note,
    confirmed_at
  ) VALUES (
    p_group_id,
    p_from_roommate_id,
    p_to_roommate_id,
    p_amount_paisa,
    'confirmed',
    p_to_roommate_id,
    p_to_roommate_id,
    p_note,
    now()
  );
END;
$$;
