import React, { useState, useEffect } from 'react';
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, doc, setDoc, getDoc, updateDoc, query, where } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSy8tI9k7VqskCABCwGMl6OY_PCkuXj80Nxc",
  authDomain: "kaapfi-pos.firebaseapp.com",
  projectId: "kaapfi-pos",
  storageBucket: "kaapfi-pos.firebasestorage.app",
  messagingSenderId: "841260204036",
  appId: "1:841260204036:web:8a614c8b0ff3ac4d81f551",
  measurementId: "G-ZC3CPTHBYG"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const CAFE_PASSWORD = "Kaapfi@737";

const defaultSettings = {
  cafeName: "Kaapfi 90's",
  tagline: "Est. 2025 • Chatrapati Nagar, Nagpur",
  phone: "+91 9307189776",
  address: "Chatrapati Nagar, Nagpur",
  footerText: "Thank you for visiting! Please visit again ☕",
  taxRate: 5,
  loyaltyRate: 100,
  loyaltyPointValue: 5,
  specialLoyaltyVisits: 7,
  specialLoyaltyDays: 15,
  specialLoyaltyDiscount: 15,
  specialLoyaltyStart: "21:00",
  specialLoyaltyEnd: "22:30",
  receiptSize: "80mm",
};

const defaultMenu = [
  { id: 1, name: 'Espresso', price: 50, category: 'Coffee', emoji: '☕' },
  { id: 2, name: 'Americano', price: 60, category: 'Coffee', emoji: '☕' },
  { id: 3, name: 'Cappuccino', price: 80, category: 'Coffee', emoji: '☕' },
  { id: 4, name: 'Latte', price: 100, category: 'Coffee', emoji: '☕' },
  { id: 5, name: 'Mocha', price: 110, category: 'Coffee', emoji: '☕' },
  { id: 6, name: 'Cold Brew', price: 70, category: 'Coffee', emoji: '🧊' },
  { id: 7, name: 'Iced Coffee', price: 60, category: 'Coffee', emoji: '🧊' },
  { id: 8, name: 'Green Tea', price: 40, category: 'Tea', emoji: '🍵' },
  { id: 9, name: 'Black Tea', price: 40, category: 'Tea', emoji: '🫖' },
  { id: 10, name: 'Hot Chocolate', price: 80, category: 'Beverage', emoji: '🍫' },
  { id: 11, name: 'Fresh Juice', price: 50, category: 'Beverage', emoji: '🧃' },
  { id: 12, name: 'Smoothie', price: 100, category: 'Beverage', emoji: '🥤' },
  { id: 13, name: 'Croissant', price: 60, category: 'Pastry', emoji: '🥐' },
  { id: 14, name: 'Muffin', price: 40, category: 'Pastry', emoji: '🧁' },
  { id: 15, name: 'Brownie', price: 50, category: 'Pastry', emoji: '🍫' },
  { id: 16, name: 'Sandwich', price: 120, category: 'Food', emoji: '🥪' },
  { id: 17, name: 'Salad', price: 150, category: 'Food', emoji: '🥗' },
];

// ═══════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════

async function saveOrderToFirebase(order) {
  try {
    await addDoc(collection(db, "orders"), { ...order, timestamp: new Date().toISOString() });
    return true;
  } catch (error) { return false; }
}

async function saveCustomer(phone, orderData) {
  try {
    const customerRef = doc(db, "customers", phone);
    const snap = await getDoc(customerRef);
    const now = new Date().toISOString();
    
    if (snap.exists()) {
      const data = snap.data();
      await updateDoc(customerRef, {
        totalOrders: (data.totalOrders || 0) + 1,
        totalSpent: (data.totalSpent || 0) + orderData.total,
        loyaltyPoints: Math.floor(((data.totalSpent || 0) + orderData.total) / 100),
        visitHistory: [...(data.visitHistory || []), now],
        lastOrder: now,
      });
    } else {
      await setDoc(customerRef, {
        phone,
        name: orderData.customerName,
        totalOrders: 1,
        totalSpent: orderData.total,
        loyaltyPoints: Math.floor(orderData.total / 100),
        visitHistory: [now],
        firstOrder: now,
        lastOrder: now,
      });
    }
    return true;
  } catch (e) { console.error(e); return false; }
}

async function getCustomer(phone) {
  try {
    const snap = await getDoc(doc(db, "customers", phone));
    return snap.exists() ? snap.data() : null;
  } catch (e) { return null; }
}

async function getCustomerOrders(phone) {
  try {
    const q = query(collection(db, "orders"), where("customerPhone", "==", phone));
    const snap = await getDocs(q);
    const orders = [];
    snap.forEach(d => orders.push({ id: d.id, ...d.data() }));
    return orders.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  } catch (e) { return []; }
}

function checkSpecialLoyalty(customerData, settings) {
  if (!customerData || !customerData.visitHistory) return { eligible: false, reason: 'No history' };
  
  const now = new Date();
  const [startH, startM] = settings.specialLoyaltyStart.split(':').map(Number);
  const [endH, endM] = settings.specialLoyaltyEnd.split(':').map(Number);
  const currentMin = now.getHours() * 60 + now.getMinutes();
  const startMin = startH * 60 + startM;
  const endMin = endH * 60 + endM;
  
  if (currentMin < startMin || currentMin > endMin) {
    return { eligible: false, reason: `Only active ${settings.specialLoyaltyStart}-${settings.specialLoyaltyEnd}` };
  }
  
  const cutoff = new Date(now.getTime() - settings.specialLoyaltyDays * 86400000);
  const recentVisits = customerData.visitHistory.filter(t => new Date(t) >= cutoff);
  
  if (recentVisits.length >= settings.specialLoyaltyVisits) {
    return { eligible: true, discountValue: settings.specialLoyaltyDiscount, visits: recentVisits.length };
  }
  return { eligible: false, reason: `Need ${settings.specialLoyaltyVisits} visits in ${settings.specialLoyaltyDays} days (has ${recentVisits.length})` };
}

function generatePromoCode() {
  return 'KF' + Math.random().toString(36).substring(2, 6).toUpperCase();
}

function getAIRecommendation(customerOrders, menu) {
  if (!customerOrders || customerOrders.length === 0) {
    return { message: "Welcome! Try our most popular: Cappuccino ☕", items: [] };
  }
  
  const itemCounts = {};
  customerOrders.forEach(order => {
    (order.items || []).forEach(item => {
      itemCounts[item.name] = (itemCounts[item.name] || 0) + item.quantity;
    });
  });
  
  const favorites = Object.entries(itemCounts).sort((a, b) => b[1] - a[1]).slice(0, 2);
  const favItem = favorites[0]?.[0] || 'Cappuccino';
  
  const pastryUpsell = menu.find(m => m.category === 'Pastry');
  
  return {
    message: `Would you like your usual ${favItem} today? 😊`,
    items: favorites.map(([name]) => name),
    upsell: pastryUpsell ? `Add ${pastryUpsell.name} (₹${pastryUpsell.price})?` : null,
  };
}

function downloadCSV(data, filename) {
  const csv = [
    'Date,Time,Customer,Phone,Items,Subtotal,Discount,Total,Payment',
    ...data.map(o => `"${o.date}","${o.time}","${o.customerName || ''}","${o.customerPhone || ''}","${(o.items || []).map(i => `${i.name} x${i.quantity}`).join('; ')}",${o.subtotal || 0},${o.totalDiscount || 0},${o.total || 0},${o.paymentMethod || ''}`)
  ].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ═══════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════

export default function CafePOS() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginInput, setLoginInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [orders, setOrders] = useState([]);
  const [currentOrder, setCurrentOrder] = useState([]);
  const [activeTab, setActiveTab] = useState('order');
  const [menuItems, setMenuItems] = useState(defaultMenu);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerData, setCustomerData] = useState(null);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [firebaseOrders, setFirebaseOrders] = useState([]);
  const [settings, setSettings] = useState(defaultSettings);
  const [loadingCloud, setLoadingCloud] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Discounts
  const [manualDiscountType, setManualDiscountType] = useState('flat');
  const [manualDiscountValue, setManualDiscountValue] = useState(0);
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [redeemPoints, setRedeemPoints] = useState(0);
  
  // Menu management
  const [editingItem, setEditingItem] = useState(null);
  const [newItem, setNewItem] = useState({ name: '', price: '', category: 'Coffee', emoji: '🍽️' });
  
  // Promo management
  const [promoCodes, setPromoCodes] = useState([]);
  const [bulkCount, setBulkCount] = useState(20);
  const [bulkType, setBulkType] = useState('percent');
  const [bulkValue, setBulkValue] = useState(10);
  
  // Order status
  const [orderStatuses, setOrderStatuses] = useState({});

  useEffect(() => {
    const loggedIn = localStorage.getItem('kaapfi_loggedIn');
    if (loggedIn === 'true') setIsLoggedIn(true);

    const saved = localStorage.getItem('cafePOS');
    if (saved) {
      const data = JSON.parse(saved);
      setMenuItems(data.menuItems || defaultMenu);
      setOrders(data.orders || []);
      setOrderStatuses(data.orderStatuses || {});
    }

    const savedSettings = localStorage.getItem('cafeSettings');
    if (savedSettings) setSettings({ ...defaultSettings, ...JSON.parse(savedSettings) });
    
    const savedPromos = localStorage.getItem('promoCodes');
    if (savedPromos) setPromoCodes(JSON.parse(savedPromos));
  }, []);

  useEffect(() => {
    localStorage.setItem('cafePOS', JSON.stringify({ menuItems, orders, orderStatuses }));
  }, [menuItems, orders, orderStatuses]);

  useEffect(() => {
    localStorage.setItem('cafeSettings', JSON.stringify(settings));
  }, [settings]);
  
  useEffect(() => {
    localStorage.setItem('promoCodes', JSON.stringify(promoCodes));
  }, [promoCodes]);

  const handleLogin = () => {
    if (loginInput === CAFE_PASSWORD) {
      setIsLoggedIn(true);
      localStorage.setItem('kaapfi_loggedIn', 'true');
      setLoginError('');
      setLoginInput('');
    } else {
      setLoginError('❌ Wrong password! Try again.');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('kaapfi_loggedIn');
    setCurrentOrder([]);
  };

  const loadCloudOrders = async () => {
    setLoadingCloud(true);
    try {
      const snap = await getDocs(collection(db, "orders"));
      const all = [];
      snap.forEach(d => all.push({ id: d.id, ...d.data() }));
      all.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setFirebaseOrders(all);
    } catch (e) { console.error(e); }
    setLoadingCloud(false);
  };

  useEffect(() => {
    if (activeTab === 'firebase' && isLoggedIn) loadCloudOrders();
  }, [activeTab, isLoggedIn]);

  const handlePhoneChange = async (phone) => {
    setCustomerPhone(phone);
    if (phone.length >= 10) {
      const c = await getCustomer(phone);
      setCustomerData(c);
      if (c) {
        setCustomerName(c.name || '');
        const co = await getCustomerOrders(phone);
        setCustomerOrders(co);
      } else {
        setCustomerOrders([]);
      }
    } else {
      setCustomerData(null);
      setCustomerOrders([]);
    }
  };

  const addToOrder = (item) => {
    const existing = currentOrder.find(o => o.id === item.id);
    if (existing) {
      setCurrentOrder(currentOrder.map(o => o.id === item.id ? { ...o, quantity: o.quantity + 1 } : o));
    } else {
      setCurrentOrder([...currentOrder, { ...item, quantity: 1 }]);
    }
  };

  const removeFromOrder = (id) => setCurrentOrder(currentOrder.filter(o => o.id !== id));
  const updateQuantity = (id, qty) => {
    if (qty <= 0) removeFromOrder(id);
    else setCurrentOrder(currentOrder.map(o => o.id === id ? { ...o, quantity: qty } : o));
  };

  // Calculations
  const subtotal = currentOrder.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const manualDiscount = manualDiscountType === 'flat' ? parseFloat(manualDiscountValue) || 0 : (subtotal * (parseFloat(manualDiscountValue) || 0) / 100);
  const promoDiscount = appliedPromo ? (appliedPromo.discountType === 'flat' ? appliedPromo.discountValue : (subtotal * appliedPromo.discountValue / 100)) : 0;
  const loyaltyRedemption = (parseInt(redeemPoints) || 0) * settings.loyaltyPointValue;
  const specialCheck = customerData ? checkSpecialLoyalty(customerData, settings) : { eligible: false };
  const specialDiscount = specialCheck.eligible ? (subtotal * specialCheck.discountValue / 100) : 0;
  const totalDiscount = manualDiscount + promoDiscount + loyaltyRedemption + specialDiscount;
  const afterDiscount = Math.max(0, subtotal - totalDiscount);
  const tax = afterDiscount * (settings.taxRate / 100);
  const total = afterDiscount + tax;

  const applyPromo = () => {
    const p = promoCodes.find(pc => pc.code === promoCode.toUpperCase());
    if (!p) { alert('❌ Invalid promo code'); return; }
    if (new Date(p.expiryDate) < new Date()) { alert('❌ Promo expired'); return; }
    if (p.usedCount >= p.usageLimit) { alert('❌ Promo usage limit reached'); return; }
    setAppliedPromo(p);
    alert(`✅ Promo applied: ${p.discountType === 'flat' ? '₹' : ''}${p.discountValue}${p.discountType === 'percent' ? '%' : ''} off`);
  };

  const completeOrder = async () => {
    if (currentOrder.length === 0) { alert('Please add items'); return; }

    const order = {
      id: Date.now(),
      items: currentOrder,
      subtotal,
      manualDiscount,
      promoDiscount,
      loyaltyRedemption,
      specialDiscount,
      totalDiscount,
      afterDiscount,
      tax,
      total,
      paymentMethod,
      customerName: customerName || 'Walk-in',
      customerPhone: customerPhone || '',
      timestamp: new Date().toLocaleString(),
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      status: 'in_progress',
      startTime: Date.now(),
    };

    setOrders([...orders, order]);
    setOrderStatuses({ ...orderStatuses, [order.id]: { status: 'in_progress', startTime: Date.now() } });
    
    const saved = await saveOrderToFirebase(order);
    
    if (customerPhone.length >= 10) {
      await saveCustomer(customerPhone, order);
    }
    
    if (appliedPromo) {
      setPromoCodes(promoCodes.map(p => p.code === appliedPromo.code ? { ...p, usedCount: (p.usedCount || 0) + 1 } : p));
    }
    
    // Reset
    setCurrentOrder([]);
    setCustomerName('');
    setCustomerPhone('');
    setCustomerData(null);
    setCustomerOrders([]);
    setPaymentMethod('cash');
    setManualDiscountValue(0);
    setPromoCode('');
    setAppliedPromo(null);
    setRedeemPoints(0);
    
    alert(saved ? '✅ Order saved to cloud!' : '⚠️ Saved locally only');
  };

  const printBill = () => {
    if (currentOrder.length === 0) { alert('No items'); return; }
    const w = settings.receiptSize === '58mm' ? 200 : 300;
    const bill = `\n${settings.cafeName}\n${settings.tagline}\n${settings.phone}\n─────────────────\nDate: ${new Date().toLocaleDateString()}\nTime: ${new Date().toLocaleTimeString()}\nCustomer: ${customerName || 'Walk-in'}\n${customerPhone ? 'Phone: ' + customerPhone + '\n' : ''}─────────────────\n${currentOrder.map(i => `${i.name} x${i.quantity}\n  ₹${i.price * i.quantity}`).join('\n')}\n─────────────────\nSubtotal: ₹${subtotal}\n${manualDiscount > 0 ? `Discount: -₹${manualDiscount.toFixed(0)}\n` : ''}${promoDiscount > 0 ? `Promo: -₹${promoDiscount.toFixed(0)}\n` : ''}${loyaltyRedemption > 0 ? `Points: -₹${loyaltyRedemption}\n` : ''}${specialDiscount > 0 ? `Loyal Customer: -₹${specialDiscount.toFixed(0)}\n` : ''}Tax (${settings.taxRate}%): ₹${tax.toFixed(0)}\n─────────────────\nTOTAL: ₹${total.toFixed(0)}\n─────────────────\nPayment: ${paymentMethod.toUpperCase()}\n─────────────────\n${settings.footerText}`;
    const win = window.open('', '', `height=600,width=${w + 100}`);
    win.document.write(`<pre style="font-family: monospace; font-size: ${settings.receiptSize === '58mm' ? '10px' : '12px'}; width: ${w}px; padding: 10px;">${bill}</pre>`);
    win.print();
    win.close();
  };

  const sendWhatsApp = () => {
    if (currentOrder.length === 0) { alert('No items'); return; }
    const text = `*${settings.cafeName}*\n${settings.tagline}\n\n*Order Summary:*\n${currentOrder.map(i => `• ${i.name} x${i.quantity} - ₹${i.price * i.quantity}`).join('\n')}\n\n*Subtotal:* ₹${subtotal}\n${totalDiscount > 0 ? `*Discount:* -₹${totalDiscount.toFixed(0)}\n` : ''}*Tax:* ₹${tax.toFixed(0)}\n*Total:* ₹${total.toFixed(0)}\n\n${settings.footerText}`;
    const url = `https://wa.me/${customerPhone ? '91' + customerPhone : ''}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  // Menu management
  const addMenuItem = () => {
    if (!newItem.name || !newItem.price) { alert('Fill name and price'); return; }
    const id = Math.max(...menuItems.map(m => m.id), 0) + 1;
    setMenuItems([...menuItems, { ...newItem, id, price: parseFloat(newItem.price) }]);
    setNewItem({ name: '', price: '', category: 'Coffee', emoji: '🍽️' });
  };
  const deleteMenuItem = (id) => { if (window.confirm('Delete this item?')) setMenuItems(menuItems.filter(m => m.id !== id)); };
  const updateMenuItem = () => {
    setMenuItems(menuItems.map(m => m.id === editingItem.id ? editingItem : m));
    setEditingItem(null);
  };

  // Promo generator
  const generateBulkPromos = async () => {
    const newCodes = [];
    for (let i = 0; i < bulkCount; i++) {
      newCodes.push({
        code: generatePromoCode(),
        discountType: bulkType,
        discountValue: parseFloat(bulkValue),
        expiryDate: new Date(Date.now() + 30 * 86400000).toISOString(),
        usageLimit: 1,
        usedCount: 0,
        createdAt: new Date().toISOString(),
      });
    }
    setPromoCodes([...promoCodes, ...newCodes]);
    alert(`✅ Generated ${bulkCount} codes!`);
  };

  const exportCSV = (days) => {
    const cutoff = new Date(Date.now() - days * 86400000);
    const filtered = orders.filter(o => new Date(o.timestamp || o.date) >= cutoff);
    if (filtered.length === 0) { alert('No orders in this period'); return; }
    downloadCSV(filtered, `kaapfi-orders-${days}days-${new Date().toISOString().split('T')[0]}.csv`);
  };

  const updateOrderStatus = (orderId, status) => {
    const cur = orderStatuses[orderId] || {};
    setOrderStatuses({
      ...orderStatuses,
      [orderId]: { ...cur, status, ...(status === 'ready' ? { readyTime: Date.now() } : {}) }
    });
  };

  const categories = ['All', ...new Set(menuItems.map(item => item.category))];
  const filteredItems = selectedCategory === 'All' ? menuItems : menuItems.filter(item => item.category === selectedCategory);
  const todayOrders = orders.filter(o => o.date === new Date().toLocaleDateString());
  const todayRevenue = todayOrders.reduce((sum, o) => sum + o.total, 0);
  const aiRec = customerOrders.length > 0 ? getAIRecommendation(customerOrders, menuItems) : null;

  // ═══════════════════════════════════════════════════════
  // LOGIN SCREEN
  // ═══════════════════════════════════════════════════════
  if (!isLoggedIn) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #FC8019 0%, #E64A19 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif', padding: '20px' }}>
        <div style={{ background: '#fff', padding: '48px 40px', borderRadius: '16px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', maxWidth: '420px', width: '100%', textAlign: 'center' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>☕</div>
          <h1 style={{ margin: '0 0 8px', fontSize: '28px', color: '#1a1a1a', fontWeight: '700' }}>{settings.cafeName}</h1>
          <p style={{ margin: '0 0 32px', fontSize: '14px', color: '#666' }}>{settings.tagline}</p>
          <input type="password" placeholder="Enter Password" value={loginInput} onChange={(e) => setLoginInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleLogin()} style={{ width: '100%', padding: '14px 16px', fontSize: '16px', border: '2px solid #e0e0e0', borderRadius: '8px', marginBottom: '16px', boxSizing: 'border-box', outline: 'none' }} />
          {loginError && <div style={{ color: '#E64A19', fontSize: '14px', marginBottom: '16px' }}>{loginError}</div>}
          <button onClick={handleLogin} style={{ width: '100%', padding: '14px', fontSize: '16px', fontWeight: '600', background: '#FC8019', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>LOGIN →</button>
          <p style={{ marginTop: '24px', fontSize: '12px', color: '#999' }}>🔒 Kaapfi POS v3 - Smart Business System</p>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════
  // MAIN APP
  // ═══════════════════════════════════════════════════════
  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', fontFamily: 'system-ui, sans-serif' }}>
      {/* HEADER */}
      <header style={{ background: 'linear-gradient(135deg, #FC8019 0%, #E64A19 100%)', padding: '16px 24px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ fontSize: '32px' }}>☕</div>
            <div>
              <h1 style={{ margin: 0, fontSize: '22px', color: '#fff', fontWeight: '700' }}>{settings.cafeName}</h1>
              <p style={{ margin: 0, fontSize: '11px', color: '#ffe0d6' }}>{settings.tagline}</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '8px 14px', borderRadius: '20px', color: '#fff', fontSize: '13px', fontWeight: '600' }}>🔥 {todayOrders.length} Orders • ₹{todayRevenue}</div>
            <div style={{ background: '#4CAF50', padding: '8px 14px', borderRadius: '20px', color: '#fff', fontSize: '11px', fontWeight: '600' }}>● LIVE</div>
            <button onClick={handleLogout} style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid #fff', padding: '8px 16px', borderRadius: '20px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>Logout</button>
          </div>
        </div>
      </header>

      {/* TAB NAV */}
      <nav style={{ background: '#fff', display: 'flex', borderBottom: '1px solid #eee', padding: '0 24px', overflowX: 'auto', gap: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.04)' }}>
        {[
          { id: 'order', icon: '🛒', label: 'New Order' },
          { id: 'bills', icon: '🧾', label: 'Bills' },
          { id: 'kitchen', icon: '👨‍🍳', label: 'Kitchen' },
          { id: 'reports', icon: '📊', label: 'Reports' },
          { id: 'firebase', icon: '☁️', label: 'Cloud' },
          { id: 'menu', icon: '🍽️', label: 'Menu' },
          { id: 'promos', icon: '🎁', label: 'Promos' },
          { id: 'customers', icon: '👥', label: 'Customers' },
          { id: 'settings', icon: '⚙️', label: 'Settings' },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ padding: '16px 20px', border: 'none', background: 'transparent', color: activeTab === tab.id ? '#FC8019' : '#666', cursor: 'pointer', fontSize: '14px', fontWeight: activeTab === tab.id ? '700' : '500', borderBottom: activeTab === tab.id ? '3px solid #FC8019' : '3px solid transparent', whiteSpace: 'nowrap' }}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </nav>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px' }}>

        {/* ORDER TAB */}
        {activeTab === 'order' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 420px', gap: '24px' }}>
            <div>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
                {categories.map(cat => (
                  <button key={cat} onClick={() => setSelectedCategory(cat)} style={{ padding: '8px 16px', borderRadius: '20px', border: 'none', background: selectedCategory === cat ? '#FC8019' : '#fff', color: selectedCategory === cat ? '#fff' : '#666', fontWeight: '600', fontSize: '13px', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>{cat}</button>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px' }}>
                {filteredItems.map(item => (
                  <div key={item.id} onClick={() => addToOrder(item)} style={{ background: '#fff', padding: '16px', borderRadius: '12px', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', textAlign: 'center', transition: 'transform 0.2s' }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                    <div style={{ fontSize: '36px', marginBottom: '8px' }}>{item.emoji || '🍽️'}</div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#1a1a1a', marginBottom: '4px' }}>{item.name}</div>
                    <div style={{ fontSize: '15px', color: '#FC8019', fontWeight: '700' }}>₹{item.price}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* CART */}
            <div style={{ background: '#fff', borderRadius: '12px', padding: '20px', height: 'fit-content', position: 'sticky', top: '100px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', maxHeight: 'calc(100vh - 120px)', overflowY: 'auto' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '18px', fontWeight: '700' }}>🛒 Current Order ({currentOrder.length})</h3>

              <input type="tel" placeholder="Customer phone (for loyalty)" value={customerPhone} onChange={(e) => handlePhoneChange(e.target.value)} style={{ width: '100%', padding: '10px 14px', fontSize: '14px', border: '2px solid #FC8019', borderRadius: '8px', marginBottom: '10px', boxSizing: 'border-box', outline: 'none' }} />
              <input type="text" placeholder="Customer name (optional)" value={customerName} onChange={(e) => setCustomerName(e.target.value)} style={{ width: '100%', padding: '10px 14px', fontSize: '14px', border: '1px solid #e0e0e0', borderRadius: '8px', marginBottom: '12px', boxSizing: 'border-box', outline: 'none' }} />

              {/* Customer Info */}
              {customerData && (
                <div style={{ background: '#fff3e0', padding: '12px', borderRadius: '8px', marginBottom: '12px', fontSize: '12px' }}>
                  <div style={{ fontWeight: '700', color: '#E64A19' }}>👋 Welcome back, {customerData.name || 'Customer'}!</div>
                  <div style={{ marginTop: '4px' }}>🏆 {customerData.loyaltyPoints || 0} points | 📦 {customerData.totalOrders} orders | 💰 ₹{customerData.totalSpent}</div>
                  {aiRec && <div style={{ marginTop: '6px', color: '#666', fontStyle: 'italic' }}>🤖 {aiRec.message}</div>}
                  {specialCheck.eligible && <div style={{ marginTop: '6px', background: '#4CAF50', color: '#fff', padding: '6px 8px', borderRadius: '4px', fontWeight: '700' }}>⭐ LOYAL CUSTOMER OFFER APPLIED ({specialCheck.discountValue}%)</div>}
                </div>
              )}

              {customerOrders.length > 0 && (
                <div style={{ background: '#f5f5f5', padding: '10px', borderRadius: '8px', marginBottom: '12px', fontSize: '11px' }}>
                  <div style={{ fontWeight: '700', marginBottom: '4px' }}>📋 Last Orders:</div>
                  {customerOrders.slice(0, 3).map(o => (
                    <div key={o.id} style={{ color: '#666', marginBottom: '2px' }}>{o.date} • ₹{o.total?.toFixed(0)}</div>
                  ))}
                </div>
              )}

              <div style={{ maxHeight: '250px', overflowY: 'auto', marginBottom: '12px' }}>
                {currentOrder.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '30px 20px', color: '#999' }}>
                    <div style={{ fontSize: '48px' }}>🛒</div>
                    <p style={{ fontSize: '13px' }}>No items yet</p>
                  </div>
                ) : (
                  currentOrder.map(item => (
                    <div key={item.id} style={{ padding: '10px', background: '#f9f9f9', borderRadius: '8px', marginBottom: '6px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontSize: '13px', fontWeight: '600' }}>{item.emoji} {item.name}</span>
                        <button onClick={() => removeFromOrder(item.id)} style={{ background: 'none', border: 'none', color: '#E64A19', cursor: 'pointer', fontSize: '16px' }}>×</button>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)} style={{ width: '24px', height: '24px', borderRadius: '4px', border: '1px solid #FC8019', background: '#fff', color: '#FC8019', cursor: 'pointer', fontWeight: '700' }}>−</button>
                          <span style={{ minWidth: '20px', textAlign: 'center', fontWeight: '600', fontSize: '13px' }}>{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)} style={{ width: '24px', height: '24px', borderRadius: '4px', border: '1px solid #FC8019', background: '#FC8019', color: '#fff', cursor: 'pointer', fontWeight: '700' }}>+</button>
                        </div>
                        <span style={{ fontWeight: '700', fontSize: '13px' }}>₹{item.price * item.quantity}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {currentOrder.length > 0 && (
                <>
                  {/* Manual Discount */}
                  <div style={{ marginBottom: '10px', padding: '10px', background: '#fff9e6', borderRadius: '8px' }}>
                    <label style={{ fontSize: '11px', fontWeight: '700', color: '#666' }}>💰 Manual Discount</label>
                    <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                      <select value={manualDiscountType} onChange={(e) => setManualDiscountType(e.target.value)} style={{ padding: '6px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '12px' }}>
                        <option value="flat">₹</option>
                        <option value="percent">%</option>
                      </select>
                      <input type="number" value={manualDiscountValue} onChange={(e) => setManualDiscountValue(e.target.value)} placeholder="0" style={{ flex: 1, padding: '6px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '12px' }} />
                    </div>
                  </div>

                  {/* Promo Code */}
                  <div style={{ marginBottom: '10px', padding: '10px', background: '#e3f2fd', borderRadius: '8px' }}>
                    <label style={{ fontSize: '11px', fontWeight: '700', color: '#666' }}>🎁 Promo Code</label>
                    <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                      <input type="text" value={promoCode} onChange={(e) => setPromoCode(e.target.value.toUpperCase())} placeholder="KF1234" style={{ flex: 1, padding: '6px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '12px' }} />
                      <button onClick={applyPromo} style={{ padding: '6px 12px', background: '#2196F3', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: '700' }}>Apply</button>
                    </div>
                    {appliedPromo && <div style={{ marginTop: '4px', fontSize: '11px', color: '#4CAF50', fontWeight: '700' }}>✓ {appliedPromo.code} applied</div>}
                  </div>

                  {/* Loyalty Redemption */}
                  {customerData && customerData.loyaltyPoints > 0 && (
                    <div style={{ marginBottom: '10px', padding: '10px', background: '#fce4ec', borderRadius: '8px' }}>
                      <label style={{ fontSize: '11px', fontWeight: '700', color: '#666' }}>🏆 Redeem Points (You have {customerData.loyaltyPoints})</label>
                      <input type="number" min="0" max={customerData.loyaltyPoints} value={redeemPoints} onChange={(e) => setRedeemPoints(Math.min(parseInt(e.target.value) || 0, customerData.loyaltyPoints))} style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '12px', marginTop: '4px', boxSizing: 'border-box' }} />
                      {redeemPoints > 0 && <div style={{ fontSize: '11px', color: '#E91E63', marginTop: '4px' }}>= ₹{loyaltyRedemption} discount</div>}
                    </div>
                  )}

                  {/* Price Breakdown */}
                  <div style={{ borderTop: '1px dashed #ddd', paddingTop: '10px', marginBottom: '12px', fontSize: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#666' }}><span>Subtotal</span><span>₹{subtotal}</span></div>
                    {manualDiscount > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', color: '#E64A19' }}><span>Manual Disc.</span><span>-₹{manualDiscount.toFixed(0)}</span></div>}
                    {promoDiscount > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', color: '#E64A19' }}><span>Promo</span><span>-₹{promoDiscount.toFixed(0)}</span></div>}
                    {loyaltyRedemption > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', color: '#E64A19' }}><span>Points</span><span>-₹{loyaltyRedemption}</span></div>}
                    {specialDiscount > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4CAF50', fontWeight: '700' }}><span>⭐ Loyal Disc.</span><span>-₹{specialDiscount.toFixed(0)}</span></div>}
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#666' }}><span>Tax ({settings.taxRate}%)</span><span>₹{tax.toFixed(0)}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: '700', marginTop: '6px', color: '#1a1a1a' }}><span>TOTAL</span><span>₹{total.toFixed(0)}</span></div>
                  </div>

                  <div style={{ marginBottom: '10px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' }}>
                      {['cash', 'card', 'upi'].map(m => (
                        <button key={m} onClick={() => setPaymentMethod(m)} style={{ padding: '8px', border: 'none', borderRadius: '6px', background: paymentMethod === m ? '#FC8019' : '#f0f0f0', color: paymentMethod === m ? '#fff' : '#666', fontWeight: '600', cursor: 'pointer', fontSize: '11px', textTransform: 'uppercase' }}>{m}</button>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '6px' }}>
                    <button onClick={printBill} style={{ padding: '10px', background: '#fff', color: '#FC8019', border: '2px solid #FC8019', borderRadius: '6px', fontWeight: '700', cursor: 'pointer', fontSize: '12px' }}>🖨️ Print</button>
                    <button onClick={sendWhatsApp} style={{ padding: '10px', background: '#25D366', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '700', cursor: 'pointer', fontSize: '12px' }}>📱 WhatsApp</button>
                  </div>

                  <button onClick={completeOrder} style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', fontSize: '15px' }}>✅ Complete • ₹{total.toFixed(0)}</button>
                </>
              )}
            </div>
          </div>
        )}

        {/* BILLS TAB */}
        {activeTab === 'bills' && (
          <div>
            <h2 style={{ fontSize: '24px', margin: '0 0 20px' }}>🧾 Today's Orders</h2>
            {todayOrders.length === 0 ? (
              <div style={{ background: '#fff', padding: '60px', borderRadius: '12px', textAlign: 'center', color: '#999' }}><div style={{ fontSize: '64px' }}>📭</div><p>No orders yet</p></div>
            ) : (
              <div style={{ display: 'grid', gap: '12px' }}>
                {todayOrders.slice().reverse().map(order => (
                  <div key={order.id} style={{ background: '#fff', padding: '16px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div>
                        <div style={{ fontWeight: '700' }}>#{order.id.toString().slice(-5)}</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>{order.customerName} {order.customerPhone && `• ${order.customerPhone}`} • {order.time}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '18px', fontWeight: '700', color: '#FC8019' }}>₹{order.total?.toFixed(0)}</div>
                        <div style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase' }}>{order.paymentMethod}</div>
                      </div>
                    </div>
                    <div style={{ fontSize: '12px', color: '#888' }}>{(order.items || []).map(i => `${i.name} x${i.quantity}`).join(', ')}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* KITCHEN TAB */}
        {activeTab === 'kitchen' && (
          <div>
            <h2 style={{ fontSize: '24px', margin: '0 0 20px' }}>👨‍🍳 Kitchen Display</h2>
            <div style={{ display: 'grid', gap: '12px' }}>
              {todayOrders.filter(o => {
                const s = orderStatuses[o.id]?.status || 'in_progress';
                return s !== 'delivered';
              }).map(order => {
                const status = orderStatuses[order.id] || { status: 'in_progress', startTime: order.startTime || Date.now() };
                const elapsed = Math.floor((Date.now() - (status.startTime || Date.now())) / 60000);
                const isLate = elapsed > 10;
                return (
                  <div key={order.id} style={{ background: '#fff', padding: '16px', borderRadius: '12px', border: isLate ? '2px solid #E64A19' : '2px solid transparent', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div style={{ fontWeight: '700' }}>#{order.id.toString().slice(-5)} • {order.customerName}</div>
                      <div style={{ background: isLate ? '#E64A19' : '#4CAF50', color: '#fff', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '700' }}>⏱️ {elapsed} min</div>
                    </div>
                    <div style={{ fontSize: '13px', marginBottom: '12px' }}>{(order.items || []).map(i => `${i.name} x${i.quantity}`).join(', ')}</div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button onClick={() => updateOrderStatus(order.id, 'in_progress')} style={{ padding: '8px 12px', background: status.status === 'in_progress' ? '#FF9800' : '#f0f0f0', color: status.status === 'in_progress' ? '#fff' : '#666', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>🔥 In Progress</button>
                      <button onClick={() => updateOrderStatus(order.id, 'ready')} style={{ padding: '8px 12px', background: status.status === 'ready' ? '#4CAF50' : '#f0f0f0', color: status.status === 'ready' ? '#fff' : '#666', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>✅ Ready</button>
                      <button onClick={() => updateOrderStatus(order.id, 'delivered')} style={{ padding: '8px 12px', background: '#2196F3', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>📦 Delivered</button>
                    </div>
                  </div>
                );
              })}
              {todayOrders.filter(o => (orderStatuses[o.id]?.status || 'in_progress') !== 'delivered').length === 0 && (
                <div style={{ background: '#fff', padding: '60px', borderRadius: '12px', textAlign: 'center', color: '#999' }}><div style={{ fontSize: '64px' }}>🎉</div><p>All orders done!</p></div>
              )}
            </div>
          </div>
        )}

        {/* REPORTS TAB */}
        {activeTab === 'reports' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
              <h2 style={{ fontSize: '24px', margin: 0 }}>📊 Reports</h2>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => exportCSV(1)} style={{ padding: '10px 16px', background: '#4CAF50', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>📥 Last 24h</button>
                <button onClick={() => exportCSV(7)} style={{ padding: '10px 16px', background: '#2196F3', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>📥 Last 7 days</button>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              {[
                { label: 'Total Orders', value: todayOrders.length, color: '#FC8019', emoji: '📦' },
                { label: 'Total Revenue', value: `₹${todayRevenue}`, color: '#4CAF50', emoji: '💰' },
                { label: 'Avg Order Value', value: `₹${todayOrders.length > 0 ? (todayRevenue / todayOrders.length).toFixed(0) : 0}`, color: '#2196F3', emoji: '📈' },
                { label: 'Items Sold', value: todayOrders.reduce((s, o) => s + (o.items || []).reduce((a, i) => a + i.quantity, 0), 0), color: '#9C27B0', emoji: '🛍️' },
              ].map(stat => (
                <div key={stat.label} style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderLeft: `4px solid ${stat.color}` }}>
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>{stat.emoji}</div>
                  <div style={{ fontSize: '13px', color: '#666' }}>{stat.label}</div>
                  <div style={{ fontSize: '28px', fontWeight: '700', color: stat.color }}>{stat.value}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CLOUD TAB */}
        {activeTab === 'firebase' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '24px', margin: 0 }}>☁️ Cloud Orders</h2>
              <button onClick={loadCloudOrders} style={{ padding: '10px 20px', background: '#FC8019', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>{loadingCloud ? '⏳' : '🔄 Refresh'}</button>
            </div>
            {loadingCloud ? <div style={{ background: '#fff', padding: '60px', borderRadius: '12px', textAlign: 'center' }}>⏳ Loading...</div> : firebaseOrders.length === 0 ? (
              <div style={{ background: '#fff', padding: '60px', borderRadius: '12px', textAlign: 'center', color: '#999' }}><div style={{ fontSize: '64px' }}>☁️</div><p>No orders in cloud yet</p></div>
            ) : (
              <>
                <div style={{ background: 'linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)', padding: '20px', borderRadius: '12px', color: '#fff', marginBottom: '16px' }}>
                  <div style={{ fontSize: '14px', opacity: 0.9 }}>Total Cloud Orders</div>
                  <div style={{ fontSize: '32px', fontWeight: '700' }}>{firebaseOrders.length}</div>
                </div>
                <div style={{ display: 'grid', gap: '12px' }}>
                  {firebaseOrders.map(order => (
                    <div key={order.id} style={{ background: '#fff', padding: '16px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <div>
                          <div style={{ fontWeight: '700' }}>{order.customerName || 'Walk-in'} {order.customerPhone && `• ${order.customerPhone}`}</div>
                          <div style={{ fontSize: '12px', color: '#666' }}>{order.date} • {order.time}</div>
                        </div>
                        <div style={{ fontSize: '18px', fontWeight: '700', color: '#FC8019' }}>₹{order.total?.toFixed(0)}</div>
                      </div>
                      <div style={{ fontSize: '12px', color: '#888' }}>{(order.items || []).map(i => `${i.name} x${i.quantity}`).join(', ')}</div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* MENU TAB - with Add/Edit/Delete */}
        {activeTab === 'menu' && (
          <div>
            <h2 style={{ fontSize: '24px', margin: '0 0 20px' }}>🍽️ Menu Management</h2>
            
            {/* Add New Item */}
            <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <h3 style={{ fontSize: '16px', margin: '0 0 12px' }}>➕ Add New Item</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '8px' }}>
                <input placeholder="Name" value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }} />
                <input placeholder="Price" type="number" value={newItem.price} onChange={(e) => setNewItem({ ...newItem, price: e.target.value })} style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }} />
                <input placeholder="Category" value={newItem.category} onChange={(e) => setNewItem({ ...newItem, category: e.target.value })} style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }} />
                <input placeholder="Emoji" value={newItem.emoji} onChange={(e) => setNewItem({ ...newItem, emoji: e.target.value })} style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }} />
                <button onClick={addMenuItem} style={{ padding: '10px', background: '#4CAF50', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>Add</button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
              {menuItems.map(item => (
                <div key={item.id} style={{ background: '#fff', padding: '16px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                  {editingItem && editingItem.id === item.id ? (
                    <div>
                      <input value={editingItem.name} onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })} style={{ width: '100%', padding: '8px', marginBottom: '6px', boxSizing: 'border-box' }} />
                      <input type="number" value={editingItem.price} onChange={(e) => setEditingItem({ ...editingItem, price: parseFloat(e.target.value) })} style={{ width: '100%', padding: '8px', marginBottom: '6px', boxSizing: 'border-box' }} />
                      <input value={editingItem.category} onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })} style={{ width: '100%', padding: '8px', marginBottom: '6px', boxSizing: 'border-box' }} />
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button onClick={updateMenuItem} style={{ flex: 1, padding: '8px', background: '#4CAF50', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Save</button>
                        <button onClick={() => setEditingItem(null)} style={{ flex: 1, padding: '8px', background: '#999', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ fontSize: '32px' }}>{item.emoji}</div>
                        <div>
                          <div style={{ fontWeight: '600' }}>{item.name}</div>
                          <div style={{ fontSize: '12px', color: '#666' }}>{item.category} • ₹{item.price}</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button onClick={() => setEditingItem({ ...item })} style={{ padding: '6px 10px', background: '#2196F3', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>Edit</button>
                        <button onClick={() => deleteMenuItem(item.id)} style={{ padding: '6px 10px', background: '#E64A19', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>Del</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PROMOS TAB */}
        {activeTab === 'promos' && (
          <div>
            <h2 style={{ fontSize: '24px', margin: '0 0 20px' }}>🎁 Promo Codes</h2>
            
            <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <h3 style={{ fontSize: '16px', margin: '0 0 12px' }}>Generate Bulk Codes</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '8px' }}>
                <select value={bulkCount} onChange={(e) => setBulkCount(parseInt(e.target.value))} style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}>
                  <option value={20}>20 codes</option>
                  <option value={50}>50 codes</option>
                  <option value={100}>100 codes</option>
                  <option value={200}>200 codes</option>
                </select>
                <select value={bulkType} onChange={(e) => setBulkType(e.target.value)} style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}>
                  <option value="percent">% Off</option>
                  <option value="flat">₹ Flat</option>
                </select>
                <input type="number" value={bulkValue} onChange={(e) => setBulkValue(e.target.value)} style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }} />
                <button onClick={generateBulkPromos} style={{ padding: '10px', background: '#FC8019', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>Generate</button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
              {promoCodes.slice().reverse().map((p, i) => (
                <div key={i} style={{ background: '#fff', padding: '12px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                  <div style={{ fontSize: '16px', fontWeight: '700', color: '#FC8019' }}>{p.code}</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>{p.discountType === 'flat' ? '₹' : ''}{p.discountValue}{p.discountType === 'percent' ? '%' : ''} off</div>
                  <div style={{ fontSize: '10px', color: '#999', marginTop: '4px' }}>Used: {p.usedCount || 0}/{p.usageLimit}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CUSTOMERS TAB */}
        {activeTab === 'customers' && (
          <div>
            <h2 style={{ fontSize: '24px', margin: '0 0 20px' }}>👥 Customer Lookup</h2>
            <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <p style={{ color: '#666', fontSize: '14px' }}>Enter a phone number in the order screen to see customer details, loyalty points, and order history.</p>
              <p style={{ color: '#666', fontSize: '13px', marginTop: '12px' }}>
                💡 <strong>Loyalty Rules:</strong><br />
                • Every ₹{settings.loyaltyRate} spent = 1 point<br />
                • 1 point = ₹{settings.loyaltyPointValue} discount<br />
                • <strong>Special Offer:</strong> {settings.specialLoyaltyVisits} visits in {settings.specialLoyaltyDays} days during {settings.specialLoyaltyStart}-{settings.specialLoyaltyEnd} = {settings.specialLoyaltyDiscount}% off!
              </p>
            </div>
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div style={{ maxWidth: '700px' }}>
            <h2 style={{ fontSize: '24px', margin: '0 0 20px' }}>⚙️ Settings</h2>
            <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <h3 style={{ fontSize: '16px', margin: '0 0 12px', color: '#FC8019' }}>Cafe Info</h3>
              {[
                { key: 'cafeName', label: 'Cafe Name' },
                { key: 'tagline', label: 'Tagline' },
                { key: 'phone', label: 'Phone' },
                { key: 'address', label: 'Address' },
                { key: 'footerText', label: 'Receipt Footer' },
              ].map(f => (
                <div key={f.key} style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '13px', color: '#666', fontWeight: '600', marginBottom: '4px' }}>{f.label}</label>
                  <input type="text" value={settings[f.key]} onChange={(e) => setSettings({ ...settings, [f.key]: e.target.value })} style={{ width: '100%', padding: '10px', border: '1px solid #e0e0e0', borderRadius: '6px', boxSizing: 'border-box' }} />
                </div>
              ))}
              
              <h3 style={{ fontSize: '16px', margin: '16px 0 12px', color: '#FC8019' }}>Tax & Receipt</h3>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '13px', color: '#666', fontWeight: '600', marginBottom: '4px' }}>Tax Rate (%)</label>
                <input type="number" value={settings.taxRate} onChange={(e) => setSettings({ ...settings, taxRate: parseFloat(e.target.value) || 0 })} style={{ width: '100%', padding: '10px', border: '1px solid #e0e0e0', borderRadius: '6px', boxSizing: 'border-box' }} />
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '13px', color: '#666', fontWeight: '600', marginBottom: '4px' }}>Receipt Size</label>
                <select value={settings.receiptSize} onChange={(e) => setSettings({ ...settings, receiptSize: e.target.value })} style={{ width: '100%', padding: '10px', border: '1px solid #e0e0e0', borderRadius: '6px', boxSizing: 'border-box' }}>
                  <option value="58mm">58mm (Small)</option>
                  <option value="80mm">80mm (Standard)</option>
                </select>
              </div>
              
              <h3 style={{ fontSize: '16px', margin: '16px 0 12px', color: '#FC8019' }}>Loyalty Settings</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '4px' }}>₹ per 1 point</label>
                  <input type="number" value={settings.loyaltyRate} onChange={(e) => setSettings({ ...settings, loyaltyRate: parseFloat(e.target.value) || 100 })} style={{ width: '100%', padding: '8px', border: '1px solid #e0e0e0', borderRadius: '6px', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '4px' }}>1 point = ₹</label>
                  <input type="number" value={settings.loyaltyPointValue} onChange={(e) => setSettings({ ...settings, loyaltyPointValue: parseFloat(e.target.value) || 5 })} style={{ width: '100%', padding: '8px', border: '1px solid #e0e0e0', borderRadius: '6px', boxSizing: 'border-box' }} />
                </div>
              </div>
              
              <h3 style={{ fontSize: '16px', margin: '16px 0 12px', color: '#FC8019' }}>⭐ Special Loyalty (Time-based)</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '4px' }}>Required visits</label>
                  <input type="number" value={settings.specialLoyaltyVisits} onChange={(e) => setSettings({ ...settings, specialLoyaltyVisits: parseInt(e.target.value) || 7 })} style={{ width: '100%', padding: '8px', border: '1px solid #e0e0e0', borderRadius: '6px', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '4px' }}>Window (days)</label>
                  <input type="number" value={settings.specialLoyaltyDays} onChange={(e) => setSettings({ ...settings, specialLoyaltyDays: parseInt(e.target.value) || 15 })} style={{ width: '100%', padding: '8px', border: '1px solid #e0e0e0', borderRadius: '6px', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '4px' }}>Start time</label>
                  <input type="time" value={settings.specialLoyaltyStart} onChange={(e) => setSettings({ ...settings, specialLoyaltyStart: e.target.value })} style={{ width: '100%', padding: '8px', border: '1px solid #e0e0e0', borderRadius: '6px', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '4px' }}>End time</label>
                  <input type="time" value={settings.specialLoyaltyEnd} onChange={(e) => setSettings({ ...settings, specialLoyaltyEnd: e.target.value })} style={{ width: '100%', padding: '8px', border: '1px solid #e0e0e0', borderRadius: '6px', boxSizing: 'border-box' }} />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '4px' }}>Discount %</label>
                  <input type="number" value={settings.specialLoyaltyDiscount} onChange={(e) => setSettings({ ...settings, specialLoyaltyDiscount: parseFloat(e.target.value) || 15 })} style={{ width: '100%', padding: '8px', border: '1px solid #e0e0e0', borderRadius: '6px', boxSizing: 'border-box' }} />
                </div>
              </div>
              
              <div style={{ padding: '12px', background: '#f0f8ff', borderRadius: '8px', fontSize: '13px', color: '#0066cc', marginTop: '16px' }}>ℹ️ All changes saved automatically</div>
            </div>
          </div>
        )}
      </div>

      <footer style={{ background: '#fff', borderTop: '1px solid #eee', padding: '20px 24px', marginTop: '40px', textAlign: 'center', color: '#666', fontSize: '13px' }}>
        <div>{settings.cafeName} • {settings.address}</div>
        <div style={{ fontSize: '11px', marginTop: '4px' }}>{settings.phone} • Powered by Firebase ☁️</div>
      </footer>
    </div>
  );
}
