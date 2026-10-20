# SweetHeart site map

Every page has the same top menu (Home, Cards, Gifts, About, Contact, cart, Log in, Sign up) and footer (About, Contact, Privacy, Terms) except the invitation pages and the sample dashboard. Below: what each page is for, what it opens from its own content, and which code files it needs.

## about.html
- What: About SweetHeart
- Opens: contact.html, privacy.html, terms.html
- Needs: site.css, config.js, i18n.js, i18n2.js, site.js

## account.html
- What: Log in / Sign up with Google, Facebook, Apple, email (not connected yet)
- Opens: privacy.html, terms.html
- Needs: site.css, config.js, i18n.js, i18n2.js, site.js, account.js

## appreciation-create.html
- What: Employee Appreciation maker: company fills it, picks date and time on a clock
- Opens: appreciation.html (the link it creates)
- Needs: site.css, config.js, i18n.js, i18n2.js, site.js, shared.js, appreciation-create.js

## appreciation.html
- What: The thank-you gift page the employee opens (sees the booked day and time)
- Opens: index.html
- Needs: site.css, shared.js, appreciation.js

## cart.html
- What: Cart (needs login): quantities, totals, savings
- Opens: checkout.html
- Needs: site.css, config.js, i18n.js, i18n2.js, products.js, site.js, shop.js

## checkout.html
- What: Checkout preview (delivery + payment options, not live)
- Opens: nothing (menu and footer only)
- Needs: site.css, config.js, i18n.js, i18n2.js, products.js, site.js, shop.js

## contact.html
- What: Contact
- Opens: nothing (menu and footer only)
- Needs: site.css, config.js, i18n.js, i18n2.js, site.js

## dashboard.html
- What: SAMPLE admin dashboard design (fake data, not for public use)
- Opens: nothing (menu and footer only)
- Needs: 

## date-invite.html
- What: Date Invite maker: creates the invitation link (3 free places, photos)
- Opens: one-little-question.html (the link it creates), payment.html (when 4-5 places are chosen)
- Needs: site.css, config.js, i18n.js, i18n2.js, site.js, shared.js, create.js

## gifts.html
- What: Gift shop: categories, "shop for" filter, sort, photo carousels, add to cart
- Opens: account.html (when a visitor who is not logged in presses Add to cart)
- Needs: site.css, config.js, i18n.js, i18n2.js, products.js, site.js, shop.js

## index.html
- What: Home page: hero, service cards, how it works
- Opens: date-invite.html, gifts.html, special-days.html
- Needs: site.css, config.js, i18n.js, i18n2.js, site.js

## one-little-question.html
- What: The invitation page the girl opens (4 steps, her answer goes to WhatsApp)
- Opens: index.html
- Needs: style.css, shared.js, invite.js

## payment.html
- What: Payment page for the 4-5 places upgrade: card (bank OTP) and USDT (preview)
- Opens: date-invite.html (after the success message)
- Needs: site.css, config.js, i18n.js, i18n2.js, site.js, shared.js

## privacy.html
- What: Privacy Policy
- Opens: nothing (menu and footer only)
- Needs: site.css, config.js, i18n.js, i18n2.js, site.js

## special-days.html
- What: Special Days: the card categories
- Opens: appreciation-create.html
- Needs: site.css, config.js, i18n.js, i18n2.js, site.js

## terms.html
- What: Terms of Use
- Opens: nothing (menu and footer only)
- Needs: site.css, config.js, i18n.js, i18n2.js, site.js

## Code files

- css/site.css - look of the home, shop, forms, menus (SweetHeart theme)
- css/style.css - look of the invitation page the girl opens
- js/config.js - site name, demo login switch, upgrade price, USDT wallet, payments on/off
- js/i18n.js, js/i18n2.js - the Sinhala and English words
- js/site.js - menu, language switch, cart number
- js/shared.js - helpers: link packing, photo cropping, popup
- js/create.js - Date Invite maker; js/invite.js - the invitation page
- js/appreciation-create.js, js/appreciation.js - Employee Appreciation maker and page
- js/products.js, js/shop.js - gift products, shop and cart; js/account.js - login screen
- js/backend.js - talks to the Supabase database (short links, saved invitations); off until js/config.js has the address and key
- backend/01_schema.sql - run once in Supabase to create the table and the two safe functions; backend/README.md - the step by step guide
- img/ - logo.png (SweetHeart logo), flower.png (sakura), place pictures, img/products for real gift photos

If you rename a file, tell me the old and new name and I will fix every link to it.