import React, { useState, useEffect } from 'react';
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, doc, setDoc, getDoc, updateDoc, query, where, deleteDoc, onSnapshot, enableIndexedDbPersistence, orderBy } from "firebase/firestore";
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
// Enable offline persistence for better real-time experience
try {
  enableIndexedDbPersistence(db).catch(() => {});
} catch (e) {}
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
  const csv = ['Date,Time,Table,Customer,Phone,Items,Subtotal,Discount,Total,Payment',
    ...data.map(o => `"${o.date}","${o.time}","${o.tableNumber || ''}","${o.customerName || ''}","${o.customerPhone || ''}","${(o.items || []).map(i => `${i.name} x${i.quantity}`).join('; ')}",${o.subtotal || 0},${o.totalDiscount || 0},${o.total || 0},${o.paymentMethod || ''}`)
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
  const [selectedTable, setSelectedTable] = useState(null);
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

  // Marketing - password protected
  const [marketingUnlocked, setMarketingUnlocked] = useState(false);
  const [marketingPassword, setMarketingPassword] = useState('');
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
    // ORDERS - Real-time sync with immediate updates
    const unsubOrders = onSnapshot(
      collection(db, "orders"),
      { includeMetadataChanges: true }, // Listen to local changes too
      (snapshot) => {
        const allOrders = [];
        snapshot.forEach(doc => {
          const data = doc.data();
          allOrders.push({
            id: data.id || doc.id,
            firebaseDocId: doc.id,
            ...data
          });
        });
        allOrders.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setOrders(allOrders);
        setSyncStatus(snapshot.metadata.fromCache ? 'syncing' : 'connected');
      },
      (error) => {
        console.error('Orders sync error:', error);
        setSyncStatus('offline');
      }
    );
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
  // Clear all local cache and force fresh sync from Firebase
  const clearLocalCache = async () => {
    if (window.confirm('⚠️ This will:\n\n1. Clear all local browser cache\n2. Re-sync fresh data from Firebase\n3. Ensure both devices show SAME data\n\nContinue?')) {
      // Clear Firebase IndexedDB cache
      try {
        const dbs = await window.indexedDB.databases();
        for (const dbInfo of dbs) {
          if (dbInfo.name && dbInfo.name.includes('firestore')) {
            window.indexedDB.deleteDatabase(dbInfo.name);
          }
        }
      } catch (e) {}

      // Clear localStorage except login
      const loginState = localStorage.getItem('kaapfi_loggedIn');
      localStorage.clear();
      if (loginState) localStorage.setItem('kaapfi_loggedIn', loginState);

      alert('✅ Cache cleared! Reloading...');
      window.location.reload();
    }
  };
  // Manual refresh - forces fresh data from Firebase
  const forceRefresh = async () => {
    setSyncStatus('syncing');
    try {
      // Refetch orders
      const ordersSnap = await getDocs(collection(db, "orders"));
      const allOrders = [];
      ordersSnap.forEach(doc => {
        const data = doc.data();
        allOrders.push({ id: data.id || doc.id, firebaseDocId: doc.id, ...data });
      });
      allOrders.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setOrders(allOrders);
      // Refetch app data
      const invSnap = await getDoc(doc(db, "appData", "inventory"));
      if (invSnap.exists()) setInventory(invSnap.data().items || []);

      const expSnap = await getDoc(doc(db, "appData", "expenses"));
      if (expSnap.exists()) setExpenses(expSnap.data().items || []);

      const menuSnap = await getDoc(doc(db, "appData", "menu"));
      if (menuSnap.exists()) setMenuItems(menuSnap.data().items || defaultMenu);
      setSyncStatus('connected');
      alert('✅ Data refreshed from cloud!');
    } catch (e) {
      setSyncStatus('offline');
      alert('❌ Refresh failed. Check internet.');
    }
  };
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
    const now = new Date();
    const order = {
      id: Date.now(), items: currentOrder, subtotal, manualDiscount, promoDiscount, loyaltyRedemption, specialDiscount, totalDiscount,
      afterDiscount, tax, total, paymentMethod,
      tableNumber: selectedTable,
      customerName: customerName || (selectedTable ? `Table ${selectedTable}` : 'Walk-in'),
      customerPhone: customerPhone || '',
      timestamp: now.toISOString(), // ISO format for consistent sync
      date: now.toISOString().split('T')[0], // YYYY-MM-DD
      time: now.toLocaleTimeString(),
      displayDate: now.toLocaleDateString(),
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
    setPromoCode(''); setAppliedPromo(null); setRedeemPoints(0); setSelectedTable(null);
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
    const now = new Date();
    const billNo = `K90-${now.getFullYear().toString().slice(2)}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}-${String(todayOrders.length + 1).padStart(3,'0')}`;
    const itemsHTML = currentOrder.map(i =>
      `<tr><td style="padding:4px 0;">${i.quantity}</td><td style="padding:4px 0;">${i.name}</td><td style="padding:4px 0;text-align:right;">${i.price}</td><td style="padding:4px 0;text-align:right;">${i.price * i.quantity}</td></tr>`
    ).join('');
    const totalItems = currentOrder.reduce((sum, i) => sum + i.quantity, 0);

    const receiptHTML = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Receipt</title>
<style>
  @page { size: 80mm auto; margin: 0; }
  body { font-family: 'Courier New', monospace; margin: 0; padding: 10px; color: #000; font-size: 12px; }
  .receipt { max-width: 300px; margin: 0 auto; }
  .header { text-align: center; padding: 10px 0; }
  .header h1 { font-family: Georgia, serif; font-size: 28px; margin: 0; font-weight: bold; letter-spacing: 1px; }
  .estd { font-size: 11px; letter-spacing: 3px; margin-top: 4px; }
  .address { text-align: center; font-size: 11px; padding: 8px 0; border-bottom: 1px dashed #000; }
  .info { padding: 8px 0; border-bottom: 1px dashed #000; font-size: 11px; }
  .info-row { display: flex; justify-content: space-between; padding: 2px 0; }
  table { width: 100%; border-collapse: collapse; font-size: 11px; }
  .header-row { border-bottom: 1px dashed #000; }
  .header-row td { padding: 6px 0; font-weight: bold; }
  .subtotal-row { border-top: 1px dashed #000; padding-top: 6px; }
  .total-row { border-top: 2px solid #000; padding: 8px 0; font-size: 16px; font-weight: bold; }
  .footer { text-align: center; padding: 12px 0; border-top: 1px dashed #000; font-size: 11px; }
  .footer h2 { font-family: Georgia, serif; font-size: 14px; margin: 4px 0; font-weight: normal; font-style: italic; }
  .footer .hindi { font-family: Arial, sans-serif; font-size: 14px; margin: 4px 0; }
  .payment { text-align: center; padding: 6px 0; font-size: 11px; }
  @media print { body { padding: 0; } .no-print { display: none; } }
</style>
</head>
<body>
<div class="receipt">
  <div class="header">
    <h1>${settings.cafeName}</h1>
    <div class="estd">ESTD · 2025</div>
  </div>
  <div class="address">
    ${settings.address}<br>
    ${settings.phone}
  </div>
  <div class="info">
    <div class="info-row"><span>Bill No:</span><span>${billNo}</span></div>
    <div class="info-row"><span>Date:</span><span>${now.toLocaleDateString('en-GB', {day:'2-digit', month:'short', year:'numeric'})}</span></div>
    <div class="info-row"><span>Time:</span><span>${now.toLocaleTimeString('en-US', {hour:'2-digit', minute:'2-digit', hour12:true})}</span></div>
    ${selectedTable ? `<div class="info-row"><span>Table:</span><span>${selectedTable === 'Takeaway' ? 'Takeaway' : `Table ${selectedTable}`}</span></div>` : ''}
    ${customerName ? `<div class="info-row"><span>Customer:</span><span>${customerName}</span></div>` : ''}
    ${customerPhone ? `<div class="info-row"><span>Phone:</span><span>${customerPhone}</span></div>` : ''}
  </div>
  <table>
    <tr class="header-row">
      <td>Qt</td><td>Item</td><td style="text-align:right;">Rate</td><td style="text-align:right;">Amt</td>
    </tr>
    ${itemsHTML}
  </table>
  <div class="subtotal-row">
    <div class="info-row"><span>Items: ${totalItems}</span><span>Subtotal: ${subtotal}</span></div>
    ${totalDiscount > 0 ? `<div class="info-row"><span>Discount:</span><span>-₹${totalDiscount.toFixed(0)}</span></div>` : ''}
    ${tax > 0 ? `<div class="info-row"><span>Tax:</span><span>₹${tax.toFixed(0)}</span></div>` : ''}
  </div>
  <div class="total-row">
    <div class="info-row"><span>TOTAL</span><span>₹${total.toFixed(0)}</span></div>
  </div>
  <div class="payment">Payment: ${paymentMethod.toUpperCase()}</div>
  <div class="footer">
    <h2>${settings.tagline}</h2>
    <div class="hindi">जो है, काफी है।</div>
    <div style="margin-top:8px;">Thank you, come again!</div>
    <div style="margin-top:4px;">IG: @kaapfi90s</div>
  </div>
</div>
<div class="no-print" style="text-align:center; padding:20px;">
  <button onclick="window.print()" style="background:#000; color:#fff; padding:12px 24px; border:none; font-size:14px; cursor:pointer; font-weight:bold;">PRINT RECEIPT</button>
  <button onclick="window.close()" style="background:#fff; color:#000; padding:12px 24px; border:1px solid #000; font-size:14px; cursor:pointer; font-weight:bold; margin-left:8px;">BACK TO BILLING</button>
</div>
</body>
</html>`;
    const win = window.open('', '', 'height=700,width=400');
    win.document.write(receiptHTML);
    win.document.close();
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
  const addInventoryItem = async () => {
    if (!newInventoryItem.name || !newInventoryItem.quantity) { alert('Fill name & quantity'); return; }
    const id = Math.max(...inventory.map(i => i.id), 0) + 1;
    const updated = [...inventory, { ...newInventoryItem, id, quantity: parseFloat(newInventoryItem.quantity), threshold: parseFloat(newInventoryItem.threshold) || 0 }];
    await saveInventoryToCloud(updated);
    setNewInventoryItem({ name: '', quantity: '', unit: 'g', threshold: '' });
    alert('✅ Added & synced!');
  };
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
    const now = new Date();
    const newExp = {
      ...newExpense,
      id: Date.now(),
      amount: parseFloat(newExpense.amount),
      date: now.toISOString().split('T')[0],
      displayDate: now.toLocaleDateString(),
      time: now.toLocaleTimeString(),
      timestamp: now.toISOString()
    };
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

  // Use ISO date for consistent comparison across devices
  const getISODate = (dateInput) => {
    if (!dateInput) return '';
    try {
      const d = typeof dateInput === 'string' && dateInput.includes('/')
        ? new Date(dateInput.split('/').reverse().join('-'))
        : new Date(dateInput);
      return d.toISOString().split('T')[0];
    } catch (e) { return ''; }
  };

  const todayISO = new Date().toISOString().split('T')[0];
  const todayOrders = orders.filter(o => {
    // Try multiple date sources
    const orderDateISO = getISODate(o.timestamp) || getISODate(o.date);
    return orderDateISO === todayISO;
  });
  const todayRevenue = todayOrders.reduce((sum, o) => sum + o.total, 0);
  const aiRec = customerOrders.length > 0 ? getAIRecommendation(customerOrders, menuItems) : null;
  const selectedDateOrders = orders.filter(o => {
    const orderDateISO = getISODate(o.timestamp) || getISODate(o.date);
    return orderDateISO === summaryDate;
  });
  const selectedDateExpenses = expenses.filter(e => {
    const expDateISO = getISODate(e.timestamp) || getISODate(e.date);
    return expDateISO === summaryDate;
  });
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
          <h1 style={{ margin: '0 0 8px', fontSize: '28px', color: '#000', fontWeight: '700' }}>{settings.cafeName}</h1>
          <p style={{ margin: '0 0 32px', fontSize: '14px', color: '#000' }}>{settings.tagline}</p>
          <input type="password" placeholder="Enter Password" value={loginInput} onChange={(e) => setLoginInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleLogin()} style={{ width: '100%', padding: '14px', fontSize: '16px', border: '2px solid #e0e0e0', borderRadius: '8px', marginBottom: '16px', boxSizing: 'border-box' }} />
          {loginError && <div style={{ color: '#E64A19', fontSize: '14px', marginBottom: '16px' }}>{loginError}</div>}
          <button onClick={handleLogin} style={{ width: '100%', padding: '14px', fontSize: '16px', fontWeight: '700', background: '#FC8019', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>LOGIN →</button>
          <p style={{ marginTop: '24px', fontSize: '12px', color: '#000' }}>🔒 Kaapfi POS v5.1 • Tables + History</p>
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
      <style>{`
        input, select, textarea {
          color: #000 !important;
          font-weight: 600 !important;
        }
        input::placeholder {
          color: #666 !important;
          font-weight: 500 !important;
        }
        label {
          color: #000 !important;
          font-weight: 700 !important;
        }
        h1, h2, h3, h4, h5 {
          color: #000 !important;
        }
        p, span, div {
          color: inherit;
        }
      `}</style>
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
            <div style={{ background: 'rgba(255,255,255,0.25)', padding: '8px 14px', borderRadius: '20px', color: '#fff', fontSize: '13px', fontWeight: '700' }}>🔥 {todayOrders.length} Orders • ₹{todayRevenue}</div>
            <div style={{ background: syncStatus === 'connected' ? '#2E7D32' : syncStatus === 'syncing' ? '#F57C00' : '#C62828', padding: '8px 14px', borderRadius: '20px', color: '#fff', fontSize: '11px', fontWeight: '700' }}>
              {syncStatus === 'connected' ? '🔄 LIVE' : syncStatus === 'syncing' ? '⏳ SYNC' : '⚠️ OFF'}
            </div>
            <button onClick={forceRefresh} style={{ background: 'rgba(255,255,255,0.25)', color: '#fff', border: '1px solid #fff', padding: '8px 12px', borderRadius: '20px', cursor: 'pointer', fontSize: '13px', fontWeight: '700' }}>🔄 Refresh</button>
            <button onClick={clearLocalCache} style={{ background: '#E64A19', color: '#fff', border: '1px solid #fff', padding: '8px 12px', borderRadius: '20px', cursor: 'pointer', fontSize: '13px', fontWeight: '700' }}>🧹 Clear Cache</button>
            <button onClick={handleLogout} style={{ background: 'rgba(255,255,255,0.25)', color: '#fff', border: '1px solid #fff', padding: '8px 16px', borderRadius: '20px', cursor: 'pointer', fontSize: '13px', fontWeight: '700' }}>Logout</button>
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
          { id: 'marketing', icon: '🎯', label: 'Marketing' },
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
                  <button key={cat} onClick={() => setSelectedCategory(cat)} style={{ padding: '8px 16px', borderRadius: '20px', border: 'none', background: selectedCategory === cat ? '#FC8019' : '#fff', color: selectedCategory === cat ? '#fff' : '#666', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}>{cat}</button>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px' }}>
                {filteredItems.map(item => {
                  const remaining = getRemainingServings(item.name);
                  const lowStock = remaining !== Infinity && remaining < 5;
                  return (
                    <div key={item.id} onClick={() => addToOrder(item)} style={{ background: '#fff', padding: '16px', borderRadius: '12px', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', textAlign: 'center', border: lowStock ? '2px solid #E64A19' : 'none' }}>
                      <div style={{ fontSize: '36px', marginBottom: '8px' }}>{item.emoji}</div>
                      <div style={{ fontSize: '13px', fontWeight: '700', color: '#000', marginBottom: '4px', minHeight: '36px' }}>{item.name}</div>
                      <div style={{ fontSize: '15px', color: '#E64A19', fontWeight: '800' }}>₹{item.price}</div>
                      {remaining !== Infinity && (
                        <div style={{ fontSize: '10px', color: lowStock ? '#E64A19' : '#4CAF50', fontWeight: '700', marginTop: '4px' }}>{lowStock ? '⚠️ ' : '✓ '}{remaining} left</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            <div style={{ background: '#fff', borderRadius: '12px', padding: '20px', height: 'fit-content', position: 'sticky', top: '100px', maxHeight: 'calc(100vh - 120px)', overflowY: 'auto' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '18px', fontWeight: '700', color: '#000' }}>🛒 Current Order ({currentOrder.length})</h3>

              {/* TABLE SELECTION */}
              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '12px', fontWeight: '800', color: '#000', display: 'block', marginBottom: '6px' }}>🪑 Select Table:</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '4px' }}>
                  {[1, 2, 3, 4, 'Takeaway'].map(t => {
                    const tableOrder = todayOrders.find(o => o.tableNumber === t && (o.status || 'in_progress') !== 'delivered');
                    const isSelected = selectedTable === t;
                    const hasActiveOrder = !!tableOrder;
                    return (
                      <button key={t} onClick={() => {
                        setSelectedTable(isSelected ? null : t);
                        if (!isSelected && tableOrder) {
                          if (tableOrder.customerPhone) handlePhoneChange(tableOrder.customerPhone);
                          if (tableOrder.customerName && !tableOrder.customerName.startsWith('Table')) setCustomerName(tableOrder.customerName);
                        }
                      }} style={{
                        padding: '10px 4px',
                        border: 'none',
                        borderRadius: '6px',
                        background: isSelected ? '#FC8019' : hasActiveOrder ? '#4CAF50' : '#f0f0f0',
                        color: isSelected || hasActiveOrder ? '#fff' : '#000',
                        fontWeight: '800',
                        cursor: 'pointer',
                        fontSize: t === 'Takeaway' ? '10px' : '13px'
                      }}>
                        {t === 'Takeaway' ? '📦 T/A' : `T${t}`}
                        {hasActiveOrder && !isSelected && <div style={{ fontSize: '9px', marginTop: '2px' }}>₹{tableOrder.total?.toFixed(0)}</div>}
                      </button>
                    );
                  })}
                </div>
                {selectedTable && (
                  <div style={{ marginTop: '6px', padding: '6px 10px', background: '#fff3e0', borderRadius: '6px', fontSize: '11px', fontWeight: '700', color: '#E64A19' }}>
                    ✓ Selected: {selectedTable === 'Takeaway' ? 'Takeaway' : `Table ${selectedTable}`}
                  </div>
                )}
              </div>

              {/* ADD-ON BILL BANNER */}
              {customerData && customerOrders.length > 0 && (
                <div style={{ background: '#fff3e0', padding: '10px', borderRadius: '8px', marginBottom: '10px', border: '2px solid #FC8019' }}>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: '#E64A19', marginBottom: '4px' }}>⚡ ADD-ON BILL for {customerData.name || customerPhone}</div>
                  <div style={{ fontSize: '11px', color: '#000', fontWeight: '600' }}>Last bill: ₹{customerOrders[0]?.total?.toFixed(0)} • {customerOrders[0]?.time}</div>
                  <div style={{ fontSize: '11px', color: '#000', fontWeight: '600', marginTop: '2px' }}>Add new items below → Complete as Add-On</div>
                </div>
              )}

              <input type="tel" placeholder="Customer phone (optional)" value={customerPhone} onChange={(e) => handlePhoneChange(e.target.value)} style={{ width: '100%', padding: '10px', fontSize: '14px', border: '2px solid #FC8019', borderRadius: '8px', marginBottom: '10px', boxSizing: 'border-box' }} />
              <input type="text" placeholder="Customer name (optional)" value={customerName} onChange={(e) => setCustomerName(e.target.value)} style={{ width: '100%', padding: '10px', fontSize: '14px', border: '1px solid #e0e0e0', borderRadius: '8px', marginBottom: '12px', boxSizing: 'border-box' }} />
              {customerData && (
                <>
                  <div style={{ background: 'linear-gradient(135deg, #FC8019 0%, #E64A19 100%)', padding: '12px', borderRadius: '8px', marginBottom: '10px', color: '#fff' }}>
                    <div style={{ fontSize: '14px', fontWeight: '700' }}>👋 {customerData.name || 'Customer'}</div>
                    <div style={{ fontSize: '11px', opacity: 1 }}>📱 {customerData.phone}</div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', marginBottom: '10px' }}>
                    <div style={{ background: '#e8f5e9', padding: '8px', borderRadius: '6px', textAlign: 'center' }}>
                      <div style={{ fontSize: '10px', color: '#000' }}>Points</div>
                      <div style={{ fontSize: '16px', fontWeight: '700', color: '#4CAF50' }}>{customerData.loyaltyPoints || 0}</div>
                    </div>
                    <div style={{ background: '#e3f2fd', padding: '8px', borderRadius: '6px', textAlign: 'center' }}>
                      <div style={{ fontSize: '10px', color: '#000' }}>Visits</div>
                      <div style={{ fontSize: '16px', fontWeight: '700', color: '#2196F3' }}>{customerData.totalOrders}</div>
                    </div>
                    <div style={{ background: '#fff3e0', padding: '8px', borderRadius: '6px', textAlign: 'center' }}>
                      <div style={{ fontSize: '10px', color: '#000' }}>Spent</div>
                      <div style={{ fontSize: '14px', fontWeight: '700', color: '#FC8019' }}>₹{customerData.totalSpent}</div>
                    </div>
                  </div>
                  {aiRec && (
                    <div style={{ background: 'linear-gradient(135deg, #9C27B0 0%, #673AB7 100%)', padding: '10px', borderRadius: '8px', marginBottom: '10px', color: '#fff' }}>
                      <div style={{ fontSize: '10px', fontWeight: '700' }}>🤖 AI SUGGESTION</div>
                      <div style={{ fontSize: '12px', fontWeight: '700', marginTop: '4px' }}>{aiRec.message}</div>
                    </div>
                  )}
                </>
              )}
              <div style={{ maxHeight: '250px', overflowY: 'auto', marginBottom: '12px' }}>
                {currentOrder.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '30px 20px', color: '#000' }}>
                    <div style={{ fontSize: '48px' }}>🛒</div>
                    <p style={{ fontSize: '13px' }}>No items yet</p>
                  </div>
                ) : (
                  currentOrder.map(item => (
                    <div key={item.id} style={{ padding: '10px', background: '#f9f9f9', borderRadius: '8px', marginBottom: '6px', border: '1px solid #e0e0e0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontSize: '13px', fontWeight: '800', color: '#000' }}>{item.emoji} {item.name}</span>
                        <button onClick={() => removeFromOrder(item.id)} style={{ background: 'none', border: 'none', color: '#E64A19', cursor: 'pointer', fontSize: '18px', fontWeight: '700' }}>×</button>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)} style={{ width: '24px', height: '24px', borderRadius: '4px', border: '1px solid #FC8019', background: '#fff', color: '#FC8019', cursor: 'pointer', fontWeight: '700' }}>−</button>
                          <span style={{ minWidth: '20px', textAlign: 'center', fontWeight: '700', fontSize: '14px', color: '#000' }}>{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)} style={{ width: '24px', height: '24px', borderRadius: '4px', border: '1px solid #FC8019', background: '#FC8019', color: '#fff', cursor: 'pointer', fontWeight: '700' }}>+</button>
                        </div>
                        <span style={{ fontWeight: '700', fontSize: '14px', color: '#000' }}>₹{item.price * item.quantity}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
              {currentOrder.length > 0 && (
                <>
                  <div style={{ marginBottom: '10px', padding: '10px', background: '#fff9e6', borderRadius: '8px' }}>
                    <label style={{ fontSize: '11px', fontWeight: '700', color: '#000' }}>💰 Manual Discount</label>
                    <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                      <select value={manualDiscountType} onChange={(e) => setManualDiscountType(e.target.value)} style={{ padding: '6px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '12px' }}>
                        <option value="flat">₹</option><option value="percent">%</option>
                      </select>
                      <input type="number" value={manualDiscountValue} onChange={(e) => setManualDiscountValue(e.target.value)} placeholder="0" style={{ flex: 1, padding: '6px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '12px' }} />
                    </div>
                  </div>
                  <div style={{ marginBottom: '10px', padding: '10px', background: '#e3f2fd', borderRadius: '8px' }}>
                    <label style={{ fontSize: '11px', fontWeight: '700', color: '#000' }}>🎁 Promo Code</label>
                    <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                      <input type="text" value={promoCode} onChange={(e) => setPromoCode(e.target.value.toUpperCase())} placeholder="KF1234" style={{ flex: 1, padding: '6px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '12px' }} />
                      <button onClick={applyPromo} style={{ padding: '6px 12px', background: '#2196F3', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: '700' }}>Apply</button>
                    </div>
                  </div>
                  <div style={{ borderTop: '1px dashed #ddd', paddingTop: '10px', marginBottom: '12px', fontSize: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#000' }}><span>Subtotal</span><span>₹{subtotal}</span></div>
                    {totalDiscount > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', color: '#E64A19' }}><span>Discount</span><span>-₹{totalDiscount.toFixed(0)}</span></div>}
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: '700', marginTop: '6px', color: '#000' }}><span>TOTAL</span><span>₹{total.toFixed(0)}</span></div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px', marginBottom: '10px' }}>
                    {['cash', 'card', 'upi'].map(m => (
                      <button key={m} onClick={() => setPaymentMethod(m)} style={{ padding: '8px', border: 'none', borderRadius: '6px', background: paymentMethod === m ? '#FC8019' : '#f0f0f0', color: paymentMethod === m ? '#fff' : '#666', fontWeight: '700', cursor: 'pointer', fontSize: '11px', textTransform: 'uppercase' }}>{m}</button>
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
              <h2 style={{ fontSize: '24px', margin: 0, color: '#000' }}>💼 Business Summary</h2>
              <input type="date" value={summaryDate} onChange={(e) => setSummaryDate(e.target.value)} style={{ padding: '10px', border: '2px solid #FC8019', borderRadius: '8px', fontSize: '14px', fontWeight: '700' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '20px' }}>
              <div style={{ background: 'linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)', padding: '20px', borderRadius: '12px', color: '#fff' }}>
                <div style={{ fontSize: '13px', opacity: 1 }}>💰 CASH</div>
                <div style={{ fontSize: '28px', fontWeight: '700' }}>₹{cashReceived.toFixed(0)}</div>
                <div style={{ fontSize: '11px', opacity: 1 }}>{selectedDateOrders.filter(o => o.paymentMethod === 'cash').length} orders</div>
              </div>
              <div style={{ background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)', padding: '20px', borderRadius: '12px', color: '#fff' }}>
                <div style={{ fontSize: '13px', opacity: 1 }}>📱 UPI</div>
                <div style={{ fontSize: '28px', fontWeight: '700' }}>₹{upiReceived.toFixed(0)}</div>
                <div style={{ fontSize: '11px', opacity: 1 }}>{selectedDateOrders.filter(o => o.paymentMethod === 'upi').length} orders</div>
              </div>
              <div style={{ background: 'linear-gradient(135deg, #9C27B0 0%, #673AB7 100%)', padding: '20px', borderRadius: '12px', color: '#fff' }}>
                <div style={{ fontSize: '13px', opacity: 1 }}>💳 CARD</div>
                <div style={{ fontSize: '28px', fontWeight: '700' }}>₹{cardReceived.toFixed(0)}</div>
                <div style={{ fontSize: '11px', opacity: 1 }}>{selectedDateOrders.filter(o => o.paymentMethod === 'card').length} orders</div>
              </div>
              <div style={{ background: 'linear-gradient(135deg, #FC8019 0%, #E64A19 100%)', padding: '20px', borderRadius: '12px', color: '#fff' }}>
                <div style={{ fontSize: '13px', opacity: 1 }}>🔥 TOTAL</div>
                <div style={{ fontSize: '28px', fontWeight: '700' }}>₹{totalReceived.toFixed(0)}</div>
                <div style={{ fontSize: '11px', opacity: 1 }}>{selectedDateOrders.length} orders</div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '20px' }}>
              <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', borderLeft: '4px solid #E64A19' }}>
                <div style={{ fontSize: '13px', color: '#000' }}>💸 CASH EXPENSES</div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#E64A19' }}>-₹{cashExpenses.toFixed(0)}</div>
              </div>
              <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', borderLeft: '4px solid #FF9800' }}>
                <div style={{ fontSize: '13px', color: '#000' }}>💸 UPI EXPENSES</div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#FF9800' }}>-₹{upiExpenses.toFixed(0)}</div>
              </div>
              <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', borderLeft: '4px solid #E64A19' }}>
                <div style={{ fontSize: '13px', color: '#000' }}>📉 TOTAL EXPENSES</div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#E64A19' }}>-₹{totalExpenses.toFixed(0)}</div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ background: netCashInHand >= 0 ? 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)' : 'linear-gradient(135deg, #E64A19 0%, #B71C1C 100%)', padding: '24px', borderRadius: '12px', color: '#fff' }}>
                <div style={{ fontSize: '14px', opacity: 1 }}>💵 NET CASH IN HAND</div>
                <div style={{ fontSize: '36px', fontWeight: '700' }}>₹{netCashInHand.toFixed(0)}</div>
                <div style={{ fontSize: '12px', opacity: 1 }}>Cash ₹{cashReceived.toFixed(0)} - Expenses ₹{cashExpenses.toFixed(0)}</div>
              </div>
              <div style={{ background: netProfit >= 0 ? 'linear-gradient(135deg, #2196F3 0%, #0D47A1 100%)' : 'linear-gradient(135deg, #E64A19 0%, #B71C1C 100%)', padding: '24px', borderRadius: '12px', color: '#fff' }}>
                <div style={{ fontSize: '14px', opacity: 1 }}>📊 NET PROFIT</div>
                <div style={{ fontSize: '36px', fontWeight: '700' }}>₹{netProfit.toFixed(0)}</div>
                <div style={{ fontSize: '12px', opacity: 1 }}>Revenue - Expenses</div>
              </div>
            </div>
            {selectedDateExpenses.length > 0 && (
              <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', marginTop: '20px' }}>
                <h3 style={{ fontSize: '16px', margin: '0 0 12px', color: '#000' }}>📋 Expenses on {new Date(summaryDate).toLocaleDateString()}</h3>
                {selectedDateExpenses.map(e => (
                  <div key={e.id} style={{ padding: '10px', background: '#f9f9f9', borderRadius: '6px', marginBottom: '6px', display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '700' }}>{e.description}</div>
                      <div style={{ fontSize: '11px', color: '#000' }}>{e.category} • {e.paidBy.toUpperCase()} • {e.time}</div>
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
            <h2 style={{ fontSize: '24px', margin: '0 0 20px', color: '#000', fontWeight: '800' }}>💸 Expenses</h2>
            <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '16px', margin: '0 0 12px', color: '#000', fontWeight: '700' }}>➕ Add Expense</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '8px', marginBottom: '10px' }}>
                <div><label style={{ fontSize: '11px', color: '#000' }}>Description</label><input style={{color: "#000", fontWeight: "600"}} placeholder="Milk purchase" value={newExpense.description} onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', boxSizing: 'border-box', color: '#000', fontWeight: '600' }} /></div>
                <div><label style={{ fontSize: '11px', color: '#000' }}>Amount ₹</label><input type="number" placeholder="500" value={newExpense.amount} onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', boxSizing: 'border-box', color: '#000', fontWeight: '600' }} /></div>
                <div><label style={{ fontSize: '11px', color: '#000' }}>Category</label><select value={newExpense.category} onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', boxSizing: 'border-box', color: '#000', fontWeight: '600' }}><option>General</option><option>Groceries</option><option>Milk/Dairy</option><option>Coffee Beans</option><option>Cleaning</option><option>Utilities</option><option>Staff</option><option>Rent</option><option>Equipment</option><option>Marketing</option><option>Transport</option><option>Other</option></select></div>
                <div><label style={{ fontSize: '11px', color: '#000' }}>Paid By</label><select value={newExpense.paidBy} onChange={(e) => setNewExpense({ ...newExpense, paidBy: e.target.value })} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', boxSizing: 'border-box', color: '#000', fontWeight: '600' }}><option value="cash">💵 Cash</option><option value="upi">📱 UPI</option><option value="card">💳 Card</option></select></div>
              </div>
              <button onClick={addExpense} style={{ width: '100%', padding: '12px', background: '#E64A19', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '700' }}>💸 Add Expense</button>
            </div>
            {expenses.length === 0 ? (
              <div style={{ background: '#fff', padding: '40px', borderRadius: '12px', textAlign: 'center', color: '#000' }}><div style={{ fontSize: '48px' }}>💸</div><p>No expenses yet</p></div>
            ) : (
              <div>
                {/* 40-Day Expense Book */}
                <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                    <h3 style={{ fontSize: '16px', margin: 0, color: '#000', fontWeight: '800' }}>📚 40-Day Expense Book</h3>
                    <button onClick={() => {
                      const start = Date.now() - 40 * 86400000;
                      const filtered = expenses.filter(e => new Date(e.timestamp || e.date) >= start);
                      const csv = 'Date,Time,Description,Category,Amount,Paid By\n' + filtered.map(e => `"${e.date}","${e.time}","${e.description}","${e.category}",${e.amount},"${e.paidBy}"`).join('\n');
                      const blob = new Blob([csv], { type: 'text/csv' });
                      const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
                      a.download = `kaapfi-expenses-40days.csv`; a.click();
                    }} style={{ padding: '8px 16px', background: '#E64A19', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '700', fontSize: '12px' }}>📥 Download 40 Days</button>
                  </div>

                  <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    {(() => {
                      const dayMap = {};
                      expenses.forEach(e => {
                        const d = e.date || (e.timestamp ? new Date(e.timestamp).toISOString().split('T')[0] : null);
                        if (!d) return;
                        const daysAgo = Math.floor((Date.now() - new Date(d)) / 86400000);
                        if (daysAgo > 40) return;
                        if (!dayMap[d]) dayMap[d] = { total: 0, cash: 0, upi: 0, items: [] };
                        dayMap[d].total += e.amount;
                        if (e.paidBy === 'cash') dayMap[d].cash += e.amount;
                        if (e.paidBy === 'upi') dayMap[d].upi += e.amount;
                        dayMap[d].items.push(e);
                      });
                      const sorted = Object.entries(dayMap).sort((a, b) => new Date(b[0]) - new Date(a[0]));
                      return sorted.length === 0 ? <p style={{ color: '#000', fontWeight: '600' }}>No expenses in last 40 days</p> : sorted.map(([date, data]) => (
                        <div key={date} style={{ marginBottom: '12px', border: '1px solid #e0e0e0', borderRadius: '8px', overflow: 'hidden' }}>
                          <div style={{ padding: '10px 14px', background: '#ffebee', display: 'flex', justifyContent: 'space-between' }}>
                            <div style={{ fontSize: '14px', fontWeight: '800', color: '#000' }}>{new Date(date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</div>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: '15px', fontWeight: '800', color: '#E64A19' }}>-₹{data.total.toFixed(0)}</div>
                              <div style={{ fontSize: '10px', color: '#000', fontWeight: '600' }}>💵 ₹{data.cash.toFixed(0)} • 📱 ₹{data.upi.toFixed(0)}</div>
                            </div>
                          </div>
                          {data.items.map((e, i) => (
                            <div key={i} style={{ padding: '8px 14px', background: '#fff', borderTop: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between' }}>
                              <div>
                                <div style={{ fontSize: '12px', fontWeight: '700', color: '#000' }}>{e.description}</div>
                                <div style={{ fontSize: '10px', color: '#000', fontWeight: '600' }}>{e.category} • {e.paidBy?.toUpperCase()} • {e.time}</div>
                              </div>
                              <div style={{ fontSize: '13px', fontWeight: '800', color: '#E64A19' }}>-₹{e.amount}</div>
                            </div>
                          ))}
                        </div>
                      ));
                    })()}
                  </div>
                </div>

                <div style={{ background: '#fff', padding: '16px', borderRadius: '12px', marginBottom: '12px' }}>
                  <div style={{ fontSize: '14px', color: '#000', fontWeight: '700' }}>Total Expenses (All Time)</div>
                  <div style={{ fontSize: '28px', fontWeight: '700', color: '#E64A19' }}>₹{expenses.reduce((s, e) => s + e.amount, 0).toFixed(0)}</div>
                </div>
                <div style={{ display: 'grid', gap: '8px' }}>
                  {expenses.slice().reverse().map(e => (
                    <div key={e.id} style={{ background: '#fff', padding: '14px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: '700' }}>{e.description}</div>
                        <div style={{ fontSize: '11px', color: '#000' }}>{e.category} • {e.paidBy.toUpperCase()} • {e.date} • {e.time}</div>
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
                <button onClick={quickAddCommonItems} style={{ padding: '10px 16px', background: '#4CAF50', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '13px' }}>⚡ Quick Add Common Items</button>
                <button onClick={resetInventoryToDefault} style={{ padding: '10px 16px', background: '#FC8019', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '13px' }}>🔄 Reset to Kaapfi Default</button>
              </div>
            </div>
            {inventory.length === 0 && (
              <div style={{ background: '#fff3e0', padding: '20px', borderRadius: '12px', marginBottom: '20px', textAlign: 'center' }}>
                <div style={{ fontSize: '48px' }}>📦</div>
                <h3 style={{ margin: '8px 0', color: '#E64A19' }}>No inventory items yet!</h3>
                <p style={{ fontSize: '13px', color: '#000', marginBottom: '12px' }}>Click "Quick Add Common Items" above to load default Kaapfi inventory (Coffee, Milk, Paneer, etc.)</p>
                <button onClick={quickAddCommonItems} style={{ padding: '12px 24px', background: '#4CAF50', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '14px' }}>⚡ Load Default Inventory Now</button>
              </div>
            )}
            <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '16px', margin: '0 0 12px', color: '#000', fontWeight: '700' }}>➕ Add Ingredient</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '8px', marginBottom: '10px' }}>
                <div><label style={{ fontSize: '11px', color: '#000' }}>Name</label><input style={{color: "#000", fontWeight: "600"}} placeholder="Cheese" value={newInventoryItem.name} onChange={(e) => setNewInventoryItem({ ...newInventoryItem, name: e.target.value })} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', boxSizing: 'border-box', color: '#000', fontWeight: '600' }} /></div>
                <div><label style={{ fontSize: '11px', color: '#000' }}>Quantity</label><input type="number" placeholder="2000" value={newInventoryItem.quantity} onChange={(e) => setNewInventoryItem({ ...newInventoryItem, quantity: e.target.value })} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', boxSizing: 'border-box', color: '#000', fontWeight: '600' }} /></div>
                <div><label style={{ fontSize: '11px', color: '#000' }}>Unit</label><select value={newInventoryItem.unit} onChange={(e) => setNewInventoryItem({ ...newInventoryItem, unit: e.target.value })} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', boxSizing: 'border-box', color: '#000', fontWeight: '600' }}><option value="g">g</option><option value="kg">kg</option><option value="ml">ml</option><option value="l">l</option><option value="units">units</option></select></div>
                <div><label style={{ fontSize: '11px', color: '#000' }}>Threshold</label><input type="number" placeholder="200" value={newInventoryItem.threshold} onChange={(e) => setNewInventoryItem({ ...newInventoryItem, threshold: e.target.value })} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', boxSizing: 'border-box', color: '#000', fontWeight: '600' }} /></div>
              </div>
              <button onClick={addInventoryItem} style={{ width: '100%', padding: '12px', background: '#4CAF50', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '700' }}>📦 Add</button>
            </div>
            <div style={{ background: '#fff', padding: '16px', borderRadius: '12px', marginBottom: '12px', display: 'flex', justifyContent: 'space-between' }}>
              <div><div style={{ fontSize: '13px', color: '#000' }}>Total Items</div><div style={{ fontSize: '24px', fontWeight: '700' }}>{inventory.length}</div></div>
              <div><div style={{ fontSize: '13px', color: '#000' }}>Low Stock</div><div style={{ fontSize: '24px', fontWeight: '700', color: '#E64A19' }}>{inventory.filter(i => i.quantity < i.threshold).length}</div></div>
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
                          <div style={{ fontSize: '15px', fontWeight: '700', color: '#000' }}>{item.name}</div>
                          {isLow && <span style={{ fontSize: '10px', background: '#E64A19', color: '#fff', padding: '2px 8px', borderRadius: '10px' }}>LOW</span>}
                        </div>
                        <div style={{ fontSize: '28px', fontWeight: '700', color: isLow ? '#E64A19' : '#4CAF50' }}>{item.quantity} <span style={{ fontSize: '14px', color: '#000' }}>{item.unit}</span></div>
                        <div style={{ fontSize: '11px', color: '#000' }}>Alert below: {item.threshold}{item.unit}</div>
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
            <h2 style={{ fontSize: '24px', margin: '0 0 20px', color: '#000', fontWeight: '800' }}>📋 Recipe SOPs</h2>
            {editingSOP ? (
              <div style={{ background: '#fff', padding: '20px', borderRadius: '12px' }}>
                <h3 style={{ fontSize: '18px', margin: '0 0 12px', color: '#FC8019' }}>✏️ {editingSOP}</h3>
                {sopEditing.map((row, index) => (
                  <div key={index} style={{ display: 'grid', gridTemplateColumns: '1fr 100px auto 30px', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                    <select value={row.ingredient} onChange={(e) => updateSOPRow(index, 'ingredient', e.target.value)} style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '6px', color: '#000', fontWeight: '600' }}>
                      <option value="">-- Select --</option>
                      {inventory.map(inv => <option key={inv.id} value={inv.name}>{inv.name} ({inv.unit})</option>)}
                    </select>
                    <input type="number" placeholder="Qty" value={row.quantity} onChange={(e) => updateSOPRow(index, 'quantity', e.target.value)} style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '6px', color: '#000', fontWeight: '600' }} />
                    <div style={{ fontSize: '12px', color: '#000' }}>{inventory.find(i => i.name === row.ingredient)?.unit || ''}</div>
                    <button onClick={() => removeSOPRow(index)} style={{ padding: '8px', background: '#E64A19', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>×</button>
                  </div>
                ))}
                <button onClick={addSOPRow} style={{ padding: '10px 16px', background: '#4CAF50', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '700', marginRight: '8px', marginTop: '8px' }}>+ Add</button>
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
                            <div style={{ fontSize: '14px', fontWeight: '700', color: '#000' }}>{item.name}</div>
                            <div style={{ fontSize: '11px', color: '#000' }}>₹{item.price}</div>
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
                      <button onClick={() => openSOPEditor(item.name)} style={{ width: '100%', padding: '8px', background: '#FC8019', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '700', fontSize: '12px' }}>{hasSOP ? '✏️ Edit' : '➕ Create'}</button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
        {activeTab === 'kitchen' && (
          <div>
            <h2 style={{ fontSize: '24px', margin: '0 0 20px', color: '#000', fontWeight: '800' }}>👨‍🍳 Kitchen</h2>
            <div style={{ display: 'grid', gap: '12px' }}>
              {todayOrders.filter(o => (o.status || 'in_progress') !== 'delivered').map(order => {
                const startTime = order.startTime || new Date(order.timestamp).getTime();
                const elapsed = Math.floor((Date.now() - startTime) / 60000);
                const isLate = elapsed > 10;
                return (
                  <div key={order.id} style={{ background: '#fff', padding: '16px', borderRadius: '12px', border: isLate ? '2px solid #E64A19' : '2px solid transparent' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <div style={{ fontWeight: '800', color: '#000' }}>
                        {order.tableNumber && <span style={{ background: '#FC8019', color: '#fff', padding: '2px 10px', borderRadius: '10px', marginRight: '8px', fontSize: '14px' }}>🪑 {order.tableNumber === 'Takeaway' ? 'T/A' : `T${order.tableNumber}`}</span>}
                        #{order.id.toString().slice(-5)} • {order.customerName}
                      </div>
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
                          ) : <div style={{ fontSize: '12px', color: '#000', paddingLeft: '12px' }}>No recipe</div>}
                        </div>
                      );
                    })}
                    <div style={{ display: 'flex', gap: '6px', marginTop: '10px' }}>
                      <button onClick={() => updateOrderStatus(order.id, 'in_progress')} style={{ padding: '8px 12px', background: order.status === 'in_progress' ? '#FF9800' : '#f0f0f0', color: order.status === 'in_progress' ? '#fff' : '#666', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }}>🔥 Progress</button>
                      <button onClick={() => updateOrderStatus(order.id, 'ready')} style={{ padding: '8px 12px', background: order.status === 'ready' ? '#4CAF50' : '#f0f0f0', color: order.status === 'ready' ? '#fff' : '#666', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }}>✅ Ready</button>
                      <button onClick={() => updateOrderStatus(order.id, 'delivered')} style={{ padding: '8px 12px', background: '#2196F3', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }}>📦 Done</button>
                    </div>
                  </div>
                );
              })}
              {todayOrders.filter(o => (o.status || 'in_progress') !== 'delivered').length === 0 && (
                <div style={{ background: '#fff', padding: '60px', borderRadius: '12px', textAlign: 'center', color: '#000' }}><div style={{ fontSize: '64px' }}>🎉</div><p>All done!</p></div>
              )}
            </div>
          </div>
        )}
        {activeTab === 'bills' && (
          <div>
            <h2 style={{ fontSize: '24px', margin: '0 0 20px', color: '#000', fontWeight: '800' }}>🧾 Today's Orders</h2>
            {todayOrders.length > 0 && (
              <div style={{ background: '#fff', padding: '16px', borderRadius: '12px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <input type="checkbox" checked={selectedBills.length === todayOrders.length} onChange={selectAllBills} style={{ width: '18px', height: '18px' }} />
                  <span style={{ fontSize: '13px', fontWeight: '700' }}>Select All ({selectedBills.length}/{todayOrders.length})</span>
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
                          <div style={{ fontWeight: '700', color: '#000' }}>#{order.id.toString().slice(-5)}</div>
                          <div style={{ fontSize: '12px', color: '#000', fontWeight: '600' }}>
                            {order.tableNumber && <span style={{ background: '#FC8019', color: '#fff', padding: '2px 8px', borderRadius: '10px', marginRight: '6px', fontWeight: '800' }}>🪑 {order.tableNumber === 'Takeaway' ? 'T/A' : `T${order.tableNumber}`}</span>}
                            {order.customerName} {order.customerPhone && `• ${order.customerPhone}`} • {order.time}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '18px', fontWeight: '700', color: '#FC8019' }}>₹{order.total?.toFixed(0)}</div>
                          <div style={{ fontSize: '11px', color: '#000', textTransform: 'uppercase' }}>{order.paymentMethod}</div>
                        </div>
                      </div>
                      <div style={{ fontSize: '12px', color: '#000', margin: '8px 0' }}>{(order.items || []).map(i => `${i.name} x${i.quantity}`).join(', ')}</div>
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
            <h2 style={{ fontSize: '24px', margin: '0 0 20px', color: '#000', fontWeight: '800' }}>📊 Reports & History</h2>

            {/* Quick Download Buttons */}
            <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', margin: '0 0 12px', color: '#000', fontWeight: '800' }}>⚡ Quick Download</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '8px', marginBottom: '12px' }}>
                {[
                  { label: '📥 Today', days: 0 },
                  { label: '📥 7 Days', days: 7 },
                  { label: '📥 15 Days', days: 15 },
                  { label: '📥 30 Days', days: 30 },
                ].map(({ label, days }) => (
                  <button key={days} onClick={() => {
                    const start = days === 0 ? new Date().setHours(0,0,0,0) : Date.now() - days * 86400000;
                    const filtered = orders.filter(o => new Date(o.timestamp) >= start);
                    if (filtered.length === 0) { alert('No orders in this period'); return; }
                    downloadCSV(filtered, `kaapfi-${days === 0 ? 'today' : days + 'days'}-${new Date().toISOString().split('T')[0]}.csv`);
                  }} style={{ padding: '12px', background: '#FC8019', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '13px' }}>{label}</button>
                ))}
              </div>

              {/* Daily Breakdown */}
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                <h3 style={{ fontSize: '14px', margin: '12px 0 8px', color: '#000', fontWeight: '800' }}>📅 Last 30 Days - Daily Breakdown</h3>
                {(() => {
                  const dayMap = {};
                  orders.forEach(o => {
                    const d = o.timestamp ? new Date(o.timestamp).toISOString().split('T')[0] : o.date;
                    if (!d) return;
                    const daysAgo = Math.floor((Date.now() - new Date(d)) / 86400000);
                    if (daysAgo > 30) return;
                    if (!dayMap[d]) dayMap[d] = { orders: 0, revenue: 0, cash: 0, upi: 0, card: 0 };
                    dayMap[d].orders++;
                    dayMap[d].revenue += o.total || 0;
                    if (o.paymentMethod === 'cash') dayMap[d].cash += o.total || 0;
                    if (o.paymentMethod === 'upi') dayMap[d].upi += o.total || 0;
                    if (o.paymentMethod === 'card') dayMap[d].card += o.total || 0;
                  });
                  const sorted = Object.entries(dayMap).sort((a, b) => new Date(b[0]) - new Date(a[0]));
                  return sorted.length === 0 ? <p style={{ color: '#000', fontWeight: '600' }}>No data yet</p> : sorted.map(([date, data]) => (
                    <div key={date} style={{ padding: '10px', background: '#f9f9f9', borderRadius: '8px', marginBottom: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: '800', color: '#000' }}>{new Date(date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</div>
                        <div style={{ fontSize: '11px', color: '#000', fontWeight: '600' }}>💵 ₹{data.cash.toFixed(0)} • 📱 ₹{data.upi.toFixed(0)} • 💳 ₹{data.card.toFixed(0)}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '16px', fontWeight: '800', color: '#FC8019' }}>₹{data.revenue.toFixed(0)}</div>
                        <div style={{ fontSize: '11px', color: '#000', fontWeight: '600' }}>{data.orders} orders</div>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>

            <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', margin: '0 0 12px', color: '#000', fontWeight: '700' }}>📥 Custom Date Range</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '8px', alignItems: 'end' }}>
                <div><label style={{ fontSize: '11px', color: '#000' }}>From</label><input type="date" value={csvStartDate} onChange={(e) => setCsvStartDate(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', boxSizing: 'border-box', color: '#000', fontWeight: '600' }} /></div>
                <div><label style={{ fontSize: '11px', color: '#000' }}>To</label><input type="date" value={csvEndDate} onChange={(e) => setCsvEndDate(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', boxSizing: 'border-box', color: '#000', fontWeight: '600' }} /></div>
                <button onClick={downloadByDateRange} style={{ padding: '10px 20px', background: '#4CAF50', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '700' }}>📥 Download</button>
              </div>
            </div>
            <div style={{ background: '#fff', padding: '20px', borderRadius: '12px' }}>
              <h3 style={{ fontSize: '16px', margin: '0 0 12px', color: '#000', fontWeight: '700' }}>📱 By Phone</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '8px' }}>
                <input type="tel" placeholder="Phone" value={csvPhone} onChange={(e) => setCsvPhone(e.target.value)} style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '6px', color: '#000', fontWeight: '600' }} />
                <button onClick={downloadByPhone} style={{ padding: '10px 20px', background: '#2196F3', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '700' }}>📥 Download</button>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'menu' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
              <h2 style={{ fontSize: '24px', margin: 0 }}>🍽️ Menu</h2>
              <button onClick={resetMenuToDefault} style={{ padding: '10px 16px', background: '#FC8019', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700' }}>🔄 Reset</button>
            </div>
            <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '16px', margin: '0 0 12px', color: '#000', fontWeight: '700' }}>➕ Add Item</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '8px' }}>
                <input style={{color: "#000", fontWeight: "600"}} placeholder="Name" value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '6px', color: '#000', fontWeight: '600' }} />
                <input style={{color: "#000", fontWeight: "600"}} placeholder="Price" type="number" value={newItem.price} onChange={(e) => setNewItem({ ...newItem, price: e.target.value })} style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '6px', color: '#000', fontWeight: '600' }} />
                <input style={{color: "#000", fontWeight: "600"}} placeholder="Category" value={newItem.category} onChange={(e) => setNewItem({ ...newItem, category: e.target.value })} style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '6px', color: '#000', fontWeight: '600' }} />
                <input style={{color: "#000", fontWeight: "600"}} placeholder="Emoji" value={newItem.emoji} onChange={(e) => setNewItem({ ...newItem, emoji: e.target.value })} style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '6px', color: '#000', fontWeight: '600' }} />
                <button onClick={addMenuItem} style={{ padding: '10px', background: '#4CAF50', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '700' }}>Add</button>
              </div>
            </div>
            {menuItems.length > 0 && (
              <div style={{ background: '#fff', padding: '16px', borderRadius: '12px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <input type="checkbox" checked={selectedMenuItems.length === menuItems.length} onChange={selectAllMenu} style={{ width: '18px', height: '18px' }} />
                  <span style={{ fontSize: '13px', fontWeight: '700' }}>Select All ({selectedMenuItems.length}/{menuItems.length})</span>
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
                            <div style={{ fontWeight: '700', fontSize: '13px' }}>{item.name}</div>
                            <div style={{ fontSize: '11px', color: '#000' }}>{item.category} • ₹{item.price}</div>
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
            <h2 style={{ fontSize: '24px', margin: '0 0 20px', color: '#000', fontWeight: '800' }}>🎁 Promos</h2>
            <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '16px', margin: '0 0 16px' }}>Generate (Min 1)</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px', marginBottom: '12px' }}>
                <div><label style={{ fontSize: '11px' }}>Count</label><input type="number" min="1" value={promoCount} onChange={(e) => setPromoCount(Math.max(1, parseInt(e.target.value) || 1))} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', boxSizing: 'border-box', color: '#000', fontWeight: '600' }} /></div>
                <div><label style={{ fontSize: '11px' }}>Type</label><select value={promoType} onChange={(e) => setPromoType(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', boxSizing: 'border-box', color: '#000', fontWeight: '600' }}><option value="percent">%</option><option value="flat">₹</option></select></div>
                <div><label style={{ fontSize: '11px' }}>Value</label><input type="number" value={promoValue} onChange={(e) => setPromoValue(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', boxSizing: 'border-box', color: '#000', fontWeight: '600' }} /></div>
                <div><label style={{ fontSize: '11px' }}>Usage</label><input type="number" min="1" value={promoUsageLimit} onChange={(e) => setPromoUsageLimit(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', boxSizing: 'border-box', color: '#000', fontWeight: '600' }} /></div>
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
                  <span style={{ fontSize: '13px', fontWeight: '700' }}>Select All ({selectedPromos.length}/{promoCodes.length})</span>
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
                      <div style={{ fontSize: '13px', fontWeight: '700' }}>{p.discountType === 'flat' ? '₹' : ''}{p.discountValue}{p.discountType === 'percent' ? '%' : ''} off</div>
                      <div style={{ fontSize: '10px', color: '#000' }}>{new Date(p.activationDate || p.createdAt).toLocaleDateString()} - {new Date(p.expiryDate).toLocaleDateString()}</div>
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
            <h2 style={{ fontSize: '24px', margin: '0 0 20px', color: '#000', fontWeight: '800' }}>👥 Customers</h2>
            <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input type="tel" placeholder="Phone..." value={lookupPhone} onChange={(e) => setLookupPhone(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && performLookup()} style={{ flex: 1, padding: '12px', border: '2px solid #FC8019', borderRadius: '8px', fontSize: '16px' }} />
                <button onClick={performLookup} style={{ padding: '12px 24px', background: '#FC8019', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700' }}>{lookupLoading ? '⏳' : '🔍'}</button>
              </div>
            </div>
            {lookupCustomer && (
              <div style={{ background: 'linear-gradient(135deg, #FC8019 0%, #E64A19 100%)', padding: '24px', borderRadius: '12px', color: '#fff', marginBottom: '16px' }}>
                <div style={{ fontSize: '28px', fontWeight: '700' }}>{lookupCustomer.name || 'Customer'}</div>
                <div style={{ fontSize: '13px', opacity: 1 }}>📱 {lookupCustomer.phone}</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginTop: '16px' }}>
                  <div><div style={{ fontSize: '11px' }}>Points</div><div style={{ fontSize: '24px', fontWeight: '700' }}>{lookupCustomer.loyaltyPoints || 0}</div></div>
                  <div><div style={{ fontSize: '11px' }}>Orders</div><div style={{ fontSize: '24px', fontWeight: '700' }}>{lookupCustomer.totalOrders || 0}</div></div>
                  <div><div style={{ fontSize: '11px' }}>Spent</div><div style={{ fontSize: '24px', fontWeight: '700' }}>₹{lookupCustomer.totalSpent || 0}</div></div>
                </div>
              </div>
            )}
            {!lookupCustomer && allCustomers.length > 0 && (
              <div style={{ background: '#fff', padding: '20px', borderRadius: '12px' }}>
                <h3 style={{ fontSize: '16px', margin: '0 0 12px', color: '#000', fontWeight: '700' }}>🏆 Top ({allCustomers.length})</h3>
                <div style={{ display: 'grid', gap: '8px', maxHeight: '400px', overflowY: 'auto' }}>
                  {allCustomers.slice(0, 20).map(c => (
                    <div key={c.phone} onClick={() => { setLookupPhone(c.phone); performLookup(); }} style={{ padding: '12px', background: '#f9f9f9', borderRadius: '8px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ fontWeight: '700', color: '#000' }}>{c.name || 'Customer'} • {c.phone}</div>
                        <div style={{ fontSize: '11px', color: '#000' }}>{c.totalOrders} orders • 🏆 {c.loyaltyPoints}</div>
                      </div>
                      <div style={{ fontSize: '16px', fontWeight: '700', color: '#FC8019' }}>₹{c.totalSpent}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        {/* MARKETING TAB - Password Protected */}
        {activeTab === 'marketing' && (
          <div>
            {!marketingUnlocked ? (
              <div style={{ background: '#fff', padding: '40px', borderRadius: '12px', maxWidth: '500px', margin: '40px auto', textAlign: 'center' }}>
                <div style={{ fontSize: '64px' }}>🔒</div>
                <h2 style={{ color: '#000', fontSize: '24px', margin: '12px 0' }}>Marketing Dashboard</h2>
                <p style={{ color: '#000', fontSize: '14px', marginBottom: '20px', fontWeight: '600' }}>Password required to access analytics</p>
                <input type="password" placeholder="Enter password" value={marketingPassword} onChange={(e) => setMarketingPassword(e.target.value)} onKeyPress={(e) => { if (e.key === 'Enter') { if (marketingPassword === DELETE_PASSWORD) { setMarketingUnlocked(true); setMarketingPassword(''); } else { alert('❌ Wrong password'); setMarketingPassword(''); } } }} style={{ width: '100%', padding: '14px', border: '2px solid #FC8019', borderRadius: '8px', fontSize: '16px', marginBottom: '12px', boxSizing: 'border-box', color: '#000', fontWeight: '700' }} />
                <button onClick={() => { if (marketingPassword === DELETE_PASSWORD) { setMarketingUnlocked(true); setMarketingPassword(''); } else { alert('❌ Wrong password'); setMarketingPassword(''); } }} style={{ width: '100%', padding: '14px', background: '#FC8019', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '14px' }}>UNLOCK →</button>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
                  <h2 style={{ fontSize: '24px', margin: 0, color: '#000', fontWeight: '800' }}>🎯 Marketing & Analytics</h2>
                  <button onClick={() => { setMarketingUnlocked(false); }} style={{ padding: '8px 16px', background: '#E64A19', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }}>🔒 Lock</button>
                </div>
                {/* Top Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '20px' }}>
                  <div style={{ background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)', padding: '16px', borderRadius: '12px', color: '#fff' }}>
                    <div style={{ fontSize: '12px', opacity: 1 }}>Total Revenue</div>
                    <div style={{ fontSize: '28px', fontWeight: '800' }}>₹{orders.reduce((s, o) => s + (o.total || 0), 0).toFixed(0)}</div>
                    <div style={{ fontSize: '11px' }}>{orders.length} total orders</div>
                  </div>
                  <div style={{ background: 'linear-gradient(135deg, #2196F3 0%, #0D47A1 100%)', padding: '16px', borderRadius: '12px', color: '#fff' }}>
                    <div style={{ fontSize: '12px' }}>Avg Order Value</div>
                    <div style={{ fontSize: '28px', fontWeight: '800' }}>₹{orders.length > 0 ? (orders.reduce((s, o) => s + (o.total || 0), 0) / orders.length).toFixed(0) : 0}</div>
                  </div>
                  <div style={{ background: 'linear-gradient(135deg, #9C27B0 0%, #673AB7 100%)', padding: '16px', borderRadius: '12px', color: '#fff' }}>
                    <div style={{ fontSize: '12px' }}>Unique Customers</div>
                    <div style={{ fontSize: '28px', fontWeight: '800' }}>{allCustomers.length}</div>
                  </div>
                  <div style={{ background: 'linear-gradient(135deg, #FC8019 0%, #E64A19 100%)', padding: '16px', borderRadius: '12px', color: '#fff' }}>
                    <div style={{ fontSize: '12px' }}>Items Sold</div>
                    <div style={{ fontSize: '28px', fontWeight: '800' }}>{orders.reduce((s, o) => s + (o.items || []).reduce((a, i) => a + i.quantity, 0), 0)}</div>
                  </div>
                </div>
                {/* Top Selling Items */}
                <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '16px', margin: '0 0 12px', color: '#000', fontWeight: '800' }}>🏆 Top Selling Items</h3>
                  {(() => {
                    const itemStats = {};
                    orders.forEach(o => (o.items || []).forEach(i => {
                      if (!itemStats[i.name]) itemStats[i.name] = { qty: 0, revenue: 0 };
                      itemStats[i.name].qty += i.quantity;
                      itemStats[i.name].revenue += i.price * i.quantity;
                    }));
                    const top = Object.entries(itemStats).sort((a, b) => b[1].qty - a[1].qty).slice(0, 10);
                    return top.length === 0 ? <p style={{ color: '#000' }}>No data yet</p> : (
                      <div style={{ display: 'grid', gap: '6px' }}>
                        {top.map(([name, stats], i) => (
                          <div key={name} style={{ padding: '10px', background: '#f9f9f9', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <span style={{ fontSize: '18px', fontWeight: '800' }}>{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i+1}`}</span>
                              <span style={{ fontSize: '14px', fontWeight: '700', color: '#000' }}>{name}</span>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: '14px', fontWeight: '800', color: '#FC8019' }}>{stats.qty} sold</div>
                              <div style={{ fontSize: '11px', color: '#000', fontWeight: '600' }}>₹{stats.revenue}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
                {/* Hourly Pattern */}
                <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '16px', margin: '0 0 12px', color: '#000', fontWeight: '800' }}>⏰ Best Hours (When Customers Order)</h3>
                  {(() => {
                    const hourly = {};
                    orders.forEach(o => {
                      try {
                        const h = new Date(o.timestamp).getHours();
                        hourly[h] = (hourly[h] || 0) + 1;
                      } catch (e) {}
                    });
                    const sortedHours = Object.entries(hourly).sort((a, b) => b[1] - a[1]).slice(0, 5);
                    return sortedHours.length === 0 ? <p style={{ color: '#000' }}>No data yet</p> : (
                      <div style={{ display: 'grid', gap: '6px' }}>
                        {sortedHours.map(([hour, count], i) => {
                          const h = parseInt(hour);
                          const label = h === 0 ? '12 AM' : h < 12 ? `${h} AM` : h === 12 ? '12 PM' : `${h-12} PM`;
                          return (
                            <div key={hour} style={{ padding: '10px', background: '#f9f9f9', borderRadius: '6px', display: 'flex', justifyContent: 'space-between' }}>
                              <span style={{ fontSize: '14px', fontWeight: '700', color: '#000' }}>{i === 0 ? '⭐' : ''} {label}</span>
                              <span style={{ fontSize: '14px', fontWeight: '800', color: '#FC8019' }}>{count} orders</span>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
                {/* Day of Week Pattern */}
                <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '16px', margin: '0 0 12px', color: '#000', fontWeight: '800' }}>📅 Best Days of Week</h3>
                  {(() => {
                    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                    const daily = {};
                    orders.forEach(o => {
                      try {
                        const d = new Date(o.timestamp).getDay();
                        if (!daily[d]) daily[d] = { count: 0, revenue: 0 };
                        daily[d].count++;
                        daily[d].revenue += o.total || 0;
                      } catch (e) {}
                    });
                    const sortedDays = Object.entries(daily).sort((a, b) => b[1].count - a[1].count);
                    return sortedDays.length === 0 ? <p style={{ color: '#000' }}>No data yet</p> : (
                      <div style={{ display: 'grid', gap: '6px' }}>
                        {sortedDays.map(([day, stats], i) => (
                          <div key={day} style={{ padding: '10px', background: '#f9f9f9', borderRadius: '6px', display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '14px', fontWeight: '700', color: '#000' }}>{i === 0 ? '⭐' : ''} {dayNames[day]}</span>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: '14px', fontWeight: '800', color: '#FC8019' }}>{stats.count} orders</div>
                              <div style={{ fontSize: '11px', color: '#000', fontWeight: '600' }}>₹{stats.revenue.toFixed(0)}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
                {/* Customer Segments */}
                <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '16px', margin: '0 0 12px', color: '#000', fontWeight: '800' }}>👥 Customer Segments</h3>
                  {(() => {
                    const vip = allCustomers.filter(c => c.totalOrders >= 10);
                    const regular = allCustomers.filter(c => c.totalOrders >= 5 && c.totalOrders < 10);
                    const occasional = allCustomers.filter(c => c.totalOrders >= 2 && c.totalOrders < 5);
                    const newCus = allCustomers.filter(c => c.totalOrders === 1);
                    const segments = [
                      { name: '🌟 VIP (10+)', list: vip, color: '#9C27B0' },
                      { name: '💎 Regular (5-9)', list: regular, color: '#4CAF50' },
                      { name: '☕ Occasional (2-4)', list: occasional, color: '#2196F3' },
                      { name: '🆕 New (1)', list: newCus, color: '#FC8019' },
                    ];
                    return (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
                        {segments.map(s => (
                          <div key={s.name} style={{ padding: '12px', background: '#f9f9f9', borderRadius: '8px', borderLeft: `4px solid ${s.color}` }}>
                            <div style={{ fontSize: '13px', fontWeight: '700', color: '#000' }}>{s.name}</div>
                            <div style={{ fontSize: '24px', fontWeight: '800', color: s.color }}>{s.list.length}</div>
                            <div style={{ fontSize: '11px', color: '#000', fontWeight: '600' }}>₹{s.list.reduce((sum, c) => sum + (c.totalSpent || 0), 0)} spent</div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
                {/* Customer Insights - Predictive */}
                <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '16px', margin: '0 0 12px', color: '#000', fontWeight: '800' }}>🔮 Customer Insights & Marketing Opportunities</h3>
                  {(() => {
                    const customerPatterns = [];
                    allCustomers.slice(0, 10).forEach(c => {
                      if (!c.phone) return;
                      const custOrders = orders.filter(o => o.customerPhone === c.phone);
                      if (custOrders.length < 2) return;

                      // Favorite item
                      const itemCounts = {};
                      custOrders.forEach(o => (o.items || []).forEach(i => {
                        itemCounts[i.name] = (itemCounts[i.name] || 0) + i.quantity;
                      }));
                      const favItem = Object.entries(itemCounts).sort((a, b) => b[1] - a[1])[0];

                      // Favorite hour
                      const hours = custOrders.map(o => { try { return new Date(o.timestamp).getHours(); } catch (e) { return null; } }).filter(h => h !== null);
                      const hourMode = hours.length > 0 ? hours.sort((a,b) => hours.filter(v => v===a).length - hours.filter(v => v===b).length).pop() : null;

                      // Days since last order
                      const daysSince = c.lastOrder ? Math.floor((Date.now() - new Date(c.lastOrder)) / 86400000) : 0;

                      if (favItem && hourMode !== null) {
                        customerPatterns.push({
                          name: c.name || 'Customer',
                          phone: c.phone,
                          favItem: favItem[0],
                          favHour: hourMode,
                          daysSince,
                          totalOrders: c.totalOrders,
                        });
                      }
                    });

                    return customerPatterns.length === 0 ? <p style={{ color: '#000' }}>Need more order data</p> : (
                      <div style={{ display: 'grid', gap: '8px' }}>
                        {customerPatterns.map(p => {
                          const hourLabel = p.favHour === 0 ? '12 AM' : p.favHour < 12 ? `${p.favHour} AM` : p.favHour === 12 ? '12 PM' : `${p.favHour-12} PM`;
                          const shouldContact = p.daysSince > 7;
                          const msg = `Hi ${p.name}! 👋 Missing your ${p.favItem} at ${hourLabel}? Come visit Kaapfi 90's today! ☕`;
                          return (
                            <div key={p.phone} style={{ padding: '12px', background: shouldContact ? '#fff3e0' : '#f9f9f9', borderRadius: '8px', border: shouldContact ? '2px solid #FC8019' : '1px solid #e0e0e0' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                <div style={{ fontSize: '14px', fontWeight: '800', color: '#000' }}>{p.name} ({p.phone})</div>
                                {shouldContact && <span style={{ fontSize: '10px', background: '#E64A19', color: '#fff', padding: '2px 8px', borderRadius: '10px', fontWeight: '700' }}>⚠️ {p.daysSince}d away</span>}
                              </div>
                              <div style={{ fontSize: '12px', color: '#000', fontWeight: '600' }}>
                                🌟 Likes: <strong>{p.favItem}</strong> • ⏰ Usually orders: <strong>{hourLabel}</strong> • 📦 {p.totalOrders} orders
                              </div>
                              <div style={{ marginTop: '8px' }}>
                                <button onClick={() => window.open(`https://wa.me/91${p.phone}?text=${encodeURIComponent(msg)}`, '_blank')} style={{ padding: '6px 12px', background: '#25D366', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: '700' }}>📱 Send WhatsApp</button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
                {/* Backup - Email CSV */}
                <div style={{ background: '#fff', padding: '20px', borderRadius: '12px' }}>
                  <h3 style={{ fontSize: '16px', margin: '0 0 12px', color: '#000', fontWeight: '800' }}>📧 Backup & Export</h3>
                  <p style={{ fontSize: '13px', color: '#000', fontWeight: '600', marginBottom: '12px' }}>Download complete backup as CSV (can forward to your email)</p>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button onClick={() => downloadCSV(orders, `kaapfi-all-orders-${new Date().toISOString().split('T')[0]}.csv`)} style={{ padding: '12px 20px', background: '#4CAF50', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '700' }}>📥 All Orders CSV</button>
                    <button onClick={() => {
                      const customerCSV = 'Name,Phone,Total Orders,Total Spent,Loyalty Points,First Order,Last Order\n' + allCustomers.map(c => `"${c.name || ''}","${c.phone}",${c.totalOrders || 0},${c.totalSpent || 0},${c.loyaltyPoints || 0},"${c.firstOrder || ''}","${c.lastOrder || ''}"`).join('\n');
                      const blob = new Blob([customerCSV], { type: 'text/csv' });
                      const a = document.createElement('a');
                      a.href = URL.createObjectURL(blob);
                      a.download = `kaapfi-customers-${new Date().toISOString().split('T')[0]}.csv`;
                      a.click();
                    }} style={{ padding: '12px 20px', background: '#2196F3', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '700' }}>📥 Customers CSV</button>
                    <button onClick={() => {
                      const expenseCSV = 'Date,Time,Description,Category,Amount,Paid By\n' + expenses.map(e => `"${e.date}","${e.time}","${e.description}","${e.category}",${e.amount},"${e.paidBy}"`).join('\n');
                      const blob = new Blob([expenseCSV], { type: 'text/csv' });
                      const a = document.createElement('a');
                      a.href = URL.createObjectURL(blob);
                      a.download = `kaapfi-expenses-${new Date().toISOString().split('T')[0]}.csv`;
                      a.click();
                    }} style={{ padding: '12px 20px', background: '#E64A19', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '700' }}>📥 Expenses CSV</button>
                  </div>
                  <p style={{ fontSize: '11px', color: '#000', fontWeight: '600', marginTop: '12px', fontStyle: 'italic' }}>💡 Tip: Email these CSV files to yourself at {settings.phone.replace('+91 ', '')} for backup</p>
                </div>
              </>
            )}
          </div>
        )}
        {activeTab === 'settings' && (
          <div style={{ maxWidth: '700px' }}>
            <h2 style={{ fontSize: '24px', margin: '0 0 20px', color: '#000', fontWeight: '800' }}>⚙️ Settings</h2>
            <div style={{ background: '#e8f5e9', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px', color: '#2E7D32' }}>
              🔄 <strong>All changes sync to ALL devices instantly!</strong>
            </div>
            <div style={{ background: '#fff', padding: '24px', borderRadius: '12px' }}>
              <h3 style={{ fontSize: '16px', margin: '0 0 12px', color: '#FC8019' }}>Cafe Info</h3>
              {[{ key: 'cafeName', label: 'Name' }, { key: 'tagline', label: 'Tagline' }, { key: 'phone', label: 'Phone' }, { key: 'address', label: 'Address' }].map(f => (
                <div key={f.key} style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '13px', color: '#000', fontWeight: '700', display: 'block', marginBottom: '4px' }}>{f.label}</label>
                  <input type="text" value={settings[f.key]} onChange={(e) => updateSettings({ ...settings, [f.key]: e.target.value })} style={{ width: '100%', padding: '10px', border: '1px solid #e0e0e0', borderRadius: '6px', boxSizing: 'border-box' }} />
                </div>
              ))}
              <div style={{ padding: '12px', background: '#fff3e0', borderRadius: '8px', marginTop: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={settings.preventNegativeStock} onChange={(e) => updateSettings({ ...settings, preventNegativeStock: e.target.checked })} style={{ width: '18px', height: '18px' }} />
                  <span style={{ fontSize: '13px', fontWeight: '700' }}>🔒 Block orders if insufficient stock</span>
                </label>
              </div>
              <div style={{ padding: '12px', background: '#fff3e0', borderRadius: '8px', fontSize: '12px', color: '#E64A19', marginTop: '12px' }}>🔒 Admin features are password protected</div>
            </div>
          </div>
        )}
      </div>
      <footer style={{ background: '#fff', borderTop: '1px solid #eee', padding: '20px 24px', marginTop: '40px', textAlign: 'center', color: '#000', fontSize: '13px' }}>
        <div>{settings.cafeName} • {settings.address}</div>
        <div style={{ fontSize: '11px', marginTop: '4px' }}>v5.1 • Tables + History + Expense Book ☁️</div>
      </footer>
    </div>
  );
}
