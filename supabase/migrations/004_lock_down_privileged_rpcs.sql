-- Privileged RPCs are called only by the server-side service-role client.
-- SECURITY DEFINER functions otherwise inherit EXECUTE for PUBLIC by default.
revoke execute on function public.create_expense_v1(
  uuid, text, integer, uuid, uuid, public.split_type, date, text, text, text, jsonb
) from public, anon, authenticated;
grant execute on function public.create_expense_v1(
  uuid, text, integer, uuid, uuid, public.split_type, date, text, text, text, jsonb
) to service_role;

revoke execute on function public.confirm_payment_v1(uuid, uuid, text)
from public, anon, authenticated;
grant execute on function public.confirm_payment_v1(uuid, uuid, text)
to service_role;

revoke execute on function public.record_payment_received_v1(uuid, uuid, uuid, integer, text)
from public, anon, authenticated;
grant execute on function public.record_payment_received_v1(uuid, uuid, uuid, integer, text)
to service_role;

alter function public.create_expense_v1(
  uuid, text, integer, uuid, uuid, public.split_type, date, text, text, text, jsonb
) set search_path = public, pg_temp;
alter function public.confirm_payment_v1(uuid, uuid, text)
set search_path = public, pg_temp;
alter function public.record_payment_received_v1(uuid, uuid, uuid, integer, text)
set search_path = public, pg_temp;
