# Nikhitha & Sri Harsha RSVP

A mobile-first wedding invitation and RSVP experience for Haldi, Wedding, and
Vratham.

## Run locally

```bash
pnpm install
pnpm dev
```

Copy `.env.example` to `.env.local` and set:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
```

The real `.env.local` file is excluded from source control.

## Create the database

1. Open the Supabase project.
2. Select **SQL Editor** and create a new query.
3. Paste and run each file separately, in numerical order:
   `supabase/setup/01_schema_and_events.sql`
   `supabase/setup/02_get_invitation_function.sql`
   `supabase/setup/03_save_rsvp_function.sql`
   `supabase/setup/04_verify_setup.sql`

This creates the events, guest groups, invitation assignments, RSVP tables,
row-level security, and the two guest-facing database functions.

## Enable the admin dashboard

1. Run `supabase/setup/06_admin_dashboard.sql` in the SQL Editor.
2. Run `supabase/setup/08_invitation_contacts.sql`.
3. Run `supabase/setup/09_verify_invitation_contacts.sql`.
4. In Supabase, open **Authentication → URL Configuration**.
5. Add `http://127.0.0.1:5173/admin` to **Redirect URLs**.

The approved administrator is `gollasriharsha19@gmail.com`. Open `/admin` and
request a magic link to sign in. Add the production `/admin` URL to the
redirect list after deployment.

## Invitation previews

The current frontend resolves event access from the URL. These examples make it
easy to review every invitation combination before the database is connected.

```text
/?invite=family-token
/?invite=family-token&events=wedding
/?invite=family-token&events=haldi,wedding
/?invite=family-token&events=haldi,vratham
```

The invitation token owns the saved response. Opening the same link lets a
guest revise their RSVP.

## Structure

```text
src/components     Presentational invitation and RSVP sections
src/config         Invitation-link resolution
src/data           Event content
src/lib            Validation and response transformations
src/services       Replaceable RSVP persistence
src/types          Shared domain types
```

`RsvpRepository` is the backend boundary. Preview links use browser storage,
while real invitation tokens use Supabase.

## Before deployment

- Confirm complete street addresses for Prism Las Colinas and both residences.
- Choose the final site domain.
- Add the private host dashboard and guest-group invitation records.
