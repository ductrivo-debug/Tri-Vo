# SILVERBACK MMA — beta
Preserves the existing workout UI and adds email/password accounts and personal data backed by a dedicated Supabase project.

## Run
1. Install Node.js (includes npm).
2. Run `npm install`.
3. Copy `.env.example` to `.env.local`. Set your Supabase project URL and **publishable** key. Never put a secret/service-role key in the frontend.
4. Run `supabase/migrations/001_personal_data.sql` in that project's SQL editor.
5. In Supabase Authentication settings enable email signup, email confirmation, and set your beta site's URL.
6. Run `npm run dev`. Build with `npm run build`; publish `dist` on a static host.

Without Supabase configuration the app offers a clearly labeled local demo. It does not simulate account creation. Demo and account data are isolated; old browser data is not automatically imported.

## Beta behavior and limits
Each account owns key/value records for settings, exercises, playlists, plans and workout history. Row-level security checks ownership on reads and writes. Account workout data is loaded before mounting the timer, and is not cached in localStorage. Failed saves are visible and can be retried while the page stays open. Concurrent devices use last-write-wins per data key; refresh to load changes from another device.
Language preference remains per browser. Music playback was incomplete in the original and remains incomplete. Password reset/account deletion UI, robust conflict handling, offline account writes and store distribution are subsequent work. This is not a release-ready build.

## Required verification with a configured backend
- Register and confirm accounts A and B; verify login, logout, and reloading.
- Save different plans/history in A and B; verify isolation after switching accounts.
- Using A's authenticated client, attempt select/upsert/delete with B's user_id: select must return no rows and writes must be denied.
- Simulate network loss during save: visible failure, retry, refresh and verify persistence.
- Sign in on another device and verify saved data after refresh.
- Check timer pause/resume, long rests, finish/history, audio and mobile layouts.

