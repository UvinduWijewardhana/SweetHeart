> **සම්පූර්ණ පියවරෙන් පියවර මාර්ගෝපදේශය `START_HERE.md` එකේ තියෙනවා (OTP email සහ Gmail SMTP ඇතුළුව).**

# SweetHeart backend, පියවර 1: කෙටි link සහ ඡායාරූප

මේ පියවරෙන් වෙන්නේ: ආරාධනා **database එකේ save වෙලා**, link එක කෙටි වෙන එක
(`one-little-question.html?c=a1b2c3d4e5` වගේ). ඡායාරූප link එකට ඇතුළත් වෙන්නේ නෑ.
තැන් 3 සීමාව **server එකේම** බලාත්මක වෙනවා.

## 1. Supabase account සහ project
1. supabase.com ඇරලා sign up කරන්න (GitHub, Google හෝ email).
2. **New project** ඔබලා: නම `sweetheart`, **Database password** එක ශක්තිමත් එකක් දාලා **ආරක්ෂිතව** (password manager එකක) තියාගන්න.
   Region එක ඔබට ළඟම එක තෝරන්න (උදා: Southeast Asia / Singapore).
3. Project එක හැදෙනකල් විනාඩි 2ක් විතර ඉන්න.

## 2. Database එක හදන්න
1. වම් පැත්තේ **SQL Editor** > **New query**.
2. `backend/01_schema.sql` file එකේ ඔක්කොම copy කරලා paste කරන්න > **Run**.
3. "Success" කියලා ආවොත් හරි. **Error එකක් ආවොත් ඒකේ අකුරු හරියටම මට එවන්න.**
   (ඒ file එක මම ඇත්ත database එකක run කරලා බලලා නෑ.)

## 2b. Link කල් ඉකුත් වීම (පැය 24) සහ ස්වයංක්‍රීයව මැකීම
1. **SQL Editor > New query** එකක් ඇරලා `backend/02_expiry.sql` file එකේ ඔක්කොම paste කරලා **Run** කරන්න (01 එක කලින් run කළාට පස්සේ).
2. ඒකෙන් වෙන්නේ: **Date Invite link එක පැය 24කට පස්සේ** වැඩ කරන්නේ නෑ, ඒකේ දත්ත සහ ඡායාරූප **ඉබේම මැකෙනවා**. **Employee Appreciation link එක** වැඩ කරන්නේ **ඒ වෙන් කරපු දිනයට පසු දවස** දක්වා (උපරිම දවස් 90).
3. ඒ කාලය වෙනස් කරන්න ඕන නම් ඒ file එකේ උඩින් තියෙන `v_date_hours` (පැය) සහ `v_max_days` (දවස්) අංක වෙනස් කරලා ආයෙත් Run කරන්න.
4. කල් ඉකුත් වුණු link එකක් ඇරියොත් **"Link expired" page එක** (`link-expired.html`) පෙන්නනවා.
5. ආරාධනා 3000කට වඩා එකවර තිබුණොත් අලුත් ඒවා ටික වෙලාවකට ප්‍රතික්ෂේප කරනවා (නොමිලේ database එක පිරෙන එක වළක්වන්න).

## 3. Site එකට සම්බන්ධ කරන්න
1. **Project Settings > API** (මෙනු නම් ටිකක් වෙනස් වෙන්න පුළුවන්).
2. **Project URL** සහ **anon public key** copy කරන්න.
3. `js/config.js` ඇරලා ඒ දෙක දාන්න:
   ```
   supabaseUrl: "https://xxxxxxxx.supabase.co",
   supabaseKey: "eyJ....(anon public key)",
   ```
4. **service_role key එක කවදාවත් මෙතන දාන්න එපා, ඒක ඕනම කෙනෙකුට මට පවා දෙන්න එපා.**
   anon key එක public (ඕනම කෙනෙකුට දකින්න පුළුවන්), ඒක ආරක්ෂිතයි මොකද table එකට කෙලින් ප්‍රවේශයක් නෑ, ඇත්තේ functions දෙකක් විතරයි.

## 4. GitHub එකට upload කරලා test කරන්න
1. Files GitHub එකට upload කරන්න.
2. Date Invite page එකෙන් link එකක් හදන්න. link එක `?c=` කියලා කෙටි වෙන්න ඕන.
3. ඒ link එක ඇරලා, ඡායාරූපත් එක්ක හරි ද බලන්න.
4. Supabase එකේ **Table Editor > invitations** වලදී ඒ row එක දකින්න පුළුවන්.
5. server එකට ළඟා වෙන්න බැරි වුණොත් site එක ඉබේම පරණ දිග link එක හදනවා.

## 5. ඇත්ත users ට ඉස්සෙල්ලා (වැදගත්)
- **Privacy Policy එක update කරන්න.** දැන් අපි නම්, WhatsApp number, ඡායාරූප **save කරනවා**, ඒ නිසා පරණ "අපි කිසිවක් save කරන්නේ නෑ" කියන කොටස වැරදියි. කොච්චර කාලයක් තියාගන්නවද, ඉවත් කරන්න ඉල්ලන්නේ කොහොමද කියලත් ලියන්න.
- නොමිලේ plan එකේ project එක ටික කාලයක් පාවිච්චි නොකළොත් නතර වෙන්න පුළුවන්, ඒක ඔබ ආපහු ක්‍රියාත්මක කරන්න වෙනවා. ඇත්ත users ඉන්නකොට ගෙවන plan එකක් ගැන හිතන්න.

## Phase 2: Login (ගිණුම්) - Supabase Auth
**1. Database කොටස**
1. SQL Editor එකේ `backend/03_auth_profiles.sql` ඔක්කොම paste කරලා **Run**.
2. ඊට පස්සේ `backend/tests/03_security_checks.sql` paste කරලා **Run**. **හැම පේළියක්ම PASS** කියලා පෙන්නන්න ඕන. FAIL එකක් තිබුණොත් ඒකේ නම මට එවන්න.

**2. Supabase dashboard සැකසුම් (මෙනු නම් ටිකක් වෙනස් වෙන්න පුළුවන්)**
1. **Authentication > URL Configuration**: **Site URL** = `https://uvinduwijewardhana.github.io/SweetHeart`. **Redirect URLs** වලට මේ දෙක එකතු කරන්න:
   `https://uvinduwijewardhana.github.io/SweetHeart/account.html` සහ `https://uvinduwijewardhana.github.io/SweetHeart/reset-password.html`.
   (මේවා නැතුව email link සහ Google ආපහු එන එක ප්‍රතික්ෂේප වෙනවා.)
2. **Email** provider එකේ **"Confirm email"** ක්‍රියාත්මකව තියෙන්න ඕන, ඒ වගේම අවම මුරපද දිග 8 කරන්න (Authentication > Sign In / Providers හෝ ඒ වගේ කොටසක).
3. **Supabase ගේම email යැවීම පරීක්ෂණ සඳහා විතරයි, ඒකට දැඩි සීමා තියෙනවා** (පැයකට email ගණන ඉතා අඩුයි). ඇත්ත users ට කලින් ඔබේම domain එකේ email යවන සේවාවක් (Resend හෝ Brevo) **Authentication > SMTP** වලට සම්බන්ධ කළ යුතුයි.
4. **Google login (වෛකල්පික):** Google Cloud Console > APIs & Services > Credentials > **OAuth client ID (Web application)**. **Authorized redirect URI** එකට Supabase ගේ Google provider පිටුවේ පෙන්නන URL එක (`https://<ඔබේ-project>.supabase.co/auth/v1/callback`) දාන්න. හැදුණු **Client ID** සහ **Client Secret** Supabase වල **Providers > Google** වලට දාන්න. **Client Secret එක Supabase එකේ විතරයි, `config.js` එකට හෝ මට දෙන්න එපා.**
5. Facebook සහ Apple බොත්තම් "ඉක්මනින්" කියලා අක්‍රියව තියෙනවා (අවසන් නොකළ දේවල් public කරන්න බෑ).

**3. පරීක්ෂා කරන්න**
1. Files (config.js හැර) GitHub එකට upload කරන්න. Account page එකෙන් **Sign up** කරන්න, email එකේ link එක ඔබලා, **Log in** කරන්න. Header එකේ "Account" සහ "Log out" පේන්න ඕන.
2. නම වෙනස් කරලා Save කරන්න. Log out. **Forgot your password?** එකත් පරීක්ෂා කරන්න.
3. (Google සකසලා නම්) Continue with Google.
4. Test ගිණුම **Delete my account** (DELETE ටයිප් කරලා) එකෙන් මකලා බලන්න.

**4. ඔබව admin කරන්න (SQL Editor එකේ, ඔබ sign up කළාට පස්සේ)**
`update public.profiles set role = 'admin' where id = (select id from auth.users where email = 'ඔබේ-email');`
admin බලතල ක්‍රියාත්මක වෙන්නේ **multi-factor (MFA) login** එකකින් විතරයි, ඒ screen එක Phase 5 දී එනවා. ඒ වෙනකම් admin role එකෙන් මුකුත් වෙන්නේ නෑ (ආරක්ෂාවට).

## Phase 3 (ආරක්ෂක කොටස): අපහාසාත්මක ආරාධනා වාර්තා කිරීම සහ දිග කේත
1. SQL Editor එකේ `backend/04_reports_tokens.sql` run කරන්න (01 සහ 02 කලින් run කරලා තියෙන්න ඕන; 03 වෛකල්පිකයි). ඊට පස්සේ `backend/tests/04_security_checks.sql` run කරන්න, හැම පේළියක්ම PASS වෙන්න ඕන.
2. ඒකෙන් වෙන්නේ: ආරාධනා පිටුවල පහළින් **"Report this invitation"** link එකක් එනවා (server එකේ save වුණු ආරාධනා වලට විතරයි). **වෙනස් සම්බන්ධතා 3කින්** එකම ආරාධනාව වාර්තා කළොත් ඒක **වහාම සඟවනවා** (admin බලනකල්). අලුත් ආරාධනා කේත දැන් අකුරු **16**ක්. වාර්තා දවස් 90කට පස්සේ මැකෙනවා.
3. වාර්තා බලන්න: Supabase **Table Editor > invitation_reports**.

## ඊළඟ පියවර
login (email, Google) > admin සහ manager roles > desktop application එක > ගෙවීම්.
