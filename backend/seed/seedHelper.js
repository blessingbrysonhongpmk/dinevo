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
  // 1. SIGNATURE / BESTSELLERS
  {
    name: 'Royal Chicken Alfaham Kuzhi Mandhi',
    description: 'Authentic Yemeni slow-cooked basmati Mandhi rice served with charcoal-grilled Alfaham chicken, garlic toum, spicy tomato salsa & fresh salad.',
    price: 520,
    image: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?q=80&w=1200&auto=format&fit=crop',
    category: 'Signature',
    veg: false,
    spiceLevel: 2,
    rating: 4.98,
    isPopular: true,
    isSignature: true,
    isAvailable: true,
    ingredients: ['Mandhi Basmati Rice', 'Alfaham Chicken', 'Garlic Toum', 'Mandhi Salsa'],
    addOns: [{ name: 'Extra Garlic Dip', price: 30 }, { name: 'Extra Mandhi Rice', price: 90 }]
  },
  {
    name: 'Hyderabadi Dum Chicken Biryani',
    description: 'Long-grain basmati rice cooked on slow dum with saffron, mint, whole spices & succulent chicken pieces.',
    price: 290,
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=1200&auto=format&fit=crop',
    category: 'Signature',
    veg: false,
    spiceLevel: 2,
    rating: 4.95,
    isPopular: true,
    isSignature: true,
    isAvailable: true,
    ingredients: ['Basmati Rice', 'Chicken', 'Saffron', 'Mint', 'Ghee'],
    addOns: [{ name: 'Mirchi Ka Salan', price: 40 }, { name: 'Boiled Egg', price: 20 }]
  },

  // 2. BIRYANI
  {
    name: 'Hyderabadi Dum Chicken Biryani',
    description: 'Long-grain basmati rice cooked on slow dum with saffron, mint, whole spices & succulent chicken pieces.',
    price: 290,
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=1200&auto=format&fit=crop',
    category: 'Biryani',
    veg: false,
    spiceLevel: 2,
    rating: 4.92,
    isPopular: true,
    isAvailable: true,
    ingredients: ['Basmati Rice', 'Chicken', 'Saffron', 'Mint', 'Ghee'],
    addOns: [{ name: 'Mirchi Ka Salan', price: 40 }]
  },
  {
    name: 'Royal Malabar Mutton Biryani',
    description: 'Kaima rice biryani dum-cooked with tender mutton pieces, cashew nuts, raisins & fragrant ghee.',
    price: 340,
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=1200&auto=format&fit=crop',
    category: 'Biryani',
    veg: false,
    spiceLevel: 2,
    rating: 4.96,
    isPopular: true,
    isAvailable: true,
    ingredients: ['Kaima Rice', 'Tender Mutton', 'Ghee', 'Cashews'],
    addOns: []
  },
  {
    name: 'Special Egg Biryani',
    description: 'Aromatic saffron basmati rice cooked with boiled eggs, caramelized onions & biryani spices.',
    price: 210,
    image: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?q=80&w=1200&auto=format&fit=crop',
    category: 'Biryani',
    veg: false,
    spiceLevel: 2,
    rating: 4.85,
    isAvailable: true,
    ingredients: ['Basmati Rice', 'Boiled Eggs', 'Ghee', 'Mint'],
    addOns: []
  },
  {
    name: 'Royal Paneer Veg Biryani',
    description: 'Long grain basmati rice dum cooked with cottage cheese cubes, fresh veggies & fragrant cardamoms.',
    price: 220,
    image: 'https://images.unsplash.com/photo-1642821373181-696a54913e93?q=80&w=1200&auto=format&fit=crop',
    category: 'Biryani',
    veg: true,
    spiceLevel: 1,
    rating: 4.88,
    isAvailable: true,
    ingredients: ['Basmati Rice', 'Paneer', 'Green Peas', 'Cardamom'],
    addOns: []
  },

  // 3. MANDI
  {
    name: 'Royal Chicken Alfaham Kuzhi Mandhi',
    description: 'Authentic Yemeni slow-cooked basmati Mandhi rice served with charcoal-grilled Alfaham chicken, garlic toum & salsa.',
    price: 520,
    image: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?q=80&w=1200&auto=format&fit=crop',
    category: 'Mandi',
    veg: false,
    spiceLevel: 2,
    rating: 4.98,
    isPopular: true,
    isSignature: true,
    isAvailable: true,
    ingredients: ['Mandhi Basmati Rice', 'Alfaham Chicken', 'Garlic Toum'],
    addOns: [{ name: 'Extra Garlic Dip', price: 30 }]
  },
  {
    name: 'Mutton Juicy Mandhi Supreme',
    description: 'Melt-in-the-mouth mutton shank cooked in underground pit steam over fragrant Mandhi rice.',
    price: 640,
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1200&auto=format&fit=crop',
    category: 'Mandi',
    veg: false,
    spiceLevel: 2,
    rating: 4.96,
    isPopular: true,
    isAvailable: true,
    ingredients: ['Tender Mutton Shank', 'Basmati Mandhi Rice', 'Garlic Sauce'],
    addOns: []
  },
  {
    name: 'Peri Peri BBQ Alfaham Mandhi',
    description: 'Spicy African Peri Peri quarter chicken grilled over charcoal, served atop butter Mandhi rice.',
    price: 540,
    image: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?q=80&w=1200&auto=format&fit=crop',
    category: 'Mandi',
    veg: false,
    spiceLevel: 3,
    rating: 4.91,
    isAvailable: true,
    ingredients: ['Peri Peri Chicken', 'Mandhi Rice'],
    addOns: []
  },
  {
    name: 'Mixed Meat Feast Mandhi',
    description: 'Feast combination platter of Alfaham Chicken & Mutton over a giant sharing tray of Mandhi rice.',
    price: 680,
    image: 'https://images.unsplash.com/photo-1610057099431-d73a1c9d2f2f?q=80&w=1200&auto=format&fit=crop',
    category: 'Mandi',
    veg: false,
    spiceLevel: 2,
    rating: 4.99,
    isPopular: true,
    isAvailable: true,
    ingredients: ['Mutton Shank', 'Alfaham Chicken', 'Mandhi Rice'],
    addOns: []
  },

  // 4. PAROTTA & GRAVY
  {
    name: 'Kerala Flaky Parotta (2 Pcs)',
    description: 'Authentic multi-layered Kerala parotta baked crisp with pure ghee.',
    price: 45,
    image: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?q=80&w=1200&auto=format&fit=crop',
    category: 'Parotta & Gravy',
    veg: true,
    spiceLevel: 0,
    rating: 4.92,
    isPopular: true,
    isAvailable: true,
    ingredients: ['Refined Flour', 'Pure Ghee', 'Salt'],
    addOns: []
  },
  {
    name: 'Street-style Egg Parotta (2 Pcs)',
    description: 'Soft parottas coated with seasoned pan-fried egg omelette.',
    price: 65,
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=1200&auto=format&fit=crop',
    category: 'Parotta & Gravy',
    veg: false,
    spiceLevel: 1,
    rating: 4.88,
    isAvailable: true,
    ingredients: ['Parotta', 'Farm Fresh Eggs', 'Onions'],
    addOns: []
  },
  {
    name: 'Spicy Chicken Kothu Parotta',
    description: 'Shredded parotta wok-tossed on hot tawa with spiced chicken curry, eggs, onions & curry leaves.',
    price: 160,
    image: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?q=80&w=1200&auto=format&fit=crop',
    category: 'Parotta & Gravy',
    veg: false,
    spiceLevel: 3,
    rating: 4.95,
    isPopular: true,
    isAvailable: true,
    ingredients: ['Shredded Parotta', 'Chicken Gravy', 'Egg', 'Onions'],
    addOns: []
  },
  {
    name: 'Nadan Mutton Kothu Parotta',
    description: 'Flaky parottas minced with tender mutton roast gravy, green chillies & roasted spices.',
    price: 190,
    image: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?q=80&w=1200&auto=format&fit=crop',
    category: 'Parotta & Gravy',
    veg: false,
    spiceLevel: 3,
    rating: 4.96,
    isAvailable: true,
    ingredients: ['Shredded Parotta', 'Mutton Roast', 'Spices'],
    addOns: []
  },
  {
    name: 'Rich Chicken Salna Gravy',
    description: 'Aromatic coconut, poppy seed & chicken stock salna curry perfected for dipping parottas.',
    price: 120,
    image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?q=80&w=1200&auto=format&fit=crop',
    category: 'Parotta & Gravy',
    veg: false,
    spiceLevel: 2,
    rating: 4.89,
    isAvailable: true,
    ingredients: ['Chicken Stock', 'Roasted Coconut', 'Fennel'],
    addOns: []
  },
  {
    name: 'Nadan Mutton Salna Gravy',
    description: 'Deep brown traditional mutton bone broth salna curry with shallots & crushed black pepper.',
    price: 150,
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=1200&auto=format&fit=crop',
    category: 'Parotta & Gravy',
    veg: false,
    spiceLevel: 3,
    rating: 4.93,
    isAvailable: true,
    ingredients: ['Mutton Broth', 'Shallots', 'Black Pepper'],
    addOns: []
  },

  // 5. DOSA & SOUTH INDIAN
  {
    name: 'Crispy Golden Plain Dosa',
    description: 'Paper-thin golden crepe made from fermented rice batter, served with coconut chutney & sambar.',
    price: 60,
    image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?q=80&w=1200&auto=format&fit=crop',
    category: 'Dosa & South Indian',
    veg: true,
    spiceLevel: 0,
    rating: 4.89,
    isPopular: true,
    isAvailable: true,
    ingredients: ['Rice & Urad Dal Batter', 'Coconut Chutney', 'Sambar'],
    addOns: []
  },
  {
    name: 'Traditional Potato Masala Dosa',
    description: 'Crispy dosa stuffed with spiced mustard, curry leaf potato masala filling.',
    price: 90,
    image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?q=80&w=1200&auto=format&fit=crop',
    category: 'Dosa & South Indian',
    veg: true,
    spiceLevel: 1,
    rating: 4.93,
    isPopular: true,
    isAvailable: true,
    ingredients: ['Dosa Batter', 'Spiced Potato Masala', 'Chutneys'],
    addOns: []
  },
  {
    name: 'Aromatic Ghee Roast Dosa',
    description: 'Super crisp paper dosa roasted generously in pure A2 cow ghee.',
    price: 110,
    image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?q=80&w=1200&auto=format&fit=crop',
    category: 'Dosa & South Indian',
    veg: true,
    spiceLevel: 0,
    rating: 4.95,
    isAvailable: true,
    ingredients: ['Dosa Batter', 'Pure Cow Ghee', 'Sambar'],
    addOns: []
  },
  {
    name: 'Spicy Egg Dosa',
    description: 'Hot crisp dosa topped with whisked egg, pepper powder, chopped onions & coriander.',
    price: 120,
    image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?q=80&w=1200&auto=format&fit=crop',
    category: 'Dosa & South Indian',
    veg: false,
    spiceLevel: 2,
    rating: 4.88,
    isAvailable: true,
    ingredients: ['Dosa Batter', 'Whisked Egg', 'Black Pepper'],
    addOns: []
  },
  {
    name: 'Chettinad Chicken Kari Dosa',
    description: 'Thick uttapam-style dosa loaded with spicy Chettinad minced chicken gravy.',
    price: 160,
    image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?q=80&w=1200&auto=format&fit=crop',
    category: 'Dosa & South Indian',
    veg: false,
    spiceLevel: 3,
    rating: 4.96,
    isPopular: true,
    isAvailable: true,
    ingredients: ['Dosa Batter', 'Minced Chicken Curry', 'Onions'],
    addOns: []
  },
  {
    name: 'Steamed Fluffy Idli (3 Pcs)',
    description: 'Soft steamed rice cakes served hot with fresh coconut chutney & tomato chutney.',
    price: 50,
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=1200&auto=format&fit=crop',
    category: 'Dosa & South Indian',
    veg: true,
    spiceLevel: 0,
    rating: 4.85,
    isAvailable: true,
    ingredients: ['Steamed Rice Batter', 'Coconut Chutney'],
    addOns: []
  },
  {
    name: 'Crispy Medu Vada (2 Pcs)',
    description: 'Golden fried lentil donuts crisp on outside, soft inside, served with hot sambar.',
    price: 55,
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=1200&auto=format&fit=crop',
    category: 'Dosa & South Indian',
    veg: true,
    spiceLevel: 1,
    rating: 4.87,
    isAvailable: true,
    ingredients: ['Urad Dal', 'Green Chilly', 'Curry Leaves'],
    addOns: []
  },

  // 6. STARTERS
  {
    name: 'Fiery South Indian Chicken 65',
    description: 'Boneless chicken cubes marinated in red chilli, curry leaves, garlic & deep-fried crisp.',
    price: 220,
    image: 'https://images.unsplash.com/photo-1610057099431-d73a1c9d2f2f?q=80&w=1200&auto=format&fit=crop',
    category: 'Starters',
    veg: false,
    spiceLevel: 3,
    rating: 4.94,
    isPopular: true,
    isAvailable: true,
    ingredients: ['Chicken Cubes', 'Curry Leaves', 'Red Chilli'],
    addOns: []
  },
  {
    name: 'Crispy Fried Chicken Lollipop',
    description: 'Frenched chicken drumettes fried crisp, served with hot garlic dipping sauce.',
    price: 240,
    image: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?q=80&w=1200&auto=format&fit=crop',
    category: 'Starters',
    veg: false,
    spiceLevel: 2,
    rating: 4.91,
    isAvailable: true,
    ingredients: ['Chicken Drumettes', 'Garlic Sauce'],
    addOns: []
  },
  {
    name: 'Nadan Black Pepper Chicken',
    description: 'Country-style chicken tossed dry with crushed Malabar black pepper & caramelized shallots.',
    price: 230,
    image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?q=80&w=1200&auto=format&fit=crop',
    category: 'Starters',
    veg: false,
    spiceLevel: 3,
    rating: 4.88,
    isAvailable: true,
    ingredients: ['Chicken', 'Crushed Pepper', 'Shallots'],
    addOns: []
  },
  {
    name: 'Charred Tandoori Chicken Tikka',
    description: 'Boneless chicken skewers marinated in Kashmiri yoghurt tikka masala & charred in tandoor.',
    price: 260,
    image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?q=80&w=1200&auto=format&fit=crop',
    category: 'Starters',
    veg: false,
    spiceLevel: 2,
    rating: 4.93,
    isAvailable: true,
    ingredients: ['Boneless Chicken', 'Hung Yoghurt', 'Mint Chutney'],
    addOns: []
  },
  {
    name: 'Achari Paneer Tikka',
    description: 'Cottage cheese cubes marinated in tangy pickling spices & roasted over clay coals.',
    price: 210,
    image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?q=80&w=1200&auto=format&fit=crop',
    category: 'Starters',
    veg: true,
    spiceLevel: 1,
    rating: 4.86,
    isAvailable: true,
    ingredients: ['Paneer Cubes', 'Achari Masala', 'Capsicum'],
    addOns: []
  },
  {
    name: 'Crispy Cauliflower Gobi 65',
    description: 'Fresh cauliflower florets coated in spiced batter & deep fried with curry leaves.',
    price: 160,
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=1200&auto=format&fit=crop',
    category: 'Starters',
    veg: true,
    spiceLevel: 2,
    rating: 4.82,
    isAvailable: true,
    ingredients: ['Cauliflower', 'Red Chilli', 'Curry Leaves'],
    addOns: []
  },

  // 7. GRILLS & TANDOOR
  {
    name: 'Smoky Tandoori Full Chicken',
    description: 'Whole chicken marinated overnight in Kashmiri chilli, hung curd & tandoori spices.',
    price: 480,
    image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?q=80&w=1200&auto=format&fit=crop',
    category: 'Grills & Tandoor',
    veg: false,
    spiceLevel: 3,
    rating: 4.97,
    isPopular: true,
    isSignature: true,
    isAvailable: true,
    ingredients: ['Full Chicken', 'Hung Curd', 'Mint Chutney'],
    addOns: [{ name: 'Butter Naan', price: 40 }]
  },
  {
    name: 'Charcoal Grilled Quarter Chicken',
    description: 'Quarter chicken grilled over glowing coals with house barbecue glaze.',
    price: 260,
    image: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?q=80&w=1200&auto=format&fit=crop',
    category: 'Grills & Tandoor',
    veg: false,
    spiceLevel: 2,
    rating: 4.9,
    isAvailable: true,
    ingredients: ['Chicken Quarter', 'House Glaze'],
    addOns: []
  },
  {
    name: 'Spicy Mutton Seekh Kebab',
    description: 'Minced mutton skewers infused with ginger, garlic, coriander & tandoori spices.',
    price: 320,
    image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?q=80&w=1200&auto=format&fit=crop',
    category: 'Grills & Tandoor',
    veg: false,
    spiceLevel: 3,
    rating: 4.94,
    isAvailable: true,
    ingredients: ['Minced Mutton', 'Fresh Coriander', 'Spices'],
    addOns: []
  },
  {
    name: 'Honey Glazed BBQ Chicken',
    description: 'Chicken leg quarters slow roasted over flame with sweet honey BBQ sauce.',
    price: 290,
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=1200&auto=format&fit=crop',
    category: 'Grills & Tandoor',
    veg: false,
    spiceLevel: 2,
    rating: 4.89,
    isAvailable: true,
    ingredients: ['Chicken Leg', 'Honey BBQ Sauce'],
    addOns: []
  },

  // 8. SEAFOOD
  {
    name: 'Kanyakumari Crispy Fish Fry',
    description: 'Fresh catch kingfish marinated in Nanjil red chilli paste & pan fried in coconut oil.',
    price: 280,
    image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?q=80&w=1200&auto=format&fit=crop',
    category: 'Seafood',
    veg: false,
    spiceLevel: 3,
    rating: 4.95,
    isPopular: true,
    isAvailable: true,
    ingredients: ['Kingfish Cutlet', 'Nanjil Spices', 'Coconut Oil'],
    addOns: []
  },
  {
    name: 'Nanjil Coconut Fish Curry',
    description: 'Authentic coastal curry with fresh fish, ground coconut, tamarind & curry leaves.',
    price: 320,
    image: 'https://images.unsplash.com/photo-1516714435131-44d6b64dc6a2?q=80&w=1200&auto=format&fit=crop',
    category: 'Seafood',
    veg: false,
    spiceLevel: 3,
    rating: 4.93,
    isAvailable: true,
    ingredients: ['Fresh Fish', 'Ground Coconut', 'Tamarind'],
    addOns: []
  },
  {
    name: 'Butter Garlic Prawn Fry',
    description: 'Ocean jumbo prawns sautéed with crushed garlic, cream butter & black pepper.',
    price: 340,
    image: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?q=80&w=1200&auto=format&fit=crop',
    category: 'Seafood',
    veg: false,
    spiceLevel: 1,
    rating: 4.97,
    isPopular: true,
    isAvailable: true,
    ingredients: ['Jumbo Prawns', 'Cream Butter', 'Garlic'],
    addOns: []
  },
  {
    name: 'Spicy Chettinad Prawn Masala',
    description: 'Succulent prawns tossed in roasted Chettinad spices, shallots & curry leaves.',
    price: 360,
    image: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?q=80&w=1200&auto=format&fit=crop',
    category: 'Seafood',
    veg: false,
    spiceLevel: 3,
    rating: 4.92,
    isAvailable: true,
    ingredients: ['Prawns', 'Chettinad Masala', 'Shallots'],
    addOns: []
  },

  // 9. KANYAKUMARI SPECIALS
  {
    name: 'Nanjil-style Fish Curry Rice',
    description: 'Authentic Kanyakumari coastal curry cooked with fresh kingfish, coconut & matta rice.',
    price: 340,
    image: 'https://images.unsplash.com/photo-1516714435131-44d6b64dc6a2?q=80&w=1200&auto=format&fit=crop',
    category: 'Kanyakumari Specials',
    veg: false,
    spiceLevel: 3,
    rating: 4.97,
    isPopular: true,
    isSignature: true,
    isAvailable: true,
    ingredients: ['Kingfish', 'Ground Coconut', 'Matta Rice'],
    addOns: []
  },
  {
    name: 'Kanyakumari Crispy Fish Fry',
    description: 'Fresh catch fish cutlet pan-fried in pure coconut oil with crushed spices.',
    price: 280,
    image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?q=80&w=1200&auto=format&fit=crop',
    category: 'Kanyakumari Specials',
    veg: false,
    spiceLevel: 3,
    rating: 4.93,
    isAvailable: true,
    ingredients: ['Fish Cutlet', 'Red Chilli', 'Coconut Oil'],
    addOns: []
  },
  {
    name: 'Nadan Pepper Chicken Fry',
    description: 'Country chicken cooked dry with crushed black pepper & roasted shallots.',
    price: 230,
    image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?q=80&w=1200&auto=format&fit=crop',
    category: 'Kanyakumari Specials',
    veg: false,
    spiceLevel: 3,
    rating: 4.9,
    isAvailable: true,
    ingredients: ['Chicken', 'Black Pepper', 'Shallots'],
    addOns: []
  },
  {
    name: 'Kanyakumari Crab Roast Masala',
    description: 'Fresh sea crab roasted with coastal spices, garlic & thick onion curry.',
    price: 380,
    image: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?q=80&w=1200&auto=format&fit=crop',
    category: 'Kanyakumari Specials',
    veg: false,
    spiceLevel: 4,
    rating: 4.98,
    isPopular: true,
    isAvailable: true,
    ingredients: ['Sea Crab', 'Coastal Spices', 'Garlic'],
    addOns: []
  },

  // 10. JUICES & COOL DRINKS
  {
    name: 'Fresh Key Lime Juice',
    description: 'Natural fresh lime juice served chilled with ice, mint & hint of sea salt.',
    price: 80,
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=1200&auto=format&fit=crop',
    category: 'Juices & Cool Drinks',
    veg: true,
    spiceLevel: 0,
    rating: 4.88,
    isPopular: true,
    isJuice: true,
    isAvailable: true,
    ingredients: ['Fresh Key Lime', 'Crushed Mint', 'Chilled Water'],
    addOns: []
  },
  {
    name: 'Chilled Red Watermelon Juice',
    description: '100% natural cold-pressed watermelon juice splash with lemon.',
    price: 100,
    image: 'https://images.unsplash.com/photo-1589733955941-5eeaf752f6dd?q=80&w=1200&auto=format&fit=crop',
    category: 'Juices & Cool Drinks',
    veg: true,
    spiceLevel: 0,
    rating: 4.85,
    isJuice: true,
    isAvailable: true,
    ingredients: ['Red Watermelon', 'Lemon'],
    addOns: []
  },
  {
    name: 'Fresh Golden Pineapple Juice',
    description: 'Sweet tropical pineapple extract served ice cold.',
    price: 110,
    image: 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?q=80&w=1200&auto=format&fit=crop',
    category: 'Juices & Cool Drinks',
    veg: true,
    spiceLevel: 0,
    rating: 4.9,
    isJuice: true,
    isAvailable: true,
    ingredients: ['Golden Pineapple', 'Ice'],
    addOns: []
  },
  {
    name: 'Cold-Pressed Orange Juice',
    description: 'Freshly squeezed sweet Nagpur oranges with pulpy goodness.',
    price: 120,
    image: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?q=80&w=1200&auto=format&fit=crop',
    category: 'Juices & Cool Drinks',
    veg: true,
    spiceLevel: 0,
    rating: 4.91,
    isJuice: true,
    isAvailable: true,
    ingredients: ['Nagpur Oranges'],
    addOns: []
  },
  {
    name: 'Fresh Alphonso Mango Juice',
    description: 'Thick rich Alphonso mango juice nectar served chilled.',
    price: 130,
    image: 'https://images.unsplash.com/photo-1546173159-315724a31696?q=80&w=1200&auto=format&fit=crop',
    category: 'Juices & Cool Drinks',
    veg: true,
    spiceLevel: 0,
    rating: 4.96,
    isPopular: true,
    isJuice: true,
    isAvailable: true,
    ingredients: ['Alphonso Mango Nectar'],
    addOns: []
  },
  {
    name: 'Virgin Mint Mojito Cooler',
    description: 'Sparkling cooler with muddled garden mint, key lime juice & sugar cane syrup.',
    price: 140,
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=1200&auto=format&fit=crop',
    category: 'Juices & Cool Drinks',
    veg: true,
    spiceLevel: 0,
    rating: 4.94,
    isJuice: true,
    isAvailable: true,
    ingredients: ['Muddled Mint', 'Key Lime', 'Sparkling Soda'],
    addOns: []
  },

  // 11. DESSERTS (Strictly isolated desserts only)
  {
    name: 'Royal Falooda Supreme',
    description: 'Layered dessert with rose syrup, basil seeds, vermicelli, rich rabri & double scoop ice cream.',
    price: 220,
    image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?q=80&w=1200&auto=format&fit=crop',
    category: 'Desserts',
    veg: true,
    spiceLevel: 0,
    rating: 4.96,
    isPopular: true,
    isDessert: true,
    isAvailable: true,
    ingredients: ['Rose Syrup', 'Basil Seeds', 'Rabri', 'Nuts', 'Kesar Ice Cream'],
    addOns: []
  },
  {
    name: 'Double Scoop Vanilla & Mango Ice Cream',
    description: 'Two rich artisanal scoops of Madagascar vanilla & Alphonso mango gelato.',
    price: 120,
    image: 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?q=80&w=1200&auto=format&fit=crop',
    category: 'Desserts',
    veg: true,
    spiceLevel: 0,
    rating: 4.89,
    isDessert: true,
    isAvailable: true,
    ingredients: ['Vanilla Bean', 'Mango Gelato'],
    addOns: []
  },
  {
    name: 'Sizzling Walnut Brownie with Gelato',
    description: 'Hot walnut chocolate brownie served sizzling on cast iron plate with dark chocolate fudge & gelato.',
    price: 240,
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?q=80&w=1200&auto=format&fit=crop',
    category: 'Desserts',
    veg: true,
    spiceLevel: 0,
    rating: 4.95,
    isDessert: true,
    isAvailable: true,
    ingredients: ['Walnut Brownie', 'Chocolate Fudge', 'Vanilla Gelato'],
    addOns: []
  },
  {
    name: 'Belgian Dark Chocolate Lava Cake',
    description: 'Warm dark chocolate sponge cake with molten Belgian cocoa centre & vanilla ice cream.',
    price: 260,
    image: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?q=80&w=1200&auto=format&fit=crop',
    category: 'Desserts',
    veg: true,
    spiceLevel: 0,
    rating: 4.97,
    isPopular: true,
    isDessert: true,
    isAvailable: true,
    ingredients: ['Belgian Dark Chocolate', 'Butter', 'Vanilla Ice Cream'],
    addOns: []
  },
  {
    name: 'Hot Gulab Jamun with Rabri (2 Pcs)',
    description: 'Soft milk solids dumplings fried golden, soaked in rose cardamom syrup & served with rabri.',
    price: 110,
    image: 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?q=80&w=1200&auto=format&fit=crop',
    category: 'Desserts',
    veg: true,
    spiceLevel: 0,
    rating: 4.91,
    isDessert: true,
    isAvailable: true,
    ingredients: ['Milk Solids', 'Cardamom Syrup', 'Rabri'],
    addOns: []
  },
  {
    name: 'Fresh Fruit Salad with Vanilla Ice Cream',
    description: 'Fresh chopped seasonal fruits served with a scoop of Madagascar vanilla gelato.',
    price: 150,
    image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?q=80&w=1200&auto=format&fit=crop',
    category: 'Desserts',
    veg: true,
    spiceLevel: 0,
    rating: 4.88,
    isDessert: true,
    isAvailable: true,
    ingredients: ['Fresh Fruits', 'Vanilla Gelato'],
    addOns: []
  },
  {
    name: 'Traditional Malai Pista Kulfi',
    description: 'Authentic dense frozen kulfi enriched with saffron, cardamom & crushed pistachios.',
    price: 130,
    image: 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?q=80&w=1200&auto=format&fit=crop',
    category: 'Desserts',
    veg: true,
    spiceLevel: 0,
    rating: 4.94,
    isDessert: true,
    isAvailable: true,
    ingredients: ['Concentrated Milk', 'Saffron', 'Pistachios'],
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

