import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Download, RotateCw, Eye, Grid3x3, Move3d, Cloud } from 'lucide-react';
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, query, where } from "firebase/firestore";

// ✅ YOUR FIREBASE CONFIG
const firebaseConfig = {
  apiKey: "AIzaSy8tI9k7VqskCABCwGMl6OY_PCkuXj80Nxc",
  authDomain: "kaapfi-pos.firebaseapp.com",
  projectId: "kaapfi-pos",
  storageBucket: "kaapfi-pos.firebasestorage.app",
  messagingSenderId: "841260204036",
  appId: "1:841260204036:web:8a614c8b0ff3ac4d81f551",
  measurementId: "G-ZC3CPTHBYG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Function to save order to Firebase
async function saveOrderToFirebase(order) {
  try {
    const docRef = await addDoc(collection(db, "orders"), {
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
    console.log("✅ Order saved to Firebase:", docRef.id);
    return true;
  } catch (error) {
    console.error("❌ Error saving order:", error);
    return false;
  }
}

export default function CafePOS() {
  const [orders, setOrders] = useState([]);
  const [currentOrder, setCurrentOrder] = useState([]);
  const [activeTab, setActiveTab] = useState('order');
  const [menuItems, setMenuItems] = useState([]);
  const [showNewItemForm, setShowNewItemForm] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [customerName, setCustomerName] = useState('');
  const [firebaseOrders, setFirebaseOrders] = useState([]);
  const [firebaseStatus, setFirebaseStatus] = useState('✅ Firebase Connected');

  // Default Menu
  const defaultMenu = [
    { id: 1, name: 'Espresso', price: 50, category: 'Coffee' },
    { id: 2, name: 'Americano', price: 60, category: 'Coffee' },
    { id: 3, name: 'Cappuccino', price: 80, category: 'Coffee' },
    { id: 4, name: 'Latte', price: 100, category: 'Coffee' },
    { id: 5, name: 'Mocha', price: 110, category: 'Coffee' },
    { id: 6, name: 'Cold Brew', price: 70, category: 'Coffee' },
    { id: 7, name: 'Iced Coffee', price: 60, category: 'Coffee' },
    { id: 8, name: 'Green Tea', price: 40, category: 'Tea' },
    { id: 9, name: 'Black Tea', price: 40, category: 'Tea' },
    { id: 10, name: 'Hot Chocolate', price: 80, category: 'Beverage' },
    { id: 11, name: 'Fresh Juice', price: 50, category: 'Beverage' },
    { id: 12, name: 'Smoothie', price: 100, category: 'Beverage' },
    { id: 13, name: 'Croissant', price: 60, category: 'Pastry' },
    { id: 14, name: 'Muffin', price: 40, category: 'Pastry' },
    { id: 15, name: 'Brownie', price: 50, category: 'Pastry' },
    { id: 16, name: 'Sandwich', price: 120, category: 'Food' },
    { id: 17, name: 'Salad', price: 150, category: 'Food' },
  ];

  // Load data
  useEffect(() => {
    const saved = localStorage.getItem('cafePOS');
    if (saved) {
      const data = JSON.parse(saved);
      setMenuItems(data.menuItems || defaultMenu);
      setOrders(data.orders || []);
    } else {
      setMenuItems(defaultMenu);
    }
  }, []);

  // Load Firebase orders
  useEffect(() => {
    const loadFirebaseOrders = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "orders"));
        const allOrders = [];
        querySnapshot.forEach((doc) => {
          allOrders.push({ id: doc.id, ...doc.data() });
        });
        setFirebaseOrders(allOrders);
      } catch (error) {
        console.log("Error loading Firebase orders:", error);
        setFirebaseStatus('❌ Firebase Connection Error');
      }
    };
    
    loadFirebaseOrders();
  }, []);

  // Save data
  useEffect(() => {
    localStorage.setItem('cafePOS', JSON.stringify({ menuItems, orders }));
  }, [menuItems, orders]);

  // Add item to current order
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

  // Remove item from order
  const removeFromOrder = (id) => {
    setCurrentOrder(currentOrder.filter(o => o.id !== id));
  };

  // Update quantity
  const updateQuantity = (id, qty) => {
    if (qty <= 0) {
      removeFromOrder(id);
    } else {
      setCurrentOrder(currentOrder.map(o =>
        o.id === id ? { ...o, quantity: qty } : o
      ));
    }
  };

  // Calculate totals
  const subtotal = currentOrder.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.05; // 5% tax
  const total = subtotal + tax;

  // Complete order
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

    // Save to local storage
    setOrders([...orders, order]);
    
    // Save to Firebase
    const saved = await saveOrderToFirebase(order);
    
    // Clear form
    setCurrentOrder([]);
    setCustomerName('');
    setPaymentMethod('cash');
    
    if (saved) {
      alert('✅ Order completed & saved to cloud!');
    } else {
      alert('⚠️ Order saved locally (Firebase offline)');
    }
  };

  // Print KOT
  const printKOT = () => {
    if (currentOrder.length === 0) {
      alert('No items to print');
      return;
    }

    const kot = `
═══════════════════════════
        KITCHEN ORDER TICKET
═══════════════════════════
Time: ${new Date().toLocaleTimeString()}
Customer: ${customerName || 'Walk-in'}
───────────────────────────
${currentOrder.map(item => `
${item.name} x${item.quantity}
`).join('')}
───────────────────────────
Items: ${currentOrder.reduce((sum, item) => sum + item.quantity, 0)}
═══════════════════════════
    `;

    const printWindow = window.open('', '', 'height=400,width=600');
    printWindow.document.write('<pre style="font-family: monospace; font-size: 12px;">' + kot + '</pre>');
    printWindow.print();
    printWindow.close();
  };

  // Print Bill
  const printBill = () => {
    if (currentOrder.length === 0) {
      alert('No items to print');
      return;
    }

    const bill = `
╔═══════════════════════════════╗
║     COFFEE90 CAFE - BILL      ║
╚═══════════════════════════════╝
Date: ${new Date().toLocaleDateString()}
Time: ${new Date().toLocaleTimeString()}
Customer: ${customerName || 'Walk-in'}
───────────────────────────────
ITEM                   QTY  PRICE
───────────────────────────────
${currentOrder.map(item => `
${item.name.padEnd(18)} x${item.quantity.toString().padStart(2)} ₹${(item.price * item.quantity).toString().padStart(4)}
`).join('')}
───────────────────────────────
Subtotal:                  ₹${subtotal}
Tax (5%):                  ₹${tax.toFixed(0)}
───────────────────────────────
TOTAL:                     ₹${total.toFixed(0)}
═════════════════════════════════
Payment: ${paymentMethod.toUpperCase()}
═════════════════════════════════
        Thank You!
  Please visit again soon ☕
═════════════════════════════════
    `;

    const printWindow = window.open('', '', 'height=500,width=400');
    printWindow.document.write('<pre style="font-family: monospace; font-size: 11px; margin: 10px;">' + bill + '</pre>');
    printWindow.print();
    printWindow.close();
  };

  // Get unique categories
  const categories = [...new Set(menuItems.map(item => item.category))];

  // Daily stats
  const todayOrders = orders.filter(o => o.date === new Date().toLocaleDateString());
  const todayRevenue = todayOrders.reduce((sum, o) => sum + o.total, 0);
  const todayItems = todayOrders.reduce((sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0), 0);

  return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh', color: '#fff', fontFamily: "'Courier New', monospace" }}>
      {/* Header */}
      <header style={{ background: '#1a1a1a', borderBottom: '3px solid #d4a574', padding: '16px 24px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ margin: '0', fontSize: '28px', fontWeight: 'bold', color: '#d4a574' }}>☕ COFFEE90 POS</h1>
          <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: '#aaa', alignItems: 'center' }}>
            <div>Orders: {todayOrders.length}</div>
            <div>Revenue: ₹{todayRevenue}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981' }}>
              <Cloud size={14} /> {firebaseStatus}
            </div>
            <div>{new Date().toLocaleTimeString()}</div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav style={{ background: '#1a1a1a', display: 'flex', borderBottom: '1px solid #333', padding: '0' }}>
        {['order', 'bills', 'reports', 'firebase', 'menu'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1,
              padding: '12px',
              border: 'none',
              background: activeTab === tab ? '#d4a574' : 'transparent',
              color: activeTab === tab ? '#000' : '#888',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 'bold',
              borderRight: '1px solid #333',
              transition: 'all 0.2s',
            }}
          >
            {tab === 'order' && '📋 NEW ORDER'}
            {tab === 'bills' && '💳 BILLS'}
            {tab === 'reports' && '📊 REPORTS'}
            {tab === 'firebase' && '☁️ CLOUD'}
            {tab === 'menu' && '🍽️ MENU'}
          </button>
        ))}
      </nav>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px', display: 'grid', gridTemplateColumns: activeTab === 'order' ? '1fr 400px' : '1fr', gap: '20px' }}>

        {/* ORDER TAB */}
        {activeTab === 'order' && (
          <>
            {/* Menu */}
            <div>
              <h2 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#d4a574', textTransform: 'uppercase' }}>Select Items</h2>
              
              {categories.map(category => (
                <div key={category} style={{ marginBottom: '24px' }}>
                  <h3 style={{ margin: '0 0 12px 0', fontSize: '12px', color: '#888', textTransform: 'uppercase', fontWeight: 'bold' }}>{category}</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '8px' }}>
                    {menuItems.filter(item => item.category === category).map(item => (
                      <button
                        key={item.id}
                        onClick={() => addToOrder(item)}
                        style={{
                          padding: '12px',
                          background: '#1a1a1a',
                          border: '2px solid #333',
                          color: '#fff',
                          cursor: 'pointer',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: 'bold',
                          transition: 'all 0.2s',
                          textAlign: 'center',
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = '#d4a574';
                          e.target.style.color = '#000';
                          e.target.style.borderColor = '#d4a574';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = '#1a1a1a';
                          e.target.style.color = '#fff';
                          e.target.style.borderColor = '#333';
                        }}
                      >
                        <div>{item.name}</div>
                        <div style={{ marginTop: '4px', color: '#d4a574' }}>₹{item.price}</div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Current Order */}
            <div style={{ background: '#1a1a1a', border: '2px solid #d4a574', borderRadius: '4px', padding: '16px', height: 'fit-content', position: 'sticky', top: '20px' }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#d4a574', fontWeight: 'bold', textTransform: 'uppercase' }}>CURRENT ORDER</h3>

              <input
                type="text"
                placeholder="Customer name (optional)"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                style={{ width: '100%', padding: '8px', background: '#333', border: '1px solid #555', color: '#fff', fontSize: '11px', marginBottom: '12px', borderRadius: '3px', boxSizing: 'border-box' }}
              />

              {/* Order Items */}
              <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '16px', borderBottom: '1px solid #333', paddingBottom: '16px' }}>
                {currentOrder.length === 0 ? (
                  <p style={{ margin: '0', color: '#666', fontSize: '11px', textAlign: 'center', paddingTop: '20px' }}>No items added</p>
                ) : (
                  currentOrder.map(item => (
                    <div key={item.id} style={{ marginBottom: '8px', background: '#0a0a0a', padding: '8px', borderRadius: '3px', borderLeft: '2px solid #d4a574' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 'bold' }}>{item.name}</span>
                        <button onClick={() => removeFromOrder(item.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '10px' }}>✕</button>
                      </div>
                      <div style={{ display: 'flex', gap: '4px', alignItems: 'center', fontSize: '10px', color: '#aaa' }}>
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} style={{ background: '#333', border: '1px solid #555', color: '#fff', width: '20px', height: '20px', cursor: 'pointer', borderRadius: '2px', fontSize: '10px' }}>-</button>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                          style={{ width: '30px', background: '#333', border: '1px solid #555', color: '#fff', fontSize: '10px', textAlign: 'center', borderRadius: '2px' }}
                        />
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} style={{ background: '#333', border: '1px solid #555', color: '#fff', width: '20px', height: '20px', cursor: 'pointer', borderRadius: '2px', fontSize: '10px' }}>+</button>
                        <span style={{ flex: 1, textAlign: 'right' }}>₹{item.price * item.quantity}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Totals */}
              {currentOrder.length > 0 && (
                <>
                  <div style={{ fontSize: '11px', marginBottom: '8px', borderBottom: '1px solid #333', paddingBottom: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', color: '#aaa' }}>
                      <span>Subtotal:</span>
                      <span>₹{subtotal}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#aaa' }}>
                      <span>Tax (5%):</span>
                      <span>₹{tax.toFixed(0)}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 'bold', marginBottom: '12px', color: '#d4a574' }}>
                    <span>TOTAL:</span>
                    <span>₹{total.toFixed(0)}</span>
                  </div>

                  {/* Payment Method */}
                  <div style={{ marginBottom: '12px', fontSize: '11px' }}>
                    <label style={{ display: 'block', marginBottom: '6px', color: '#aaa', fontWeight: 'bold' }}>Payment:</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                      {['cash', 'card', 'upi'].map(method => (
                        <button
                          key={method}
                          onClick={() => setPaymentMethod(method)}
                          style={{
                            padding: '8px',
                            background: paymentMethod === method ? '#d4a574' : '#333',
                            border: '1px solid #555',
                            color: paymentMethod === method ? '#000' : '#fff',
                            cursor: 'pointer',
                            borderRadius: '3px',
                            fontWeight: 'bold',
                            textTransform: 'uppercase',
                            fontSize: '10px',
                          }}
                        >
                          {method}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Buttons */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                    <button
                      onClick={printKOT}
                      style={{
                        padding: '10px',
                        background: '#333',
                        border: '1px solid #555',
                        color: '#d4a574',
                        cursor: 'pointer',
                        borderRadius: '3px',
                        fontWeight: 'bold',
                        fontSize: '11px',
                        textTransform: 'uppercase',
                      }}
                    >
                      🖨️ Print KOT
                    </button>
                    <button
                      onClick={printBill}
                      style={{
                        padding: '10px',
                        background: '#333',
                        border: '1px solid #555',
                        color: '#d4a574',
                        cursor: 'pointer',
                        borderRadius: '3px',
                        fontWeight: 'bold',
                        fontSize: '11px',
                        textTransform: 'uppercase',
                      }}
                    >
                      🖨️ Print Bill
                    </button>
                  </div>
                  <button
                    onClick={completeOrder}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: '#d4a574',
                      border: 'none',
                      color: '#000',
                      cursor: 'pointer',
                      borderRadius: '3px',
                      fontWeight: 'bold',
                      fontSize: '12px',
                      textTransform: 'uppercase',
                      marginTop: '8px',
                    }}
                  >
                    ✅ COMPLETE ORDER
                  </button>
                </>
              )}
            </div>
          </>
        )}

        {/* BILLS TAB */}
        {activeTab === 'bills' && (
          <div>
            <h2 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#d4a574', textTransform: 'uppercase' }}>Today's Orders</h2>
            {todayOrders.length === 0 ? (
              <p style={{ color: '#666' }}>No orders today yet</p>
            ) : (
              <div style={{ display: 'grid', gap: '12px' }}>
                {todayOrders.map(order => (
                  <div key={order.id} style={{ background: '#1a1a1a', border: '1px solid #333', padding: '12px', borderRadius: '4px', fontSize: '11px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontWeight: 'bold' }}>Order #{order.id.toString().slice(-5)}</span>
                      <span style={{ color: '#888' }}>{order.time}</span>
                    </div>
                    <div style={{ color: '#aaa', marginBottom: '8px' }}>
                      <div>{order.customerName}</div>
                      <div>{order.items.length} items • {order.items.reduce((sum, i) => sum + i.quantity, 0)} qty</div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', color: '#d4a574' }}>
                      <span>Total:</span>
                      <span>₹{order.total.toFixed(0)}</span>
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
            <h2 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#d4a574', textTransform: 'uppercase' }}>Daily Reports</h2>
            
            {/* Today's Summary */}
            <div style={{ background: '#1a1a1a', border: '2px solid #d4a574', padding: '16px', marginBottom: '20px', borderRadius: '4px' }}>
              <h3 style={{ margin: '0 0 12px 0', color: '#d4a574', fontWeight: 'bold' }}>Today's Summary</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', fontSize: '12px' }}>
                <div style={{ background: '#0a0a0a', padding: '12px', borderRadius: '3px', borderLeft: '3px solid #d4a574' }}>
                  <div style={{ color: '#888', marginBottom: '4px' }}>Total Orders</div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#d4a574' }}>{todayOrders.length}</div>
                </div>
                <div style={{ background: '#0a0a0a', padding: '12px', borderRadius: '3px', borderLeft: '3px solid #d4a574' }}>
                  <div style={{ color: '#888', marginBottom: '4px' }}>Total Items</div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#d4a574' }}>{todayItems}</div>
                </div>
                <div style={{ background: '#0a0a0a', padding: '12px', borderRadius: '3px', borderLeft: '3px solid #d4a574' }}>
                  <div style={{ color: '#888', marginBottom: '4px' }}>Total Revenue</div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#d4a574' }}>₹{todayRevenue}</div>
                </div>
                <div style={{ background: '#0a0a0a', padding: '12px', borderRadius: '3px', borderLeft: '3px solid #d4a574' }}>
                  <div style={{ color: '#888', marginBottom: '4px' }}>Avg Order Value</div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#d4a574' }}>₹{todayOrders.length > 0 ? (todayRevenue / todayOrders.length).toFixed(0) : 0}</div>
                </div>
              </div>
            </div>

            {/* Top Items */}
            {todayOrders.length > 0 && (
              <div style={{ background: '#1a1a1a', border: '1px solid #333', padding: '16px', borderRadius: '4px' }}>
                <h3 style={{ margin: '0 0 12px 0', color: '#d4a574', fontWeight: 'bold', fontSize: '12px' }}>Top Items</h3>
                {(() => {
                  const itemCounts = {};
                  todayOrders.forEach(order => {
                    order.items.forEach(item => {
                      itemCounts[item.name] = (itemCounts[item.name] || 0) + item.quantity;
                    });
                  });
                  return Object.entries(itemCounts)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 5)
                    .map(([name, qty]) => (
                      <div key={name} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', padding: '8px', background: '#0a0a0a', borderRadius: '3px', fontSize: '11px' }}>
                        <span>{name}</span>
                        <span style={{ color: '#d4a574', fontWeight: 'bold' }}>{qty} sold</span>
                      </div>
                    ));
                })()}
              </div>
            )}
          </div>
        )}

        {/* FIREBASE/CLOUD TAB */}
        {activeTab === 'firebase' && (
          <div>
            <h2 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#d4a574', textTransform: 'uppercase' }}>☁️ Cloud Orders (Firebase)</h2>
            <p style={{ color: '#aaa', fontSize: '12px', marginBottom: '16px' }}>
              All orders are automatically saved to Firebase cloud. Reload this page to see latest orders.
            </p>
            
            {firebaseOrders.length === 0 ? (
              <p style={{ color: '#666' }}>No orders in cloud yet</p>
            ) : (
              <div style={{ display: 'grid', gap: '12px' }}>
                <div style={{ background: '#1a1a1a', border: '2px solid #10b981', padding: '12px', marginBottom: '12px', borderRadius: '4px' }}>
                  <div style={{ color: '#10b981', fontSize: '13px', fontWeight: 'bold' }}>✅ Total Cloud Orders: {firebaseOrders.length}</div>
                </div>
                {firebaseOrders.map(order => (
                  <div key={order.id} style={{ background: '#1a1a1a', border: '1px solid #333', padding: '12px', borderRadius: '4px', fontSize: '11px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontWeight: 'bold' }}>{order.customer_name}</span>
                      <span style={{ color: '#888' }}>{order.date} {order.time}</span>
                    </div>
                    <div style={{ color: '#aaa', marginBottom: '8px' }}>
                      {order.items.length} items • {order.items.reduce((sum, i) => sum + i.quantity, 0)} qty
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', color: '#d4a574' }}>
                      <span>Total:</span>
                      <span>₹{order.total.toFixed(0)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* MENU TAB */}
        {activeTab === 'menu' && (
          <div>
            <h2 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#d4a574', textTransform: 'uppercase' }}>Manage Menu</h2>
            
            {menuItems.map(item => (
              <div key={item.id} style={{ background: '#1a1a1a', border: '1px solid #333', padding: '12px', marginBottom: '8px', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px' }}>
                <div>
                  <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{item.name}</div>
                  <div style={{ color: '#888', fontSize: '10px' }}>{item.category}</div>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div style={{ color: '#d4a574', fontWeight: 'bold' }}>₹{item.price}</div>
                  <button
                    onClick={() => setMenuItems(menuItems.filter(m => m.id !== item.id))}
                    style={{ background: '#ef4444', border: 'none', color: '#fff', padding: '6px 10px', borderRadius: '3px', cursor: 'pointer', fontSize: '10px', fontWeight: 'bold' }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}