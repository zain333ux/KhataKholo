-- ============================================================================
-- DEVELOPMENT / PERFORMANCE TESTING SEED SCRIPT
-- ============================================================================
-- WARNING: This script inserts sample performance testing data.
-- DO NOT RUN THIS ON PRODUCTION DATABASE.
-- Run this in the Supabase SQL Editor to seed 1 room, 10 roommates, and 100 expenses.

DO $$
DECLARE
  v_group_id uuid;
  v_roommates uuid[] := '{}';
  v_roommate_id uuid;
  v_expense_id uuid;
  v_payer_id uuid;
  v_roommate_name text;
  v_amount_paisa integer;
  v_share_paisa integer;
  v_expense_title text;
  v_titles text[] := ARRAY['Milk', 'Dinner', 'Hostel Rent', 'Internet Bill', 'Electricity Bill', 'Gas Bill', 'Room Cleaning', 'Water Tank', 'Evening Tea', 'Fruit', 'Groceries', 'Dishwashing Liquid', 'Snacks', 'Drinking Water', 'Room Heater'];
  i integer;
  j integer;
  k integer;
BEGIN
  -- 1. Create a performance test room
  INSERT INTO public.groups (name, room_code)
  VALUES ('Performance Test Room', 'PERF100')
  RETURNING id INTO v_group_id;

  RAISE NOTICE 'Created Room PERF100 with ID: %', v_group_id;

  -- 2. Create 10 roommates with the PIN 123456 (pre-hashed)
  -- Hashed value matches: scrypt hash for '123456'
  FOR i IN 1..10 LOOP
    v_roommate_name := 'Roommate ' || chr(64 + i); -- Roommate A, Roommate B, etc.
    INSERT INTO public.roommates (
      group_id,
      name,
      login_id,
      phone,
      pin_hash,
      role,
      is_active
    ) VALUES (
      v_group_id,
      v_roommate_name,
      lower(v_roommate_name),
      '0300' || lpad(i::text, 7, '0'),
      'scrypt$16384$8$1$75f29d20c5d3368297d26bb87265b7914f6d3f278eb079c6d59a2f26799042b9$d9cfdb2d81ad3adad7b9f36f6eb830f2',
      CASE WHEN i = 1 THEN 'admin'::public.roommate_role ELSE 'member'::public.roommate_role END,
      true
    ) RETURNING id INTO v_roommate_id;
    
    v_roommates := array_append(v_roommates, v_roommate_id);
  END LOOP;

  -- Update group created_by to first roommate
  UPDATE public.groups
  SET created_by_roommate_id = v_roommates[1]
  WHERE id = v_group_id;

  RAISE NOTICE 'Created 10 roommates successfully.';

  -- 3. Create 100 sample expenses with equal splits
  FOR j IN 1..100 LOOP
    -- Choose a random title and amount (₨ 50 to ₨ 5,000)
    v_expense_title := v_titles[1 + (j % array_length(v_titles, 1))];
    v_amount_paisa := (50 + (j * 49) % 4950) * 100; -- deterministic pseudo-random amount
    v_payer_id := v_roommates[1 + (j % 10)];
    
    -- Insert the expense using the transaction RPC logic
    -- We can call the newly created RPC function directly!
    PERFORM public.create_expense_v1(
      v_group_id,
      v_expense_title || ' #' || j,
      v_amount_paisa,
      v_payer_id,
      v_roommates[1], -- created by admin roommate
      'equal'::public.split_type,
      CURRENT_DATE - (j / 5), -- distribute dates over past 20 days
      'Auto-generated expense for performance testing.',
      null, -- receiptUrl
      null, -- receiptPublicId
      (
        SELECT jsonb_agg(jsonb_build_object('roommate_id', r_id, 'share_paisa', v_amount_paisa / 10))
        FROM unnest(v_roommates) AS r_id
      )
    );
  END LOOP;

  RAISE NOTICE 'Successfully seeded 100 sample expenses and updated pairwise balances.';

  -- 4. Add a few pending payments, disputes, and reminders
  -- Roommate B pays Roommate A (Admin)
  INSERT INTO public.payments (
    group_id,
    from_roommate_id,
    to_roommate_id,
    amount_paisa,
    status,
    initiated_by_roommate_id,
    note
  ) VALUES (
    v_group_id,
    v_roommates[2],
    v_roommates[1],
    25000,
    'pending_confirmation'::public.payment_status,
    v_roommates[2],
    'Sent my share of electric bill.'
  );

  -- Roommate C disputes expense #50
  SELECT id INTO v_expense_id FROM public.expenses WHERE group_id = v_group_id AND title = 'groceries #50' OR title LIKE '%#50' LIMIT 1;
  IF v_expense_id IS NOT NULL THEN
    INSERT INTO public.disputes (
      expense_id,
      group_id,
      raised_by_roommate_id,
      reason,
      status
    ) VALUES (
      v_expense_id,
      v_group_id,
      v_roommates[3],
      'I was not in the hostel during this weekend. I should not be included.',
      'pending'::public.dispute_status
    );
  END IF;

  -- Roommate A reminds Roommate D
  INSERT INTO public.reminders (
    group_id,
    from_roommate_id,
    to_roommate_id,
    amount_paisa,
    message
  ) VALUES (
    v_group_id,
    v_roommates[1],
    v_roommates[4],
    100000,
    'Please clear the room tea balance ASAP.'
  );

  RAISE NOTICE 'Performance seed complete! Go to /login, enter room code PERF100, username "roommate a" and PIN "123456" to log in.';
END $$;
