import React, { useState, useEffect } from 'react';
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, doc, setDoc, getDoc, updateDoc, query, where, deleteDoc } from "firebase/firestore";

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
const DELETE_PASSWORD = "9923022925";

const defaultSettings = {
  cafeName: "Kaapfi 90's",
  tagline: "Jo Hai Kaapfi Hai",
  phone: "+91 9307189776",
  address: "Chatrapati Nagar, Nagpur",
  footerText: "Thank you for visiting! Please visit again ☕",
  taxRate: 0,
  loyaltyRate: 100,
  loyaltyPointValue: 5,
  specialLoyaltyVisits: 7,
  specialLoyaltyDays: 15,
  specialLoyaltyDiscount: 15,
  specialLoyaltyStart: "21:00",
  specialLoyaltyEnd: "22:30",
  receiptSize: "80mm",
};

// ACTUAL KAAPFI MENU
const defaultMenu = [
  // KAAPFI (HOT)
  { id: 1, name: 'Milk Filter Coffee', price: 20, category: 'Kaapfi Hot', emoji: '☕' },
  { id: 2, name: 'Black Filter Coffee', price: 20, category: 'Kaapfi Hot', emoji: '☕' },
  // ICED FILTER KAAFI
  { id: 3, name: 'Classic Iced Filter', price: 110, category: 'Iced Filter', emoji: '🧊' },
  { id: 4, name: 'Hazelnut Iced Filter', price: 120, category: 'Iced Filter', emoji: '🧊' },
  { id: 5, name: 'Vanilla Iced Filter', price: 125, category: 'Iced Filter', emoji: '🧊' },
  { id: 6, name: 'Salted Caramel Iced', price: 120, category: 'Iced Filter', emoji: '🧊' },
  { id: 7, name: 'Rose Iced Filter', price: 125, category: 'Iced Filter', emoji: '🌹' },
  { id: 8, name: 'Strawberry Iced', price: 125, category: 'Iced Filter', emoji: '🍓' },
  // COLD BREW
  { id: 9, name: 'Classic Cold Brew', price: 100, category: 'Cold Brew', emoji: '❄️' },
  { id: 10, name: 'Cranberry Cold Brew', price: 120, category: 'Cold Brew', emoji: '🔴' },
  { id: 11, name: 'Orange Cold Brew', price: 120, category: 'Cold Brew', emoji: '🍊' },
  { id: 12, name: 'Ginger Ale Cold Brew', price: 120, category: 'Cold Brew', emoji: '🫚' },
  { id: 13, name: 'Tonic Cold Brew', price: 120, category: 'Cold Brew', emoji: '💧' },
  { id: 14, name: 'Ocean Brew', price: 125, category: 'Cold Brew', emoji: '🌊' },
  { id: 15, name: 'Kaccha Aam Brew', price: 125, category: 'Cold Brew', emoji: '🥭' },
  { id: 16, name: 'Kokum Brew', price: 125, category: 'Cold Brew', emoji: '🍒' },
  { id: 17, name: 'Roohafza Brew', price: 125, category: 'Cold Brew', emoji: '🌸' },
  // IDLI
  { id: 18, name: 'Thatte Idli', price: 45, category: 'Idli', emoji: '🍚' },
  { id: 19, name: 'Ghee Thatte Idli', price: 60, category: 'Idli', emoji: '🍚' },
  { id: 20, name: 'Ghee Podi Thatte Idli', price: 70, category: 'Idli', emoji: '🍚' },
  { id: 21, name: 'Idli with Veg Curry', price: 60, category: 'Idli', emoji: '🥘' },
  { id: 22, name: 'Idli with Chicken Curry', price: 100, category: 'Idli', emoji: '🍗' },
  // MALABAR PARATHA
  { id: 23, name: 'Paneer Chatpata', price: 99, category: 'Malabar Paratha', emoji: '🫓' },
  { id: 24, name: 'Paneer Savji', price: 99, category: 'Malabar Paratha', emoji: '🫓' },
  { id: 25, name: 'Paneer Makkhanwala', price: 99, category: 'Malabar Paratha', emoji: '🫓' },
  { id: 26, name: 'Paneer Achari', price: 99, category: 'Malabar Paratha', emoji: '🫓' },
  { id: 27, name: 'Burnt Garlic Creamy Chicken', price: 125, category: 'Malabar Paratha', emoji: '🍗' },
  { id: 28, name: 'Chicken Achari', price: 99, category: 'Malabar Paratha', emoji: '🍗' },
  { id: 29, name: 'Smokey BBQ Chicken', price: 99, category: 'Malabar Paratha', emoji: '🔥' },
  { id: 30, name: 'Crispy Creamy Chicken', price: 125, category: 'Malabar Paratha', emoji: '🍗' },
];

async function saveOrderToFirebase(order) {
  try {
    const docRef = await addDoc(collection(db, "orders"), { ...order, timestamp: new Date().toISOString() });
    return docRef.id;
  } catch (error) { return null; }
}

async function deleteOrderFromFirebase(docId) {
  try {
    await deleteDoc(doc(db, "orders", docId));
    return true;
  } catch (e) { return false; }
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
        phone, name: orderData.customerName,
        totalOrders: 1, totalSpent: orderData.total,
        loyaltyPoints: Math.floor(orderData.total / 100),
        visitHistory: [now], firstOrder: now, lastOrder: now,
      });
    }
    return true;
  } catch (e) { return false; }
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

async function getAllCustomers() {
  try {
    const snap = await getDocs(collection(db, "customers"));
    const customers = [];
    snap.forEach(d => customers.push({ id: d.id, ...d.data() }));
    return customers.sort((a, b) => (b.totalSpent || 0) - (a.totalSpent || 0));
  } catch (e) { return []; }
}

function checkSpecialLoyalty(customerData, settings) {
  if (!customerData || !customerData.visitHistory) return { eligible: false };
  const now = new Date();
  const [startH, startM] = settings.specialLoyaltyStart.split(':').map(Number);
  const [endH, endM] = settings.specialLoyaltyEnd.split(':').map(Number);
  const currentMin = now.getHours() * 60 + now.getMinutes();
  const startMin = startH * 60 + startM;
  const endMin = endH * 60 + endM;
  if (currentMin < startMin || currentMin > endMin) return { eligible: false };
  const cutoff = new Date(now.getTime() - settings.specialLoyaltyDays * 86400000);
  const recentVisits = customerData.visitHistory.filter(t => new Date(t) >= cutoff);
  if (recentVisits.length >= settings.specialLoyaltyVisits) {
    return { eligible: true, discountValue: settings.specialLoyaltyDiscount, visits: recentVisits.length };
  }
  return { eligible: false };
}

function generatePromoCode() {
  return 'KF' + Math.random().toString(36).substring(2, 6).toUpperCase();
}

function getAIRecommendation(customerOrders, menu) {
  if (!customerOrders || customerOrders.length === 0) {
    return { message: "👋 New customer! Try our Classic Iced Filter ☕", items: [], upsell: null };
  }
  const itemCounts = {};
  customerOrders.forEach(order => {
    (order.items || []).forEach(item => {
      itemCounts[item.name] = (itemCounts[item.name] || 0) + item.quantity;
    });
  });
  const favorites = Object.entries(itemCounts).sort((a, b) => b[1] - a[1]).slice(0, 3);
  const favItem = favorites[0]?.[0] || 'Classic Iced Filter';
  const pastryUpsell = menu.find(m => m.category === 'Malabar Paratha');
  const totalVisits = customerOrders.length;
  let message = '';
  if (totalVisits === 1) message = `Welcome back! Your usual ${favItem}? 😊`;
  else if (totalVisits < 5) message = `Hey! Would you like your favorite ${favItem}?`;
  else if (totalVisits < 10) message = `Great to see you again! ${favItem} as usual? ☕`;
  else message = `Our VIP is here! 🌟 Same great ${favItem}?`;
  return {
    message,
    items: favorites.map(([name, count]) => ({ name, count })),
    upsell: pastryUpsell ? `💡 Try our ${pastryUpsell.name} (₹${pastryUpsell.price})!` : null,
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
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

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
  const [manualDiscountType, setManualDiscountType] = useState('flat');
  const [manualDiscountValue, setManualDiscountValue] = useState(0);
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [redeemPoints, setRedeemPoints] = useState(0);
  const [editingItem, setEditingItem] = useState(null);
  const [newItem, setNewItem] = useState({ name: '', price: '', category: 'Kaapfi Hot', emoji: '☕' });
  const [promoCodes, setPromoCodes] = useState([]);
  const [bulkCount, setBulkCount] = useState(20);
  const [bulkType, setBulkType] = useState('percent');
  const [bulkValue, setBulkValue] = useState(10);
  const [orderStatuses, setOrderStatuses] = useState({});
  const [lookupPhone, setLookupPhone] = useState('');
  const [lookupCustomer, setLookupCustomer] = useState(null);
  const [lookupOrders, setLookupOrders] = useState([]);
  const [lookupAI, setLookupAI] = useState(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [allCustomers, setAllCustomers] = useState([]);
  
  // NEW: Bill deletion
  const [deletingOrderId, setDeletingOrderId] = useState(null);
  const [deletePassword, setDeletePassword] = useState('');
  const [deletingPromoId, setDeletingPromoId] = useState(null);
  
  // NEW: Force menu reset
  const [menuVersion, setMenuVersion] = useState(1);

  useEffect(() => {
    const loggedIn = localStorage.getItem('kaapfi_loggedIn');
    if (loggedIn === 'true') setIsLoggedIn(true);
    
    // Check menu version - reset if old
    const savedVersion = localStorage.getItem('menuVersion');
    const saved = localStorage.getItem('cafePOS');
    
    if (savedVersion !== '2' || !saved) {
      // NEW MENU - force update
      setMenuItems(defaultMenu);
      localStorage.setItem('menuVersion', '2');
      if (saved) {
        const data = JSON.parse(saved);
        setOrders(data.orders || []);
        setOrderStatuses(data.orderStatuses || {});
      }
    } else {
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
  useEffect(() => { localStorage.setItem('cafeSettings', JSON.stringify(settings)); }, [settings]);
  useEffect(() => { localStorage.setItem('promoCodes', JSON.stringify(promoCodes)); }, [promoCodes]);

  const handleLogin = () => {
    if (loginInput === CAFE_PASSWORD) {
      setIsLoggedIn(true);
      localStorage.setItem('kaapfi_loggedIn', 'true');
      setLoginError(''); setLoginInput('');
    } else { setLoginError('❌ Wrong password!'); }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('kaapfi_loggedIn');
    setCurrentOrder([]);
  };

  const resetMenuToDefault = () => {
    if (window.confirm('Reset menu to Kaapfi default menu? This will replace all current menu items.')) {
      setMenuItems(defaultMenu);
      alert('✅ Menu reset to Kaapfi 90\'s default!');
    }
  };

  const loadCloudOrders = async () => {
    setLoadingCloud(true);
    try {
      const snap = await getDocs(collection(db, "orders"));
      const all = [];
      snap.forEach(d => all.push({ id: d.id, ...d.data() }));
      all.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setFirebaseOrders(all);
    } catch (e) {}
    setLoadingCloud(false);
  };

  useEffect(() => {
    if (activeTab === 'firebase' && isLoggedIn) loadCloudOrders();
    if (activeTab === 'customers' && isLoggedIn) loadAllCustomers();
  }, [activeTab, isLoggedIn]);

  const loadAllCustomers = async () => {
    const customers = await getAllCustomers();
    setAllCustomers(customers);
  };

  const performLookup = async () => {
    if (lookupPhone.length < 10) { alert('Enter 10-digit phone'); return; }
    setLookupLoading(true);
    const c = await getCustomer(lookupPhone);
    setLookupCustomer(c);
    if (c) {
      const co = await getCustomerOrders(lookupPhone);
      setLookupOrders(co);
      setLookupAI(getAIRecommendation(co, menuItems));
    } else { setLookupOrders([]); setLookupAI(null); }
    setLookupLoading(false);
  };

  const handlePhoneChange = async (phone) => {
    setCustomerPhone(phone);
    if (phone.length >= 10) {
      const c = await getCustomer(phone);
      setCustomerData(c);
      if (c) {
        setCustomerName(c.name || '');
        const co = await getCustomerOrders(phone);
        setCustomerOrders(co);
      } else { setCustomerOrders([]); }
    } else { setCustomerData(null); setCustomerOrders([]); }
  };

  const addToOrder = (item) => {
    const existing = currentOrder.find(o => o.id === item.id);
    if (existing) setCurrentOrder(currentOrder.map(o => o.id === item.id ? { ...o, quantity: o.quantity + 1 } : o));
    else setCurrentOrder([...currentOrder, { ...item, quantity: 1 }]);
  };
  const removeFromOrder = (id) => setCurrentOrder(currentOrder.filter(o => o.id !== id));
  const updateQuantity = (id, qty) => {
    if (qty <= 0) removeFromOrder(id);
    else setCurrentOrder(currentOrder.map(o => o.id === id ? { ...o, quantity: qty } : o));
  };

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
    if (!p) { alert('❌ Invalid code'); return; }
    if (new Date(p.expiryDate) < new Date()) { alert('❌ Expired'); return; }
    if (p.usedCount >= p.usageLimit) { alert('❌ Usage limit reached'); return; }
    setAppliedPromo(p);
    alert(`✅ ${p.discountType === 'flat' ? '₹' : ''}${p.discountValue}${p.discountType === 'percent' ? '%' : ''} off applied`);
  };

  const completeOrder = async () => {
    if (currentOrder.length === 0) { alert('Add items'); return; }
    const order = {
      id: Date.now(), items: currentOrder, subtotal,
      manualDiscount, promoDiscount, loyaltyRedemption, specialDiscount, totalDiscount,
      afterDiscount, tax, total, paymentMethod,
      customerName: customerName || 'Walk-in', customerPhone: customerPhone || '',
      timestamp: new Date().toLocaleString(), date: new Date().toLocaleDateString(), time: new Date().toLocaleTimeString(),
      status: 'in_progress', startTime: Date.now(),
    };
    const firebaseDocId = await saveOrderToFirebase(order);
    if (firebaseDocId) order.firebaseDocId = firebaseDocId;
    setOrders([...orders, order]);
    setOrderStatuses({ ...orderStatuses, [order.id]: { status: 'in_progress', startTime: Date.now() } });
    if (customerPhone.length >= 10) await saveCustomer(customerPhone, order);
    if (appliedPromo) {
      setPromoCodes(promoCodes.map(p => p.code === appliedPromo.code ? { ...p, usedCount: (p.usedCount || 0) + 1 } : p));
    }
    setCurrentOrder([]); setCustomerName(''); setCustomerPhone(''); setCustomerData(null);
    setCustomerOrders([]); setPaymentMethod('cash'); setManualDiscountValue(0);
    setPromoCode(''); setAppliedPromo(null); setRedeemPoints(0);
    alert(firebaseDocId ? '✅ Order saved to cloud!' : '⚠️ Saved locally');
  };

  // NEW: Delete order with password
  const deleteOrder = async (order) => {
    if (deletePassword !== DELETE_PASSWORD) {
      alert('❌ Wrong password! Access denied.');
      return;
    }
    if (order.firebaseDocId) await deleteOrderFromFirebase(order.firebaseDocId);
    setOrders(orders.filter(o => o.id !== order.id));
    const newStatuses = { ...orderStatuses };
    delete newStatuses[order.id];
    setOrderStatuses(newStatuses);
    setDeletingOrderId(null);
    setDeletePassword('');
    alert('✅ Bill deleted successfully!');
  };

  // NEW: Delete promo with password
  const deletePromo = (promoIndex) => {
    if (deletePassword !== DELETE_PASSWORD) {
      alert('❌ Wrong password! Access denied.');
      return;
    }
    setPromoCodes(promoCodes.filter((_, i) => i !== promoIndex));
    setDeletingPromoId(null);
    setDeletePassword('');
    alert('✅ Promo code deleted!');
  };

  const printBill = () => {
    if (currentOrder.length === 0) { alert('No items'); return; }
    const w = settings.receiptSize === '58mm' ? 200 : 300;
    const bill = `\n${settings.cafeName}\n${settings.tagline}\n${settings.phone}\n─────────────────\nDate: ${new Date().toLocaleDateString()}\nTime: ${new Date().toLocaleTimeString()}\nCustomer: ${customerName || 'Walk-in'}\n${customerPhone ? 'Phone: ' + customerPhone + '\n' : ''}─────────────────\n${currentOrder.map(i => `${i.name} x${i.quantity}\n  ₹${i.price * i.quantity}`).join('\n')}\n─────────────────\nSubtotal: ₹${subtotal}\n${manualDiscount > 0 ? `Discount: -₹${manualDiscount.toFixed(0)}\n` : ''}${promoDiscount > 0 ? `Promo: -₹${promoDiscount.toFixed(0)}\n` : ''}${loyaltyRedemption > 0 ? `Points: -₹${loyaltyRedemption}\n` : ''}${specialDiscount > 0 ? `Loyal: -₹${specialDiscount.toFixed(0)}\n` : ''}Tax: ₹${tax.toFixed(0)}\n─────────────────\nTOTAL: ₹${total.toFixed(0)}\n─────────────────\nPayment: ${paymentMethod.toUpperCase()}\n─────────────────\n${settings.footerText}`;
    const win = window.open('', '', `height=600,width=${w + 100}`);
    win.document.write(`<pre style="font-family: monospace; font-size: ${settings.receiptSize === '58mm' ? '10px' : '12px'}; width: ${w}px; padding: 10px;">${bill}</pre>`);
    win.print(); win.close();
  };

  const sendWhatsApp = () => {
    if (currentOrder.length === 0) { alert('No items'); return; }
    const text = `*${settings.cafeName}*\n${settings.tagline}\n\n*Order:*\n${currentOrder.map(i => `• ${i.name} x${i.quantity} - ₹${i.price * i.quantity}`).join('\n')}\n\n*Total:* ₹${total.toFixed(0)}\n\n${settings.footerText}`;
    const url = `https://wa.me/${customerPhone ? '91' + customerPhone : ''}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const sharePromoWhatsApp = (promo) => {
    const text = `🎁 *${settings.cafeName}* - Special Offer! 🎁\n\nUse this promo code on your next visit:\n\n*${promo.code}*\n\n💰 Get ${promo.discountType === 'flat' ? '₹' : ''}${promo.discountValue}${promo.discountType === 'percent' ? '%' : ''} OFF!\n\n⏰ Valid till: ${new Date(promo.expiryDate).toLocaleDateString()}\n\n📍 ${settings.address}\n📞 ${settings.phone}\n\n${settings.tagline}`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const copyPromoCode = (code) => {
    navigator.clipboard.writeText(code);
    alert(`✅ Copied: ${code}`);
  };

  const addMenuItem = () => {
    if (!newItem.name || !newItem.price) { alert('Fill name and price'); return; }
    const id = Math.max(...menuItems.map(m => m.id), 0) + 1;
    setMenuItems([...menuItems, { ...newItem, id, price: parseFloat(newItem.price) }]);
    setNewItem({ name: '', price: '', category: 'Kaapfi Hot', emoji: '☕' });
  };
  const deleteMenuItem = (id) => { if (window.confirm('Delete?')) setMenuItems(menuItems.filter(m => m.id !== id)); };
  const updateMenuItem = () => { setMenuItems(menuItems.map(m => m.id === editingItem.id ? editingItem : m)); setEditingItem(null); };

  const generateBulkPromos = () => {
    const newCodes = [];
    for (let i = 0; i < bulkCount; i++) {
      newCodes.push({
        code: generatePromoCode(), discountType: bulkType, discountValue: parseFloat(bulkValue),
        expiryDate: new Date(Date.now() + 30 * 86400000).toISOString(),
        usageLimit: 1, usedCount: 0, createdAt: new Date().toISOString(),
      });
    }
    setPromoCodes([...promoCodes, ...newCodes]);
    alert(`✅ Generated ${bulkCount} codes!`);
  };

  const exportCSV = (days) => {
    const cutoff = new Date(Date.now() - days * 86400000);
    const filtered = orders.filter(o => new Date(o.timestamp || o.date) >= cutoff);
    if (filtered.length === 0) { alert('No orders in period'); return; }
    downloadCSV(filtered, `kaapfi-orders-${days}days.csv`);
  };

  const updateOrderStatus = (orderId, status) => {
    const cur = orderStatuses[orderId] || {};
    setOrderStatuses({ ...orderStatuses, [orderId]: { ...cur, status, ...(status === 'ready' ? { readyTime: Date.now() } : {}) } });
  };

  const categories = ['All', ...new Set(menuItems.map(item => item.category))];
  const filteredItems = selectedCategory === 'All' ? menuItems : menuItems.filter(item => item.category === selectedCategory);
  const todayOrders = orders.filter(o => o.date === new Date().toLocaleDateString());
  const todayRevenue = todayOrders.reduce((sum, o) => sum + o.total, 0);
  const aiRec = customerOrders.length > 0 ? getAIRecommendation(customerOrders, menuItems) : null;

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
          <p style={{ marginTop: '24px', fontSize: '12px', color: '#999' }}>🔒 Kaapfi POS v3.2</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', fontFamily: 'system-ui, sans-serif' }}>
      <header style={{ background: 'linear-gradient(135deg, #FC8019 0%, #E64A19 100%)', padding: '16px 24px', position: 'sticky', top: 0, zIndex: 100 }}>
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

      <nav style={{ background: '#fff', display: 'flex', borderBottom: '1px solid #eee', padding: '0 24px', overflowX: 'auto', gap: '8px' }}>
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
                  <div key={item.id} onClick={() => addToOrder(item)} style={{ background: '#fff', padding: '16px', borderRadius: '12px', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', textAlign: 'center' }}>
                    <div style={{ fontSize: '36px', marginBottom: '8px' }}>{item.emoji || '🍽️'}</div>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#1a1a1a', marginBottom: '4px', minHeight: '36px' }}>{item.name}</div>
                    <div style={{ fontSize: '15px', color: '#FC8019', fontWeight: '700' }}>₹{item.price}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: '#fff', borderRadius: '12px', padding: '20px', height: 'fit-content', position: 'sticky', top: '100px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', maxHeight: 'calc(100vh - 120px)', overflowY: 'auto' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '18px', fontWeight: '700', color: '#1a1a1a' }}>🛒 Current Order ({currentOrder.length})</h3>

              <input type="tel" placeholder="Customer phone (for loyalty)" value={customerPhone} onChange={(e) => handlePhoneChange(e.target.value)} style={{ width: '100%', padding: '10px 14px', fontSize: '14px', border: '2px solid #FC8019', borderRadius: '8px', marginBottom: '10px', boxSizing: 'border-box', outline: 'none' }} />
              <input type="text" placeholder="Customer name (optional)" value={customerName} onChange={(e) => setCustomerName(e.target.value)} style={{ width: '100%', padding: '10px 14px', fontSize: '14px', border: '1px solid #e0e0e0', borderRadius: '8px', marginBottom: '12px', boxSizing: 'border-box', outline: 'none' }} />

              {/* CUSTOMER HISTORY ON BILLING PAGE - Enhanced for staff */}
              {customerData && (
                <>
                  <div style={{ background: 'linear-gradient(135deg, #FC8019 0%, #E64A19 100%)', padding: '12px', borderRadius: '8px', marginBottom: '10px', color: '#fff' }}>
                    <div style={{ fontSize: '14px', fontWeight: '700' }}>👋 {customerData.name || 'Customer'}</div>
                    <div style={{ fontSize: '11px', opacity: 0.9, marginTop: '2px' }}>📱 {customerData.phone}</div>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', marginBottom: '10px' }}>
                    <div style={{ background: '#e8f5e9', padding: '8px', borderRadius: '6px', textAlign: 'center' }}>
                      <div style={{ fontSize: '10px', color: '#666' }}>Points</div>
                      <div style={{ fontSize: '16px', fontWeight: '700', color: '#4CAF50' }}>{customerData.loyaltyPoints || 0}</div>
                    </div>
                    <div style={{ background: '#e3f2fd', padding: '8px', borderRadius: '6px', textAlign: 'center' }}>
                      <div style={{ fontSize: '10px', color: '#666' }}>Visits</div>
                      <div style={{ fontSize: '16px', fontWeight: '700', color: '#2196F3' }}>{customerData.totalOrders}</div>
                    </div>
                    <div style={{ background: '#fff3e0', padding: '8px', borderRadius: '6px', textAlign: 'center' }}>
                      <div style={{ fontSize: '10px', color: '#666' }}>Spent</div>
                      <div style={{ fontSize: '14px', fontWeight: '700', color: '#FC8019' }}>₹{customerData.totalSpent}</div>
                    </div>
                  </div>

                  {aiRec && (
                    <div style={{ background: 'linear-gradient(135deg, #9C27B0 0%, #673AB7 100%)', padding: '10px', borderRadius: '8px', marginBottom: '10px', color: '#fff' }}>
                      <div style={{ fontSize: '10px', opacity: 0.9, fontWeight: '700', marginBottom: '4px' }}>🤖 AI SUGGESTION</div>
                      <div style={{ fontSize: '12px', fontWeight: '600' }}>{aiRec.message}</div>
                      {aiRec.items.length > 0 && (
                        <div style={{ marginTop: '6px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {aiRec.items.slice(0, 3).map((item, i) => (
                            <span key={i} style={{ background: 'rgba(255,255,255,0.25)', padding: '3px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: '600' }}>
                              {i === 0 ? '⭐' : '📌'} {item.name} ({item.count}x)
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {specialCheck.eligible && (
                    <div style={{ background: '#4CAF50', color: '#fff', padding: '8px', borderRadius: '6px', marginBottom: '10px', textAlign: 'center', fontWeight: '700', fontSize: '12px' }}>
                      ⭐ LOYAL CUSTOMER OFFER! {specialCheck.discountValue}% OFF
                    </div>
                  )}

                  {customerOrders.length > 0 && (
                    <div style={{ background: '#f5f5f5', padding: '10px', borderRadius: '8px', marginBottom: '10px' }}>
                      <div style={{ fontSize: '11px', fontWeight: '700', color: '#333', marginBottom: '6px' }}>📋 Recent Orders:</div>
                      <div style={{ maxHeight: '120px', overflowY: 'auto' }}>
                        {customerOrders.slice(0, 5).map(o => (
                          <div key={o.id} style={{ fontSize: '10px', color: '#666', marginBottom: '4px', padding: '4px', background: '#fff', borderRadius: '4px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span>{o.date}</span>
                              <span style={{ fontWeight: '700', color: '#FC8019' }}>₹{o.total?.toFixed(0)}</span>
                            </div>
                            <div style={{ fontSize: '9px', color: '#999', marginTop: '2px' }}>{(o.items || []).map(i => `${i.name} x${i.quantity}`).join(', ')}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              <div style={{ maxHeight: '250px', overflowY: 'auto', marginBottom: '12px' }}>
                {currentOrder.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '30px 20px', color: '#999' }}>
                    <div style={{ fontSize: '48px' }}>🛒</div>
                    <p style={{ fontSize: '13px' }}>No items yet</p>
                  </div>
                ) : (
                  currentOrder.map(item => (
                    <div key={item.id} style={{ padding: '10px', background: '#f9f9f9', borderRadius: '8px', marginBottom: '6px', border: '1px solid #e0e0e0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', alignItems: 'center' }}>
                        <span style={{ fontSize: '13px', fontWeight: '700', color: '#1a1a1a' }}>{item.emoji} {item.name}</span>
                        <button onClick={() => removeFromOrder(item.id)} style={{ background: 'none', border: 'none', color: '#E64A19', cursor: 'pointer', fontSize: '18px', fontWeight: '700' }}>×</button>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)} style={{ width: '24px', height: '24px', borderRadius: '4px', border: '1px solid #FC8019', background: '#fff', color: '#FC8019', cursor: 'pointer', fontWeight: '700' }}>−</button>
                          <span style={{ minWidth: '20px', textAlign: 'center', fontWeight: '700', fontSize: '14px', color: '#1a1a1a' }}>{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)} style={{ width: '24px', height: '24px', borderRadius: '4px', border: '1px solid #FC8019', background: '#FC8019', color: '#fff', cursor: 'pointer', fontWeight: '700' }}>+</button>
                        </div>
                        <span style={{ fontWeight: '700', fontSize: '14px', color: '#1a1a1a' }}>₹{item.price * item.quantity}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {currentOrder.length > 0 && (
                <>
                  <div style={{ marginBottom: '10px', padding: '10px', background: '#fff9e6', borderRadius: '8px' }}>
                    <label style={{ fontSize: '11px', fontWeight: '700', color: '#666' }}>💰 Manual Discount</label>
                    <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                      <select value={manualDiscountType} onChange={(e) => setManualDiscountType(e.target.value)} style={{ padding: '6px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '12px' }}>
                        <option value="flat">₹</option><option value="percent">%</option>
                      </select>
                      <input type="number" value={manualDiscountValue} onChange={(e) => setManualDiscountValue(e.target.value)} placeholder="0" style={{ flex: 1, padding: '6px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '12px' }} />
                    </div>
                  </div>

                  <div style={{ marginBottom: '10px', padding: '10px', background: '#e3f2fd', borderRadius: '8px' }}>
                    <label style={{ fontSize: '11px', fontWeight: '700', color: '#666' }}>🎁 Promo Code</label>
                    <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                      <input type="text" value={promoCode} onChange={(e) => setPromoCode(e.target.value.toUpperCase())} placeholder="KF1234" style={{ flex: 1, padding: '6px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '12px' }} />
                      <button onClick={applyPromo} style={{ padding: '6px 12px', background: '#2196F3', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: '700' }}>Apply</button>
                    </div>
                    {appliedPromo && <div style={{ marginTop: '4px', fontSize: '11px', color: '#4CAF50', fontWeight: '700' }}>✓ {appliedPromo.code} applied</div>}
                  </div>

                  {customerData && customerData.loyaltyPoints > 0 && (
                    <div style={{ marginBottom: '10px', padding: '10px', background: '#fce4ec', borderRadius: '8px' }}>
                      <label style={{ fontSize: '11px', fontWeight: '700', color: '#666' }}>🏆 Redeem ({customerData.loyaltyPoints} pts)</label>
                      <input type="number" min="0" max={customerData.loyaltyPoints} value={redeemPoints} onChange={(e) => setRedeemPoints(Math.min(parseInt(e.target.value) || 0, customerData.loyaltyPoints))} style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '12px', marginTop: '4px', boxSizing: 'border-box' }} />
                      {redeemPoints > 0 && <div style={{ fontSize: '11px', color: '#E91E63', marginTop: '4px' }}>= ₹{loyaltyRedemption} off</div>}
                    </div>
                  )}

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

        {/* BILLS TAB - with DELETE button */}
        {activeTab === 'bills' && (
          <div>
            <h2 style={{ fontSize: '24px', margin: '0 0 20px', color: '#1a1a1a' }}>🧾 Today's Orders</h2>
            {todayOrders.length === 0 ? (
              <div style={{ background: '#fff', padding: '60px', borderRadius: '12px', textAlign: 'center', color: '#999' }}><div style={{ fontSize: '64px' }}>📭</div><p>No orders yet</p></div>
            ) : (
              <div style={{ display: 'grid', gap: '12px' }}>
                {todayOrders.slice().reverse().map(order => (
                  <div key={order.id} style={{ background: '#fff', padding: '16px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div>
                        <div style={{ fontWeight: '700', color: '#1a1a1a' }}>#{order.id.toString().slice(-5)}</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>{order.customerName} {order.customerPhone && `• ${order.customerPhone}`} • {order.time}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '18px', fontWeight: '700', color: '#FC8019' }}>₹{order.total?.toFixed(0)}</div>
                        <div style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase' }}>{order.paymentMethod}</div>
                      </div>
                    </div>
                    <div style={{ fontSize: '12px', color: '#888', marginBottom: '10px' }}>{(order.items || []).map(i => `${i.name} x${i.quantity}`).join(', ')}</div>
                    
                    {/* DELETE BUTTON WITH PASSWORD */}
                    {deletingOrderId === order.id ? (
                      <div style={{ display: 'flex', gap: '6px', padding: '10px', background: '#ffebee', borderRadius: '6px' }}>
                        <input type="password" placeholder="Delete password" value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} style={{ flex: 1, padding: '8px', border: '1px solid #E64A19', borderRadius: '4px', fontSize: '12px' }} />
                        <button onClick={() => deleteOrder(order)} style={{ padding: '8px 12px', background: '#E64A19', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }}>Confirm</button>
                        <button onClick={() => { setDeletingOrderId(null); setDeletePassword(''); }} style={{ padding: '8px 12px', background: '#999', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }}>Cancel</button>
                      </div>
                    ) : (
                      <button onClick={() => setDeletingOrderId(order.id)} style={{ padding: '6px 12px', background: '#fff', color: '#E64A19', border: '1px solid #E64A19', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: '600' }}>🗑️ Delete Bill</button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'kitchen' && (
          <div>
            <h2 style={{ fontSize: '24px', margin: '0 0 20px', color: '#1a1a1a' }}>👨‍🍳 Kitchen Display</h2>
            <div style={{ display: 'grid', gap: '12px' }}>
              {todayOrders.filter(o => (orderStatuses[o.id]?.status || 'in_progress') !== 'delivered').map(order => {
                const status = orderStatuses[order.id] || { status: 'in_progress', startTime: order.startTime || Date.now() };
                const elapsed = Math.floor((Date.now() - (status.startTime || Date.now())) / 60000);
                const isLate = elapsed > 10;
                return (
                  <div key={order.id} style={{ background: '#fff', padding: '16px', borderRadius: '12px', border: isLate ? '2px solid #E64A19' : '2px solid transparent', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div style={{ fontWeight: '700', color: '#1a1a1a' }}>#{order.id.toString().slice(-5)} • {order.customerName}</div>
                      <div style={{ background: isLate ? '#E64A19' : '#4CAF50', color: '#fff', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '700' }}>⏱️ {elapsed} min</div>
                    </div>
                    <div style={{ fontSize: '13px', marginBottom: '12px', color: '#333' }}>{(order.items || []).map(i => `${i.name} x${i.quantity}`).join(', ')}</div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button onClick={() => updateOrderStatus(order.id, 'in_progress')} style={{ padding: '8px 12px', background: status.status === 'in_progress' ? '#FF9800' : '#f0f0f0', color: status.status === 'in_progress' ? '#fff' : '#666', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>🔥 Progress</button>
                      <button onClick={() => updateOrderStatus(order.id, 'ready')} style={{ padding: '8px 12px', background: status.status === 'ready' ? '#4CAF50' : '#f0f0f0', color: status.status === 'ready' ? '#fff' : '#666', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>✅ Ready</button>
                      <button onClick={() => updateOrderStatus(order.id, 'delivered')} style={{ padding: '8px 12px', background: '#2196F3', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>📦 Delivered</button>
                    </div>
                  </div>
                );
              })}
              {todayOrders.filter(o => (orderStatuses[o.id]?.status || 'in_progress') !== 'delivered').length === 0 && (
                <div style={{ background: '#fff', padding: '60px', borderRadius: '12px', textAlign: 'center', color: '#999' }}><div style={{ fontSize: '64px' }}>🎉</div><p>All done!</p></div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
              <h2 style={{ fontSize: '24px', margin: 0, color: '#1a1a1a' }}>📊 Reports</h2>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => exportCSV(1)} style={{ padding: '10px 16px', background: '#4CAF50', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>📥 24h</button>
                <button onClick={() => exportCSV(7)} style={{ padding: '10px 16px', background: '#2196F3', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>📥 7 days</button>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              {[
                { label: 'Total Orders', value: todayOrders.length, color: '#FC8019', emoji: '📦' },
                { label: 'Total Revenue', value: `₹${todayRevenue}`, color: '#4CAF50', emoji: '💰' },
                { label: 'Avg Order', value: `₹${todayOrders.length > 0 ? (todayRevenue / todayOrders.length).toFixed(0) : 0}`, color: '#2196F3', emoji: '📈' },
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

        {activeTab === 'firebase' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '24px', margin: 0, color: '#1a1a1a' }}>☁️ Cloud Orders</h2>
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
                          <div style={{ fontWeight: '700', color: '#1a1a1a' }}>{order.customerName || 'Walk-in'} {order.customerPhone && `• ${order.customerPhone}`}</div>
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

        {activeTab === 'menu' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
              <h2 style={{ fontSize: '24px', margin: 0, color: '#1a1a1a' }}>🍽️ Menu Management</h2>
              <button onClick={resetMenuToDefault} style={{ padding: '10px 16px', background: '#FC8019', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>🔄 Reset to Kaapfi Default</button>
            </div>
            <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <h3 style={{ fontSize: '16px', margin: '0 0 12px', color: '#1a1a1a' }}>➕ Add New Item</h3>
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
                          <div style={{ fontWeight: '600', color: '#1a1a1a', fontSize: '13px' }}>{item.name}</div>
                          <div style={{ fontSize: '11px', color: '#666' }}>{item.category} • ₹{item.price}</div>
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

        {/* PROMOS - with DELETE */}
        {activeTab === 'promos' && (
          <div>
            <h2 style={{ fontSize: '24px', margin: '0 0 20px', color: '#1a1a1a' }}>🎁 Promo Codes</h2>
            <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <h3 style={{ fontSize: '16px', margin: '0 0 12px', color: '#1a1a1a' }}>Generate Bulk Codes</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '8px' }}>
                <select value={bulkCount} onChange={(e) => setBulkCount(parseInt(e.target.value))} style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}>
                  <option value={20}>20 codes</option><option value={50}>50 codes</option>
                  <option value={100}>100 codes</option><option value={200}>200 codes</option>
                </select>
                <select value={bulkType} onChange={(e) => setBulkType(e.target.value)} style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}>
                  <option value="percent">% Off</option><option value="flat">₹ Flat</option>
                </select>
                <input type="number" value={bulkValue} onChange={(e) => setBulkValue(e.target.value)} style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }} />
                <button onClick={generateBulkPromos} style={{ padding: '10px', background: '#FC8019', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>Generate</button>
              </div>
            </div>

            {promoCodes.length > 0 && (
              <div style={{ marginBottom: '12px', color: '#666', fontSize: '13px' }}>
                Total: {promoCodes.length} codes • Available: {promoCodes.filter(p => (p.usedCount || 0) < p.usageLimit).length}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '12px' }}>
              {promoCodes.slice().reverse().map((p, reverseI) => {
                const i = promoCodes.length - 1 - reverseI;
                const isUsed = (p.usedCount || 0) >= p.usageLimit;
                return (
                  <div key={i} style={{ background: isUsed ? '#f5f5f5' : '#fff', padding: '14px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', opacity: isUsed ? 0.6 : 1, border: isUsed ? '1px solid #ccc' : '2px solid #FC8019' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <div style={{ fontSize: '18px', fontWeight: '700', color: '#FC8019', fontFamily: 'monospace' }}>{p.code}</div>
                      {isUsed && <span style={{ fontSize: '10px', background: '#E64A19', color: '#fff', padding: '2px 6px', borderRadius: '4px' }}>USED</span>}
                    </div>
                    <div style={{ fontSize: '13px', color: '#333', fontWeight: '600' }}>{p.discountType === 'flat' ? '₹' : ''}{p.discountValue}{p.discountType === 'percent' ? '%' : ''} off</div>
                    <div style={{ fontSize: '10px', color: '#999', marginTop: '4px' }}>Expires: {new Date(p.expiryDate).toLocaleDateString()}</div>
                    <div style={{ fontSize: '10px', color: '#999' }}>Used: {p.usedCount || 0}/{p.usageLimit}</div>
                    
                    {deletingPromoId === i ? (
                      <div style={{ marginTop: '8px', padding: '8px', background: '#ffebee', borderRadius: '4px' }}>
                        <input type="password" placeholder="Password" value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} style={{ width: '100%', padding: '6px', border: '1px solid #E64A19', borderRadius: '4px', fontSize: '11px', marginBottom: '4px', boxSizing: 'border-box' }} />
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button onClick={() => deletePromo(i)} style={{ flex: 1, padding: '6px', background: '#E64A19', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '10px' }}>Delete</button>
                          <button onClick={() => { setDeletingPromoId(null); setDeletePassword(''); }} style={{ flex: 1, padding: '6px', background: '#999', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '10px' }}>Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: '4px', marginTop: '8px' }}>
                        {!isUsed && (
                          <>
                            <button onClick={() => copyPromoCode(p.code)} style={{ flex: 1, padding: '6px', background: '#2196F3', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '10px', fontWeight: '700' }}>📋</button>
                            <button onClick={() => sharePromoWhatsApp(p)} style={{ flex: 1, padding: '6px', background: '#25D366', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '10px', fontWeight: '700' }}>📱</button>
                          </>
                        )}
                        <button onClick={() => setDeletingPromoId(i)} style={{ flex: 1, padding: '6px', background: '#E64A19', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '10px', fontWeight: '700' }}>🗑️</button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'customers' && (
          <div>
            <h2 style={{ fontSize: '24px', margin: '0 0 20px', color: '#1a1a1a' }}>👥 Customer Lookup</h2>
            <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <h3 style={{ fontSize: '16px', margin: '0 0 12px', color: '#1a1a1a' }}>🔍 Search Customer</h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input type="tel" placeholder="Enter 10-digit phone number..." value={lookupPhone} onChange={(e) => setLookupPhone(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && performLookup()} style={{ flex: 1, padding: '12px', border: '2px solid #FC8019', borderRadius: '8px', fontSize: '16px', outline: 'none' }} />
                <button onClick={performLookup} style={{ padding: '12px 24px', background: '#FC8019', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '14px' }}>{lookupLoading ? '⏳' : '🔍 Search'}</button>
              </div>
            </div>

            {lookupLoading && <div style={{ background: '#fff', padding: '40px', borderRadius: '12px', textAlign: 'center' }}>⏳ Searching...</div>}

            {!lookupLoading && lookupPhone && !lookupCustomer && lookupPhone.length >= 10 && (
              <div style={{ background: '#fff', padding: '40px', borderRadius: '12px', textAlign: 'center', color: '#999' }}>
                <div style={{ fontSize: '48px' }}>🤷</div>
                <p style={{ fontWeight: '600', color: '#666' }}>New customer!</p>
                <p style={{ fontSize: '13px' }}>No records for {lookupPhone}</p>
              </div>
            )}

            {lookupCustomer && (
              <>
                <div style={{ background: 'linear-gradient(135deg, #FC8019 0%, #E64A19 100%)', padding: '24px', borderRadius: '12px', color: '#fff', marginBottom: '16px' }}>
                  <div style={{ fontSize: '14px', opacity: 0.9 }}>Customer</div>
                  <div style={{ fontSize: '28px', fontWeight: '700' }}>{lookupCustomer.name || 'Customer'}</div>
                  <div style={{ fontSize: '13px', marginTop: '4px', opacity: 0.9 }}>📱 {lookupCustomer.phone}</div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ background: '#fff', padding: '16px', borderRadius: '12px', borderLeft: '4px solid #4CAF50' }}>
                    <div style={{ fontSize: '24px' }}>🏆</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>Loyalty Points</div>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: '#4CAF50' }}>{lookupCustomer.loyaltyPoints || 0}</div>
                  </div>
                  <div style={{ background: '#fff', padding: '16px', borderRadius: '12px', borderLeft: '4px solid #2196F3' }}>
                    <div style={{ fontSize: '24px' }}>📦</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>Total Orders</div>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: '#2196F3' }}>{lookupCustomer.totalOrders || 0}</div>
                  </div>
                  <div style={{ background: '#fff', padding: '16px', borderRadius: '12px', borderLeft: '4px solid #FC8019' }}>
                    <div style={{ fontSize: '24px' }}>💰</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>Total Spent</div>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: '#FC8019' }}>₹{lookupCustomer.totalSpent || 0}</div>
                  </div>
                </div>

                {lookupAI && (
                  <div style={{ background: 'linear-gradient(135deg, #9C27B0 0%, #673AB7 100%)', padding: '20px', borderRadius: '12px', color: '#fff', marginBottom: '16px' }}>
                    <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>🤖 AI RECOMMENDATION</div>
                    <div style={{ fontSize: '20px', fontWeight: '700', marginBottom: '12px' }}>{lookupAI.message}</div>
                    {lookupAI.items.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {lookupAI.items.map((item, i) => (
                          <div key={i} style={{ background: 'rgba(255,255,255,0.2)', padding: '6px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: '600' }}>
                            {i === 0 ? '⭐' : '📌'} {item.name} ({item.count}x)
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div style={{ background: '#fff', padding: '20px', borderRadius: '12px' }}>
                  <h3 style={{ fontSize: '16px', margin: '0 0 12px', color: '#1a1a1a' }}>📋 Order History ({lookupOrders.length})</h3>
                  {lookupOrders.length === 0 ? <p style={{ color: '#999', textAlign: 'center' }}>No orders yet</p> : (
                    <div style={{ display: 'grid', gap: '8px', maxHeight: '400px', overflowY: 'auto' }}>
                      {lookupOrders.slice(0, 10).map(o => (
                        <div key={o.id} style={{ padding: '12px', background: '#f9f9f9', borderRadius: '8px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '12px', color: '#666' }}>{o.date} • {o.time}</span>
                            <span style={{ fontSize: '14px', fontWeight: '700', color: '#FC8019' }}>₹{o.total?.toFixed(0)}</span>
                          </div>
                          <div style={{ fontSize: '12px', color: '#333', marginTop: '4px' }}>{(o.items || []).map(i => `${i.name} x${i.quantity}`).join(', ')}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {!lookupCustomer && allCustomers.length > 0 && (
              <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', marginTop: '20px' }}>
                <h3 style={{ fontSize: '16px', margin: '0 0 12px', color: '#1a1a1a' }}>🏆 Top Customers ({allCustomers.length})</h3>
                <div style={{ display: 'grid', gap: '8px', maxHeight: '400px', overflowY: 'auto' }}>
                  {allCustomers.slice(0, 20).map(c => (
                    <div key={c.phone} onClick={() => { setLookupPhone(c.phone); performLookup(); }} style={{ padding: '12px', background: '#f9f9f9', borderRadius: '8px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ fontWeight: '700', color: '#1a1a1a' }}>{c.name || 'Customer'} • {c.phone}</div>
                        <div style={{ fontSize: '11px', color: '#666' }}>{c.totalOrders} orders • 🏆 {c.loyaltyPoints} points</div>
                      </div>
                      <div style={{ fontSize: '16px', fontWeight: '700', color: '#FC8019' }}>₹{c.totalSpent}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div style={{ maxWidth: '700px' }}>
            <h2 style={{ fontSize: '24px', margin: '0 0 20px', color: '#1a1a1a' }}>⚙️ Settings</h2>
            <div style={{ background: '#fff', padding: '24px', borderRadius: '12px' }}>
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
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '13px', color: '#666', fontWeight: '600', marginBottom: '4px' }}>Tax Rate (%)</label>
                <input type="number" value={settings.taxRate} onChange={(e) => setSettings({ ...settings, taxRate: parseFloat(e.target.value) || 0 })} style={{ width: '100%', padding: '10px', border: '1px solid #e0e0e0', borderRadius: '6px', boxSizing: 'border-box' }} />
              </div>
              <div style={{ padding: '12px', background: '#fff3e0', borderRadius: '8px', fontSize: '12px', color: '#E64A19', marginTop: '16px' }}>
                🔒 <strong>Delete Password:</strong> 9923022925 (keep secure)
              </div>
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
