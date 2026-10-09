/* config.js - site-wide settings. Change the name or turn the preview login off here. */
var SH = {
  brand: "SweetHeart",      /* site name shown everywhere */
  demoLogin: true,          /* true = shows a "preview as signed-in user" button. Set to false when real login is connected */
  currency: "LKR",
  supabaseUrl: "https://rdxnjjeykbtqizhsbxuc.supabase.co/rest/v1/",          /* e.g. "https://abcdefgh.supabase.co" - from Supabase > Project Settings > API */
  supabaseKey: "sb_secret_gaehQ1ErSeGrxxVwJDks-w_QiKxIdu8",          /* the "anon public" key only. NEVER the service_role key */
  upgradePrice: 100,         /* price of the 4-5 places upgrade (LKR) */
  usdtWallet: "",           /* your USDT wallet address goes here when payments are connected */
  payments: false           /* turn on when real payments are connected */
};
