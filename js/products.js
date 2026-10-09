/* products.js - the gift shop's categories and products.
   TO ADD A PRODUCT: copy one line, change the details.
   images: [] = a placeholder picture is shown. When you have real photos, put them in the img/products folder and list them:
           images: ["img/products/teddy-1.jpg", "img/products/teddy-2.jpg"]   (square 1:1 photos look best)
   for: who the gift suits - women, men, girls, boys (you can list more than one)
   price = selling price, old = the old price (leave it out if there is no offer). */
var CATEGORIES = ["teddy", "chocolate", "flowers", "cakes", "jewellery", "perfume", "personal", "hampers"];
var PRODUCTS = [
  { id: "t1", cat: "teddy", name: "Classic Teddy Bear 40cm", price: 2490, old: 2990, images: [], for: ["women", "girls"], pop: 9 },
  { id: "t2", cat: "teddy", name: "Heart Hugger Teddy", price: 3290, old: 3990, images: [], for: ["women", "girls"], pop: 8 },
  { id: "t3", cat: "teddy", name: "Giant Teddy Bear 100cm", price: 8900, images: [], for: ["women", "girls"], pop: 6 },
  { id: "c1", cat: "chocolate", name: "Dark Chocolate Box (12 pieces)", price: 1890, old: 2290, images: [], for: ["women", "men"], pop: 9 },
  { id: "c2", cat: "chocolate", name: "Heart Truffle Gift Box", price: 2650, images: [], for: ["women"], pop: 7 },
  { id: "c3", cat: "chocolate", name: "Mini Chocolate Treat Pack", price: 990, old: 1190, images: [], for: ["girls", "boys"], pop: 5 },
  { id: "f1", cat: "flowers", name: "Red Rose Bouquet (12 roses)", price: 3900, old: 4500, images: [], for: ["women"], pop: 10 },
  { id: "f2", cat: "flowers", name: "Mixed Spring Bouquet", price: 3200, images: [], for: ["women"], pop: 6 },
  { id: "f3", cat: "flowers", name: "Single Rose in Gift Box", price: 1250, images: [], for: ["women"], pop: 7 },
  { id: "k1", cat: "cakes", name: "Chocolate Fudge Cake 1kg", price: 4200, old: 4800, images: [], for: ["women", "men", "girls", "boys"], pop: 8 },
  { id: "k2", cat: "cakes", name: "Red Velvet Heart Cake", price: 4900, images: [], for: ["women"], pop: 9 },
  { id: "k3", cat: "cakes", name: "Birthday Cupcake Box (6)", price: 1650, images: [], for: ["girls", "boys"], pop: 5 },
  { id: "j1", cat: "jewellery", name: "Heart Pendant Necklace", price: 5900, old: 7200, images: [], for: ["women"], pop: 8 },
  { id: "j2", cat: "jewellery", name: "Silver Charm Bracelet", price: 6400, images: [], for: ["women", "girls"], pop: 6 },
  { id: "j3", cat: "jewellery", name: "Pearl Stud Earrings", price: 3800, old: 4500, images: [], for: ["women"], pop: 5 },
  { id: "p1", cat: "perfume", name: "Floral Eau de Parfum 50ml", price: 7900, old: 9500, images: [], for: ["women"], pop: 7 },
  { id: "p2", cat: "perfume", name: "Fresh Citrus Cologne 100ml", price: 6200, images: [], for: ["men"], pop: 5 },
  { id: "p3", cat: "perfume", name: "Sweet Vanilla Body Mist", price: 2400, images: [], for: ["women", "girls"], pop: 6 },
  { id: "s1", cat: "personal", name: "Custom Photo Mug", price: 1450, old: 1750, images: [], for: ["women", "men"], pop: 8 },
  { id: "s2", cat: "personal", name: "Name Engraved Keychain", price: 890, images: [], for: ["men", "boys"], pop: 6 },
  { id: "s3", cat: "personal", name: "Photo Frame Night Lamp", price: 3300, old: 3900, images: [], for: ["women", "men", "girls", "boys"], pop: 7 },
  { id: "h1", cat: "hampers", name: "Sweet Surprise Hamper", price: 5400, old: 6400, images: [], for: ["women", "men"], pop: 9 },
  { id: "h2", cat: "hampers", name: "Birthday Joy Box", price: 4600, images: [], for: ["women", "men", "girls", "boys"], pop: 7 },
  { id: "h3", cat: "hampers", name: "Romantic Evening Box", price: 7200, old: 8500, images: [], for: ["women", "men"], pop: 8 },
  { id: "s4", cat: "personal", name: "Men's Leather Wallet", price: 4200, old: 5000, images: [], for: ["men"], pop: 7 },
  { id: "h4", cat: "hampers", name: "Boys Superhero Gift Box", price: 3900, images: [], for: ["boys"], pop: 6 },
  { id: "h5", cat: "hampers", name: "Girls Sparkle Gift Box", price: 3900, old: 4600, images: [], for: ["girls"], pop: 6 }
];

/* placeholder pictures (simple drawings) used until real photos are added */
var ART_BG = ["#fde0e0", "#e6dcf7", "#fde7b8", "#d9ecfa", "#dcf3e6"];
var HP = "M12 21.5C5 16 2 12.4 2 8.6 2 5.9 4.1 4 6.6 4c1.9 0 3.7 1 5.4 3.1C13.7 5 15.5 4 17.4 4 19.9 4 22 5.9 22 8.6c0 3.8-3 7.4-10 12.9z";
var ART = {
  teddy: '<circle cx="100" cy="128" r="46" fill="#c98f5a"/><circle cx="100" cy="74" r="36" fill="#d9a066"/><circle cx="72" cy="44" r="13" fill="#d9a066"/><circle cx="128" cy="44" r="13" fill="#d9a066"/><circle cx="72" cy="44" r="6" fill="#f3c9a0"/><circle cx="128" cy="44" r="6" fill="#f3c9a0"/><ellipse cx="100" cy="86" rx="15" ry="11" fill="#f3d9bd"/><circle cx="88" cy="68" r="4" fill="#2b1423"/><circle cx="112" cy="68" r="4" fill="#2b1423"/><ellipse cx="100" cy="81" rx="5" ry="3.5" fill="#2b1423"/><path d="' + HP + '" transform="translate(88 112)" fill="#e63e6d"/>',
  chocolate: '<rect x="34" y="60" width="132" height="90" rx="12" fill="#6b3a2a"/><rect x="42" y="68" width="116" height="74" rx="8" fill="#8a4b34"/><g fill="#3e1f14"><circle cx="62" cy="88" r="10"/><circle cx="87" cy="88" r="10"/><circle cx="113" cy="88" r="10"/><circle cx="138" cy="88" r="10"/><circle cx="62" cy="122" r="10"/><circle cx="87" cy="122" r="10"/><circle cx="113" cy="122" r="10"/><circle cx="138" cy="122" r="10"/></g><rect x="94" y="58" width="12" height="94" fill="#e63e6d"/>',
  flowers: '<path d="M100 190V110M80 190l20-80M120 190l-20-80" stroke="#3f9a63" stroke-width="5" fill="none"/><path d="M58 112l42 82 42-82z" fill="#f7c764"/><g fill="#e63e6d"><circle cx="68" cy="72" r="20"/><circle cx="132" cy="72" r="20"/><circle cx="100" cy="46" r="20"/></g><g fill="#fff4f0"><circle cx="68" cy="72" r="7"/><circle cx="132" cy="72" r="7"/><circle cx="100" cy="46" r="7"/></g>',
  cakes: '<rect x="44" y="110" width="112" height="50" rx="8" fill="#f7a1bd"/><rect x="54" y="78" width="92" height="36" rx="8" fill="#fff"/><path d="M54 94q10 10 20 0t20 0 20 0 20 0" fill="none" stroke="#f7a1bd" stroke-width="5"/><circle cx="100" cy="66" r="9" fill="#e63e6d"/><rect x="98" y="50" width="4" height="12" fill="#3f9a63"/>',
  jewellery: '<path d="M46 46q54 110 108 0" fill="none" stroke="#d9a441" stroke-width="5"/><path d="' + HP + '" transform="translate(82 108) scale(1.4)" fill="#e63e6d"/><circle cx="100" cy="150" r="5" fill="#d9a441"/>',
  perfume: '<rect x="70" y="86" width="60" height="80" rx="14" fill="#cfa8f0"/><rect x="84" y="62" width="32" height="26" rx="6" fill="#2b1423"/><rect x="92" y="46" width="16" height="18" rx="4" fill="#d9a441"/><ellipse cx="100" cy="126" rx="14" ry="22" fill="#fff" opacity=".6"/>',
  personal: '<rect x="56" y="64" width="76" height="86" rx="12" fill="#fff"/><path d="M132 82h12a14 14 0 0 1 0 38h-12" fill="none" stroke="#fff" stroke-width="10"/><path d="' + HP + '" transform="translate(80 92) scale(1.3)" fill="#e63e6d"/>',
  hampers: '<path d="M42 100h116l-12 62a10 10 0 0 1-10 8H64a10 10 0 0 1-10-8z" fill="#c98f5a"/><path d="M60 100q40-70 80 0" fill="none" stroke="#a8713f" stroke-width="6"/><rect x="62" y="62" width="30" height="40" rx="5" fill="#e63e6d"/><rect x="100" y="70" width="34" height="32" rx="5" fill="#6bb6e8"/><circle cx="116" cy="58" r="12" fill="#f7c764"/>'
};
function artUrl(cat, n) {
  var bg = ART_BG[(CATEGORIES.indexOf(cat) + n) % ART_BG.length];
  var extra = n === 1 ? '<circle cx="30" cy="34" r="6" fill="#fff" opacity=".7"/><circle cx="172" cy="158" r="9" fill="#fff" opacity=".6"/>' :
              n === 2 ? '<path d="' + HP + '" transform="translate(150 20) scale(1.1)" fill="#fff" opacity=".8"/>' : '';
  var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect width="200" height="200" fill="' + bg + '"/>' + extra + ART[cat] + '</svg>';
  return "data:image/svg+xml," + encodeURIComponent(svg);
}
