# DiscPlus Friends Update

Copy these files into your project:

- `web/app/friends/page.tsx`
- `web/components/friends/friends-panel.tsx`

Run this SQL in Supabase SQL Editor if your `friends` table does not exist:

```sql
create table if not exists friends (
  id bigint generated always as identity primary key,
  requester_id uuid references profiles(id) on delete cascade,
  addressee_id uuid references profiles(id) on delete cascade,
  status text not null default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()),
  unique (requester_id, addressee_id)
);

alter table friends enable row level security;

drop policy if exists "Friends are viewable by involved users" on friends;
drop policy if exists "Users can create friend requests" on friends;
drop policy if exists "Users can update involved friendships" on friends;
drop policy if exists "Users can delete involved friendships" on friends;

create policy "Friends are viewable by involved users"
on friends for select
using (auth.uid() = requester_id or auth.uid() = addressee_id);

create policy "Users can create friend requests"
on friends for insert
with check (auth.uid() = requester_id);

create policy "Users can update involved friendships"
on friends for update
using (auth.uid() = requester_id or auth.uid() = addressee_id)
with check (auth.uid() = requester_id or auth.uid() = addressee_id);

create policy "Users can delete involved friendships"
on friends for delete
using (auth.uid() = requester_id or auth.uid() = addressee_id);
```

Restart local dev server:

```bash
Ctrl + C
npm run dev
```

Test:

1. Create user A.
2. Log out.
3. Create user B.
4. Search user A from `/friends`.
5. Send request.
6. Log in as user A.
7. Accept request.
8. Post a check-in from a course.
9. Confirm friend activity appears.
