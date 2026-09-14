// Comprehensive End-to-End Senior Developer & QA Test Suite for Dinevo

async function runTests() {
  const baseUrl = 'http://localhost:5000/api';
  console.log('========================================================');
  console.log('   DINEVO 5-STAR DIGITAL DINING & POS — QA TEST SUITE   ');
  console.log('========================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`[PASS] ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] ${message}`);
      failed++;
    }
  }

  try {
    // 1. Health check
    const health = await (await fetch(`${baseUrl}/health`)).json();
    assert(health.success && health.server === 'running', '1. Backend server health endpoint responds OK');

    // 2. Foods catalog check
    const foods = await (await fetch(`${baseUrl}/foods`)).json();
    assert(Array.isArray(foods) && foods.length === 100, `2. Catalog has exactly 100 items (received ${foods?.length})`);

    const images = foods.map(f => f.image);
    const uniqueImages = new Set(images).size;
    assert(uniqueImages === 100, `3. Zero duplicate images: 100 unique images for 100 items (received ${uniqueImages})`);

    const names = foods.map(f => f.name.trim().toLowerCase());
    const uniqueNames = new Set(names).size;
    assert(uniqueNames === 100, `4. Zero duplicate dishes: 100 unique names (received ${uniqueNames})`);

    const categories = Array.from(new Set(foods.map(f => f.category)));
    assert(categories.length === 12, `5. Exactly 12 luxury culinary categories represented (found: ${categories.join(', ')})`);

    // 3. Tables check
    const tables = await (await fetch(`${baseUrl}/tables`)).json();
    assert(Array.isArray(tables) && tables.length >= 8, `6. Table fleet contains at least 8 tables (found ${tables?.length})`);

    // 4. Table code lookup
    const tableLookup = await (await fetch(`${baseUrl}/tables/code/DINEVO-T01`)).json();
    const tData = tableLookup.data || tableLookup;
    assert(tData.tableNumber === '01' && tData.tableCode === 'DINEVO-T01', '7. Resolved Table 01 details correctly');

    // 5. Table booking & session creation
    const bookRes = await (await fetch(`${baseUrl}/tables/DINEVO-T01/book`, { method: 'PATCH' })).json();
    assert(bookRes.success && bookRes.session && bookRes.session.tableCode === 'DINEVO-T01', '8. Successfully booked Table 01 and attached dining session');
    const sessionCode = bookRes.session.sessionCode;

    // 6. Order creation with backend calculation
    const item1 = foods[0];
    const item2 = foods[1];
    const orderPayload = {
      restaurantId: tData.restaurantId,
      tableNumber: '01',
      sessionCode,
      items: [
        {
          menuItem: item1._id,
          name: item1.name,
          price: item1.price,
          quantity: 2,
          spiceLevel: 'Medium',
          selectedAddOns: item1.addOns && item1.addOns.length > 0 ? [item1.addOns[0]] : [],
          notes: 'Make it extra crisp please'
        },
        {
          menuItem: item2._id,
          name: item2.name,
          price: item2.price,
          quantity: 1,
          spiceLevel: 'Mild',
          selectedAddOns: [],
          notes: ''
        }
      ]
    };

    const orderRes = await (await fetch(`${baseUrl}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderPayload)
    })).json();

    assert(orderRes && orderRes.orderNumber && orderRes.total > 0, `9. Created order ${orderRes.orderNumber} with total ₹${orderRes.total}`);
    assert(orderRes.servingCode && orderRes.servingCode.length === 4, `10. Generated 4-digit serving security code: ${orderRes.servingCode}`);
    const orderId = orderRes._id;

    // 7. Payment flow
    const payRes = await (await fetch(`${baseUrl}/payments/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId,
        method: 'UPI',
        tipAmount: 50,
        customerPhone: '9876543210'
      })
    })).json();

    assert(payRes.success && payRes.receipt, '11. Payment verified successfully and generated tax invoice receipt');
    assert(payRes.receipt.receiptNumber && payRes.receipt.grandTotal > 0, `12. Receipt #${payRes.receipt.receiptNumber} with Grand Total ₹${payRes.receipt.grandTotal}`);

    // 8. Order status progression
    const prepRes = await (await fetch(`${baseUrl}/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'PREPARING' })
    })).json();
    assert(prepRes.status === 'PREPARING', '13. Advanced order status to PREPARING');

    const readyRes = await (await fetch(`${baseUrl}/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'READY' })
    })).json();
    assert(readyRes.status === 'READY', '14. Advanced order status to READY');

    const serveRes = await (await fetch(`${baseUrl}/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'SERVED', servingCode: orderRes.servingCode })
    })).json();
    assert(serveRes.status === 'SERVED', '15. Advanced order status to SERVED with valid 4-digit serving code');

    // 9. Dining experience rating
    const rateRes = await (await fetch(`${baseUrl}/orders/${orderId}/rate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating: 5, feedback: 'Spectacular dining experience! Exceptional truffle and ribeye.' })
    })).json();
    assert(rateRes.rating === 5, '16. Successfully submitted 5-star customer dining review');

    // 10. Customer loyalty
    const custRes = await (await fetch(`${baseUrl}/customers/lookup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '9876543210' })
    })).json();
    assert(custRes.phoneNumber === '9876543210', '17. Customer loyalty profile lookup successful');

    const addPtsRes = await (await fetch(`${baseUrl}/customers/add-points`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '9876543210', pointsToAdd: 150 })
    })).json();
    assert(addPtsRes.loyaltyPoints >= 150, `18. Added loyalty reward points (Current points: ${addPtsRes.loyaltyPoints})`);

    // 11. Table release
    const relRes = await (await fetch(`${baseUrl}/tables/DINEVO-T01/release`, { method: 'PATCH' })).json();
    assert(relRes.success, '19. Released Table 01 back to AVAILABLE state');

  } catch (err) {
    console.error('[FATAL ERROR IN TEST SUITE]:', err);
    failed++;
  }

  console.log('\n========================================================');
  console.log(`   TEST RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log('========================================================\n');
}

runTests();
