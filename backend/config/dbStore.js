const mongoose = require('mongoose');
const RestaurantModel = require('../models/Restaurant');
const MenuItemModel = require('../models/MenuItem');
const OrderModel = require('../models/Order');
const DiningSessionModel = require('../models/DiningSession');
const PaymentModel = require('../models/Payment');

let isConnected = false;

// In-Memory fallback data store
const memoryDb = {
  restaurants: [],
  menuItems: [],
  sessions: [],
  orders: [],
  payments: []
};

function generateId() {
  return Array.from({ length: 12 }, () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')).join('');
}

function generateSessionCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'D';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function generateServingCode() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

function cleanStr(str) {
  return (str || '').toString().toUpperCase().replace(/[^A-Z0-9]/g, '');
}

const dbStore = {
  setConnected(status) {
    isConnected = status;
  },
  isDbConnected() {
    return isConnected && mongoose.connection.readyState === 1;
  },

  // RESTAURANTS
  async getRestaurants() {
    if (this.isDbConnected()) {
      return await RestaurantModel.find().lean();
    }
    return memoryDb.restaurants;
  },

  async getRestaurantById(id) {
    if (isConnected) {
      return await RestaurantModel.findById(id).lean();
    }
    return memoryDb.restaurants.find((r) => r._id.toString() === id.toString()) || null;
  },

  async findRestaurantByTableCode(code) {
    const rawUpper = (code || '').trim().toUpperCase();
    const targetClean = cleanStr(code);

    let restaurants = [];
    if (isConnected) {
      restaurants = await RestaurantModel.find().lean();
    } else {
      restaurants = memoryDb.restaurants;
    }

    if (!restaurants || restaurants.length === 0) return null;

    const exact = restaurants.find(
      (r) => r.tables && r.tables.some((t) => t.code && t.code.trim().toUpperCase() === rawUpper)
    );
    if (exact) return exact;

    const cleanMatch = restaurants.find(
      (r) =>
        r.tables &&
        r.tables.some(
          (t) => cleanStr(t.code) === targetClean || cleanStr(t.tableNumber) === targetClean
        )
    );
    if (cleanMatch) return cleanMatch;

    return restaurants[0];
  },

  async countRestaurants() {
    if (isConnected) {
      return await RestaurantModel.countDocuments();
    }
    return memoryDb.restaurants.length;
  },

  async createRestaurant(data) {
    if (isConnected) {
      return await RestaurantModel.create(data);
    }
    const doc = { ...data, _id: generateId(), createdAt: new Date(), updatedAt: new Date() };
    memoryDb.restaurants.push(doc);
    return doc;
  },

  // SESSIONS
  async createDiningSession(tableCode) {
    const restaurant = await this.findRestaurantByTableCode(tableCode);
    if (!restaurant) {
      throw new Error('Invalid table QR code');
    }

    const cleanCode = (tableCode || '').trim().toUpperCase();
    const targetClean = cleanStr(tableCode);
    const table = restaurant.tables
      ? restaurant.tables.find(
          (t) =>
            t.code.toUpperCase() === cleanCode ||
            cleanStr(t.code) === targetClean ||
            cleanStr(t.tableNumber) === targetClean
        )
      : null;

    const tableNumber = table ? table.tableNumber : '08';
    const sessionCode = generateSessionCode();

    const sessionData = {
      sessionCode,
      restaurant: restaurant._id,
      tableNumber,
      tableCode: cleanCode,
      isActive: true
    };

    if (isConnected) {
      await DiningSessionModel.create(sessionData);
    } else {
      memoryDb.sessions.push({ ...sessionData, _id: generateId(), createdAt: new Date() });
    }

    return {
      sessionCode,
      tableNumber,
      tableCode: cleanCode,
      restaurantId: restaurant._id,
      restaurantName: restaurant.name,
      tagline: restaurant.tagline,
      coverImage: restaurant.coverImage,
      address: restaurant.address,
      verified: true
    };
  },

  async getSessionByCode(sessionCode) {
    const codeUpper = (sessionCode || '').trim().toUpperCase();
    if (isConnected) {
      const session = await DiningSessionModel.findOne({ sessionCode: codeUpper }).populate('restaurant').lean();
      if (!session) return null;
      return {
        sessionCode: session.sessionCode,
        tableNumber: session.tableNumber,
        tableCode: session.tableCode,
        restaurantId: session.restaurant._id,
        restaurantName: session.restaurant.name,
        tagline: session.restaurant.tagline,
        verified: true
      };
    }

    const s = memoryDb.sessions.find((x) => x.sessionCode.toUpperCase() === codeUpper && x.isActive);
    if (!s) return null;
    const restaurant = memoryDb.restaurants.find((r) => r._id.toString() === s.restaurant.toString());
    return {
      sessionCode: s.sessionCode,
      tableNumber: s.tableNumber,
      tableCode: s.tableCode,
      restaurantId: s.restaurant,
      restaurantName: restaurant ? restaurant.name : 'DINEVO Kitchen',
      tagline: restaurant ? restaurant.tagline : 'Digital Ordering',
      verified: true
    };
  },

  // FOODS / MENU
  async getMenuItems(filter = {}) {
    if (this.isDbConnected()) {
      const query = MenuItemModel.find(filter);
      return await query.sort({ category: 1, name: 1 }).lean();
    }

    let items = [...memoryDb.menuItems];
    if (filter.restaurant) {
      const matched = items.filter((i) => i.restaurant && i.restaurant.toString() === filter.restaurant.toString());
      if (matched.length > 0) {
        items = matched;
      }
    }
    if (filter.category) {
      const catLower = filter.category.toLowerCase();
      if (catLower === 'popular') {
        items = items.filter((i) => i.isPopular);
      } else if (catLower === 'signature') {
        items = items.filter((i) => i.isSignature || (i.category && i.category.toLowerCase() === 'signature'));
      } else if (catLower === 'spicy') {
        items = items.filter((i) => i.isSpicy || i.spiceLevel > 1 || (i.category && i.category.toLowerCase() === 'spicy'));
      } else {
        items = items.filter((i) => i.category && i.category.toLowerCase() === catLower);
      }
    }
    if (filter.isAvailable !== undefined) {
      items = items.filter((i) => i.isAvailable === filter.isAvailable);
    }
    return items.sort((a, b) => (a.category || '').localeCompare(b.category || '') || (a.name || '').localeCompare(b.name || ''));
  },

  async getMenuItemById(id) {
    if (isConnected) {
      return await MenuItemModel.findById(id).lean();
    }
    return memoryDb.menuItems.find((i) => i._id.toString() === id.toString()) || null;
  },

  async insertMenuItems(items) {
    if (isConnected) {
      return await MenuItemModel.insertMany(items);
    }
    const docs = items.map((i) => ({
      ...i,
      _id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    }));
    memoryDb.menuItems.push(...docs);
    return docs;
  },

  async countMenuItems() {
    if (this.isDbConnected()) {
      return await MenuItemModel.countDocuments({});
    }
    return memoryDb.menuItems.length;
  },


  // ORDERS WITH BACKEND PRICE VALIDATION
  async createOrder({ restaurantId, tableNumber, sessionCode, items, customerNote }) {
    if (!tableNumber || !items || !Array.isArray(items) || items.length === 0) {
      throw new Error('Cart is empty or missing required order fields');
    }

    let targetRestId = restaurantId;
    if (!targetRestId) {
      const defaultRest = await this.findRestaurantByTableCode(`DINEVO-T${tableNumber || '01'}`);
      if (defaultRest) targetRestId = defaultRest._id;
    }

    const validatedItems = [];
    let subtotal = 0;

    for (const rawItem of items) {
      let food = null;
      if (rawItem.menuItem) {
        food = await this.getMenuItemById(rawItem.menuItem);
      }
      if (!food && rawItem.name) {
        if (this.isDbConnected()) {
          food = await MenuItemModel.findOne({ name: new RegExp('^' + rawItem.name.trim() + '$', 'i') }).lean();
        } else {
          food = memoryDb.menuItems.find((i) => (i.name || '').trim().toLowerCase() === (rawItem.name || '').trim().toLowerCase());
        }
      }
      if (!food) {
        food = {
          _id: rawItem.menuItem || generateId(),
          name: rawItem.name || 'Gourmet Dish',
          price: Number(rawItem.price) || 250,
          isAvailable: true
        };
      }


      const qty = Math.max(1, Number(rawItem.quantity) || 1);
      const basePrice = Number(food.price);
      let addOnsTotal = 0;
      const selectedAddOns = [];

      if (rawItem.selectedAddOns && Array.isArray(rawItem.selectedAddOns)) {
        for (const addOnReq of rawItem.selectedAddOns) {
          const match = food.addOns ? food.addOns.find((a) => a.name === addOnReq.name) : null;
          if (match) {
            addOnsTotal += Number(match.price);
            selectedAddOns.push({ name: match.name, price: Number(match.price) });
          }
        }
      }

      const unitPrice = basePrice + addOnsTotal;
      const itemSubtotal = unitPrice * qty;
      subtotal += itemSubtotal;

      const spiceText =
        rawItem.spiceLevel || (food.spiceLevel === 0 ? 'Mild' : food.spiceLevel === 1 ? 'Mild' : food.spiceLevel === 2 ? 'Medium' : food.spiceLevel === 3 ? 'Hot' : 'Extra Hot');

      validatedItems.push({
        menuItem: food._id,
        name: food.name,
        price: unitPrice,
        quantity: qty,
        spiceLevel: spiceText,
        addOns: selectedAddOns,
        notes: rawItem.notes || ''
      });
    }

    const tax = Math.round(subtotal * 0.05 * 100) / 100;
    const total = Math.round((subtotal + tax) * 100) / 100;

    const sessionStr = sessionCode || generateSessionCode();
    const orderNumber = `DINEVO-${Math.floor(1000 + Math.random() * 9000)}`;
    const servingCode = generateServingCode();

    const orderDoc = {
      orderNumber,
      restaurant: targetRestId || restaurantId,
      restaurantId: targetRestId || restaurantId,
      tableNumber,

      tableCode: `DINEVO-T${tableNumber}`,
      sessionCode: sessionStr,
      items: validatedItems,
      subtotal,
      tax,
      total,
      totalAmount: total,
      paymentStatus: 'PAID',
      status: 'received',
      servingCode,
      rating: 0,
      customerFeedback: customerNote || ''
    };

    if (isConnected) {
      return await OrderModel.create(orderDoc);
    }

    const newOrder = {
      ...orderDoc,
      _id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    memoryDb.orders.push(newOrder);
    return newOrder;
  },

  async getOrderById(id) {
    if (isConnected) {
      return await OrderModel.findById(id).lean();
    }
    return memoryDb.orders.find((o) => o._id.toString() === id.toString() || o.orderNumber === id) || null;
  },

  async getAllOrders() {
    if (isConnected) {
      return await OrderModel.find().sort({ createdAt: -1 }).lean();
    }
    return [...memoryDb.orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  // PAYMENT FLOW
  async createPaymentSession(orderId, options = 'UPI') {
    const order = await this.getOrderById(orderId);
    if (!order) throw new Error('Order not found');

    const method = typeof options === 'string' ? options : (options.method || 'UPI');
    const tipAmount = typeof options === 'object' && options.tipAmount ? Number(options.tipAmount) : 0;
    const bankName = typeof options === 'object' ? options.bankName : null;
    const customerPhone = typeof options === 'object' ? options.customerPhone : null;

    const timestampStr = Date.now().toString();
    const txnId = `TXN-${timestampStr.slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;
    const utr = `UTR${timestampStr.slice(-8)}${Math.floor(10000 + Math.random() * 90000)}`;

    const totalPaid = Math.round((order.total + tipAmount) * 100) / 100;

    const paymentDoc = {
      order: order._id,
      orderNumber: order.orderNumber,
      sessionCode: order.sessionCode,
      tableNumber: order.tableNumber,
      amount: totalPaid,
      subtotal: order.subtotal,
      tax: order.tax,
      tipAmount,
      provider: method.toUpperCase().includes('RAZOR') ? 'RAZORPAY_GATEWAY' : 'DINEVO_POS_GATEWAY',
      method,
      bankName,
      status: 'SUCCESS',
      transactionId: txnId,
      utrNumber: utr,
      customerPhone,
      createdAt: new Date()
    };

    let createdPayment = null;
    if (isConnected) {
      createdPayment = (await PaymentModel.create(paymentDoc)).toObject();
    } else {
      createdPayment = { ...paymentDoc, _id: generateId() };
      memoryDb.payments.push(createdPayment);
    }

    const updatedOrder = await this.verifyPayment(order._id, txnId, utr);
    const receipt = await this.generateReceiptData(order._id);

    return {
      payment: createdPayment,
      order: updatedOrder,
      receipt
    };
  },

  async getPaymentByOrderId(orderId) {
    if (isConnected) {
      return await PaymentModel.findOne({ order: orderId }).sort({ createdAt: -1 }).lean();
    }
    return memoryDb.payments.find((p) => p.order.toString() === orderId.toString()) || null;
  },

  async verifyPayment(orderId, transactionId, utrNumber) {
    const utr = utrNumber || `UTR${Date.now().toString().slice(-8)}${Math.floor(10000 + Math.random() * 90000)}`;
    if (isConnected) {
      const order = await OrderModel.findByIdAndUpdate(
        orderId,
        { paymentStatus: 'PAID', status: 'CONFIRMED', transactionId, utrNumber: utr },
        { new: true }
      ).lean();
      return order;
    }

    const order = memoryDb.orders.find((o) => o._id.toString() === orderId.toString());
    if (order) {
      order.paymentStatus = 'PAID';
      order.status = 'CONFIRMED';
      order.transactionId = transactionId;
      order.utrNumber = utr;
      order.updatedAt = new Date();
      return order;
    }
    return null;
  },

  async generateReceiptData(orderId) {
    const order = await this.getOrderById(orderId);
    if (!order) return null;

    const payment = await this.getPaymentByOrderId(orderId);
    const restaurant = await this.getRestaurantById(order.restaurantId || order.restaurant);

    const cgst = Math.round((order.tax / 2) * 100) / 100;
    const sgst = Math.round((order.tax / 2) * 100) / 100;

    return {
      receiptNumber: `INV-${order.orderNumber}`,
      orderId: order._id,
      orderNumber: order.orderNumber,
      tableNumber: order.tableNumber,
      sessionCode: order.sessionCode,
      restaurantName: restaurant?.name || 'DINEVO Kitchen & Bar',
      restaurantAddress: restaurant?.address || '124 Luxury Promenade, Grand Culinary Plaza',
      gstin: restaurant?.gstin || '27AABCD1234E1Z5',
      date: order.createdAt || new Date(),
      items: order.items || [],
      subtotal: order.subtotal,
      cgst,
      sgst,
      totalTax: order.tax,
      tipAmount: payment?.tipAmount || 0,
      grandTotal: (payment?.amount || order.total),
      paymentMethod: payment?.method || 'UPI',
      paymentStatus: 'PAID',
      transactionId: payment?.transactionId || order.transactionId || `TXN-${Date.now().toString().slice(-6)}`,
      utrNumber: payment?.utrNumber || order.utrNumber || `UTR${Date.now().toString().slice(-8)}`
    };
  },

  // STATUS LIFE-CYCLE CONTROL
  async updateOrderStatus(id, newStatus, servingCodeInput = null) {
    const allowedTransitions = {
      received: ['confirmed', 'preparing', 'ready', 'served', 'CONFIRMED', 'PREPARING', 'CANCELLED'],
      confirmed: ['preparing', 'ready', 'served', 'PREPARING', 'CANCELLED'],
      preparing: ['ready', 'served', 'READY', 'CANCELLED'],
      ready: ['served', 'SERVED', 'CANCELLED'],
      served: ['completed', 'COMPLETED'],
      PENDING_PAYMENT: ['PAID', 'CONFIRMED', 'confirmed', 'CANCELLED'],
      PAID: ['CONFIRMED', 'confirmed', 'PREPARING', 'preparing', 'CANCELLED'],
      CONFIRMED: ['PREPARING', 'preparing', 'CANCELLED'],
      PREPARING: ['READY', 'ready', 'CANCELLED'],
      READY: ['SERVED', 'served', 'CANCELLED'],
      SERVED: ['COMPLETED', 'completed'],
      COMPLETED: [],
      CANCELLED: []
    };

    const order = await this.getOrderById(id);
    if (!order) throw new Error('Order not found');

    const current = order.status;
    const allowedNext = allowedTransitions[current] || [];

    if (!allowedNext.includes(newStatus)) {
      throw new Error(`Cannot transition order status from '${current}' to '${newStatus}'`);
    }

    // Serving security check
    if (newStatus === 'SERVED' && servingCodeInput) {
      if (servingCodeInput.toString().trim() !== order.servingCode.toString().trim()) {
        throw new Error(`Invalid Serving Code. Provided '${servingCodeInput}', required '${order.servingCode}'`);
      }
    }

    if (isConnected) {
      return await OrderModel.findByIdAndUpdate(order._id, { status: newStatus }, { new: true }).lean();
    }

    order.status = newStatus;
    order.updatedAt = new Date();
    return order;
  },

  async rateOrder(id, rating, feedback = '') {
    if (isConnected) {
      return await OrderModel.findByIdAndUpdate(id, { rating, customerFeedback: feedback }, { new: true }).lean();
    }
    const order = memoryDb.orders.find((o) => o._id.toString() === id.toString());
    if (order) {
      order.rating = rating;
      order.customerFeedback = feedback;
      order.updatedAt = new Date();
      return order;
    }
    return null;
  },

  // TABLE & FOOD ADMIN MANAGEMENT
  async getTables() {
    const restaurants = await this.getRestaurants();
    if (!restaurants || restaurants.length === 0) return [];
    return restaurants[0].tables || [];
  },

  async createTable({ tableNumber, code }) {
    const cleanNum = (tableNumber || '').toString().padStart(2, '0');
    const cleanCode = (code || `DINEVO-T${cleanNum}`).trim().toUpperCase();

    if (isConnected) {
      const rest = await RestaurantModel.findOne();
      if (!rest) throw new Error('Restaurant not found');
      rest.tables.push({ tableNumber: cleanNum, code: cleanCode, status: 'Available' });
      await rest.save();
      return rest.tables;
    }

    if (memoryDb.restaurants.length > 0) {
      memoryDb.restaurants[0].tables.push({ tableNumber: cleanNum, code: cleanCode, status: 'Available' });
      return memoryDb.restaurants[0].tables;
    }
    return [];
  },

  async updateTableStatus(tableCode, status) {
    if (isConnected) {
      const rest = await RestaurantModel.findOne();
      if (rest && rest.tables) {
        const tbl = rest.tables.find((t) => t.code === tableCode || t.tableNumber === tableCode);
        if (tbl) {
          tbl.status = status;
          if (status === 'AVAILABLE') {
            tbl.activeSession = null;
          }
          await rest.save();
        }
      }
    } else if (memoryDb.restaurants.length > 0) {
      const rest = memoryDb.restaurants[0];
      if (rest.tables) {
        const tbl = rest.tables.find((t) => t.code === tableCode || t.tableNumber === tableCode);
        if (tbl) {
          tbl.status = status;
          if (status === 'AVAILABLE') {
            tbl.activeSession = null;
          }
        }
      }
    }
  },

  // Atomic table booking — prevents race conditions
  async bookTable(tableCode) {
    const cleanCode = (tableCode || '').trim().toUpperCase();

    if (isConnected) {
      // Use $elemMatch to ensure exact table code and status match the same subdocument
      const result = await RestaurantModel.findOneAndUpdate(
        {
          tables: {
            $elemMatch: {
              code: { $regex: new RegExp(`^${cleanCode}$`, 'i') },
              status: { $regex: /^AVAILABLE$/i }
            }
          }
        },
        {
          $set: {
            'tables.$.status': 'OCCUPIED',
            'tables.$.activeSession': generateSessionCode()
          }
        },
        { new: true }
      );

      if (!result) {
        // Check if table exists at all
        const rest = await RestaurantModel.findOne({
          'tables.code': { $regex: new RegExp(`^${cleanCode}$`, 'i') }
        });
        if (!rest) {
          return { success: false, message: 'Table not found' };
        }
        return { success: false, message: 'Table is already occupied' };
      }

      const table = result.tables.find(
        (t) => t.code && t.code.trim().toUpperCase() === cleanCode
      );
      return { success: true, table, restaurantId: result._id, restaurantName: result.name };
    }

    // In-memory fallback
    if (memoryDb.restaurants.length > 0) {
      const rest = memoryDb.restaurants[0];
      const tbl = rest.tables ? rest.tables.find((t) => t.code && t.code.trim().toUpperCase() === cleanCode) : null;
      if (!tbl) {
        return { success: false, message: 'Table not found' };
      }
      if (tbl.status && tbl.status.toUpperCase() !== 'AVAILABLE') {
        return { success: false, message: 'Table is already occupied' };
      }
      tbl.status = 'OCCUPIED';
      tbl.activeSession = generateSessionCode();
      return { success: true, table: tbl, restaurantId: rest._id, restaurantName: rest.name };
    }

    return { success: false, message: 'No restaurant found' };
  },

  // Release table back to AVAILABLE
  async releaseTable(tableCode) {
    const cleanCode = (tableCode || '').trim().toUpperCase();

    if (isConnected) {
      const result = await RestaurantModel.findOneAndUpdate(
        {
          tables: {
            $elemMatch: {
              code: { $regex: new RegExp(`^${cleanCode}$`, 'i') }
            }
          }
        },
        {
          $set: {
            'tables.$.status': 'AVAILABLE',
            'tables.$.activeSession': null
          }
        },
        { new: true }
      );
      if (!result) return { success: false, message: 'Table not found' };
      const table = result.tables.find((t) => t.code && t.code.trim().toUpperCase() === cleanCode);
      return { success: true, table };
    }

    if (memoryDb.restaurants.length > 0) {
      const rest = memoryDb.restaurants[0];
      const tbl = rest.tables ? rest.tables.find((t) => t.code && t.code.trim().toUpperCase() === cleanCode) : null;
      if (!tbl) return { success: false, message: 'Table not found' };
      tbl.status = 'AVAILABLE';
      tbl.activeSession = null;
      return { success: true, table: tbl };
    }
    return { success: false, message: 'No restaurant found' };
  },

  async mergeTables(sourceCode, targetCode) {
    const cleanSource = (sourceCode || '').trim().toUpperCase();
    const cleanTarget = (targetCode || '').trim().toUpperCase();

    if (isConnected) {
       const rest = await RestaurantModel.findOne();
       if (!rest) return { success: false, message: 'Restaurant not found' };
       const sourceTbl = rest.tables.find(t => t.code.toUpperCase() === cleanSource || t.tableNumber === cleanSource);
       const targetTbl = rest.tables.find(t => t.code.toUpperCase() === cleanTarget || t.tableNumber === cleanTarget);
       
       if (!sourceTbl || !targetTbl) return { success: false, message: 'Table not found' };
       
       sourceTbl.status = targetTbl.status;
       sourceTbl.activeSession = targetTbl.activeSession;
       await rest.save();
       return { success: true, message: 'Tables merged successfully' };
    }
    
    if (memoryDb.restaurants.length > 0) {
       const rest = memoryDb.restaurants[0];
       const sourceTbl = rest.tables.find(t => t.code.toUpperCase() === cleanSource || t.tableNumber === cleanSource);
       const targetTbl = rest.tables.find(t => t.code.toUpperCase() === cleanTarget || t.tableNumber === cleanTarget);
       if (!sourceTbl || !targetTbl) return { success: false, message: 'Table not found' };
       
       sourceTbl.status = targetTbl.status;
       sourceTbl.activeSession = targetTbl.activeSession;
       return { success: true, message: 'Tables merged successfully' };
    }
    
    return { success: false, message: 'No restaurant found' };
  },

  async createFoodItem(data) {
    const rest = (await this.getRestaurants())[0];
    const itemData = {
      ...data,
      restaurant: rest ? rest._id : generateId(),
      price: Number(data.price),
      spiceLevel: Number(data.spiceLevel || 0),
      rating: Number(data.rating || 4.8),
      isAvailable: data.isAvailable !== false
    };

    if (isConnected) {
      return await MenuItemModel.create(itemData);
    }
    const doc = {
      ...itemData,
      _id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    memoryDb.menuItems.push(doc);
    return doc;
  },

  async updateFoodItem(id, updateData) {
    if (isConnected) {
      return await MenuItemModel.findByIdAndUpdate(id, updateData, { new: true }).lean();
    }
    const item = memoryDb.menuItems.find((i) => i._id.toString() === id.toString());
    if (item) {
      Object.assign(item, updateData, { updatedAt: new Date() });
      return item;
    }
    return null;
  },

  async deleteFoodItem(id) {
    if (isConnected) {
      await MenuItemModel.findByIdAndDelete(id);
      return true;
    }
    const index = memoryDb.menuItems.findIndex((i) => i._id.toString() === id.toString());
    if (index !== -1) {
      memoryDb.menuItems.splice(index, 1);
      return true;
    }
    return false;
  },

  async toggleFoodAvailability(id, isAvailable) {
    return await this.updateFoodItem(id, { isAvailable });
  },

  async clearAll() {
    if (isConnected) {
      await RestaurantModel.deleteMany({});
      await MenuItemModel.deleteMany({});
      await OrderModel.deleteMany({});
      await DiningSessionModel.deleteMany({});
      await PaymentModel.deleteMany({});
    }
    memoryDb.restaurants = [];
    memoryDb.menuItems = [];
    memoryDb.sessions = [];
    memoryDb.orders = [];
    memoryDb.payments = [];
  }
};

module.exports = dbStore;

