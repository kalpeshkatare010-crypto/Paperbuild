# Switching on accounts and Pro payments

The code is ready. These steps connect it to your own Supabase (accounts and saved papers) and Razorpay (payments). Everything can be done from a phone browser.

## 1. Create the Supabase project
1. Open **supabase.com/dashboard**, choose your **RK Digitals Org**, tap **New project**.
2. Name: `Paperbuild` · Region: **Mumbai (ap-south-1)** · set a **database password** and save it somewhere safe.
3. When it's ready, open **Project Settings → API** (or **Data API**) and copy:
   - **Project URL** (looks like `https://abcd1234.supabase.co`). The part before `.supabase.co` is your **project ref**.
   - **anon public** key.
   Send these two to Claude; they go into `assets/config.js` (they're public by design).
4. **Authentication → URL Configuration**
   - Site URL: `https://kalpeshkatare.in/Paperbuild/app.html`
   - Redirect URLs: add `https://kalpeshkatare.in/Paperbuild/app.html` and `paperbuild://auth`
5. Your profile picture (top right) → **Account preferences → Access Tokens** → **Generate new token**, name it `paperbuild-deploy`, copy it.

## 2. Razorpay
1. Razorpay Dashboard → **Account & Settings → API Keys** → generate keys. Copy the **Key ID** and **Key Secret**.
2. **Account & Settings → Webhooks → Add new webhook**
   - URL: `https://<project ref>.supabase.co/functions/v1/razorpay-webhook`
   - Secret: make up a long password and copy it
   - Events: `payment.captured` and `order.paid`

## 3. Add the secrets to GitHub
Repo **Paperbuild → Settings → Secrets and variables → Actions → New repository secret**, one at a time:

| Name | Value |
|---|---|
| `SUPABASE_ACCESS_TOKEN` | token from step 1.5 |
| `SUPABASE_PROJECT_REF` | project ref from step 1.3 |
| `SUPABASE_DB_PASSWORD` | database password from step 1.2 |
| `RAZORPAY_KEY_ID` | Key ID |
| `RAZORPAY_KEY_SECRET` | Key Secret |
| `RAZORPAY_WEBHOOK_SECRET` | webhook secret |

Then **Actions → Deploy Supabase backend → Run workflow**. It creates the tables and payment functions. A green tick means it worked.

## 4. Optional extras
- **Google sign-in:** Google Cloud Console → APIs & Services → Credentials → **Create OAuth client ID** (Web application). Authorised redirect URI: `https://<project ref>.supabase.co/auth/v1/callback`. Paste the client ID and secret into Supabase → **Authentication → Providers → Google**. Then set `google: true` in `assets/config.js`.
- **Phone (OTP) sign-in:** Supabase → **Authentication → Providers → Phone** needs an SMS provider (Twilio, MessageBird, Vonage or Textlocal). Each SMS costs money, and SMS to Indian numbers needs DLT template registration with your provider. Then set `phone: true`.
- **Emails:** Supabase's built-in email sender only allows a few emails per hour. Before launch, add your own SMTP under **Authentication → Emails → SMTP Settings** (Brevo or Resend have free tiers).

## Admin account
`kalpeshkatare010@gmail.com` is the admin. When that email signs up (and confirms the email, or signs in with Google), it gets every Pro feature free, with no subscription. To add another admin, run this in Supabase → **SQL Editor**:
```sql
insert into public.admin_emails (email) values ('someone@example.com');
select public.sync_admin(id) from auth.users;
```
Keep **Authentication → Providers → Email → Confirm email** switched on, so nobody can claim an admin email they don't own.

## Prices in India and abroad
- India (phone/computer set to Indian time): ₹99 / month, ₹799 / year, paid by UPI, card or net banking.
- Everywhere else: $4.99 / month, $39.99 / year, paid by card in US dollars. People can switch with the "Paying from India?" link.
- For US-dollar payments, switch on **International payments** in Razorpay (Account & Settings → International payments). Razorpay reviews this before turning it on. Until then, only ₹ payments work.
- Prices live in `supabase/functions/_shared/common.ts` (what is charged) and in `app.html`, `signup.html` and `index.html` (what is shown).

## How the plans work
- **Free** (account needed to download): IEEE and APA, 1 paper saved online, small "Made with Paper Build" line on PDFs.
- **Pro**: 30 or 365 days, paid once through Razorpay (no auto-renewal). All 8 standards, Word (.docx) export, tables, subsections and equations, grammar & clarity suggestions, unlimited papers, no credit line.
- Free users can see Pro parts in the preview; when downloading, they can upgrade or download the PDF without them.
- The 1-paper limit is enforced by the database. The other limits are checked in the app.
- Until `assets/config.js` is filled in, the app runs without accounts and everything is unlocked.
