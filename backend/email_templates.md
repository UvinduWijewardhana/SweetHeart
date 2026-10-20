# Email templates with the one-time code (OTP)

Supabase > Authentication > Email Templates. Paste these, one by one, and Save.
(The Templates screen may stay locked until you have saved your custom SMTP settings. See START_HERE.md, step 4.)

## 1. "Confirm sign up"
**Subject:** `Your SweetHeart confirmation code`

**Body (HTML):**
```html
<h2>Welcome to SweetHeart</h2>
<p>Your confirmation code is:</p>
<p style="font-size:32px;font-weight:bold;letter-spacing:6px;margin:12px 0">{{ .Token }}</p>
<p>Type it on the SweetHeart sign-up page to finish creating your account. The code works for a short time only.</p>
<p>If you did not sign up, you can ignore this email.</p>
```

## 2. "Reset password"
**Subject:** `Your SweetHeart password reset code`

**Body (HTML):**
```html
<h2>Reset your SweetHeart password</h2>
<p>Your code to choose a new password is:</p>
<p style="font-size:32px;font-weight:bold;letter-spacing:6px;margin:12px 0">{{ .Token }}</p>
<p>Type it on the SweetHeart page together with your new password. The code works for a short time only.</p>
<p>If you did not ask for this, ignore this email. Nobody can change your password without this code.</p>
```

`{{ .Token }}` is the 6-digit code. Do not remove it, and never share the code with anyone.
