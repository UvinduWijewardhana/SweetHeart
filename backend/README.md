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

## ඊළඟ පියවර
login (email, Google) > admin සහ manager roles > desktop application එක > ගෙවීම්.
