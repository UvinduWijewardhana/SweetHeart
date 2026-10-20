# SweetHeart: START HERE (පියවරෙන් පියවර)

## 0. ඔබට ඕන එකම file එක
**`sweetheart.zip`** විතරයි. අනිත් file card ඔක්කොම ඒක ඇතුළේම තියෙනවා, ඒවා වෙනම ඕන නෑ.
1. zip එක **Extract** කරන්න (`sweetheart` folder එකක් එනවා).
2. GitHub repo එකට **Add file > Upload files** වලින් ඒ folder එක ඇතුළේ ඔක්කොම files/folders drag කරන්න > **Commit changes**.
3. **වැදගත්:** `js/config.js` එක **upload කරන්න එපා** (ඒකේ ඔබේ Supabase URL සහ key තියෙනවා). upload කරන්න කලින් ඒ file එක ඉවත් කරන්න, නැත්නම් ඒක මාරු වුණාට පස්සේ ආයෙත් URL/key දෙක දාන්න.

## 1. දැන් කරන්න (නොමිලේ, domain එකක් නැතුව)
**පියවර 1: Database (SQL Editor එකේ, මේ පිළිවෙළට)**
`backend/02_expiry.sql` (කලින් run කළේ නැත්නම්) > `backend/03_auth_profiles.sql` > `backend/tests/03_security_checks.sql` (හැම පේළියක්ම **PASS**) > `backend/04_reports_tokens.sql` > `backend/tests/04_security_checks.sql` (PASS).

**පියවර 2: Gmail "App password" එකක් හදන්න (නොමිලේ)**
Google Account > **Security** > **2-Step Verification** ක්‍රියාත්මක කරන්න > ඒකේ **App passwords** (හෝ සෙවුමෙන් "App passwords") > නමක් දෙන්න (SweetHeart) > ලැබෙන **අකුරු 16ක මුරපදය** copy කරන්න. **ඒක කාටවත්, මටත් දෙන්න එපා.**

**පියවර 3: Supabase එකට email යවන්න අවසර දෙන්න (Custom SMTP)**
Supabase > **Authentication** > **SMTP Settings** (මෙනු නම් ටිකක් වෙනස් වෙන්න පුළුවන්) > Custom SMTP ක්‍රියාත්මක කරන්න:
- Sender email = ඔබේ Gmail address, Sender name = SweetHeart
- Host = `smtp.gmail.com`, Port = `465` (වැඩ නැත්නම් `587`)
- Username = ඔබේ Gmail address, Password = **ඒ App password එක**
- Save.
(ඒක නැතුව Supabase ගේම email යැවීම ඔබේ project එකේ team members ට විතරයි, ඒ වගේම පැයකට 2යි. ඒ නිසා වෙනත් කෙනෙකුට OTP යවන්න බෑ.)

**පියවර 4: Email templates (OTP code එක පෙන්නන්න)**
Supabase > Authentication > **Email Templates** > "Confirm sign up" සහ "Reset password". `backend/email_templates.md` එකේ තියෙන Subject සහ Body paste කරලා Save. (SMTP save කරලා නැත්නම් මේ කොටස අගුලු දාලා තියෙන්න පුළුවන්.)

**පියවර 5: Authentication සැකසුම්**
- **URL Configuration:** Site URL = `https://uvinduwijewardhana.github.io/SweetHeart`; Redirect URLs: `.../SweetHeart/account.html` සහ `.../SweetHeart/reset-password.html`.
- "Confirm email" ක්‍රියාත්මකව; අවම මුරපද දිග 8; (හැකි නම්) email OTP කල් ඉකුත් වීම තත්පර 600 (විනාඩි 10) වගේ කුඩා අගයක්.

**පියවර 6: Upload සහ පරීක්ෂාව**
Files upload කරන්න (0 වෙනි කොටස). ඊට පස්සේ **වෙනත් email එකකින්** (ඔබේ යාළුවෙකුගේ නැත්නම් වෙනත් Gmail එකක) Account page එකෙන් **Sign up**: ඒ email එකට **code එකක්** එනවා > ඒක ටයිප් කරලා ගිණුම සම්පූර්ණ කරන්න. ඊට පස්සේ **Forgot your password?** : code එකක් එනවා > code එකයි අලුත් මුරපදයයි ටයිප් කරන්න.

## 2. මොනවා මිලදී ගන්න ඕනද? Domain නැතුව බැරිද?
**දැනට කිසිවක් මිලදී ගන්න ඕන නෑ, domain එකක් ඕනත් නෑ.** නොමිලේ කොටස් (GitHub Pages + Supabase නොමිලේ plan + Gmail SMTP) වලින් ඔබටයි යාළුවන්ටයි පරීක්ෂා කරන්න ඇති. Gmail SMTP වලට දිනකට යවන්න පුළුවන් email ගණනට සීමාවක් තියෙනවා (පෞද්ගලික ගිණුමකට 500ක් පමණ, ඒක ඔබ තහවුරු කරගන්න), ඒ නිසා ඒක පරීක්ෂණයට සහ පොඩි පරිමාණයට විතරයි.

**ඇත්ත users ට කලින් (public launch) domain එකක් ඕන වෙනවා, මොකද:**
- ඔබේම domain එකේ email යවන සේවාවක් (Brevo / Resend) හරියට සකසන්න (SPF, DKIM, DMARC), එතකොට OTP email spam වලට නොයනවා.
- Google login ඇත්ත users ට විවෘත කරන්න, ගෙවීම් gateway (PayHere/WEBXPAY) ලියාපදිංචියට, AdSense වලට.
- Cloudflare Pages (ආරක්ෂක headers), `sweetheart.lk/i/කේතය` වගේ කෙටි link.
**වියදම්:** `.lk` domain එකක් අවුරුද්දකට රු. 8,000 පමණ (askmeout.lk සඳහා ඔබේ screenshot එකේ ගාණ, sweetheart.lk වෙනස් වෙන්න පුළුවන්, නිදහසද කියලා domains.lk එකෙන් බලන්න). Supabase Pro (මාසයකට ඩොලර් 25 පමණ) ඕන වෙන්නේ ඇත්ත users ආවාට පස්සේ විතරයි.

## 3. ඊළඟට
ඉහත 1 පියවර සාර්ථක වුණාම: Phase 3 (ආරාධනා වලට අයිතිකරුවන්, templates, ඡායාරූප Supabase Storage එකට). ඊට පස්සේ products/orders, ගෙවීම්, admin.
