const dbStore = require('../config/dbStore');

const defaultRestaurant = {
  name: 'DINEVO Kitchen & Bar',
  tagline: 'Crafted Gourmet Plates & Table QR Ordering',
  coverImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1600&auto=format&fit=crop',
  address: '12 Marina Walk, City Center',
  openingHours: '11:00 AM - 11:30 PM',
  tables: [
    { tableNumber: '01', code: 'DINEVO-T01', status: 'AVAILABLE', activeSession: null },
    { tableNumber: '02', code: 'DINEVO-T02', status: 'AVAILABLE', activeSession: null },
    { tableNumber: '03', code: 'DINEVO-T03', status: 'AVAILABLE', activeSession: null },
    { tableNumber: '04', code: 'DINEVO-T04', status: 'AVAILABLE', activeSession: null },
    { tableNumber: '05', code: 'DINEVO-T05', status: 'AVAILABLE', activeSession: null },
    { tableNumber: '06', code: 'DINEVO-T06', status: 'AVAILABLE', activeSession: null },
    { tableNumber: '07', code: 'DINEVO-T07', status: 'AVAILABLE', activeSession: null },
    { tableNumber: '08', code: 'DINEVO-T08', status: 'AVAILABLE', activeSession: null }
  ]
};

const defaultItems = [
  // SIGNATURE
  {
    name: 'Truffle Wagyu Smash Burger',
    description: 'Double Wagyu beef patty, black truffle aioli, aged English cheddar, crispy shallots on toasted brioche.',
    price: 490,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=1200&auto=format&fit=crop',
    category: 'Signature',
    veg: false,
    spiceLevel: 1,
    rating: 4.98,
    isPopular: true,
    isSignature: true,
    isAvailable: true,
    ingredients: ['Wagyu Beef', 'Black Truffle Aioli', 'Aged Cheddar', 'Brioche Bun'],
    addOns: [{ name: 'Extra Truffle Dip', price: 50 }, { name: 'Crispy Bacon', price: 80 }]
  },
  {
    name: 'Royal Charcoal Grilled Atlantic Salmon',
    description: 'Fresh Atlantic salmon steak, saffron potato velvet, charred asparagus & herb citrus butter.',
    price: 690,
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?q=80&w=1200&auto=format&fit=crop',
    category: 'Signature',
    veg: false,
    spiceLevel: 1,
    rating: 4.95,
    isPopular: true,
    isSignature: true,
    isAvailable: true,
    ingredients: ['Atlantic Salmon', 'Saffron Potato Velvet', 'Asparagus', 'Citrus Butter'],
    addOns: [{ name: 'Extra Lemon Herb Butter', price: 35 }]
  },
  {
    name: 'Royal Mutton Sukka Roast',
    description: 'Tender tenderloin mutton slow-roasted in toasted coconut, black pepper, star anise and curry leaf ghee.',
    price: 520,
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1200&auto=format&fit=crop',
    category: 'Signature',
    veg: false,
    spiceLevel: 3,
    rating: 4.92,
    isPopular: true,
    isSignature: true,
    isAvailable: true,
    ingredients: ['Tender Mutton', 'Roasted Coconut', 'Crushed Black Pepper', 'Curry Leaf Ghee'],
    addOns: [{ name: 'Malabar Parotta (2 pcs)', price: 60 }]
  },

  // KANYAKUMARI SPECIALS
  {
    name: 'Nanjil-style Fish Curry Rice',
    description: 'Authentic Kanyakumari coastal curry cooked with fresh kingfish, ground coconut, tamarind & roasted coconut oil, served with steamed matta rice.',
    price: 380,
    image: 'https://images.unsplash.com/photo-1516714435131-44d6b64dc6a2?q=80&w=1200&auto=format&fit=crop',
    category: 'Kanyakumari Specials',
    veg: false,
    spiceLevel: 3,
    rating: 4.95,
    isPopular: true,
    isKanyakumariSpecial: true,
    isAvailable: true,
    ingredients: ['Kingfish', 'Ground Coconut', 'Tamarind', 'Coconut Oil', 'Matta Rice'],
    addOns: [{ name: 'Extra Fish Fry Piece', price: 90 }, { name: 'Coconut Gravy', price: 40 }]
  },
  {
    name: 'Kanyakumari Crispy Fish Fry',
    description: 'Fresh catch of the day marinated in traditional Nanjil red chilli paste, fennel, garlic & pan-fried crisp in pure coconut oil.',
    price: 340,
    image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?q=80&w=1200&auto=format&fit=crop',
    category: 'Kanyakumari Specials',
    veg: false,
    spiceLevel: 3,
    rating: 4.9,
    isPopular: true,
    isKanyakumariSpecial: true,
    isAvailable: true,
    ingredients: ['Fresh Fish Cutlet', 'Nanjil Chilli Paste', 'Garlic', 'Fennel', 'Coconut Oil'],
    addOns: [{ name: 'Spicy Green Dip', price: 20 }]
  },
  {
    name: 'Nadan Pepper Chicken Fry',
    description: 'Country-style chicken tossed with crushed black pepper, caramelized shallots, curry leaves & aromatic roasted spices.',
    price: 350,
    image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?q=80&w=1200&auto=format&fit=crop',
    category: 'Kanyakumari Specials',
    veg: false,
    spiceLevel: 3,
    rating: 4.85,
    isPopular: true,
    isKanyakumariSpecial: true,
    isAvailable: true,
    ingredients: ['Chicken', 'Crushed Pepper', 'Shallots', 'Curry Leaves', 'Ghee'],
    addOns: [{ name: 'Extra Malabar Parotta (2 pcs)', price: 50 }]
  },
  {
    name: 'Flaky Parotta & Spicy Chicken Curry',
    description: 'Two layered flaky Malabar parottas served with rich slow-cooked Nanjil chicken gravy.',
    price: 290,
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=1200&auto=format&fit=crop',
    category: 'Kanyakumari Specials',
    veg: false,
    spiceLevel: 2,
    rating: 4.9,
    isKanyakumariSpecial: true,
    isAvailable: true,
    ingredients: ['Layered Parotta', 'Chicken Curry', 'Coconut Milk'],
    addOns: [{ name: 'Extra Parotta', price: 25 }]
  },
  {
    name: 'Coastal Special Prawn Roast',
    description: 'Juicy coastal prawns pan-roasted with spicy Nanjil masala, shallots & fresh curry leaves.',
    price: 450,
    image: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?q=80&w=1200&auto=format&fit=crop',
    category: 'Kanyakumari Specials',
    veg: false,
    spiceLevel: 3,
    rating: 4.88,
    isKanyakumariSpecial: true,
    isAvailable: true,
    ingredients: ['Jumbo Prawns', 'Nanjil Spice Blend', 'Coconut Slices', 'Curry Leaves'],
    addOns: [{ name: 'Extra Coconut Paste', price: 35 }]
  },

  // BURGERS
  {
    name: 'Smokey BBQ Beef-Style Burger',
    description: 'Charbroiled juicy patty, crispy onion rings, Applewood smoked BBQ glaze & melted Swiss cheese.',
    price: 320,
    image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?q=80&w=1200&auto=format&fit=crop',
    category: 'Burgers',
    veg: false,
    spiceLevel: 1,
    rating: 4.7,
    isPopular: true,
    isAvailable: true,
    ingredients: ['Juicy Patty', 'Onion Rings', 'Swiss Cheese', 'BBQ Sauce'],
    addOns: [{ name: 'Extra Patty', price: 90 }]
  },
  {
    name: 'Double Cheese Veggie Smash Burger',
    description: 'Plant-based smash patty, double sharp cheddar, caramelised onions & secret burger sauce.',
    price: 249,
    image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=1200&auto=format&fit=crop',
    category: 'Burgers',
    veg: true,
    spiceLevel: 1,
    rating: 4.6,
    isAvailable: true,
    ingredients: ['Plant Patty', 'Cheddar Cheese', 'Caramelised Onions'],
    addOns: [{ name: 'Extra Cheese Slice', price: 35 }]
  },

  // CHICKEN
  {
    name: 'Peri Peri Crispy Chicken Tenders',
    description: 'Golden buttermilk fried chicken tenders dusted with African Peri Peri spice blend & ranch dip.',
    price: 310,
    image: 'https://images.unsplash.com/photo-1562967914-608f82629710?q=80&w=1200&auto=format&fit=crop',
    category: 'Chicken',
    veg: false,
    spiceLevel: 3,
    rating: 4.8,
    isPopular: true,
    isAvailable: true,
    ingredients: ['Chicken Tenders', 'Buttermilk', 'Peri Peri Spice', 'Ranch Sauce'],
    addOns: [{ name: 'Extra Peri Peri Dip', price: 25 }]
  },
  {
    name: 'Firecracker Naga Reaper Wings',
    description: 'Extreme heat wings coated in authentic ghost pepper and Naga chilli reduction.',
    price: 390,
    image: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?q=80&w=1200&auto=format&fit=crop',
    category: 'Chicken',
    veg: false,
    spiceLevel: 4,
    rating: 4.75,
    isPopular: true,
    isAvailable: true,
    ingredients: ['Wings', 'Naga Chilli', 'Ghost Pepper', 'Lime Juice'],
    addOns: [{ name: 'Cooling Sour Cream Dip', price: 30 }]
  },

  // RICE & MEALS
  {
    name: 'Hyderabadi Dum Chicken Biryani',
    description: 'Long-grain basmati rice cooked on slow dum with saffron, mint, whole spices & succulent chicken.',
    price: 480,
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=1200&auto=format&fit=crop',
    category: 'Meals',
    veg: false,
    spiceLevel: 2,
    rating: 4.9,
    isPopular: true,
    isAvailable: true,
    ingredients: ['Basmati Rice', 'Chicken', 'Saffron', 'Mint', 'Ghee', 'Raita'],
    addOns: [{ name: 'Extra Mirchi Ka Salan', price: 40 }, { name: 'Raita Dip', price: 25 }]
  },
  {
    name: 'Royal Malabar Mutton Biryani',
    description: 'Kaima rice biryani dum-cooked with tender mutton pieces, cashew nuts, raisins & fragrant ghee.',
    price: 540,
    image: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?q=80&w=1200&auto=format&fit=crop',
    category: 'Meals',
    veg: false,
    spiceLevel: 2,
    rating: 4.95,
    isPopular: true,
    isAvailable: true,
    ingredients: ['Kaima Rice', 'Tender Mutton', 'Ghee', 'Cashew & Raisins'],
    addOns: [{ name: 'Extra Date Pickle', price: 20 }]
  },

  // JUICES & COOLERS
  {
    name: 'Fresh Lime Soda',
    description: 'Chilled sparkling soda infused with freshly squeezed Key lime, garden mint & Himalayan pink rock salt.',
    price: 110,
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=1200&auto=format&fit=crop',
    category: 'Juices',
    veg: true,
    spiceLevel: 0,
    rating: 4.8,
    isJuice: true,
    isAvailable: true,
    ingredients: ['Fresh Lime', 'Sparkling Soda', 'Mint', 'Himalayan Salt'],
    addOns: []
  },
  {
    name: 'Cold-Pressed Watermelon Juice',
    description: '100% pure cold-pressed red watermelon juice with crushed garden mint and lemon splash.',
    price: 140,
    image: 'https://images.unsplash.com/photo-1589733955941-5eeaf752f6dd?q=80&w=1200&auto=format&fit=crop',
    category: 'Juices',
    veg: true,
    spiceLevel: 0,
    rating: 4.85,
    isPopular: true,
    isJuice: true,
    isAvailable: true,
    ingredients: ['Fresh Watermelon', 'Garden Mint', 'Lemon Juice'],
    addOns: []
  },
  {
    name: 'Fresh Alphonso Mango Juice',
    description: 'Thick, velvety sweet mango pulp blended fresh with chilled milk or ice.',
    price: 160,
    image: 'https://images.unsplash.com/photo-1546173159-315724a31696?q=80&w=1200&auto=format&fit=crop',
    category: 'Juices',
    veg: true,
    spiceLevel: 0,
    rating: 4.9,
    isPopular: true,
    isJuice: true,
    isAvailable: true,
    ingredients: ['Alphonso Mango', 'Chilled Milk', 'Pistachio Flakes'],
    addOns: [{ name: 'Vanilla Gelato Scoop', price: 40 }]
  },

  // DESSERTS
  {
    name: 'Belgian Dark Chocolate Lava Cake',
    description: 'Warm dark chocolate sponge cake with molten Belgian cocoa centre, served with Madagascar vanilla ice cream.',
    price: 320,
    image: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?q=80&w=1200&auto=format&fit=crop',
    category: 'Desserts',
    veg: true,
    spiceLevel: 0,
    rating: 4.95,
    isPopular: true,
    isDessert: true,
    isAvailable: true,
    ingredients: ['Belgian Dark Chocolate', 'Butter', 'Eggs', 'Vanilla Ice Cream'],
    addOns: [{ name: 'Extra Vanilla Scoop', price: 50 }]
  },
  {
    name: 'Classic New York Cheesecake',
    description: 'Silky smooth baked cream cheese over a buttery graham cracker crust, topped with wild berry compote.',
    price: 340,
    image: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?q=80&w=1200&auto=format&fit=crop',
    category: 'Desserts',
    veg: true,
    spiceLevel: 0,
    rating: 4.92,
    isPopular: true,
    isDessert: true,
    isAvailable: true,
    ingredients: ['Cream Cheese', 'Graham Crust', 'Wild Berry Compote'],
    addOns: [{ name: 'Extra Berry Compote', price: 40 }]
  }
];

async function seedData(forceReset = false) {
  const existing = await dbStore.countRestaurants();
  if (existing > 0 && !forceReset) {
    const rest = (await dbStore.getRestaurants())[0];
    if (rest) {
      // Re-seed items to ensure all rich foods are present
      await dbStore.insertMenuItems(defaultItems.map((i) => ({ ...i, restaurant: rest._id })));
    }
    return;
  }

  if (forceReset) {
    await dbStore.clearAll();
  }

  const restaurant = await dbStore.createRestaurant(defaultRestaurant);
  await dbStore.insertMenuItems(defaultItems.map((i) => ({ ...i, restaurant: restaurant._id })));

  console.log('[dinevo] Seeded default restaurant & enriched menu items.');
  console.log(`[dinevo] Restaurant ID: ${restaurant._id}`);
}

module.exports = { seedData, defaultItems, defaultRestaurant };
