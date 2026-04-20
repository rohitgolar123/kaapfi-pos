import React, { useState, useEffect } from 'react';
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, doc, setDoc, getDoc, updateDoc, query, where, deleteDoc, onSnapshot } from "firebase/firestore";

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
  preventNegativeStock: false,
};

const defaultMenu = [
  { id: 1, name: 'Milk Filter Coffee', price: 20, category: 'Kaapfi Hot', emoji: '☕' },
  { id: 2, name: 'Black Filter Coffee', price: 20, category: 'Kaapfi Hot', emoji: '☕' },
  { id: 3, name: 'Classic Iced Filter', price: 110, category: 'Iced Filter', emoji: '🧊' },
  { id: 4, name: 'Hazelnut Iced Filter', price: 120, category: 'Iced Filter', emoji: '🧊' },
  { id: 5, name: 'Vanilla Iced Filter', price: 125, category: 'Iced Filter', emoji: '🧊' },
  { id: 6, name: 'Salted Caramel Iced', price: 120, category: 'Iced Filter', emoji: '🧊' },
  { id: 7, name: 'Rose Iced Filter', price: 125, category: 'Iced Filter', emoji: '🌹' },
  { id: 8, name: 'Strawberry Iced', price: 125, category: 'Iced Filter', emoji: '🍓' },
  { id: 9, name: 'Classic Cold Brew', price: 100, category: 'Cold Brew', emoji: '❄️' },
  { id: 10, name: 'Cranberry Cold Brew', price: 120, category: 'Cold Brew', emoji: '🔴' },
  { id: 11, name: 'Orange Cold Brew', price: 120, category: 'Cold Brew', emoji: '🍊' },
  { id: 12, name: 'Ginger Ale Cold Brew', price: 120, category: 'Cold Brew', emoji: '🫚' },
  { id: 13, name: 'Tonic Cold Brew', price: 120, category: 'Cold Brew', emoji: '💧' },
  { id: 14, name: 'Ocean Brew', price: 125, category: 'Cold Brew', emoji: '🌊' },
  { id: 15, name: 'Kaccha Aam Brew', price: 125, category: 'Cold Brew', emoji: '🥭' },
  { id: 16, name: 'Kokum Brew', price: 125, category: 'Cold Brew', emoji: '🍒' },
  { id: 17, name: 'Roohafza Brew', price: 125, category: 'Cold Brew', emoji: '🌸' },
  { id: 18, name: 'Thatte Idli', price: 45, category: 'Idli', emoji: '🍚' },
  { id: 19, name: 'Ghee Thatte Idli', price: 60, category: 'Idli', emoji: '🍚' },
  { id: 20, name: 'Ghee Podi Thatte Idli', price: 70, category: 'Idli', emoji: '🍚' },
  { id: 21, name: 'Idli with Veg Curry', price: 60, category: 'Idli', emoji: '🥘' },
  { id: 22, name: 'Idli with Chicken Curry', price: 100, category: 'Idli', emoji: '🍗' },
  { id: 23, name: 'Paneer Chatpata', price: 99, category: 'Malabar Paratha', emoji: '🫓' },
  { id: 24, name: 'Paneer Savji', price: 99, category: 'Malabar Paratha', emoji: '🫓' },
  { id: 25, name: 'Paneer Makkhanwala', price: 99, category: 'Malabar Paratha', emoji: '🫓' },
  { id: 26, name: 'Paneer Achari', price: 99, category: 'Malabar Paratha', emoji: '🫓' },
  { id: 27, name: 'Burnt Garlic Creamy Chicken', price: 125, category: 'Malabar Paratha', emoji: '🍗' },
  { id: 28, name: 'Chicken Achari', price: 99, category: 'Malabar Paratha', emoji: '🍗' },
  { id: 29, name: 'Smokey BBQ Chicken', price: 99, category: 'Malabar Paratha', emoji: '🔥' },
  { id: 30, name: 'Crispy Creamy Chicken', price: 125, category: 'Malabar Paratha', emoji: '🍗' },
];

const defaultInventory = [
  { id: 1, name: 'Filter Coffee Powder', quantity: 2000, unit: 'g', threshold: 200 },
  { id: 2, name: 'Milk', quantity: 10000, unit: 'ml', threshold: 1000 },
  { id: 3, name: 'Paneer', quantity: 5000, unit: 'g', threshold: 500 },
  { id: 4, name: 'Gravy Base', quantity: 3000, unit: 'ml', threshold: 300 },
  { id: 5, name: 'Paratha', quantity: 100, unit: 'units', threshold: 10 },
  { id: 6, name: 'Cold Brew Concentrate', quantity: 3000, unit: 'ml', threshold: 300 },
  { id: 7, name: 'Ice', quantity: 5000, unit: 'g', threshold: 500 },
  { id: 8, name: 'Idli Batter', quantity: 5000, unit: 'g', threshold: 500 },
  { id: 9, name: 'Chicken', quantity: 2000, unit: 'g', threshold: 300 },
  { id: 10, name: 'Onion', quantity: 2000, unit: 'g', threshold: 200 },
];

const defaultSOPs = {
  'Milk Filter Coffee': [{ ingredient: 'Filter Coffee Powder', quantity: 15 }, { ingredient: 'Milk', quantity: 100 }],
  'Classic Cold Brew': [{ ingredient: 'Cold Brew Concentrate', quantity: 150 }, { ingredient: 'Ice', quantity: 50 }],
  'Paneer Chatpata': [{ ingredient: 'Paneer', quantity: 80 }, { ingredient: 'Gravy Base', quantity: 100 }, { ingredient: 'Paratha', quantity: 1 }, { ingredient: 'Onion', quantity: 20 }],
  'Chicken Achari': [{ ingredient: 'Chicken', quantity: 80 }, { ingredient: 'Gravy Base', quantity: 100 }, { ingredient: 'Paratha', quantity: 1 }, { ingredient: 'Onion', quantity: 20 }],
  'Thatte Idli': [{ ingredient: 'Idli Batter', quantity: 150 }],
};

// FIREBASE HELPERS - ALL DATA SYNCED TO CLOUD

async function saveInventoryToCloud(inventory) {
  try { await setDoc(doc(db, "appData", "inventory"), { items: inventory, updatedAt: new Date().toISOString() }); return true; } catch (e) { return false; }
}

async function saveExpensesToCloud(expenses) {
  try { await setDoc(doc(db, "appData", "expenses"), { items: expenses, updatedAt: new Date().toISOString() }); return true; } catch (e) { return false; }
}

async function saveMenuToCloud(menu) {
  try { await setDoc(doc(db, "appData", "menu"), { items: menu, updatedAt: new Date().toISOString() }); return true; } catch (e) { return false; }
}

async function saveSOPsToCloud(sops) {
  try { await setDoc(doc(db, "appData", "sops"), { data: sops, updatedAt: new Date().toISOString() }); return true; } catch (e) { return false; }
}

async function savePromosToCloud(promos) {
  try { await setDoc(doc(db, "appData", "promos"), { items: promos, updatedAt: new Date().toISOString() }); return true; } catch (e) { return false; }
}

async function saveSettingsToCloud(settings) {
  try { await setDoc(doc(db, "appData", "settings"), { data: settings, updatedAt: new Date().toISOString() }); return true; } catch (e) { return false; }
}

async function saveOrderToFirebase(order) {
  try { const docRef = await addDoc(collection(db, "orders"), { ...order, timestamp: new Date().toISOString() }); return docRef.id; } catch (e) { return null; }
}

async function deleteOrderFromFirebase(docId) { try { await deleteDoc(doc(db, "orders", docId)); return true; } catch (e) { return false; } }

async function saveCustomer(phone, orderData) {
  try {
    const customerRef = doc(db, "customers", phone);
    const snap = await getDoc(customerRef);
    const now = new Date().toISOString();
    if (snap.exists()) {
      const data = snap.data();
      await updateDoc(customerRef, { totalOrders: (data.totalOrders || 0) + 1, totalSpent: (data.totalSpent || 0) + orderData.total, loyaltyPoints: Math.floor(((data.totalSpent || 0) + orderData.total) / 100), visitHistory: [...(data.visitHistory || []), now], lastOrder: now });
    } else {
      await setDoc(customerRef, { phone, name: orderData.customerName, totalOrders: 1, totalSpent: orderData.total, loyaltyPoints: Math.floor(orderData.total / 100), visitHistory: [now], firstOrder: now, lastOrder: now });
    }
    return true;
  } catch (e) { return false; }
}

async function getCustomer(phone) { try { const snap = await getDoc(doc(db, "customers", phone)); return snap.exists() ? snap.data() : null; } catch (e) { return null; } }

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
  try { const snap = await getDocs(collection(db, "customers")); const customers = []; snap.forEach(d => customers.push({ id: d.id, ...d.data() })); return customers.sort((a, b) => (b.totalSpent || 0) - (a.totalSpent || 0)); } catch (e) { return []; }
}

function checkSpecialLoyalty(customerData, settings) {
  if (!customerData || !customerData.visitHistory) return { eligible: false };
  const now = new Date();
  const [startH, startM] = settings.specialLoyaltyStart.split(':').map(Number);
  const [endH, endM] = settings.specialLoyaltyEnd.split(':').map(Number);
  const currentMin = now.getHours() * 60 + now.getMinutes();
  if (currentMin < startH * 60 + startM || currentMin > endH * 60 + endM) return { eligible: false };
  const cutoff = new Date(now.getTime() - settings.specialLoyaltyDays * 86400000);
  const recentVisits = customerData.visitHistory.filter(t => new Date(t) >= cutoff);
  if (recentVisits.length >= settings.specialLoyaltyVisits) return { eligible: true, discountValue: settings.specialLoyaltyDiscount, visits: recentVisits.length };
  return { eligible: false };
}

function generatePromoCode() { return 'KF' + Math.random().toString(36).substring(2, 6).toUpperCase(); }

function getAIRecommendation(customerOrders, menu) {
  if (!customerOrders || customerOrders.length === 0) return { message: "👋 New customer! Try our Classic Iced Filter ☕", items: [] };
  const itemCounts = {};
  customerOrders.forEach(order => { (order.items || []).forEach(item => { itemCounts[item.name] = (itemCounts[item.name] || 0) + item.quantity; }); });
  const favorites = Object.entries(itemCounts).sort((a, b) => b[1] - a[1]).slice(0, 3);
  const favItem = favorites[0]?.[0] || 'Classic Iced Filter';
  const totalVisits = customerOrders.length;
  let message = '';
  if (totalVisits === 1) message = `Welcome back! Your usual ${favItem}? 😊`;
  else if (totalVisits < 5) message = `Hey! Your favorite ${favItem}?`;
  else if (totalVisits < 10) message = `Great to see you! ${favItem} as usual? ☕`;
  else message = `Our VIP is here! 🌟 Same great ${favItem}?`;
  return { message, items: favorites.map(([name, count]) => ({ name, count })) };
}

function downloadCSV(data, filename) {
  const csv = ['Date,Time,Customer,Phone,Items,Subtotal,Discount,Total,Payment',
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
  const [settings, setSettings] = useState(defaultSettings);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [manualDiscountType, setManualDiscountType] = useState('flat');
  const [manualDiscountValue, setManualDiscountValue] = useState(0);
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [redeemPoints, setRedeemPoints] = useState(0);
  const [editingItem, setEditingItem] = useState(null);
  const [newItem, setNewItem] = useState({ name: '', price: '', category: 'Kaapfi Hot', emoji: '☕' });
  const [promoCodes, setPromoCodes] = useState([]);
  const [orderStatuses, setOrderStatuses] = useState({});
  const [lookupPhone, setLookupPhone] = useState('');
  const [lookupCustomer, setLookupCustomer] = useState(null);
  const [lookupOrders, setLookupOrders] = useState([]);
  const [lookupAI, setLookupAI] = useState(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [allCustomers, setAllCustomers] = useState([]);
  const [selectedBills, setSelectedBills] = useState([]);
  const [selectedPromos, setSelectedPromos] = useState([]);
  const [selectedMenuItems, setSelectedMenuItems] = useState([]);
  const [showDeletePassword, setShowDeletePassword] = useState(null);
  const [deletePassword, setDeletePassword] = useState('');
  const [promoCount, setPromoCount] = useState(1);
  const [promoType, setPromoType] = useState('percent');
  const [promoValue, setPromoValue] = useState(10);
  const [promoActivationDate, setPromoActivationDate] = useState(new Date().toISOString().split('T')[0]);
  const [promoExpiryDate, setPromoExpiryDate] = useState(new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]);
  const [promoUsageLimit, setPromoUsageLimit] = useState(1);
  const [csvStartDate, setCsvStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [csvEndDate, setCsvEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [csvPhone, setCsvPhone] = useState('');
  const [inventory, setInventory] = useState(defaultInventory);
  const [menuSOPs, setMenuSOPs] = useState(defaultSOPs);
  const [newInventoryItem, setNewInventoryItem] = useState({ name: '', quantity: '', unit: 'g', threshold: '' });
  const [editingSOP, setEditingSOP] = useState(null);
  const [sopEditing, setSopEditing] = useState([]);
  const [editingInventoryItem, setEditingInventoryItem] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [newExpense, setNewExpense] = useState({ description: '', amount: '', category: 'General', paidBy: 'cash' });
  const [summaryDate, setSummaryDate] = useState(new Date().toISOString().split('T')[0]);
  const [syncStatus, setSyncStatus] = useState('connected'); // connected, syncing, offline

  // LOGIN CHECK
  useEffect(() => {
    const loggedIn = localStorage.getItem('kaapfi_loggedIn');
    if (loggedIn === 'true') setIsLoggedIn(true);
  }, []);

  // REAL-TIME FIREBASE LISTENERS - SYNC ACROSS ALL DEVICES
  useEffect(() => {
    if (!isLoggedIn) return;

    setSyncStatus('syncing');

    // ORDERS - Real-time sync
    const unsubOrders = onSnapshot(collection(db, "orders"), (snapshot) => {
      const allOrders = [];
      snapshot.forEach(doc => allOrders.push({ id: doc.data().id || doc.id, firebaseDocId: doc.id, ...doc.data() }));
      allOrders.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setOrders(allOrders);
      setSyncStatus('connected');
    }, (error) => {
      console.error('Orders sync error:', error);
      setSyncStatus('offline');
    });

    // INVENTORY - Real-time sync with auto-initialization
    const unsubInventory = onSnapshot(doc(db, "appData", "inventory"), (snap) => {
      if (snap.exists()) {
        const cloudInventory = snap.data().items || [];
        if (cloudInventory.length === 0) {
          // Cloud has empty array - push defaults
          console.log('Inventory empty, loading defaults...');
          saveInventoryToCloud(defaultInventory);
        } else {
          setInventory(cloudInventory);
        }
      } else {
        // First time - no document exists
        console.log('Creating inventory in cloud...');
        saveInventoryToCloud(defaultInventory);
      }
    });

    // EXPENSES - Real-time sync
    const unsubExpenses = onSnapshot(doc(db, "appData", "expenses"), (snap) => {
      if (snap.exists()) setExpenses(snap.data().items || []);
    });

    // MENU - Real-time sync
    const unsubMenu = onSnapshot(doc(db, "appData", "menu"), (snap) => {
      if (snap.exists()) {
        setMenuItems(snap.data().items || defaultMenu);
      } else {
        saveMenuToCloud(defaultMenu);
      }
    });

    // SOPs - Real-time sync
    const unsubSOPs = onSnapshot(doc(db, "appData", "sops"), (snap) => {
      if (snap.exists()) {
        setMenuSOPs(snap.data().data || defaultSOPs);
      } else {
        saveSOPsToCloud(defaultSOPs);
      }
    });

    // PROMOS - Real-time sync
    const unsubPromos = onSnapshot(doc(db, "appData", "promos"), (snap) => {
      if (snap.exists()) setPromoCodes(snap.data().items || []);
    });

    // SETTINGS - Real-time sync
    const unsubSettings = onSnapshot(doc(db, "appData", "settings"), (snap) => {
      if (snap.exists()) setSettings({ ...defaultSettings, ...snap.data().data });
    });

    // Cleanup on unmount
    return () => {
      unsubOrders();
      unsubInventory();
      unsubExpenses();
      unsubMenu();
      unsubSOPs();
      unsubPromos();
      unsubSettings();
    };
  }, [isLoggedIn]);

  // Load customers when tab opened
  useEffect(() => {
    if (activeTab === 'customers' && isLoggedIn) loadAllCustomers();
  }, [activeTab, isLoggedIn]);

  const handleLogin = () => {
    if (loginInput === CAFE_PASSWORD) { setIsLoggedIn(true); localStorage.setItem('kaapfi_loggedIn', 'true'); setLoginError(''); setLoginInput(''); }
    else { setLoginError('❌ Wrong password!'); }
  };
  const handleLogout = () => { setIsLoggedIn(false); localStorage.removeItem('kaapfi_loggedIn'); setCurrentOrder([]); };

  const loadAllCustomers = async () => { const customers = await getAllCustomers(); setAllCustomers(customers); };

  const performLookup = async () => {
    if (lookupPhone.length < 10) { alert('Enter 10-digit phone'); return; }
    setLookupLoading(true);
    const c = await getCustomer(lookupPhone);
    setLookupCustomer(c);
    if (c) { const co = await getCustomerOrders(lookupPhone); setLookupOrders(co); setLookupAI(getAIRecommendation(co, menuItems)); }
    else { setLookupOrders([]); setLookupAI(null); }
    setLookupLoading(false);
  };

  const handlePhoneChange = async (phone) => {
    setCustomerPhone(phone);
    if (phone.length >= 10) {
      const c = await getCustomer(phone);
      setCustomerData(c);
      if (c) { setCustomerName(c.name || ''); const co = await getCustomerOrders(phone); setCustomerOrders(co); }
      else { setCustomerOrders([]); }
    } else { setCustomerData(null); setCustomerOrders([]); }
  };

  const checkStockAvailability = (orderItems) => {
    const requiredStock = {};
    orderItems.forEach(item => {
      const sop = menuSOPs[item.name] || [];
      sop.forEach(ing => { requiredStock[ing.ingredient] = (requiredStock[ing.ingredient] || 0) + (ing.quantity * item.quantity); });
    });
    const insufficient = [];
    Object.entries(requiredStock).forEach(([ingName, needed]) => {
      const inv = inventory.find(i => i.name === ingName);
      if (inv && inv.quantity < needed) insufficient.push({ ingredient: ingName, needed, available: inv.quantity, unit: inv.unit });
    });
    return { sufficient: insufficient.length === 0, insufficient, requiredStock };
  };

  const deductInventory = async (orderItems) => {
    const newInventory = [...inventory];
    orderItems.forEach(item => {
      const sop = menuSOPs[item.name] || [];
      sop.forEach(ing => {
        const invIndex = newInventory.findIndex(i => i.name === ing.ingredient);
        if (invIndex !== -1) newInventory[invIndex] = { ...newInventory[invIndex], quantity: Math.max(0, newInventory[invIndex].quantity - (ing.quantity * item.quantity)) };
      });
    });
    await saveInventoryToCloud(newInventory);
  };

  const addToOrder = (item) => {
    const existing = currentOrder.find(o => o.id === item.id);
    if (existing) setCurrentOrder(currentOrder.map(o => o.id === item.id ? { ...o, quantity: o.quantity + 1 } : o));
    else setCurrentOrder([...currentOrder, { ...item, quantity: 1 }]);
  };
  const removeFromOrder = (id) => setCurrentOrder(currentOrder.filter(o => o.id !== id));
  const updateQuantity = (id, qty) => { if (qty <= 0) removeFromOrder(id); else setCurrentOrder(currentOrder.map(o => o.id === id ? { ...o, quantity: qty } : o)); };

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
    if (p.activationDate && new Date(p.activationDate) > new Date()) { alert(`❌ Activates on ${new Date(p.activationDate).toLocaleDateString()}`); return; }
    if (new Date(p.expiryDate) < new Date()) { alert('❌ Expired'); return; }
    if (p.usedCount >= p.usageLimit) { alert('❌ Usage limit reached'); return; }
    setAppliedPromo(p);
    alert(`✅ Applied!`);
  };

  const completeOrder = async () => {
    if (currentOrder.length === 0) { alert('Add items'); return; }
    const stockCheck = checkStockAvailability(currentOrder);
    if (!stockCheck.sufficient) {
      const msg = stockCheck.insufficient.map(i => `• ${i.ingredient}: need ${i.needed}${i.unit}, have ${i.available}${i.unit}`).join('\n');
      if (settings.preventNegativeStock) { alert(`❌ INSUFFICIENT STOCK!\n\n${msg}`); return; }
      else { if (!window.confirm(`⚠️ LOW STOCK:\n\n${msg}\n\nContinue?`)) return; }
    }
    setSyncStatus('syncing');
    const order = {
      id: Date.now(), items: currentOrder, subtotal, manualDiscount, promoDiscount, loyaltyRedemption, specialDiscount, totalDiscount,
      afterDiscount, tax, total, paymentMethod,
      customerName: customerName || 'Walk-in', customerPhone: customerPhone || '',
      timestamp: new Date().toLocaleString(), date: new Date().toLocaleDateString(), time: new Date().toLocaleTimeString(),
      status: 'in_progress', startTime: Date.now(),
    };
    const firebaseDocId = await saveOrderToFirebase(order);
    if (customerPhone.length >= 10) await saveCustomer(customerPhone, order);
    if (appliedPromo) {
      const updatedPromos = promoCodes.map(p => p.code === appliedPromo.code ? { ...p, usedCount: (p.usedCount || 0) + 1 } : p);
      await savePromosToCloud(updatedPromos);
    }
    await deductInventory(currentOrder);
    setCurrentOrder([]); setCustomerName(''); setCustomerPhone(''); setCustomerData(null);
    setCustomerOrders([]); setPaymentMethod('cash'); setManualDiscountValue(0);
    setPromoCode(''); setAppliedPromo(null); setRedeemPoints(0);
    setSyncStatus('connected');
    alert(firebaseDocId ? '✅ Saved & synced to all devices!' : '⚠️ Check internet connection');
  };

  const bulkDeleteBills = async () => {
    if (deletePassword !== DELETE_PASSWORD) { alert('❌ Wrong password!'); return; }
    if (selectedBills.length === 0) { alert('Select bills'); return; }
    for (const id of selectedBills) { const order = orders.find(o => o.id === id); if (order?.firebaseDocId) await deleteOrderFromFirebase(order.firebaseDocId); }
    setSelectedBills([]); setShowDeletePassword(null); setDeletePassword('');
    alert(`✅ ${selectedBills.length} bills deleted!`);
  };

  const bulkDeletePromos = async () => {
    if (deletePassword !== DELETE_PASSWORD) { alert('❌ Wrong password!'); return; }
    if (selectedPromos.length === 0) { alert('Select codes'); return; }
    const filtered = promoCodes.filter((_, i) => !selectedPromos.includes(i));
    await savePromosToCloud(filtered);
    setSelectedPromos([]); setShowDeletePassword(null); setDeletePassword('');
    alert(`✅ ${selectedPromos.length} codes deleted!`);
  };

  const bulkDeleteMenu = async () => {
    if (deletePassword !== DELETE_PASSWORD) { alert('❌ Wrong password!'); return; }
    if (selectedMenuItems.length === 0) { alert('Select items'); return; }
    const filtered = menuItems.filter(m => !selectedMenuItems.includes(m.id));
    await saveMenuToCloud(filtered);
    setSelectedMenuItems([]); setShowDeletePassword(null); setDeletePassword('');
    alert(`✅ ${selectedMenuItems.length} items deleted!`);
  };

  const toggleBill = (id) => setSelectedBills(selectedBills.includes(id) ? selectedBills.filter(x => x !== id) : [...selectedBills, id]);
  const togglePromo = (i) => setSelectedPromos(selectedPromos.includes(i) ? selectedPromos.filter(x => x !== i) : [...selectedPromos, i]);
  const toggleMenuItem = (id) => setSelectedMenuItems(selectedMenuItems.includes(id) ? selectedMenuItems.filter(x => x !== id) : [...selectedMenuItems, id]);
  const selectAllBills = () => setSelectedBills(selectedBills.length === todayOrders.length ? [] : todayOrders.map(o => o.id));
  const selectAllPromos = () => setSelectedPromos(selectedPromos.length === promoCodes.length ? [] : promoCodes.map((_, i) => i));
  const selectAllMenu = () => setSelectedMenuItems(selectedMenuItems.length === menuItems.length ? [] : menuItems.map(m => m.id));

  const downloadSelectedBills = () => { const selected = todayOrders.filter(o => selectedBills.includes(o.id)); if (selected.length === 0) { alert('Select bills'); return; } downloadCSV(selected, `kaapfi-selected.csv`); };
  const downloadByDateRange = () => {
    const start = new Date(csvStartDate); const end = new Date(csvEndDate); end.setHours(23, 59, 59);
    const filtered = orders.filter(o => { const d = new Date(o.timestamp || o.date); return d >= start && d <= end; });
    if (filtered.length === 0) { alert('No orders in range'); return; }
    downloadCSV(filtered, `kaapfi-${csvStartDate}-to-${csvEndDate}.csv`);
  };
  const downloadByPhone = async () => {
    if (csvPhone.length < 10) { alert('Enter 10-digit phone'); return; }
    const list = await getCustomerOrders(csvPhone);
    if (list.length === 0) { alert('No orders'); return; }
    downloadCSV(list, `kaapfi-customer-${csvPhone}.csv`);
  };
  const downloadSingleBill = (order) => downloadCSV([order], `kaapfi-bill-${order.id}.csv`);
  const downloadTodayAll = () => { if (todayOrders.length === 0) { alert('No orders today'); return; } downloadCSV(todayOrders, `kaapfi-today.csv`); };

  const printBill = () => {
    if (currentOrder.length === 0) { alert('No items'); return; }
    const bill = `\n${settings.cafeName}\n${settings.tagline}\n${settings.phone}\n─────────────────\nDate: ${new Date().toLocaleDateString()}\nTime: ${new Date().toLocaleTimeString()}\nCustomer: ${customerName || 'Walk-in'}\n${customerPhone ? 'Phone: ' + customerPhone + '\n' : ''}─────────────────\n${currentOrder.map(i => `${i.name} x${i.quantity}\n  ₹${i.price * i.quantity}`).join('\n')}\n─────────────────\nSubtotal: ₹${subtotal}\n${totalDiscount > 0 ? `Discount: -₹${totalDiscount.toFixed(0)}\n` : ''}Tax: ₹${tax.toFixed(0)}\n─────────────────\nTOTAL: ₹${total.toFixed(0)}\n─────────────────\nPayment: ${paymentMethod.toUpperCase()}\n${settings.footerText}`;
    const win = window.open('', '', `height=600,width=400`);
    win.document.write(`<pre style="font-family: monospace; padding: 10px;">${bill}</pre>`);
    win.print(); win.close();
  };

  const sendWhatsApp = () => {
    if (currentOrder.length === 0) { alert('No items'); return; }
    const text = `*${settings.cafeName}*\n\n*Order:*\n${currentOrder.map(i => `• ${i.name} x${i.quantity} - ₹${i.price * i.quantity}`).join('\n')}\n\n*Total:* ₹${total.toFixed(0)}`;
    window.open(`https://wa.me/${customerPhone ? '91' + customerPhone : ''}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const sharePromoWhatsApp = (promo) => {
    const text = `🎁 *${settings.cafeName}*\n\nPromo Code: *${promo.code}*\n\n${promo.discountType === 'flat' ? '₹' : ''}${promo.discountValue}${promo.discountType === 'percent' ? '%' : ''} OFF\n\nValid: ${new Date(promo.activationDate).toLocaleDateString()} - ${new Date(promo.expiryDate).toLocaleDateString()}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };
  const copyPromoCode = (code) => { navigator.clipboard.writeText(code); alert(`✅ Copied: ${code}`); };

  const addMenuItem = async () => {
    if (!newItem.name || !newItem.price) { alert('Fill fields'); return; }
    const id = Math.max(...menuItems.map(m => m.id), 0) + 1;
    const updated = [...menuItems, { ...newItem, id, price: parseFloat(newItem.price) }];
    await saveMenuToCloud(updated);
    setNewItem({ name: '', price: '', category: 'Kaapfi Hot', emoji: '☕' });
  };
  const updateMenuItem = async () => { 
    const updated = menuItems.map(m => m.id === editingItem.id ? editingItem : m);
    await saveMenuToCloud(updated);
    setEditingItem(null);
  };

  const resetMenuToDefault = async () => {
    if (window.confirm('Reset menu to Kaapfi default?')) { 
      await saveMenuToCloud(defaultMenu); 
      alert('✅ Menu reset & synced!'); 
    }
  };

  const generatePromos = async () => {
    if (promoCount < 1) { alert('At least 1 code'); return; }
    const newCodes = [];
    for (let i = 0; i < promoCount; i++) {
      newCodes.push({ code: generatePromoCode(), discountType: promoType, discountValue: parseFloat(promoValue), activationDate: new Date(promoActivationDate).toISOString(), expiryDate: new Date(promoExpiryDate).toISOString(), usageLimit: parseInt(promoUsageLimit), usedCount: 0, createdAt: new Date().toISOString() });
    }
    await savePromosToCloud([...promoCodes, ...newCodes]);
    alert(`✅ Generated ${promoCount} code${promoCount > 1 ? 's' : ''}!`);
  };

  const updateOrderStatus = async (orderId, status) => {
    const order = orders.find(o => o.id === orderId);
    if (order?.firebaseDocId) {
      try {
        await updateDoc(doc(db, "orders", order.firebaseDocId), { 
          status, 
          ...(status === 'ready' ? { readyTime: Date.now() } : {}) 
        });
      } catch (e) { console.error('Status update failed:', e); }
    }
  };

  // INVENTORY FUNCTIONS - ALL CLOUD SYNC


  const deleteInventoryItem = async (id) => {
    if (window.confirm('Delete this ingredient?')) {
      const updated = inventory.filter(i => i.id !== id);
      await saveInventoryToCloud(updated);
    }
  };

  const updateInventoryItem = async () => {
    if (!editingInventoryItem) return;
    const updated = inventory.map(i => i.id === editingInventoryItem.id ? editingInventoryItem : i);
    await saveInventoryToCloud(updated);
    setEditingInventoryItem(null);
  };

  const adjustInventoryQuantity = async (id, change) => {
    const updated = inventory.map(i => i.id === id ? { ...i, quantity: Math.max(0, i.quantity + change) } : i);
    await saveInventoryToCloud(updated);
  };

  const resetInventoryToDefault = async () => {
    if (window.confirm('⚠️ This will REPLACE all current inventory with default Kaapfi inventory.\n\nAll custom items and quantities will be lost. Continue?')) {
      await saveInventoryToCloud(defaultInventory);
      alert('✅ Inventory reset to Kaapfi defaults!\n\nAll 10 ingredients loaded:\n- Filter Coffee Powder 2000g\n- Milk 10000ml\n- Paneer 5000g\n- And 7 more...');
    }
  };

  const quickAddCommonItems = async () => {
    if (window.confirm('Add common Kaapfi ingredients to inventory?\n\nWill add these (if not already there):\n• Filter Coffee Powder\n• Milk\n• Paneer\n• Gravy Base\n• Paratha\n• Cold Brew Concentrate\n• Ice\n• Idli Batter\n• Chicken\n• Onion')) {
      const existingNames = inventory.map(i => i.name.toLowerCase());
      const toAdd = defaultInventory.filter(d => !existingNames.includes(d.name.toLowerCase()));
      if (toAdd.length === 0) { alert('All common items already exist!'); return; }
      const maxId = Math.max(...inventory.map(i => i.id), 0);
      const newItems = toAdd.map((item, idx) => ({ ...item, id: maxId + idx + 1 }));
      await saveInventoryToCloud([...inventory, ...newItems]);
      alert(`✅ Added ${newItems.length} new items!`);
    }
  };

  // SOP FUNCTIONS - ALL CLOUD SYNC
  const openSOPEditor = (itemName) => {
    setEditingSOP(itemName);
    setSopEditing(menuSOPs[itemName] ? [...menuSOPs[itemName]] : []);
  };

  const saveSOP = async () => {
    const filtered = sopEditing.filter(s => s.ingredient && s.quantity > 0);
    const updated = { ...menuSOPs, [editingSOP]: filtered };
    await saveSOPsToCloud(updated);
    setEditingSOP(null);
    setSopEditing([]);
    alert('✅ SOP saved & synced!');
  };

  const addSOPRow = () => setSopEditing([...sopEditing, { ingredient: '', quantity: 0 }]);
  const removeSOPRow = (index) => setSopEditing(sopEditing.filter((_, i) => i !== index));
  const updateSOPRow = (index, field, value) => {
    const updated = [...sopEditing];
    updated[index] = { ...updated[index], [field]: field === 'quantity' ? parseFloat(value) || 0 : value };
    setSopEditing(updated);
  };

  // EXPENSES - CLOUD SYNC
  const addExpense = async () => {
    if (!newExpense.description || !newExpense.amount) { alert('Fill fields'); return; }
    const newExp = { ...newExpense, id: Date.now(), amount: parseFloat(newExpense.amount), date: new Date().toLocaleDateString(), time: new Date().toLocaleTimeString(), timestamp: new Date().toISOString() };
    await saveExpensesToCloud([...expenses, newExp]);
    setNewExpense({ description: '', amount: '', category: 'General', paidBy: 'cash' });
    alert('✅ Added & synced!');
  };

  const deleteExpense = async (id) => { 
    if (window.confirm('Delete expense?')) {
      const updated = expenses.filter(e => e.id !== id);
      await saveExpensesToCloud(updated);
    }
  };

  // SETTINGS - CLOUD SYNC
  const updateSettings = async (newSettings) => {
    setSettings(newSettings);
    await saveSettingsToCloud(newSettings);
  };

  const getRemainingServings = (itemName) => {
    const sop = menuSOPs[itemName] || [];
    if (sop.length === 0) return Infinity;
    const possibleServings = sop.map(ing => {
      const inv = inventory.find(i => i.name === ing.ingredient);
      if (!inv || ing.quantity === 0) return Infinity;
      return Math.floor(inv.quantity / ing.quantity);
    });
    return Math.min(...possibleServings);
  };

  const categories = ['All', ...new Set(menuItems.map(item => item.category))];
  const filteredItems = selectedCategory === 'All' ? menuItems : menuItems.filter(item => item.category === selectedCategory);
  const todayOrders = orders.filter(o => o.date === new Date().toLocaleDateString());
  const todayRevenue = todayOrders.reduce((sum, o) => sum + o.total, 0);
  const aiRec = customerOrders.length > 0 ? getAIRecommendation(customerOrders, menuItems) : null;

  const selectedDateOrders = orders.filter(o => o.date === new Date(summaryDate).toLocaleDateString());
  const selectedDateExpenses = expenses.filter(e => e.date === new Date(summaryDate).toLocaleDateString());
  const cashReceived = selectedDateOrders.filter(o => o.paymentMethod === 'cash').reduce((s, o) => s + o.total, 0);
  const upiReceived = selectedDateOrders.filter(o => o.paymentMethod === 'upi').reduce((s, o) => s + o.total, 0);
  const cardReceived = selectedDateOrders.filter(o => o.paymentMethod === 'card').reduce((s, o) => s + o.total, 0);
  const totalReceived = cashReceived + upiReceived + cardReceived;
  const cashExpenses = selectedDateExpenses.filter(e => e.paidBy === 'cash').reduce((s, e) => s + e.amount, 0);
  const upiExpenses = selectedDateExpenses.filter(e => e.paidBy === 'upi').reduce((s, e) => s + e.amount, 0);
  const totalExpenses = selectedDateExpenses.reduce((s, e) => s + e.amount, 0);
  const netCashInHand = cashReceived - cashExpenses;
  const netProfit = totalReceived - totalExpenses;

  if (!isLoggedIn) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #FC8019 0%, #E64A19 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif', padding: '20px' }}>
        <div style={{ background: '#fff', padding: '48px 40px', borderRadius: '16px', maxWidth: '420px', width: '100%', textAlign: 'center' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>☕</div>
          <h1 style={{ margin: '0 0 8px', fontSize: '28px', color: '#1a1a1a', fontWeight: '700' }}>{settings.cafeName}</h1>
          <p style={{ margin: '0 0 32px', fontSize: '14px', color: '#666' }}>{settings.tagline}</p>
          <input type="password" placeholder="Enter Password" value={loginInput} onChange={(e) => setLoginInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleLogin()} style={{ width: '100%', padding: '14px', fontSize: '16px', border: '2px solid #e0e0e0', borderRadius: '8px', marginBottom: '16px', boxSizing: 'border-box' }} />
          {loginError && <div style={{ color: '#E64A19', fontSize: '14px', marginBottom: '16px' }}>{loginError}</div>}
          <button onClick={handleLogin} style={{ width: '100%', padding: '14px', fontSize: '16px', fontWeight: '600', background: '#FC8019', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>LOGIN →</button>
          <p style={{ marginTop: '24px', fontSize: '12px', color: '#999' }}>🔒 Kaapfi POS v4.2 • Multi-Device Sync</p>
        </div>
      </div>
    );
  }

  const DeleteModal = () => showDeletePassword && (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', minWidth: '320px' }}>
        <h3 style={{ margin: '0 0 12px', color: '#E64A19' }}>🔒 Password Required</h3>
        <input type="password" autoFocus value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} style={{ width: '100%', padding: '10px', border: '2px solid #E64A19', borderRadius: '6px', boxSizing: 'border-box', fontSize: '14px', marginBottom: '12px' }} />
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => { setShowDeletePassword(null); setDeletePassword(''); }} style={{ flex: 1, padding: '10px', background: '#999', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
          <button onClick={() => { if (showDeletePassword === 'bills') bulkDeleteBills(); else if (showDeletePassword === 'promos') bulkDeletePromos(); else if (showDeletePassword === 'menu') bulkDeleteMenu(); }} style={{ flex: 1, padding: '10px', background: '#E64A19', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '700' }}>Delete</button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', fontFamily: 'system-ui, sans-serif' }}>
      <DeleteModal />
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
            <div style={{ background: syncStatus === 'connected' ? '#4CAF50' : syncStatus === 'syncing' ? '#FF9800' : '#E64A19', padding: '8px 14px', borderRadius: '20px', color: '#fff', fontSize: '11px', fontWeight: '600' }}>
              {syncStatus === 'connected' ? '🔄 SYNCED' : syncStatus === 'syncing' ? '⏳ SYNCING' : '⚠️ OFFLINE'}
            </div>
            <button onClick={handleLogout} style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid #fff', padding: '8px 16px', borderRadius: '20px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>Logout</button>
          </div>
        </div>
      </header>

      <nav style={{ background: '#fff', display: 'flex', borderBottom: '1px solid #eee', padding: '0 24px', overflowX: 'auto', gap: '8px' }}>
        {[
          { id: 'order', icon: '🛒', label: 'New Order' },
          { id: 'bills', icon: '🧾', label: 'Bills' },
          { id: 'kitchen', icon: '👨‍🍳', label: 'Kitchen' },
          { id: 'summary', icon: '💼', label: 'Summary' },
          { id: 'expenses', icon: '💸', label: 'Expenses' },
          { id: 'inventory', icon: '📦', label: 'Inventory' },
          { id: 'sops', icon: '📋', label: 'SOPs' },
          { id: 'reports', icon: '📊', label: 'Reports' },
          { id: 'menu', icon: '🍽️', label: 'Menu' },
          { id: 'promos', icon: '🎁', label: 'Promos' },
          { id: 'customers', icon: '👥', label: 'Customers' },
          { id: 'settings', icon: '⚙️', label: 'Settings' },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ padding: '16px 16px', border: 'none', background: 'transparent', color: activeTab === tab.id ? '#FC8019' : '#666', cursor: 'pointer', fontSize: '13px', fontWeight: activeTab === tab.id ? '700' : '500', borderBottom: activeTab === tab.id ? '3px solid #FC8019' : '3px solid transparent', whiteSpace: 'nowrap' }}>
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
                  <button key={cat} onClick={() => setSelectedCategory(cat)} style={{ padding: '8px 16px', borderRadius: '20px', border: 'none', background: selectedCategory === cat ? '#FC8019' : '#fff', color: selectedCategory === cat ? '#fff' : '#666', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}>{cat}</button>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px' }}>
                {filteredItems.map(item => {
                  const remaining = getRemainingServings(item.name);
                  const lowStock = remaining !== Infinity && remaining < 5;
                  return (
                    <div key={item.id} onClick={() => addToOrder(item)} style={{ background: '#fff', padding: '16px', borderRadius: '12px', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', textAlign: 'center', border: lowStock ? '2px solid #E64A19' : 'none' }}>
                      <div style={{ fontSize: '36px', marginBottom: '8px' }}>{item.emoji}</div>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: '#1a1a1a', marginBottom: '4px', minHeight: '36px' }}>{item.name}</div>
                      <div style={{ fontSize: '15px', color: '#FC8019', fontWeight: '700' }}>₹{item.price}</div>
                      {remaining !== Infinity && (
                        <div style={{ fontSize: '10px', color: lowStock ? '#E64A19' : '#4CAF50', fontWeight: '700', marginTop: '4px' }}>{lowStock ? '⚠️ ' : '✓ '}{remaining} left</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ background: '#fff', borderRadius: '12px', padding: '20px', height: 'fit-content', position: 'sticky', top: '100px', maxHeight: 'calc(100vh - 120px)', overflowY: 'auto' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '18px', fontWeight: '700', color: '#1a1a1a' }}>🛒 Current Order ({currentOrder.length})</h3>
              <input type="tel" placeholder="Customer phone" value={customerPhone} onChange={(e) => handlePhoneChange(e.target.value)} style={{ width: '100%', padding: '10px', fontSize: '14px', border: '2px solid #FC8019', borderRadius: '8px', marginBottom: '10px', boxSizing: 'border-box' }} />
              <input type="text" placeholder="Customer name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} style={{ width: '100%', padding: '10px', fontSize: '14px', border: '1px solid #e0e0e0', borderRadius: '8px', marginBottom: '12px', boxSizing: 'border-box' }} />

              {customerData && (
                <>
                  <div style={{ background: 'linear-gradient(135deg, #FC8019 0%, #E64A19 100%)', padding: '12px', borderRadius: '8px', marginBottom: '10px', color: '#fff' }}>
                    <div style={{ fontSize: '14px', fontWeight: '700' }}>👋 {customerData.name || 'Customer'}</div>
                    <div style={{ fontSize: '11px', opacity: 0.9 }}>📱 {customerData.phone}</div>
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
                      <div style={{ fontSize: '10px', fontWeight: '700' }}>🤖 AI SUGGESTION</div>
                      <div style={{ fontSize: '12px', fontWeight: '600', marginTop: '4px' }}>{aiRec.message}</div>
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
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
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
                  </div>
                  <div style={{ borderTop: '1px dashed #ddd', paddingTop: '10px', marginBottom: '12px', fontSize: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#666' }}><span>Subtotal</span><span>₹{subtotal}</span></div>
                    {totalDiscount > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', color: '#E64A19' }}><span>Discount</span><span>-₹{totalDiscount.toFixed(0)}</span></div>}
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: '700', marginTop: '6px', color: '#1a1a1a' }}><span>TOTAL</span><span>₹{total.toFixed(0)}</span></div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px', marginBottom: '10px' }}>
                    {['cash', 'card', 'upi'].map(m => (
                      <button key={m} onClick={() => setPaymentMethod(m)} style={{ padding: '8px', border: 'none', borderRadius: '6px', background: paymentMethod === m ? '#FC8019' : '#f0f0f0', color: paymentMethod === m ? '#fff' : '#666', fontWeight: '600', cursor: 'pointer', fontSize: '11px', textTransform: 'uppercase' }}>{m}</button>
                    ))}
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

        {activeTab === 'summary' && (
          <div>
            <div style={{ background: '#e3f2fd', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px', color: '#0066cc' }}>
              🔄 <strong>Real-time sync:</strong> All data syncs across all devices instantly!
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
              <h2 style={{ fontSize: '24px', margin: 0, color: '#1a1a1a' }}>💼 Business Summary</h2>
              <input type="date" value={summaryDate} onChange={(e) => setSummaryDate(e.target.value)} style={{ padding: '10px', border: '2px solid #FC8019', borderRadius: '8px', fontSize: '14px', fontWeight: '600' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '20px' }}>
              <div style={{ background: 'linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)', padding: '20px', borderRadius: '12px', color: '#fff' }}>
                <div style={{ fontSize: '13px', opacity: 0.9 }}>💰 CASH</div>
                <div style={{ fontSize: '28px', fontWeight: '700' }}>₹{cashReceived.toFixed(0)}</div>
                <div style={{ fontSize: '11px', opacity: 0.8 }}>{selectedDateOrders.filter(o => o.paymentMethod === 'cash').length} orders</div>
              </div>
              <div style={{ background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)', padding: '20px', borderRadius: '12px', color: '#fff' }}>
                <div style={{ fontSize: '13px', opacity: 0.9 }}>📱 UPI</div>
                <div style={{ fontSize: '28px', fontWeight: '700' }}>₹{upiReceived.toFixed(0)}</div>
                <div style={{ fontSize: '11px', opacity: 0.8 }}>{selectedDateOrders.filter(o => o.paymentMethod === 'upi').length} orders</div>
              </div>
              <div style={{ background: 'linear-gradient(135deg, #9C27B0 0%, #673AB7 100%)', padding: '20px', borderRadius: '12px', color: '#fff' }}>
                <div style={{ fontSize: '13px', opacity: 0.9 }}>💳 CARD</div>
                <div style={{ fontSize: '28px', fontWeight: '700' }}>₹{cardReceived.toFixed(0)}</div>
                <div style={{ fontSize: '11px', opacity: 0.8 }}>{selectedDateOrders.filter(o => o.paymentMethod === 'card').length} orders</div>
              </div>
              <div style={{ background: 'linear-gradient(135deg, #FC8019 0%, #E64A19 100%)', padding: '20px', borderRadius: '12px', color: '#fff' }}>
                <div style={{ fontSize: '13px', opacity: 0.9 }}>🔥 TOTAL</div>
                <div style={{ fontSize: '28px', fontWeight: '700' }}>₹{totalReceived.toFixed(0)}</div>
                <div style={{ fontSize: '11px', opacity: 0.8 }}>{selectedDateOrders.length} orders</div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '20px' }}>
              <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', borderLeft: '4px solid #E64A19' }}>
                <div style={{ fontSize: '13px', color: '#666' }}>💸 CASH EXPENSES</div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#E64A19' }}>-₹{cashExpenses.toFixed(0)}</div>
              </div>
              <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', borderLeft: '4px solid #FF9800' }}>
                <div style={{ fontSize: '13px', color: '#666' }}>💸 UPI EXPENSES</div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#FF9800' }}>-₹{upiExpenses.toFixed(0)}</div>
              </div>
              <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', borderLeft: '4px solid #E64A19' }}>
                <div style={{ fontSize: '13px', color: '#666' }}>📉 TOTAL EXPENSES</div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#E64A19' }}>-₹{totalExpenses.toFixed(0)}</div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ background: netCashInHand >= 0 ? 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)' : 'linear-gradient(135deg, #E64A19 0%, #B71C1C 100%)', padding: '24px', borderRadius: '12px', color: '#fff' }}>
                <div style={{ fontSize: '14px', opacity: 0.9 }}>💵 NET CASH IN HAND</div>
                <div style={{ fontSize: '36px', fontWeight: '700' }}>₹{netCashInHand.toFixed(0)}</div>
                <div style={{ fontSize: '12px', opacity: 0.8 }}>Cash ₹{cashReceived.toFixed(0)} - Expenses ₹{cashExpenses.toFixed(0)}</div>
              </div>
              <div style={{ background: netProfit >= 0 ? 'linear-gradient(135deg, #2196F3 0%, #0D47A1 100%)' : 'linear-gradient(135deg, #E64A19 0%, #B71C1C 100%)', padding: '24px', borderRadius: '12px', color: '#fff' }}>
                <div style={{ fontSize: '14px', opacity: 0.9 }}>📊 NET PROFIT</div>
                <div style={{ fontSize: '36px', fontWeight: '700' }}>₹{netProfit.toFixed(0)}</div>
                <div style={{ fontSize: '12px', opacity: 0.8 }}>Revenue - Expenses</div>
              </div>
            </div>
            {selectedDateExpenses.length > 0 && (
              <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', marginTop: '20px' }}>
                <h3 style={{ fontSize: '16px', margin: '0 0 12px', color: '#1a1a1a' }}>📋 Expenses on {new Date(summaryDate).toLocaleDateString()}</h3>
                {selectedDateExpenses.map(e => (
                  <div key={e.id} style={{ padding: '10px', background: '#f9f9f9', borderRadius: '6px', marginBottom: '6px', display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '600' }}>{e.description}</div>
                      <div style={{ fontSize: '11px', color: '#666' }}>{e.category} • {e.paidBy.toUpperCase()} • {e.time}</div>
                    </div>
                    <div style={{ fontSize: '16px', fontWeight: '700', color: '#E64A19' }}>-₹{e.amount}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'expenses' && (
          <div>
            <h2 style={{ fontSize: '24px', margin: '0 0 20px' }}>💸 Expenses</h2>
            <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '16px', margin: '0 0 12px' }}>➕ Add Expense</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '8px', marginBottom: '10px' }}>
                <div><label style={{ fontSize: '11px', color: '#666' }}>Description</label><input placeholder="Milk purchase" value={newExpense.description} onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', boxSizing: 'border-box' }} /></div>
                <div><label style={{ fontSize: '11px', color: '#666' }}>Amount ₹</label><input type="number" placeholder="500" value={newExpense.amount} onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', boxSizing: 'border-box' }} /></div>
                <div><label style={{ fontSize: '11px', color: '#666' }}>Category</label><select value={newExpense.category} onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', boxSizing: 'border-box' }}><option>General</option><option>Groceries</option><option>Milk/Dairy</option><option>Coffee Beans</option><option>Cleaning</option><option>Utilities</option><option>Staff</option><option>Rent</option><option>Equipment</option><option>Marketing</option><option>Transport</option><option>Other</option></select></div>
                <div><label style={{ fontSize: '11px', color: '#666' }}>Paid By</label><select value={newExpense.paidBy} onChange={(e) => setNewExpense({ ...newExpense, paidBy: e.target.value })} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', boxSizing: 'border-box' }}><option value="cash">💵 Cash</option><option value="upi">📱 UPI</option><option value="card">💳 Card</option></select></div>
              </div>
              <button onClick={addExpense} style={{ width: '100%', padding: '12px', background: '#E64A19', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '700' }}>💸 Add Expense</button>
            </div>
            {expenses.length === 0 ? (
              <div style={{ background: '#fff', padding: '40px', borderRadius: '12px', textAlign: 'center', color: '#999' }}><div style={{ fontSize: '48px' }}>💸</div><p>No expenses yet</p></div>
            ) : (
              <div>
                <div style={{ background: '#fff', padding: '16px', borderRadius: '12px', marginBottom: '12px' }}>
                  <div style={{ fontSize: '14px', color: '#666' }}>Total Expenses (All Time)</div>
                  <div style={{ fontSize: '28px', fontWeight: '700', color: '#E64A19' }}>₹{expenses.reduce((s, e) => s + e.amount, 0).toFixed(0)}</div>
                </div>
                <div style={{ display: 'grid', gap: '8px' }}>
                  {expenses.slice().reverse().map(e => (
                    <div key={e.id} style={{ background: '#fff', padding: '14px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: '700' }}>{e.description}</div>
                        <div style={{ fontSize: '11px', color: '#666' }}>{e.category} • {e.paidBy.toUpperCase()} • {e.date} • {e.time}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ fontSize: '18px', fontWeight: '700', color: '#E64A19' }}>-₹{e.amount}</div>
                        <button onClick={() => deleteExpense(e.id)} style={{ padding: '6px 10px', background: '#fff', color: '#E64A19', border: '1px solid #E64A19', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>🗑️</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'inventory' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
              <h2 style={{ fontSize: '24px', margin: 0 }}>📦 Inventory</h2>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button onClick={quickAddCommonItems} style={{ padding: '10px 16px', background: '#4CAF50', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>⚡ Quick Add Common Items</button>
                <button onClick={resetInventoryToDefault} style={{ padding: '10px 16px', background: '#FC8019', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>🔄 Reset to Kaapfi Default</button>
              </div>
            </div>

            {inventory.length === 0 && (
              <div style={{ background: '#fff3e0', padding: '20px', borderRadius: '12px', marginBottom: '20px', textAlign: 'center' }}>
                <div style={{ fontSize: '48px' }}>📦</div>
                <h3 style={{ margin: '8px 0', color: '#E64A19' }}>No inventory items yet!</h3>
                <p style={{ fontSize: '13px', color: '#666', marginBottom: '12px' }}>Click "Quick Add Common Items" above to load default Kaapfi inventory (Coffee, Milk, Paneer, etc.)</p>
                <button onClick={quickAddCommonItems} style={{ padding: '12px 24px', background: '#4CAF50', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '14px' }}>⚡ Load Default Inventory Now</button>
              </div>
            )}

            <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '16px', margin: '0 0 12px' }}>➕ Add Ingredient</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '8px', marginBottom: '10px' }}>
                <div><label style={{ fontSize: '11px', color: '#666' }}>Name</label><input placeholder="Cheese" value={newInventoryItem.name} onChange={(e) => setNewInventoryItem({ ...newInventoryItem, name: e.target.value })} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', boxSizing: 'border-box' }} /></div>
                <div><label style={{ fontSize: '11px', color: '#666' }}>Quantity</label><input type="number" placeholder="2000" value={newInventoryItem.quantity} onChange={(e) => setNewInventoryItem({ ...newInventoryItem, quantity: e.target.value })} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', boxSizing: 'border-box' }} /></div>
                <div><label style={{ fontSize: '11px', color: '#666' }}>Unit</label><select value={newInventoryItem.unit} onChange={(e) => setNewInventoryItem({ ...newInventoryItem, unit: e.target.value })} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', boxSizing: 'border-box' }}><option value="g">g</option><option value="kg">kg</option><option value="ml">ml</option><option value="l">l</option><option value="units">units</option></select></div>
                <div><label style={{ fontSize: '11px', color: '#666' }}>Threshold</label><input type="number" placeholder="200" value={newInventoryItem.threshold} onChange={(e) => setNewInventoryItem({ ...newInventoryItem, threshold: e.target.value })} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', boxSizing: 'border-box' }} /></div>
              </div>
              <button onClick={addInventoryItem} style={{ width: '100%', padding: '12px', background: '#4CAF50', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '700' }}>📦 Add</button>
            </div>
            <div style={{ background: '#fff', padding: '16px', borderRadius: '12px', marginBottom: '12px', display: 'flex', justifyContent: 'space-between' }}>
              <div><div style={{ fontSize: '13px', color: '#666' }}>Total Items</div><div style={{ fontSize: '24px', fontWeight: '700' }}>{inventory.length}</div></div>
              <div><div style={{ fontSize: '13px', color: '#666' }}>Low Stock</div><div style={{ fontSize: '24px', fontWeight: '700', color: '#E64A19' }}>{inventory.filter(i => i.quantity < i.threshold).length}</div></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
              {inventory.map(item => {
                const isLow = item.quantity < item.threshold;
                return (
                  <div key={item.id} style={{ background: isLow ? '#ffebee' : '#fff', padding: '16px', borderRadius: '12px', border: isLow ? '2px solid #E64A19' : '1px solid #e0e0e0' }}>
                    {editingInventoryItem && editingInventoryItem.id === item.id ? (
                      <div>
                        <input value={editingInventoryItem.name} onChange={(e) => setEditingInventoryItem({ ...editingInventoryItem, name: e.target.value })} style={{ width: '100%', padding: '6px', marginBottom: '4px', boxSizing: 'border-box' }} />
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', marginBottom: '4px' }}>
                          <input type="number" value={editingInventoryItem.quantity} onChange={(e) => setEditingInventoryItem({ ...editingInventoryItem, quantity: parseFloat(e.target.value) || 0 })} style={{ padding: '6px' }} />
                          <input type="number" value={editingInventoryItem.threshold} onChange={(e) => setEditingInventoryItem({ ...editingInventoryItem, threshold: parseFloat(e.target.value) || 0 })} style={{ padding: '6px' }} />
                        </div>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button onClick={updateInventoryItem} style={{ flex: 1, padding: '6px', background: '#4CAF50', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Save</button>
                          <button onClick={() => setEditingInventoryItem(null)} style={{ flex: 1, padding: '6px', background: '#999', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <div style={{ fontSize: '15px', fontWeight: '700' }}>{item.name}</div>
                          {isLow && <span style={{ fontSize: '10px', background: '#E64A19', color: '#fff', padding: '2px 8px', borderRadius: '10px' }}>LOW</span>}
                        </div>
                        <div style={{ fontSize: '28px', fontWeight: '700', color: isLow ? '#E64A19' : '#4CAF50' }}>{item.quantity} <span style={{ fontSize: '14px', color: '#666' }}>{item.unit}</span></div>
                        <div style={{ fontSize: '11px', color: '#666' }}>Alert below: {item.threshold}{item.unit}</div>
                        <div style={{ display: 'flex', gap: '4px', marginTop: '10px' }}>
                          <button onClick={() => adjustInventoryQuantity(item.id, -100)} style={{ flex: 1, padding: '6px', background: '#fff', color: '#E64A19', border: '1px solid #E64A19', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>-100</button>
                          <button onClick={() => adjustInventoryQuantity(item.id, -10)} style={{ flex: 1, padding: '6px', background: '#fff', color: '#E64A19', border: '1px solid #E64A19', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>-10</button>
                          <button onClick={() => adjustInventoryQuantity(item.id, 10)} style={{ flex: 1, padding: '6px', background: '#fff', color: '#4CAF50', border: '1px solid #4CAF50', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>+10</button>
                          <button onClick={() => adjustInventoryQuantity(item.id, 100)} style={{ flex: 1, padding: '6px', background: '#fff', color: '#4CAF50', border: '1px solid #4CAF50', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>+100</button>
                        </div>
                        <div style={{ display: 'flex', gap: '4px', marginTop: '6px' }}>
                          <button onClick={() => setEditingInventoryItem({ ...item })} style={{ flex: 1, padding: '6px', background: '#2196F3', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>Edit</button>
                          <button onClick={() => deleteInventoryItem(item.id)} style={{ flex: 1, padding: '6px', background: '#E64A19', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>Delete</button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'sops' && (
          <div>
            <h2 style={{ fontSize: '24px', margin: '0 0 20px' }}>📋 Recipe SOPs</h2>
            {editingSOP ? (
              <div style={{ background: '#fff', padding: '20px', borderRadius: '12px' }}>
                <h3 style={{ fontSize: '18px', margin: '0 0 12px', color: '#FC8019' }}>✏️ {editingSOP}</h3>
                {sopEditing.map((row, index) => (
                  <div key={index} style={{ display: 'grid', gridTemplateColumns: '1fr 100px auto 30px', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                    <select value={row.ingredient} onChange={(e) => updateSOPRow(index, 'ingredient', e.target.value)} style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}>
                      <option value="">-- Select --</option>
                      {inventory.map(inv => <option key={inv.id} value={inv.name}>{inv.name} ({inv.unit})</option>)}
                    </select>
                    <input type="number" placeholder="Qty" value={row.quantity} onChange={(e) => updateSOPRow(index, 'quantity', e.target.value)} style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }} />
                    <div style={{ fontSize: '12px', color: '#666' }}>{inventory.find(i => i.name === row.ingredient)?.unit || ''}</div>
                    <button onClick={() => removeSOPRow(index)} style={{ padding: '8px', background: '#E64A19', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>×</button>
                  </div>
                ))}
                <button onClick={addSOPRow} style={{ padding: '10px 16px', background: '#4CAF50', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', marginRight: '8px', marginTop: '8px' }}>+ Add</button>
                <button onClick={saveSOP} style={{ padding: '10px 16px', background: '#FC8019', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '700', marginRight: '8px' }}>✅ Save</button>
                <button onClick={() => { setEditingSOP(null); setSopEditing([]); }} style={{ padding: '10px 16px', background: '#999', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '12px' }}>
                {menuItems.map(item => {
                  const sop = menuSOPs[item.name] || [];
                  const hasSOP = sop.length > 0;
                  return (
                    <div key={item.id} style={{ background: '#fff', padding: '16px', borderRadius: '12px', border: hasSOP ? '2px solid #4CAF50' : '2px solid #ffcdd2' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '24px' }}>{item.emoji}</span>
                          <div>
                            <div style={{ fontSize: '14px', fontWeight: '700' }}>{item.name}</div>
                            <div style={{ fontSize: '11px', color: '#666' }}>₹{item.price}</div>
                          </div>
                        </div>
                        {hasSOP ? <span style={{ fontSize: '10px', background: '#4CAF50', color: '#fff', padding: '2px 8px', borderRadius: '10px' }}>✓ SOP</span> : <span style={{ fontSize: '10px', background: '#E64A19', color: '#fff', padding: '2px 8px', borderRadius: '10px' }}>NO SOP</span>}
                      </div>
                      {hasSOP && (
                        <div style={{ background: '#f9f9f9', padding: '10px', borderRadius: '6px', marginBottom: '8px' }}>
                          {sop.map((row, i) => (
                            <div key={i} style={{ fontSize: '12px', marginBottom: '2px' }}>• {row.ingredient}: <strong>{row.quantity}{inventory.find(inv => inv.name === row.ingredient)?.unit || ''}</strong></div>
                          ))}
                        </div>
                      )}
                      <button onClick={() => openSOPEditor(item.name)} style={{ width: '100%', padding: '8px', background: '#FC8019', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '12px' }}>{hasSOP ? '✏️ Edit' : '➕ Create'}</button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'kitchen' && (
          <div>
            <h2 style={{ fontSize: '24px', margin: '0 0 20px' }}>👨‍🍳 Kitchen</h2>
            <div style={{ display: 'grid', gap: '12px' }}>
              {todayOrders.filter(o => (o.status || 'in_progress') !== 'delivered').map(order => {
                const startTime = order.startTime || new Date(order.timestamp).getTime();
                const elapsed = Math.floor((Date.now() - startTime) / 60000);
                const isLate = elapsed > 10;
                return (
                  <div key={order.id} style={{ background: '#fff', padding: '16px', borderRadius: '12px', border: isLate ? '2px solid #E64A19' : '2px solid transparent' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <div style={{ fontWeight: '700' }}>#{order.id.toString().slice(-5)} • {order.customerName}</div>
                      <div style={{ background: isLate ? '#E64A19' : '#4CAF50', color: '#fff', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '700' }}>⏱️ {elapsed} min</div>
                    </div>
                    {order.items.map(item => {
                      const sop = menuSOPs[item.name] || [];
                      return (
                        <div key={item.id} style={{ background: '#fff3e0', padding: '12px', borderRadius: '8px', marginBottom: '8px' }}>
                          <div style={{ fontSize: '15px', fontWeight: '700', color: '#E64A19', marginBottom: '6px' }}>{item.emoji} {item.name} x{item.quantity}</div>
                          {sop.length > 0 ? (
                            <div style={{ paddingLeft: '12px' }}>
                              {sop.map((row, i) => {
                                const unit = inventory.find(inv => inv.name === row.ingredient)?.unit || '';
                                return <div key={i} style={{ fontSize: '13px', marginBottom: '2px' }}>→ {row.ingredient}: <strong>{row.quantity * item.quantity}{unit}</strong></div>;
                              })}
                            </div>
                          ) : <div style={{ fontSize: '12px', color: '#999', paddingLeft: '12px' }}>No recipe</div>}
                        </div>
                      );
                    })}
                    <div style={{ display: 'flex', gap: '6px', marginTop: '10px' }}>
                      <button onClick={() => updateOrderStatus(order.id, 'in_progress')} style={{ padding: '8px 12px', background: order.status === 'in_progress' ? '#FF9800' : '#f0f0f0', color: order.status === 'in_progress' ? '#fff' : '#666', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>🔥 Progress</button>
                      <button onClick={() => updateOrderStatus(order.id, 'ready')} style={{ padding: '8px 12px', background: order.status === 'ready' ? '#4CAF50' : '#f0f0f0', color: order.status === 'ready' ? '#fff' : '#666', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>✅ Ready</button>
                      <button onClick={() => updateOrderStatus(order.id, 'delivered')} style={{ padding: '8px 12px', background: '#2196F3', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>📦 Done</button>
                    </div>
                  </div>
                );
              })}
              {todayOrders.filter(o => (o.status || 'in_progress') !== 'delivered').length === 0 && (
                <div style={{ background: '#fff', padding: '60px', borderRadius: '12px', textAlign: 'center', color: '#999' }}><div style={{ fontSize: '64px' }}>🎉</div><p>All done!</p></div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'bills' && (
          <div>
            <h2 style={{ fontSize: '24px', margin: '0 0 20px' }}>🧾 Today's Orders</h2>
            {todayOrders.length > 0 && (
              <div style={{ background: '#fff', padding: '16px', borderRadius: '12px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <input type="checkbox" checked={selectedBills.length === todayOrders.length} onChange={selectAllBills} style={{ width: '18px', height: '18px' }} />
                  <span style={{ fontSize: '13px', fontWeight: '600' }}>Select All ({selectedBills.length}/{todayOrders.length})</span>
                </label>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  <button onClick={downloadTodayAll} style={{ padding: '8px 12px', background: '#4CAF50', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>📥 All</button>
                  {selectedBills.length > 0 && (<>
                    <button onClick={downloadSelectedBills} style={{ padding: '8px 12px', background: '#2196F3', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>📥 Selected</button>
                    <button onClick={() => setShowDeletePassword('bills')} style={{ padding: '8px 12px', background: '#E64A19', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>🗑️ Delete</button>
                  </>)}
                </div>
              </div>
            )}
            {todayOrders.length === 0 ? <div style={{ background: '#fff', padding: '60px', borderRadius: '12px', textAlign: 'center' }}>📭 No orders yet</div> : (
              <div style={{ display: 'grid', gap: '12px' }}>
                {todayOrders.slice().reverse().map(order => (
                  <div key={order.id} style={{ background: '#fff', padding: '16px', borderRadius: '12px', display: 'flex', gap: '12px', border: selectedBills.includes(order.id) ? '2px solid #FC8019' : '2px solid transparent' }}>
                    <input type="checkbox" checked={selectedBills.includes(order.id)} onChange={() => toggleBill(order.id)} style={{ width: '20px', height: '20px', marginTop: '4px' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                        <div>
                          <div style={{ fontWeight: '700' }}>#{order.id.toString().slice(-5)}</div>
                          <div style={{ fontSize: '12px', color: '#666' }}>{order.customerName} {order.customerPhone && `• ${order.customerPhone}`} • {order.time}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '18px', fontWeight: '700', color: '#FC8019' }}>₹{order.total?.toFixed(0)}</div>
                          <div style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase' }}>{order.paymentMethod}</div>
                        </div>
                      </div>
                      <div style={{ fontSize: '12px', color: '#888', margin: '8px 0' }}>{(order.items || []).map(i => `${i.name} x${i.quantity}`).join(', ')}</div>
                      <button onClick={() => downloadSingleBill(order)} style={{ padding: '6px 12px', background: '#fff', color: '#4CAF50', border: '1px solid #4CAF50', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>📥 CSV</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'reports' && (
          <div>
            <h2 style={{ fontSize: '24px', margin: '0 0 20px' }}>📊 Reports</h2>
            <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', margin: '0 0 12px' }}>📥 Date Range</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '8px', alignItems: 'end' }}>
                <div><label style={{ fontSize: '11px', color: '#666' }}>From</label><input type="date" value={csvStartDate} onChange={(e) => setCsvStartDate(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', boxSizing: 'border-box' }} /></div>
                <div><label style={{ fontSize: '11px', color: '#666' }}>To</label><input type="date" value={csvEndDate} onChange={(e) => setCsvEndDate(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', boxSizing: 'border-box' }} /></div>
                <button onClick={downloadByDateRange} style={{ padding: '10px 20px', background: '#4CAF50', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>📥 Download</button>
              </div>
            </div>
            <div style={{ background: '#fff', padding: '20px', borderRadius: '12px' }}>
              <h3 style={{ fontSize: '16px', margin: '0 0 12px' }}>📱 By Phone</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '8px' }}>
                <input type="tel" placeholder="Phone" value={csvPhone} onChange={(e) => setCsvPhone(e.target.value)} style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }} />
                <button onClick={downloadByPhone} style={{ padding: '10px 20px', background: '#2196F3', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>📥 Download</button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'menu' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
              <h2 style={{ fontSize: '24px', margin: 0 }}>🍽️ Menu</h2>
              <button onClick={resetMenuToDefault} style={{ padding: '10px 16px', background: '#FC8019', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>🔄 Reset</button>
            </div>
            <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '16px', margin: '0 0 12px' }}>➕ Add Item</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '8px' }}>
                <input placeholder="Name" value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }} />
                <input placeholder="Price" type="number" value={newItem.price} onChange={(e) => setNewItem({ ...newItem, price: e.target.value })} style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }} />
                <input placeholder="Category" value={newItem.category} onChange={(e) => setNewItem({ ...newItem, category: e.target.value })} style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }} />
                <input placeholder="Emoji" value={newItem.emoji} onChange={(e) => setNewItem({ ...newItem, emoji: e.target.value })} style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }} />
                <button onClick={addMenuItem} style={{ padding: '10px', background: '#4CAF50', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>Add</button>
              </div>
            </div>
            {menuItems.length > 0 && (
              <div style={{ background: '#fff', padding: '16px', borderRadius: '12px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <input type="checkbox" checked={selectedMenuItems.length === menuItems.length} onChange={selectAllMenu} style={{ width: '18px', height: '18px' }} />
                  <span style={{ fontSize: '13px', fontWeight: '600' }}>Select All ({selectedMenuItems.length}/{menuItems.length})</span>
                </label>
                {selectedMenuItems.length > 0 && <button onClick={() => setShowDeletePassword('menu')} style={{ padding: '8px 12px', background: '#E64A19', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>🗑️ Delete ({selectedMenuItems.length})</button>}
              </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
              {menuItems.map(item => (
                <div key={item.id} style={{ background: '#fff', padding: '16px', borderRadius: '12px', border: selectedMenuItems.includes(item.id) ? '2px solid #FC8019' : '2px solid transparent', display: 'flex', gap: '12px' }}>
                  <input type="checkbox" checked={selectedMenuItems.includes(item.id)} onChange={() => toggleMenuItem(item.id)} style={{ width: '18px', height: '18px', marginTop: '12px' }} />
                  <div style={{ flex: 1 }}>
                    {editingItem && editingItem.id === item.id ? (
                      <div>
                        <input value={editingItem.name} onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })} style={{ width: '100%', padding: '8px', marginBottom: '6px', boxSizing: 'border-box' }} />
                        <input type="number" value={editingItem.price} onChange={(e) => setEditingItem({ ...editingItem, price: parseFloat(e.target.value) })} style={{ width: '100%', padding: '8px', marginBottom: '6px', boxSizing: 'border-box' }} />
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button onClick={updateMenuItem} style={{ flex: 1, padding: '8px', background: '#4CAF50', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Save</button>
                          <button onClick={() => setEditingItem(null)} style={{ flex: 1, padding: '8px', background: '#999', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ fontSize: '28px' }}>{item.emoji}</div>
                          <div>
                            <div style={{ fontWeight: '600', fontSize: '13px' }}>{item.name}</div>
                            <div style={{ fontSize: '11px', color: '#666' }}>{item.category} • ₹{item.price}</div>
                          </div>
                        </div>
                        <button onClick={() => setEditingItem({ ...item })} style={{ padding: '6px 10px', background: '#2196F3', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>Edit</button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'promos' && (
          <div>
            <h2 style={{ fontSize: '24px', margin: '0 0 20px' }}>🎁 Promos</h2>
            <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '16px', margin: '0 0 16px' }}>Generate (Min 1)</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px', marginBottom: '12px' }}>
                <div><label style={{ fontSize: '11px' }}>Count</label><input type="number" min="1" value={promoCount} onChange={(e) => setPromoCount(Math.max(1, parseInt(e.target.value) || 1))} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', boxSizing: 'border-box' }} /></div>
                <div><label style={{ fontSize: '11px' }}>Type</label><select value={promoType} onChange={(e) => setPromoType(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', boxSizing: 'border-box' }}><option value="percent">%</option><option value="flat">₹</option></select></div>
                <div><label style={{ fontSize: '11px' }}>Value</label><input type="number" value={promoValue} onChange={(e) => setPromoValue(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', boxSizing: 'border-box' }} /></div>
                <div><label style={{ fontSize: '11px' }}>Usage</label><input type="number" min="1" value={promoUsageLimit} onChange={(e) => setPromoUsageLimit(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', boxSizing: 'border-box' }} /></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                <div><label style={{ fontSize: '11px' }}>🔓 Activation</label><input type="date" value={promoActivationDate} onChange={(e) => setPromoActivationDate(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #4CAF50', borderRadius: '6px', boxSizing: 'border-box' }} /></div>
                <div><label style={{ fontSize: '11px' }}>⏰ Expiry</label><input type="date" value={promoExpiryDate} onChange={(e) => setPromoExpiryDate(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #E64A19', borderRadius: '6px', boxSizing: 'border-box' }} /></div>
              </div>
              <button onClick={generatePromos} style={{ width: '100%', padding: '14px', background: '#FC8019', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700' }}>🎁 Generate {promoCount}</button>
            </div>
            {promoCodes.length > 0 && (
              <div style={{ background: '#fff', padding: '16px', borderRadius: '12px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <input type="checkbox" checked={selectedPromos.length === promoCodes.length} onChange={selectAllPromos} style={{ width: '18px', height: '18px' }} />
                  <span style={{ fontSize: '13px', fontWeight: '600' }}>Select All ({selectedPromos.length}/{promoCodes.length})</span>
                </label>
                {selectedPromos.length > 0 && <button onClick={() => setShowDeletePassword('promos')} style={{ padding: '8px 12px', background: '#E64A19', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>🗑️ Delete ({selectedPromos.length})</button>}
              </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px' }}>
              {promoCodes.slice().reverse().map((p, reverseI) => {
                const i = promoCodes.length - 1 - reverseI;
                const isUsed = (p.usedCount || 0) >= p.usageLimit;
                const notYet = p.activationDate && new Date(p.activationDate) > new Date();
                const expired = new Date(p.expiryDate) < new Date();
                return (
                  <div key={i} style={{ background: isUsed || expired ? '#f5f5f5' : '#fff', padding: '14px', borderRadius: '10px', opacity: isUsed || expired ? 0.6 : 1, border: selectedPromos.includes(i) ? '2px solid #FC8019' : '1px solid #e0e0e0', display: 'flex', gap: '10px' }}>
                    <input type="checkbox" checked={selectedPromos.includes(i)} onChange={() => togglePromo(i)} style={{ width: '18px', height: '18px', marginTop: '4px' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <div style={{ fontSize: '16px', fontWeight: '700', color: '#FC8019', fontFamily: 'monospace' }}>{p.code}</div>
                        {isUsed && <span style={{ fontSize: '10px', background: '#E64A19', color: '#fff', padding: '2px 6px', borderRadius: '4px' }}>USED</span>}
                        {notYet && <span style={{ fontSize: '10px', background: '#FF9800', color: '#fff', padding: '2px 6px', borderRadius: '4px' }}>SOON</span>}
                        {expired && <span style={{ fontSize: '10px', background: '#999', color: '#fff', padding: '2px 6px', borderRadius: '4px' }}>EXP</span>}
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: '600' }}>{p.discountType === 'flat' ? '₹' : ''}{p.discountValue}{p.discountType === 'percent' ? '%' : ''} off</div>
                      <div style={{ fontSize: '10px', color: '#666' }}>{new Date(p.activationDate || p.createdAt).toLocaleDateString()} - {new Date(p.expiryDate).toLocaleDateString()}</div>
                      {!isUsed && !expired && (
                        <div style={{ display: 'flex', gap: '4px', marginTop: '8px' }}>
                          <button onClick={() => copyPromoCode(p.code)} style={{ flex: 1, padding: '6px', background: '#2196F3', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '10px', fontWeight: '700' }}>📋</button>
                          <button onClick={() => sharePromoWhatsApp(p)} style={{ flex: 1, padding: '6px', background: '#25D366', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '10px', fontWeight: '700' }}>📱</button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'customers' && (
          <div>
            <h2 style={{ fontSize: '24px', margin: '0 0 20px' }}>👥 Customers</h2>
            <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input type="tel" placeholder="Phone..." value={lookupPhone} onChange={(e) => setLookupPhone(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && performLookup()} style={{ flex: 1, padding: '12px', border: '2px solid #FC8019', borderRadius: '8px', fontSize: '16px' }} />
                <button onClick={performLookup} style={{ padding: '12px 24px', background: '#FC8019', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700' }}>{lookupLoading ? '⏳' : '🔍'}</button>
              </div>
            </div>
            {lookupCustomer && (
              <div style={{ background: 'linear-gradient(135deg, #FC8019 0%, #E64A19 100%)', padding: '24px', borderRadius: '12px', color: '#fff', marginBottom: '16px' }}>
                <div style={{ fontSize: '28px', fontWeight: '700' }}>{lookupCustomer.name || 'Customer'}</div>
                <div style={{ fontSize: '13px', opacity: 0.9 }}>📱 {lookupCustomer.phone}</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginTop: '16px' }}>
                  <div><div style={{ fontSize: '11px' }}>Points</div><div style={{ fontSize: '24px', fontWeight: '700' }}>{lookupCustomer.loyaltyPoints || 0}</div></div>
                  <div><div style={{ fontSize: '11px' }}>Orders</div><div style={{ fontSize: '24px', fontWeight: '700' }}>{lookupCustomer.totalOrders || 0}</div></div>
                  <div><div style={{ fontSize: '11px' }}>Spent</div><div style={{ fontSize: '24px', fontWeight: '700' }}>₹{lookupCustomer.totalSpent || 0}</div></div>
                </div>
              </div>
            )}
            {!lookupCustomer && allCustomers.length > 0 && (
              <div style={{ background: '#fff', padding: '20px', borderRadius: '12px' }}>
                <h3 style={{ fontSize: '16px', margin: '0 0 12px' }}>🏆 Top ({allCustomers.length})</h3>
                <div style={{ display: 'grid', gap: '8px', maxHeight: '400px', overflowY: 'auto' }}>
                  {allCustomers.slice(0, 20).map(c => (
                    <div key={c.phone} onClick={() => { setLookupPhone(c.phone); performLookup(); }} style={{ padding: '12px', background: '#f9f9f9', borderRadius: '8px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ fontWeight: '700' }}>{c.name || 'Customer'} • {c.phone}</div>
                        <div style={{ fontSize: '11px', color: '#666' }}>{c.totalOrders} orders • 🏆 {c.loyaltyPoints}</div>
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
            <h2 style={{ fontSize: '24px', margin: '0 0 20px' }}>⚙️ Settings</h2>
            <div style={{ background: '#e8f5e9', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px', color: '#2E7D32' }}>
              🔄 <strong>All changes sync to ALL devices instantly!</strong>
            </div>
            <div style={{ background: '#fff', padding: '24px', borderRadius: '12px' }}>
              <h3 style={{ fontSize: '16px', margin: '0 0 12px', color: '#FC8019' }}>Cafe Info</h3>
              {[{ key: 'cafeName', label: 'Name' }, { key: 'tagline', label: 'Tagline' }, { key: 'phone', label: 'Phone' }, { key: 'address', label: 'Address' }].map(f => (
                <div key={f.key} style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '13px', color: '#666', fontWeight: '600', display: 'block', marginBottom: '4px' }}>{f.label}</label>
                  <input type="text" value={settings[f.key]} onChange={(e) => updateSettings({ ...settings, [f.key]: e.target.value })} style={{ width: '100%', padding: '10px', border: '1px solid #e0e0e0', borderRadius: '6px', boxSizing: 'border-box' }} />
                </div>
              ))}
              <div style={{ padding: '12px', background: '#fff3e0', borderRadius: '8px', marginTop: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={settings.preventNegativeStock} onChange={(e) => updateSettings({ ...settings, preventNegativeStock: e.target.checked })} style={{ width: '18px', height: '18px' }} />
                  <span style={{ fontSize: '13px', fontWeight: '600' }}>🔒 Block orders if insufficient stock</span>
                </label>
              </div>
              <div style={{ padding: '12px', background: '#fff3e0', borderRadius: '8px', fontSize: '12px', color: '#E64A19', marginTop: '12px' }}>🔒 Delete Password: 9923022925</div>
            </div>
          </div>
        )}
      </div>

      <footer style={{ background: '#fff', borderTop: '1px solid #eee', padding: '20px 24px', marginTop: '40px', textAlign: 'center', color: '#666', fontSize: '13px' }}>
        <div>{settings.cafeName} • {settings.address}</div>
        <div style={{ fontSize: '11px', marginTop: '4px' }}>v4.2 • Real-Time Multi-Device Sync ☁️</div>
      </footer>
    </div>
  );
}
