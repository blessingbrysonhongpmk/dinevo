const dbStore = require('../config/dbStore');

const defaultRestaurant = {
  name: 'DINEVO 5-Star Luxury Resort & Bar',
  tagline: 'Gourmet World Cuisine, Arabian Mandhi & Live Table QR POS',
  coverImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1600&auto=format&fit=crop',
  address: '12 Marina Promenade, Five-Star Luxury Zone',
  openingHours: '24 Hours Open',
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
  // 1. ARABIAN MANDHI
  {
    name: 'Royal Chicken Alfaham Kuzhi Mandhi',
    description: 'Authentic Yemeni slow-cooked basmati Mandhi rice served with charcoal-grilled Alfaham chicken, garlic toum, spicy tomato salsa & fresh salad.',
    price: 520,
    image: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?q=80&w=1200&auto=format&fit=crop',
    category: 'Arabian Mandhi',
    veg: false,
    spiceLevel: 2,
    rating: 4.98,
    isPopular: true,
    isSignature: true,
    isAvailable: true,
    ingredients: ['Mandhi Basmati Rice', 'Alfaham Chicken', 'Garlic Toum', 'Mandhi Salsa', 'Fried Nuts'],
    addOns: [{ name: 'Extra Garlic Dip', price: 30 }, { name: 'Extra Mandhi Rice', price: 90 }]
  },
  {
    name: 'Mutton Juicy Mandhi Supreme',
    description: 'Melt-in-the-mouth mutton shank cooked in underground pit steam over fragrant long-grain Mandhi rice with roasted cashew & raisins.',
    price: 640,
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1200&auto=format&fit=crop',
    category: 'Arabian Mandhi',
    veg: false,
    spiceLevel: 2,
    rating: 4.96,
    isPopular: true,
    isSignature: true,
    isAvailable: true,
    ingredients: ['Tender Mutton Shank', 'Basmati Mandhi Rice', 'Garlic Sauce', 'Salsa'],
    addOns: [{ name: 'Extra Mutton Piece', price: 220 }]
  },
  {
    name: 'Peri Peri BBQ Alfaham Mandhi',
    description: 'Spicy African Peri Peri spiced quarter chicken grilled over charcoal, served atop aromatic butter Mandhi rice.',
    price: 540,
    image: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?q=80&w=1200&auto=format&fit=crop',
    category: 'Arabian Mandhi',
    veg: false,
    spiceLevel: 3,
    rating: 4.91,
    isPopular: true,
    isAvailable: true,
    ingredients: ['Peri Peri Chicken', 'Mandhi Rice', 'Spicy Dip'],
    addOns: [{ name: 'Cheese Slice', price: 40 }]
  },

  // 2. ROYAL BIRYANIS
  {
    name: 'Hyderabadi Dum Chicken Biryani',
    description: 'Long-grain basmati rice cooked on slow dum with saffron, mint, whole spices & succulent chicken pieces.',
    price: 480,
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=1200&auto=format&fit=crop',
    category: 'Royal Biryanis',
    veg: false,
    spiceLevel: 2,
    rating: 4.9,
    isPopular: true,
    isAvailable: true,
    ingredients: ['Basmati Rice', 'Chicken', 'Saffron', 'Mint', 'Ghee', 'Raita'],
    addOns: [{ name: 'Mirchi Ka Salan', price: 40 }, { name: 'Boiled Egg', price: 20 }]
  },
  {
    name: 'Royal Malabar Mutton Biryani',
    description: 'Kaima rice biryani dum-cooked with tender mutton pieces, cashew nuts, raisins & fragrant ghee.',
    price: 560,
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=1200&auto=format&fit=crop',
    category: 'Royal Biryanis',
    veg: false,
    spiceLevel: 2,
    rating: 4.95,
    isPopular: true,
    isAvailable: true,
    ingredients: ['Kaima Rice', 'Tender Mutton', 'Ghee', 'Cashews'],
    addOns: []
  },

  {
    name: 'Kanyakumari Special Prawn Biryani',
    description: 'Fresh ocean jumbo prawns tossed with roasted coconut spices, layered with aromatic basmati rice.',
    price: 580,
    image: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?q=80&w=1200&auto=format&fit=crop',
    category: 'Royal Biryanis',
    veg: false,
    spiceLevel: 3,
    rating: 4.92,
    isPopular: true,
    isAvailable: true,
    ingredients: ['Ocean Prawns', 'Nanjil Spices', 'Basmati Rice'],
    addOns: []
  },

  // 3. JUICES & COOLERS
  {
    name: 'Electric Blue Lagoon Mocktail',
    description: 'Refreshing curaçao blue cooler with sparkling soda, fresh Key lime juice, crushed ice & garden mint.',
    price: 160,
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=1200&auto=format&fit=crop',
    category: 'Juices & Coolers',
    veg: true,
    spiceLevel: 0,
    rating: 4.88,
    isPopular: true,
    isJuice: true,
    isAvailable: true,
    ingredients: ['Blue Curaçao Syrup', 'Sparkling Soda', 'Lime Juice', 'Mint'],
    addOns: []
  },
  {
    name: 'Fresh Alphonso Mango Lassi',
    description: 'Thick, creamy yogurt lassi blended with rich Alphonso mango pulp & garnished with pistachio flakes.',
    price: 140,
    image: 'https://images.unsplash.com/photo-1546173159-315724a31696?q=80&w=1200&auto=format&fit=crop',
    category: 'Juices & Coolers',
    veg: true,
    spiceLevel: 0,
    rating: 4.92,
    isPopular: true,
    isJuice: true,
    isAvailable: true,
    ingredients: ['Alphonso Mango', 'Thick Yogurt', 'Cardamom', 'Pistachios'],
    addOns: [{ name: 'Scoop Vanilla Gelato', price: 40 }]
  },
  {
    name: 'Cold-Pressed Red Watermelon Juice',
    description: '100% natural pure chilled watermelon juice with lemon splash & crushed mint leaves.',
    price: 140,
    image: 'https://images.unsplash.com/photo-1589733955941-5eeaf752f6dd?q=80&w=1200&auto=format&fit=crop',
    category: 'Juices & Coolers',
    veg: true,
    spiceLevel: 0,
    rating: 4.85,
    isJuice: true,
    isAvailable: true,
    ingredients: ['Red Watermelon', 'Mint', 'Lemon'],
    addOns: []
  },
  {
    name: 'Creamy Hass Avocado Milkshake',
    description: 'Rich velvety smoothie blended with fresh Mexican Hass avocados, honey & chilled full-cream milk.',
    price: 180,
    image: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?q=80&w=1200&auto=format&fit=crop',
    category: 'Juices & Coolers',
    veg: true,
    spiceLevel: 0,
    rating: 4.94,
    isPopular: true,
    isJuice: true,
    isAvailable: true,
    ingredients: ['Hass Avocado', 'Pure Honey', 'Chilled Milk'],
    addOns: []
  },
  {
    name: 'Signature Cold Coffee with Vanilla Gelato',
    description: 'Double shot dark espresso blended with cream, chocolate drizzle & topped with a scoop of vanilla gelato.',
    price: 170,
    image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?q=80&w=1200&auto=format&fit=crop',
    category: 'Juices & Coolers',
    veg: true,
    spiceLevel: 0,
    rating: 4.89,
    isPopular: true,
    isJuice: true,
    isAvailable: true,
    ingredients: ['Espresso', 'Full Cream Milk', 'Chocolate Sauce', 'Vanilla Ice Cream'],
    addOns: [{ name: 'Extra Espresso Shot', price: 30 }]
  },

  // 4. SNACKS & FINGER FOODS
  {
    name: 'Crispy Peri Peri French Fries',
    description: 'Thick cut potato fries tossed hot with spicy African Peri Peri seasoning & served with garlic aioli.',
    price: 190,
    image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?q=80&w=1200&auto=format&fit=crop',
    category: 'Snacks & Finger Foods',
    veg: true,
    spiceLevel: 2,
    rating: 4.8,
    isPopular: true,
    isAvailable: true,
    ingredients: ['Potato Fries', 'Peri Peri Spice', 'Garlic Aioli'],
    addOns: [{ name: 'Melted Cheese Dip', price: 45 }]
  },
  {
    name: 'Loaded Cheesy Nachos Supreme',
    description: 'Crispy tortilla chips smothered in warm cheese sauce, jalapenos, salsa, sour cream & guacamole.',
    price: 240,
    image: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?q=80&w=1200&auto=format&fit=crop',
    category: 'Snacks & Finger Foods',
    veg: true,
    spiceLevel: 1,
    rating: 4.85,
    isPopular: true,
    isAvailable: true,
    ingredients: ['Tortilla Chips', 'Cheese Sauce', 'Jalapenos', 'Pico de Gallo', 'Guacamole'],
    addOns: [{ name: 'Add Shredded Chicken', price: 60 }]
  },
  {
    name: 'Golden Fried Mozzarella Cheese Balls',
    description: 'Golden panko crusted gooey mozzarella balls served piping hot with fiery marinara dip.',
    price: 220,
    image: 'https://images.unsplash.com/photo-1531749668029-2db88e4276c7?q=80&w=1200&auto=format&fit=crop',
    category: 'Snacks & Finger Foods',
    veg: true,
    spiceLevel: 1,
    rating: 4.88,
    isAvailable: true,
    ingredients: ['Mozzarella Cheese', 'Panko Breadcrumbs', 'Fiery Marinara Dip'],
    addOns: []
  },

  // 5. STARTERS & TANDOORI
  {
    name: 'Firecracker Naga BBQ Wings',
    description: 'Crispy fried chicken wings coated in hot ghost pepper & honey garlic glaze.',
    price: 390,
    image: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?q=80&w=1200&auto=format&fit=crop',
    category: 'Starters & Tandoori',
    veg: false,
    spiceLevel: 4,
    rating: 4.91,
    isPopular: true,
    isAvailable: true,
    ingredients: ['Chicken Wings', 'Naga Chilli Glaze', 'Honey', 'Garlic'],
    addOns: [{ name: 'Cooling Ranch Dip', price: 30 }]
  },
  {
    name: 'Smoky Tandoori Full Chicken',
    description: 'Whole chicken marinated overnight in Kashmiri chilli, hung curd & aromatic tandoori masala, charred in clay oven.',
    price: 480,
    image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?q=80&w=1200&auto=format&fit=crop',
    category: 'Starters & Tandoori',
    veg: false,
    spiceLevel: 3,
    rating: 4.95,
    isPopular: true,
    isSignature: true,
    isAvailable: true,
    ingredients: ['Full Chicken', 'Hung Curd', 'Kashmiri Chilli', 'Mint Chutney'],
    addOns: [{ name: 'Butter Naan', price: 40 }]
  },
  {
    name: 'Paneer Tikka Malai Kebab',
    description: 'Soft cottage cheese cubes marinated in rich cashew cream, green cardamom & roasted in tandoor.',
    price: 320,
    image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?q=80&w=1200&auto=format&fit=crop',
    category: 'Starters & Tandoori',
    veg: true,
    spiceLevel: 1,
    rating: 4.87,
    isAvailable: true,
    ingredients: ['Cottage Cheese', 'Cashew Paste', 'Malai Cream', 'Mint Dip'],
    addOns: []
  },
  {
    name: 'Sesame Honey Dragon Chicken',
    description: 'Crispy chicken strips tossed in spicy red dragon sauce, bell peppers & toasted sesame seeds.',
    price: 340,
    image: 'https://images.unsplash.com/photo-1525755662778-989d0524087e?q=80&w=1200&auto=format&fit=crop',
    category: 'Starters & Tandoori',
    veg: false,
    spiceLevel: 3,
    rating: 4.86,
    isPopular: true,
    isAvailable: true,
    ingredients: ['Chicken Strips', 'Dragon Chilli Sauce', 'Sesame Seeds'],
    addOns: []
  },

  // 6. BURGERS & WRAPS
  {
    name: 'Truffle Wagyu Smash Burger',
    description: 'Double Wagyu beef patty, black truffle aioli, aged English cheddar, crispy shallots on toasted brioche.',
    price: 490,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=1200&auto=format&fit=crop',
    category: 'Burgers & Wraps',
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
    name: 'Smokey BBQ Chicken Zinger Burger',
    description: 'Giant crispy fried chicken fillet, double cheddar, applewood smoked BBQ glaze & dill pickles.',
    price: 320,
    image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?q=80&w=1200&auto=format&fit=crop',
    category: 'Burgers & Wraps',
    veg: false,
    spiceLevel: 2,
    rating: 4.88,
    isPopular: true,
    isAvailable: true,
    ingredients: ['Crispy Chicken Fillet', 'Smokey BBQ Sauce', 'Cheddar Cheese', 'Pickles'],
    addOns: [{ name: 'French Fries Side', price: 60 }]
  },
  {
    name: 'Double Cheese Veggie Smash Burger',
    description: 'Plant-based smash patty, double sharp cheddar, caramelised onions & secret burger sauce.',
    price: 249,
    image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=1200&auto=format&fit=crop',
    category: 'Burgers & Wraps',
    veg: true,
    spiceLevel: 1,
    rating: 4.75,
    isAvailable: true,
    ingredients: ['Plant Patty', 'Cheddar Cheese', 'Caramelised Onions'],
    addOns: [{ name: 'Extra Cheese Slice', price: 35 }]
  },

  // 7. KANYAKUMARI SPECIALS
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
    isAvailable: true,
    ingredients: ['Kingfish', 'Ground Coconut', 'Tamarind', 'Coconut Oil', 'Matta Rice'],
    addOns: [{ name: 'Extra Fish Fry Piece', price: 90 }]
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
    isAvailable: true,
    ingredients: ['Fresh Fish Cutlet', 'Nanjil Chilli Paste', 'Garlic', 'Fennel', 'Coconut Oil'],
    addOns: []
  },
  {
    name: 'Nadan Pepper Chicken Fry',
    description: 'Country-style chicken tossed with crushed black pepper, caramelized shallots, curry leaves & aromatic roasted spices.',
    price: 350,
    image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?q=80&w=1200&auto=format&fit=crop',
    category: 'Kanyakumari Specials',
    veg: false,
    spiceLevel: 3,
    rating: 4.85,
    isAvailable: true,
    ingredients: ['Chicken', 'Crushed Pepper', 'Shallots', 'Curry Leaves'],
    addOns: [{ name: 'Malabar Parotta (2 pcs)', price: 50 }]
  },


  // 8. CONTINENTAL PASTAS & PIZZAS
  {
    name: 'Creamy Truffle Alfredo Fettuccine',
    description: 'Handcrafted fettuccine tossed in rich Parmesan cream sauce, wild porcini mushrooms & black truffle oil.',
    price: 420,
    image: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281464?q=80&w=1200&auto=format&fit=crop',
    category: 'Continental Pastas',
    veg: true,
    spiceLevel: 1,
    rating: 4.92,
    isPopular: true,
    isAvailable: true,
    ingredients: ['Fettuccine', 'Parmesan', 'Truffle Oil', 'Porcini Mushrooms'],
    addOns: [{ name: 'Grilled Chicken Breast', price: 80 }]
  },
  {
    name: 'Wood-Fired Artisanal Margherita Pizza',
    description: 'Neapolitan sourdough crust baked at 900°F with San Marzano tomato sauce, fresh buffalo mozzarella & basil.',
    price: 460,
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?q=80&w=1200&auto=format&fit=crop',
    category: 'Continental Pastas',
    veg: true,
    spiceLevel: 1,
    rating: 4.94,
    isPopular: true,
    isAvailable: true,
    ingredients: ['San Marzano Tomato', 'Buffalo Mozzarella', 'Fresh Basil'],
    addOns: []
  },

  // 9. 5-STAR DESSERTS
  {
    name: 'Belgian Dark Chocolate Lava Cake',
    description: 'Warm dark chocolate sponge cake with molten Belgian cocoa centre, served with Madagascar vanilla ice cream.',
    price: 320,
    image: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?q=80&w=1200&auto=format&fit=crop',
    category: '5-Star Desserts',
    veg: true,
    spiceLevel: 0,
    rating: 4.96,
    isPopular: true,
    isDessert: true,
    isAvailable: true,
    ingredients: ['Belgian Dark Chocolate', 'Butter', 'Eggs', 'Vanilla Ice Cream'],
    addOns: [{ name: 'Extra Vanilla Scoop', price: 50 }]
  },
  {
    name: 'Royal Falooda Supreme',
    description: 'Layered dessert with rose syrup, basil seeds, vermicelli, rich rabri, dry fruit nuts & double scoop ice cream.',
    price: 240,
    image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?q=80&w=1200&auto=format&fit=crop',
    category: '5-Star Desserts',
    veg: true,
    spiceLevel: 0,
    rating: 4.93,
    isPopular: true,
    isDessert: true,
    isAvailable: true,
    ingredients: ['Rose Syrup', 'Basil Seeds', 'Rabri', 'Nuts', 'Kesar Ice Cream'],
    addOns: []
  },
  {
    name: 'Sizzling Walnut Brownie with Gelato',
    description: 'Hot walnut chocolate brownie served sizzling on cast iron plate with dark chocolate ganache & vanilla bean gelato.',
    price: 280,
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?q=80&w=1200&auto=format&fit=crop',
    category: '5-Star Desserts',
    veg: true,
    spiceLevel: 0,
    rating: 4.9,
    isDessert: true,
    isAvailable: true,
    ingredients: ['Walnut Brownie', 'Chocolate Fudge', 'Vanilla Gelato'],
    addOns: []
  },

  // 10. SOUPS & BEVERAGES
  {
    name: 'Sweet Corn Chicken Soup',
    description: 'Rich oriental chicken broth with sweet kernel corn, egg drops & white pepper.',
    price: 180,
    image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?q=80&w=1200&auto=format&fit=crop',
    category: 'Soups & Beverages',
    veg: false,
    spiceLevel: 1,
    rating: 4.82,
    isAvailable: true,
    ingredients: ['Chicken Stock', 'Sweet Corn', 'Egg Ribbon'],
    addOns: []
  },
  {
    name: 'Royal South Indian Filter Coffee',
    description: 'Authentic brass tumbler brass cup filter coffee brewed fresh with peaberry chicory blend & frothy hot milk.',
    price: 80,
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=1200&auto=format&fit=crop',
    category: 'Soups & Beverages',
    veg: true,
    spiceLevel: 0,
    rating: 4.95,
    isPopular: true,
    isAvailable: true,
    ingredients: ['Peaberry Decoction', 'Frothy Milk', 'Jaggery/Sugar'],
    addOns: []
  }
];

const UserModel = require('../models/User');

async function seedAdminUser() {
  try {
    if (dbStore.isDbConnected()) {
      const adminExists = await UserModel.findOne({ email: 'admin@dinevo.com' });
      if (!adminExists) {
        await UserModel.create({
          email: 'admin@dinevo.com',
          password: 'dinevo123',
          name: 'DINEVO Admin',
          role: 'admin'
        });
        console.log('[dinevo] Created admin user in Atlas: admin@dinevo.com / dinevo123');
      } else {
        adminExists.password = 'dinevo123';
        adminExists.role = 'admin';
        await adminExists.save();
        console.log('[dinevo] Verified & synced admin user credentials in Atlas');
      }
    }
  } catch (userErr) {
    console.warn('[dinevo] Admin user seed warning:', userErr.message);
  }
}

async function seedData(forceReset = false) {
  await seedAdminUser();

  const existing = await dbStore.countRestaurants();
  if (existing > 0 && !forceReset) {
    const itemCount = await dbStore.countMenuItems();
    if (itemCount === 0) {
      const rest = (await dbStore.getRestaurants())[0];
      if (rest) {
        await dbStore.insertMenuItems(defaultItems.map((i) => ({ ...i, restaurant: rest._id })));
      }
    } else {
      console.log(`[dinevo] Atlas DB contains ${itemCount} clean unique food items. Skipping duplicate re-seed.`);
    }
    return;
  }


  if (forceReset) {
    await dbStore.clearAll();
  }

  const restaurant = await dbStore.createRestaurant(defaultRestaurant);
  await dbStore.insertMenuItems(defaultItems.map((i) => ({ ...i, restaurant: restaurant._id })));

  console.log('[dinevo] Seeded 5-Star Luxury resort & enriched food menu items.');
  console.log(`[dinevo] Restaurant ID: ${restaurant._id}`);
}

module.exports = { seedData, seedAdminUser, defaultItems, defaultRestaurant };

