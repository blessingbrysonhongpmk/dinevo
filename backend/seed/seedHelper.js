const dbStore = require('../config/dbStore');

const defaultRestaurant = {
  name: 'DINEVO Kitchen & Bar',
  tagline: 'Crafted Gourmet Plates & Table QR Ordering',
  coverImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1600&auto=format&fit=crop',
  address: '12 Marina Walk, City Center',
  openingHours: '11:00 AM - 11:30 PM',
  tables: [
    { tableNumber: '01', code: 'DINEVO-T01', status: 'Available' },
    { tableNumber: '02', code: 'DINEVO-T02', status: 'Available' },
    { tableNumber: '03', code: 'DINEVO-T03', status: 'Available' },
    { tableNumber: '04', code: 'DINEVO-T04', status: 'Available' },
    { tableNumber: '05', code: 'DINEVO-T05', status: 'Available' },
    { tableNumber: '08', code: 'DINEVO-T08', status: 'Available' },
    { tableNumber: 'T1', code: 'DV-T1', status: 'Available' },
    { tableNumber: 'T2', code: 'DV-T2', status: 'Available' },
    { tableNumber: 'T3', code: 'DV-T3', status: 'Available' }
  ]
};

const defaultItems = [
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
    ingredients: ['Kingfish', 'Ground Coconut', 'Tamarind', 'Coconut Oil', 'Curry Leaves', 'Matta Rice'],
    allergens: ['Fish'],
    addOns: [
      { name: 'Extra Fish Fry Piece', price: 90 },
      { name: 'Extra Coconut Curry Gravy', price: 40 }
    ]
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
    allergens: ['Fish'],
    addOns: [
      { name: 'Onion & Lemon Salad', price: 25 },
      { name: 'Spicy Green Dip', price: 20 }
    ]
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
    ingredients: ['Bone-in Chicken', 'Crushed Pepper', 'Shallots', 'Curry Leaves', 'Ghee'],
    allergens: [],
    addOns: [
      { name: 'Extra Malabar Parotta (2 pcs)', price: 50 },
      { name: 'Extra Shallot Pepper Sauce', price: 30 }
    ]
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
    isPopular: true,
    isKanyakumariSpecial: true,
    isAvailable: true,
    ingredients: ['Layered Parotta', 'Chicken Curry', 'Coconut Milk', 'Garam Masala'],
    allergens: ['Gluten', 'Dairy'],
    addOns: [
      { name: 'Extra Parotta', price: 25 },
      { name: 'Extra Chicken Piece', price: 60 }
    ]
  },
  {
    name: 'Nanjil Nadu Special Feast Meal',
    description: 'Traditional South Tamil Nadu feast with 7 regional accompaniments, fish curry, sambar, rasam & payasam.',
    price: 420,
    image: 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?q=80&w=1200&auto=format&fit=crop',
    category: 'Kanyakumari Specials',
    veg: false,
    spiceLevel: 2,
    rating: 4.95,
    isKanyakumariSpecial: true,
    isAvailable: true,
    ingredients: ['Matta Rice', 'Fish Curry', 'Sambar', 'Rasam', 'Avial', 'Thoran', 'Payasam'],
    allergens: ['Fish', 'Dairy'],
    addOns: [
      { name: 'Add Fish Fry Dip', price: 70 },
      { name: 'Extra Payasam Bowl', price: 40 }
    ]
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
    allergens: ['Shellfish'],
    addOns: [
      { name: 'Extra Roasted Coconut Paste', price: 35 }
    ]
  },

  // JUICES & COOLERS
  {
    name: 'Fresh Lime Soda',
    description: 'Chilled sparkling soda infused with freshly squeezed Key lime, garden mint & Himalayan pink rock salt.',
    price: 110,
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=1200&auto=format&fit=crop',
    category: 'Juices & Coolers',
    veg: true,
    spiceLevel: 0,
    rating: 4.8,
    isJuice: true,
    isAvailable: true,
    ingredients: ['Fresh Key Lime', 'Sparkling Soda', 'Mint', 'Himalayan Salt'],
    allergens: [],
    addOns: [
      { name: 'Sweet Syrup Boost', price: 15 },
      { name: 'Extra Mint Splash', price: 15 }
    ]
  },
  {
    name: 'Cold-Pressed Watermelon Juice',
    description: '100% pure cold-pressed red watermelon juice with crushed garden mint and lemon splash.',
    price: 140,
    image: 'https://images.unsplash.com/photo-1589733955941-5eeaf752f6dd?q=80&w=1200&auto=format&fit=crop',
    category: 'Juices & Coolers',
    veg: true,
    spiceLevel: 0,
    rating: 4.85,
    isPopular: true,
    isJuice: true,
    isAvailable: true,
    ingredients: ['Fresh Watermelon', 'Garden Mint', 'Lemon Juice'],
    allergens: [],
    addOns: [
      { name: 'Chia Seeds Upgrade', price: 20 }
    ]
  },
  {
    name: 'Fresh Alphonso Mango Juice',
    description: 'Thick, velvety sweet mango pulp blended fresh with chilled milk or ice.',
    price: 160,
    image: 'https://images.unsplash.com/photo-1546173159-315724a31696?q=80&w=1200&auto=format&fit=crop',
    category: 'Juices & Coolers',
    veg: true,
    spiceLevel: 0,
    rating: 4.9,
    isPopular: true,
    isJuice: true,
    isAvailable: true,
    ingredients: ['Alphonso Mango Pulp', 'Chilled Milk', 'Pistachio Flakes'],
    allergens: ['Dairy'],
    addOns: [
      { name: 'Vanilla Gelato Scoop Top', price: 40 }
    ]
  },
  {
    name: 'Tropical Pineapple Juice',
    description: 'Freshly extracted sweet pineapple juice garnished with mint sprig & black salt.',
    price: 140,
    image: 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?q=80&w=1200&auto=format&fit=crop',
    category: 'Juices & Coolers',
    veg: true,
    spiceLevel: 0,
    rating: 4.75,
    isJuice: true,
    isAvailable: true,
    ingredients: ['Fresh Pineapple', 'Black Salt', 'Crushed Ice'],
    allergens: [],
    addOns: [
      { name: 'Extra Ginger Twist', price: 15 }
    ]
  },
  {
    name: 'Fresh Orange Citrus Cooler',
    description: 'Hand-pressed Valencia oranges blended with crushed ice and citrus zest.',
    price: 150,
    image: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?q=80&w=1200&auto=format&fit=crop',
    category: 'Juices & Coolers',
    veg: true,
    spiceLevel: 0,
    rating: 4.8,
    isJuice: true,
    isAvailable: true,
    ingredients: ['Valencia Orange Juice', 'Orange Zest', 'Crushed Ice'],
    allergens: [],
    addOns: []
  },
  {
    name: 'Passion Fruit Mint Cooler',
    description: 'Exotic passion fruit nectar shaken with crushed mint leaves, lime and bubbly soda.',
    price: 180,
    image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?q=80&w=1200&auto=format&fit=crop',
    category: 'Juices & Coolers',
    veg: true,
    spiceLevel: 0,
    rating: 4.88,
    isPopular: true,
    isJuice: true,
    isAvailable: true,
    ingredients: ['Passion Fruit Nectar', 'Mint Leaves', 'Lime Juice', 'Soda'],
    allergens: [],
    addOns: [
      { name: 'Extra Passion Pulp', price: 30 }
    ]
  },
  {
    name: 'Mint Lemon Detox Cooler',
    description: 'Refreshing iced lemon infusion with crushed garden mint, cucumber slices and honey.',
    price: 130,
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=1200&auto=format&fit=crop',
    category: 'Juices & Coolers',
    veg: true,
    spiceLevel: 0,
    rating: 4.7,
    isJuice: true,
    isAvailable: true,
    ingredients: ['Lemon', 'Mint', 'Cucumber', 'Wild Honey'],
    allergens: [],
    addOns: []
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
    ingredients: ['70% Belgian Dark Chocolate', 'Butter', 'Eggs', 'Vanilla Bean Ice Cream'],
    allergens: ['Dairy', 'Gluten', 'Eggs'],
    addOns: [
      { name: 'Extra Vanilla Scoop', price: 50 },
      { name: 'Salted Caramel Drizzle', price: 30 }
    ]
  },
  {
    name: 'Rich Brownie Fudge Sundae',
    description: 'Warm double-fudge chocolate brownie topped with Madagascar vanilla ice cream, hot fudge & toasted walnuts.',
    price: 290,
    image: 'https://images.unsplash.com/photo-1564355808539-22fda35bed7e?q=80&w=1200&auto=format&fit=crop',
    category: 'Desserts',
    veg: true,
    spiceLevel: 0,
    rating: 4.9,
    isDessert: true,
    isAvailable: true,
    ingredients: ['Fudge Brownie', 'Vanilla Ice Cream', 'Hot Fudge', 'Toasted Walnuts'],
    allergens: ['Dairy', 'Gluten', 'Nuts', 'Eggs'],
    addOns: [
      { name: 'Extra Hot Fudge Sauce', price: 35 }
    ]
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
    ingredients: ['Cream Cheese', 'Graham Crust', 'Wild Berry Compote', 'Vanilla'],
    allergens: ['Dairy', 'Gluten', 'Eggs'],
    addOns: [
      { name: 'Extra Berry Compote', price: 40 }
    ]
  },
  {
    name: 'Traditional Caramel Custard',
    description: 'Silky egg custard infused with real vanilla bean and bathed in golden burnt caramel syrup.',
    price: 220,
    image: 'https://images.unsplash.com/photo-1528975604071-b4dc52a2d18c?q=80&w=1200&auto=format&fit=crop',
    category: 'Desserts',
    veg: true,
    spiceLevel: 0,
    rating: 4.78,
    isDessert: true,
    isAvailable: true,
    ingredients: ['Whole Milk', 'Eggs', 'Caramel Syrup', 'Vanilla Bean'],
    allergens: ['Dairy', 'Eggs'],
    addOns: []
  },
  {
    name: 'Artisanal Gelato Dessert Bowl',
    description: 'Trio of handcrafted Italian gelatos (Pistachio, Belgian Dark Chocolate, Mango) served with berry drizzle.',
    price: 280,
    image: 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?q=80&w=1200&auto=format&fit=crop',
    category: 'Desserts',
    veg: true,
    spiceLevel: 0,
    rating: 4.85,
    isDessert: true,
    isAvailable: true,
    ingredients: ['Pistachio Gelato', 'Chocolate Gelato', 'Mango Gelato', 'Berry Drizzle'],
    allergens: ['Dairy', 'Nuts'],
    addOns: [
      { name: 'Waffle Cone Shards', price: 25 }
    ]
  },
  {
    name: 'Velvety Chocolate Mousse',
    description: 'Airy 70% dark chocolate mousse crowned with shaved cocoa and whipped vanilla cream.',
    price: 260,
    image: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?q=80&w=1200&auto=format&fit=crop',
    category: 'Desserts',
    veg: true,
    spiceLevel: 0,
    rating: 4.82,
    isDessert: true,
    isAvailable: true,
    ingredients: ['Dark Chocolate', 'Whipped Cream', 'Cocoa Shavings'],
    allergens: ['Dairy', 'Eggs'],
    addOns: []
  },

  // SIGNATURE
  {
    name: 'Signature Chicken Burger',
    description: 'Double crispy chicken thigh, sharp cheddar, artisan brioche bun, house smoked mayo & pickles.',
    price: 289,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=1200&auto=format&fit=crop',
    category: 'Signature',
    veg: false,
    spiceLevel: 2,
    rating: 4.9,
    isPopular: true,
    isSignature: true,
    isAvailable: true,
    ingredients: ['Brioche Bun', 'Crispy Chicken', 'Cheddar Cheese', 'Smoked Mayo', 'Pickles'],
    allergens: ['Gluten', 'Dairy', 'Eggs'],
    addOns: [
      { name: 'Extra Cheddar Cheese', price: 40 },
      { name: 'Extra House Sauce', price: 25 }
    ]
  },
  {
    name: 'Royal Charcoal Grilled Salmon',
    description: 'Wild Atlantic salmon steak, saffron potato velvet, charred seasonal asparagus & herb butter.',
    price: 690,
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?q=80&w=1200&auto=format&fit=crop',
    category: 'Signature',
    veg: false,
    spiceLevel: 1,
    rating: 4.95,
    isPopular: true,
    isSignature: true,
    isAvailable: true,
    ingredients: ['Atlantic Salmon', 'Saffron Potato', 'Asparagus', 'Herb Butter'],
    allergens: ['Fish', 'Dairy'],
    addOns: [
      { name: 'Extra Lemon Herb Butter', price: 35 }
    ]
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
    ingredients: ['Beef Patty', 'Onion Rings', 'Swiss Cheese', 'BBQ Sauce'],
    allergens: ['Gluten', 'Dairy'],
    addOns: [
      { name: 'Extra Patty', price: 90 },
      { name: 'Extra Swiss Cheese', price: 40 }
    ]
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
    ingredients: ['Plant Patty', 'Cheddar Cheese', 'Caramelised Onions', 'Secret Sauce'],
    allergens: ['Gluten', 'Dairy', 'Soy'],
    addOns: [
      { name: 'Extra Cheese Slice', price: 35 }
    ]
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
    allergens: ['Gluten', 'Dairy'],
    addOns: [
      { name: 'Extra Peri Peri Dip', price: 25 }
    ]
  },

  // RICE & MEALS
  {
    name: 'Hyderabadi Dum Chicken Biryani',
    description: 'Long-grain basmati rice cooked on slow dum with saffron, mint, whole spices & succulent chicken.',
    price: 480,
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=1200&auto=format&fit=crop',
    category: 'Rice & Meals',
    veg: false,
    spiceLevel: 2,
    rating: 4.9,
    isPopular: true,
    isAvailable: true,
    ingredients: ['Basmati Rice', 'Bone-in Chicken', 'Saffron', 'Mint', 'Ghee', 'Raita'],
    allergens: ['Dairy'],
    addOns: [
      { name: 'Extra Mirchi Ka Salan', price: 40 },
      { name: 'Extra Raita Dip', price: 25 }
    ]
  },

  // SPICY
  {
    name: 'Firecracker Naga Reaper Wings',
    description: 'Extreme heat wings coated in authentic ghost pepper and Naga chilli reduction.',
    price: 390,
    image: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?q=80&w=1200&auto=format&fit=crop',
    category: 'Spicy',
    veg: false,
    spiceLevel: 4,
    rating: 4.75,
    isPopular: true,
    isAvailable: true,
    ingredients: ['Wings', 'Naga Chilli', 'Ghost Pepper', 'Lime Juice'],
    allergens: [],
    addOns: [
      { name: 'Cooling Sour Cream Dip', price: 30 }
    ]
  },

  // STARTERS
  {
    name: 'Burrata & Heirloom Tomato Salad',
    description: 'Creamy Italian burrata, slow-roasted heirloom tomatoes, fresh basil oil & sourdough crisp.',
    price: 420,
    image: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?q=80&w=1200&auto=format&fit=crop',
    category: 'Starters',
    veg: true,
    spiceLevel: 0,
    rating: 4.8,
    isAvailable: true,
    ingredients: ['Italian Burrata', 'Heirloom Tomatoes', 'Basil Oil'],
    allergens: ['Dairy', 'Gluten'],
    addOns: []
  },

  // SIDES
  {
    name: 'Loaded Cheese & Jalapeño Fries',
    description: 'Hand-cut potato fries smothered in warm liquid cheddar, pickled jalapeños & crispy shallots.',
    price: 220,
    image: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?q=80&w=1200&auto=format&fit=crop',
    category: 'Sides',
    veg: true,
    spiceLevel: 1,
    rating: 4.5,
    isAvailable: true,
    ingredients: ['Potato Fries', 'Liquid Cheddar', 'Jalapeño Slices'],
    allergens: ['Dairy'],
    addOns: [
      { name: 'Extra Cheese Sauce', price: 40 }
    ]
  }
];

async function seedData(forceReset = false) {
  const existing = await dbStore.countRestaurants();
  if (existing > 0 && !forceReset) {
    const rest = (await dbStore.getRestaurants())[0];
    if (rest) {
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
  console.log('[dinevo] Supported table codes: DINEVO-T01, DINEVO-T02, DINEVO-T03, DINEVO-T04, DINEVO-T05, DINEVO-T08, DV-T1, DV-T2, DV-T3');
}

module.exports = { seedData, defaultItems, defaultRestaurant };
