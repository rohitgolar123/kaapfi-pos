import React, { useState, useEffect } from 'react';
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs } from "firebase/firestore";

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

async function saveOrderToFirebase(order) {
  try {
    await addDoc(collection(db, "orders"), {
      order_id: order.id,
      customer_name: order.customerName,
      items: order.items,
      subtotal: order.subtotal,
      tax: order.tax,
      total: order.total,
      payment_method: order.paymentMethod,
      timestamp: new Date().toISOString(),
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
    });
    return true;
  } catch (error) {
    return false;
  }
}

const defaultSettings = {
  cafeName: "Kaapfi 90's",
  tagline: "Est. 2025 • Chatrapati Nagar, Nagpur",
  phone: "+91 XXXXXXXXXX",
  address: "Chatrapati Nagar, Nagpur",
  footerText: "Thank you for visiting! Please visit again ☕",
  taxRate: 5,
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
  const [firebaseOrders, setFirebaseOrders] = useState([]);
  const [settings, setSettings] = useState(defaultSettings);
  const [loadingCloud, setLoadingCloud] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    const loggedIn = localStorage.getItem('kaapfi_loggedIn');
    if (loggedIn === 'true') setIsLoggedIn(true);

    const saved = localStorage.getItem('cafePOS');
    if (saved) {
      const data = JSON.parse(saved);
      setMenuItems(data.menuItems || defaultMenu);
      setOrders(data.orders || []);
    }

    const savedSettings = localStorage.getItem('cafeSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cafePOS', JSON.stringify({ menuItems, orders }));
  }, [menuItems, orders]);

  useEffect(() => {
    localStorage.setItem('cafeSettings', JSON.stringify(settings));
  }, [settings]);

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
      const querySnapshot = await getDocs(collection(db, "orders"));
      const allOrders = [];
      querySnapshot.forEach((doc) => {
        allOrders.push({ id: doc.id, ...doc.data() });
      });
      allOrders.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setFirebaseOrders(allOrders);
    } catch (error) {
      console.error("Error:", error);
    }
    setLoadingCloud(false);
  };

  useEffect(() => {
    if (activeTab === 'firebase' && isLoggedIn) {
      loadCloudOrders();
    }
  }, [activeTab, isLoggedIn]);

  const addToOrder = (item) => {
    const existing = currentOrder.find(o => o.id === item.id);
    if (existing) {
      setCurrentOrder(currentOrder.map(o =>
        o.id === item.id ? { ...o, quantity: o.quantity + 1 } : o
      ));
    } else {
      setCurrentOrder([...currentOrder, { ...item, quantity: 1 }]);
    }
  };

  const removeFromOrder = (id) => {
    setCurrentOrder(currentOrder.filter(o => o.id !== id));
  };

  const updateQuantity = (id, qty) => {
    if (qty <= 0) {
      removeFromOrder(id);
    } else {
      setCurrentOrder(currentOrder.map(o =>
        o.id === id ? { ...o, quantity: qty } : o
      ));
    }
  };

  const subtotal = currentOrder.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * (settings.taxRate / 100);
  const total = subtotal + tax;

  const completeOrder = async () => {
    if (currentOrder.length === 0) {
      alert('Please add items to order');
      return;
    }

    const order = {
      id: Date.now(),
      items: currentOrder,
      subtotal,
      tax,
      total,
      paymentMethod,
      customerName: customerName || 'Walk-in',
      timestamp: new Date().toLocaleString(),
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
    };

    setOrders([...orders, order]);
    const saved = await saveOrderToFirebase(order);
    setCurrentOrder([]);
    setCustomerName('');
    setPaymentMethod('cash');

    if (saved) {
      alert('✅ Order completed & saved to cloud!');
    } else {
      alert('⚠️ Order saved locally');
    }
  };

  const printBill = () => {
    if (currentOrder.length === 0) {
      alert('No items to print');
      return;
    }
    const bill = `\n${settings.cafeName}\n${settings.tagline}\n${settings.phone}\n───────────────────────\nDate: ${new Date().toLocaleDateString()}\nTime: ${new Date().toLocaleTimeString()}\nCustomer: ${customerName || 'Walk-in'}\n───────────────────────\n${currentOrder.map(item => `${item.name} x${item.quantity}  ₹${item.price * item.quantity}`).join('\n')}\n───────────────────────\nSubtotal: ₹${subtotal}\nTax (${settings.taxRate}%): ₹${tax.toFixed(0)}\nTOTAL: ₹${total.toFixed(0)}\n───────────────────────\nPayment: ${paymentMethod.toUpperCase()}\n───────────────────────\n${settings.footerText}\n    `;
    const w = window.open('', '', 'height=500,width=400');
    w.document.write('<pre style="font-family: monospace; font-size: 11px; padding: 10px;">' + bill + '</pre>');
    w.print();
    w.close();
  };

  const categories = ['All', ...new Set(menuItems.map(item => item.category))];
  const filteredItems = selectedCategory === 'All' ? menuItems : menuItems.filter(item => item.category === selectedCategory);
  const todayOrders = orders.filter(o => o.date === new Date().toLocaleDateString());
  const todayRevenue = todayOrders.reduce((sum, o) => sum + o.total, 0);

  // LOGIN SCREEN
  if (!isLoggedIn) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #FC8019 0%, #E64A19 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        padding: '20px'
      }}>
        <div style={{
          background: '#fff',
          padding: '48px 40px',
          borderRadius: '16px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          maxWidth: '420px',
          width: '100%',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>☕</div>
          <h1 style={{ margin: '0 0 8px 0', fontSize: '28px', color: '#1a1a1a', fontWeight: '700' }}>
            {settings.cafeName}
          </h1>
          <p style={{ margin: '0 0 32px 0', fontSize: '14px', color: '#666' }}>
            {settings.tagline}
          </p>
          <input
            type="password"
            placeholder="Enter Password"
            value={loginInput}
            onChange={(e) => setLoginInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            style={{
              width: '100%',
              padding: '14px 16px',
              fontSize: '16px',
              border: '2px solid #e0e0e0',
              borderRadius: '8px',
              marginBottom: '16px',
              boxSizing: 'border-box',
              outline: 'none',
              transition: 'border-color 0.2s',
            }}
            onFocus={(e) => e.target.style.borderColor = '#FC8019'}
            onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
          />
          {loginError && (
            <div style={{ color: '#E64A19', fontSize: '14px', marginBottom: '16px' }}>
              {loginError}
            </div>
          )}
          <button
            onClick={handleLogin}
            style={{
              width: '100%',
              padding: '14px',
              fontSize: '16px',
              fontWeight: '600',
              background: '#FC8019',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => e.target.style.background = '#E64A19'}
            onMouseLeave={(e) => e.target.style.background = '#FC8019'}
          >
            LOGIN →
          </button>
          <p style={{ marginTop: '24px', fontSize: '12px', color: '#999' }}>
            🔒 Secure cafe management system
          </p>
        </div>
      </div>
    );
  }

  // MAIN APP (After login)
  return (
    <div style={{
      minHeight: '100vh',
      background: '#f5f5f5',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      {/* HEADER - Swiggy Style */}
      <header style={{
        background: 'linear-gradient(135deg, #FC8019 0%, #E64A19 100%)',
        padding: '16px 24px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ fontSize: '32px' }}>☕</div>
            <div>
              <h1 style={{ margin: '0', fontSize: '22px', color: '#fff', fontWeight: '700' }}>{settings.cafeName}</h1>
              <p style={{ margin: '0', fontSize: '11px', color: '#ffe0d6' }}>{settings.tagline}</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '8px 14px', borderRadius: '20px', color: '#fff', fontSize: '13px', fontWeight: '600' }}>
              🔥 {todayOrders.length} Orders • ₹{todayRevenue}
            </div>
            <div style={{ background: '#4CAF50', padding: '8px 14px', borderRadius: '20px', color: '#fff', fontSize: '11px', fontWeight: '600' }}>
              ● LIVE
            </div>
            <button onClick={handleLogout} style={{
              background: 'rgba(255,255,255,0.2)',
              color: '#fff',
              border: '1px solid #fff',
              padding: '8px 16px',
              borderRadius: '20px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '600',
            }}>
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* TAB NAVIGATION - Swiggy Style */}
      <nav style={{
        background: '#fff',
        display: 'flex',
        borderBottom: '1px solid #eee',
        padding: '0 24px',
        overflowX: 'auto',
        gap: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
      }}>
        {[
          { id: 'order', icon: '🛒', label: 'New Order' },
          { id: 'bills', icon: '🧾', label: 'Bills' },
          { id: 'reports', icon: '📊', label: 'Reports' },
          { id: 'firebase', icon: '☁️', label: 'Cloud' },
          { id: 'menu', icon: '🍽️', label: 'Menu' },
          { id: 'settings', icon: '⚙️', label: 'Settings' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '16px 20px',
              border: 'none',
              background: 'transparent',
              color: activeTab === tab.id ? '#FC8019' : '#666',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: activeTab === tab.id ? '700' : '500',
              borderBottom: activeTab === tab.id ? '3px solid #FC8019' : '3px solid transparent',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s',
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </nav>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px' }}>

        {/* ORDER TAB */}
        {activeTab === 'order' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 400px', gap: '24px' }}>
            <div>
              {/* Category Pills */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '20px',
                      border: 'none',
                      background: selectedCategory === cat ? '#FC8019' : '#fff',
                      color: selectedCategory === cat ? '#fff' : '#666',
                      fontWeight: '600',
                      fontSize: '13px',
                      cursor: 'pointer',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Menu Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px' }}>
                {filteredItems.map(item => (
                  <div
                    key={item.id}
                    onClick={() => addToOrder(item)}
                    style={{
                      background: '#fff',
                      padding: '16px',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      textAlign: 'center',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 8px 20px rgba(252,128,25,0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
                    }}
                  >
                    <div style={{ fontSize: '36px', marginBottom: '8px' }}>{item.emoji || '🍽️'}</div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#1a1a1a', marginBottom: '4px' }}>{item.name}</div>
                    <div style={{ fontSize: '15px', color: '#FC8019', fontWeight: '700' }}>₹{item.price}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Current Order - Swiggy Cart Style */}
            <div style={{
              background: '#fff',
              borderRadius: '12px',
              padding: '20px',
              height: 'fit-content',
              position: 'sticky',
              top: '100px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
            }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: '#1a1a1a', fontWeight: '700', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>🛒 Current Order</span>
                <span style={{ fontSize: '14px', color: '#666', fontWeight: '500' }}>{currentOrder.length} items</span>
              </h3>

              <input
                type="text"
                placeholder="Customer name (optional)"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  fontSize: '14px',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  marginBottom: '16px',
                  boxSizing: 'border-box',
                  outline: 'none',
                }}
              />

              <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '16px' }}>
                {currentOrder.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 20px', color: '#999' }}>
                    <div style={{ fontSize: '48px', marginBottom: '8px' }}>🛒</div>
                    <p style={{ margin: 0, fontSize: '14px' }}>No items yet</p>
                    <p style={{ margin: '4px 0 0', fontSize: '12px' }}>Click items to add</p>
                  </div>
                ) : (
                  currentOrder.map(item => (
                    <div key={item.id} style={{
                      padding: '12px',
                      background: '#f9f9f9',
                      borderRadius: '8px',
                      marginBottom: '8px',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '14px', fontWeight: '600', color: '#1a1a1a' }}>{item.emoji} {item.name}</span>
                        <button onClick={() => removeFromOrder(item.id)} style={{
                          background: 'none',
                          border: 'none',
                          color: '#E64A19',
                          cursor: 'pointer',
                          fontSize: '18px',
                        }}>×</button>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)} style={{
                            width: '28px', height: '28px', borderRadius: '6px',
                            border: '1px solid #FC8019', background: '#fff', color: '#FC8019',
                            cursor: 'pointer', fontSize: '14px', fontWeight: '700',
                          }}>−</button>
                          <span style={{ minWidth: '24px', textAlign: 'center', fontWeight: '600' }}>{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)} style={{
                            width: '28px', height: '28px', borderRadius: '6px',
                            border: '1px solid #FC8019', background: '#FC8019', color: '#fff',
                            cursor: 'pointer', fontSize: '14px', fontWeight: '700',
                          }}>+</button>
                        </div>
                        <span style={{ fontWeight: '700', color: '#1a1a1a' }}>₹{item.price * item.quantity}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {currentOrder.length > 0 && (
                <>
                  <div style={{ borderTop: '1px dashed #ddd', paddingTop: '12px', marginBottom: '12px', fontSize: '13px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', color: '#666' }}>
                      <span>Subtotal</span><span>₹{subtotal}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#666' }}>
                      <span>Tax ({settings.taxRate}%)</span><span>₹{tax.toFixed(0)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: '700', color: '#1a1a1a' }}>
                      <span>Total</span><span>₹{total.toFixed(0)}</span>
                    </div>
                  </div>

                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ fontSize: '12px', color: '#666', fontWeight: '600', display: 'block', marginBottom: '6px' }}>Payment Method</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                      {['cash', 'card', 'upi'].map(m => (
                        <button
                          key={m}
                          onClick={() => setPaymentMethod(m)}
                          style={{
                            padding: '10px',
                            border: 'none',
                            borderRadius: '8px',
                            background: paymentMethod === m ? '#FC8019' : '#f0f0f0',
                            color: paymentMethod === m ? '#fff' : '#666',
                            fontWeight: '600',
                            cursor: 'pointer',
                            fontSize: '12px',
                            textTransform: 'uppercase',
                          }}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button onClick={printBill} style={{
                    width: '100%',
                    padding: '12px',
                    background: '#fff',
                    color: '#FC8019',
                    border: '2px solid #FC8019',
                    borderRadius: '8px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    fontSize: '14px',
                    marginBottom: '8px',
                  }}>
                    🖨️ Print Bill
                  </button>

                  <button onClick={completeOrder} style={{
                    width: '100%',
                    padding: '14px',
                    background: 'linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    fontSize: '15px',
                  }}>
                    ✅ Complete Order • ₹{total.toFixed(0)}
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* BILLS TAB */}
        {activeTab === 'bills' && (
          <div>
            <h2 style={{ fontSize: '24px', color: '#1a1a1a', margin: '0 0 20px' }}>🧾 Today's Orders</h2>
            {todayOrders.length === 0 ? (
              <div style={{ background: '#fff', padding: '60px', borderRadius: '12px', textAlign: 'center', color: '#999' }}>
                <div style={{ fontSize: '64px', marginBottom: '16px' }}>📭</div>
                <p>No orders yet today</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '12px' }}>
                {todayOrders.slice().reverse().map(order => (
                  <div key={order.id} style={{ background: '#fff', padding: '16px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div>
                        <div style={{ fontWeight: '700', fontSize: '15px' }}>#{order.id.toString().slice(-5)}</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>{order.customerName} • {order.time}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '18px', fontWeight: '700', color: '#FC8019' }}>₹{order.total.toFixed(0)}</div>
                        <div style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase' }}>{order.paymentMethod}</div>
                      </div>
                    </div>
                    <div style={{ fontSize: '12px', color: '#888' }}>
                      {order.items.map(i => `${i.name} x${i.quantity}`).join(', ')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* REPORTS TAB */}
        {activeTab === 'reports' && (
          <div>
            <h2 style={{ fontSize: '24px', color: '#1a1a1a', margin: '0 0 20px' }}>📊 Today's Report</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              {[
                { label: 'Total Orders', value: todayOrders.length, color: '#FC8019', emoji: '📦' },
                { label: 'Total Revenue', value: `₹${todayRevenue}`, color: '#4CAF50', emoji: '💰' },
                { label: 'Avg Order Value', value: `₹${todayOrders.length > 0 ? (todayRevenue / todayOrders.length).toFixed(0) : 0}`, color: '#2196F3', emoji: '📈' },
                { label: 'Items Sold', value: todayOrders.reduce((s, o) => s + o.items.reduce((a, i) => a + i.quantity, 0), 0), color: '#9C27B0', emoji: '🛍️' },
              ].map(stat => (
                <div key={stat.label} style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderLeft: `4px solid ${stat.color}` }}>
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>{stat.emoji}</div>
                  <div style={{ fontSize: '13px', color: '#666', marginBottom: '4px' }}>{stat.label}</div>
                  <div style={{ fontSize: '28px', fontWeight: '700', color: stat.color }}>{stat.value}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CLOUD TAB - Fixed */}
        {activeTab === 'firebase' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '24px', color: '#1a1a1a', margin: 0 }}>☁️ Cloud Orders</h2>
              <button onClick={loadCloudOrders} style={{
                padding: '10px 20px', background: '#FC8019', color: '#fff', border: 'none',
                borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px',
              }}>
                {loadingCloud ? '⏳ Loading...' : '🔄 Refresh'}
              </button>
            </div>

            {loadingCloud ? (
              <div style={{ background: '#fff', padding: '60px', borderRadius: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
                <p>Loading orders from cloud...</p>
              </div>
            ) : firebaseOrders.length === 0 ? (
              <div style={{ background: '#fff', padding: '60px', borderRadius: '12px', textAlign: 'center', color: '#999' }}>
                <div style={{ fontSize: '64px', marginBottom: '16px' }}>☁️</div>
                <p>No orders in cloud yet</p>
                <p style={{ fontSize: '12px' }}>Complete an order to see it here</p>
              </div>
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
                          <div style={{ fontWeight: '700' }}>{order.customer_name || 'Walk-in'}</div>
                          <div style={{ fontSize: '12px', color: '#666' }}>{order.date} • {order.time}</div>
                        </div>
                        <div style={{ fontSize: '18px', fontWeight: '700', color: '#FC8019' }}>₹{order.total?.toFixed(0)}</div>
                      </div>
                      <div style={{ fontSize: '12px', color: '#888' }}>
                        {order.items?.map(i => `${i.name} x${i.quantity}`).join(', ')}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* MENU TAB */}
        {activeTab === 'menu' && (
          <div>
            <h2 style={{ fontSize: '24px', color: '#1a1a1a', margin: '0 0 20px' }}>🍽️ Menu Items</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
              {menuItems.map(item => (
                <div key={item.id} style={{ background: '#fff', padding: '16px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ fontSize: '32px' }}>{item.emoji}</div>
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '15px' }}>{item.name}</div>
                      <div style={{ fontSize: '12px', color: '#666' }}>{item.category}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: '700', color: '#FC8019', fontSize: '16px' }}>₹{item.price}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div style={{ maxWidth: '600px' }}>
            <h2 style={{ fontSize: '24px', color: '#1a1a1a', margin: '0 0 20px' }}>⚙️ Cafe Settings</h2>
            <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              {[
                { key: 'cafeName', label: 'Cafe Name', placeholder: "Kaapfi 90's" },
                { key: 'tagline', label: 'Tagline / Header Text', placeholder: 'Est. 2025 • Nagpur' },
                { key: 'phone', label: 'Phone Number', placeholder: '+91 XXXXXXXXXX' },
                { key: 'address', label: 'Address', placeholder: 'Your address' },
                { key: 'footerText', label: 'Footer Text (on bills)', placeholder: 'Thank you!' },
              ].map(field => (
                <div key={field.key} style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', color: '#666', fontWeight: '600', marginBottom: '6px' }}>{field.label}</label>
                  <input
                    type="text"
                    value={settings[field.key]}
                    onChange={(e) => setSettings({ ...settings, [field.key]: e.target.value })}
                    placeholder={field.placeholder}
                    style={{ width: '100%', padding: '10px 14px', fontSize: '14px', border: '1px solid #e0e0e0', borderRadius: '8px', boxSizing: 'border-box', outline: 'none' }}
                  />
                </div>
              ))}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', color: '#666', fontWeight: '600', marginBottom: '6px' }}>Tax Rate (%)</label>
                <input
                  type="number"
                  value={settings.taxRate}
                  onChange={(e) => setSettings({ ...settings, taxRate: parseFloat(e.target.value) || 0 })}
                  style={{ width: '100%', padding: '10px 14px', fontSize: '14px', border: '1px solid #e0e0e0', borderRadius: '8px', boxSizing: 'border-box', outline: 'none' }}
                />
              </div>
              <div style={{ padding: '12px', background: '#f0f8ff', borderRadius: '8px', fontSize: '13px', color: '#0066cc', marginTop: '16px' }}>
                ℹ️ Changes are saved automatically
              </div>
            </div>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <footer style={{ background: '#fff', borderTop: '1px solid #eee', padding: '20px 24px', marginTop: '40px', textAlign: 'center', color: '#666', fontSize: '13px' }}>
        <div>{settings.cafeName} • {settings.address}</div>
        <div style={{ fontSize: '11px', marginTop: '4px' }}>{settings.phone} • Powered by Firebase ☁️</div>
      </footer>
    </div>
  );
}
