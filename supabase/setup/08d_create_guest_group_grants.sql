revoke all on function public.create_guest_group(
  text,
  text,
  text,
  text[]
) from public;

grant execute on function public.create_guest_group(
  text,
  text,
  text,
  text[]
) to authenticated;
