const fs = require('fs');
const path = require('path');
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc, setDoc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: 'AIzaSy8tI9k7VqskCABCwGMl6OY_PCkuXj80Nxc',
  authDomain: 'kaapfi-pos.firebaseapp.com',
  projectId: 'kaapfi-pos',
  storageBucket: 'kaapfi-pos.firebasestorage.app',
  messagingSenderId: '841260204036',
  appId: '1:841260204036:web:8a614c8b0ff3ac4d81f551',
  measurementId: 'G-ZC3CPTHBYG'
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const newMenu = [
  // BEVERAGES - KAAPI (HOT) - 5 items
  { id: 1, name: 'Milk Filter Coffee', price: 49, category: 'BEVERAGES', subcategory: 'KAAPI (HOT)', emoji: '☕', requiresVariant: false },
  { id: 2, name: 'Black Filter Coffee', price: 30, category: 'BEVERAGES', subcategory: 'KAAPI (HOT)', emoji: '☕', requiresVariant: false },
  { id: 3, name: 'Classic Kaapi', price: 119, category: 'BEVERAGES', subcategory: 'KAAPI (HOT)', emoji: '☕', requiresVariant: false },
  { id: 4, name: 'Kaapi Mocha', price: 129, category: 'BEVERAGES', subcategory: 'KAAPI (HOT)', emoji: '☕', requiresVariant: false },
  { id: 5, name: 'Kaapi Haze', price: 129, category: 'BEVERAGES', subcategory: 'KAAPI (HOT)', emoji: '☕', requiresVariant: false },
  // BEVERAGES - ICED FILTER KAAPI - 10 items
  { id: 6, name: 'Kaapi Classic Iced Filter', price: 110, category: 'BEVERAGES', subcategory: 'ICED FILTER KAAPI', emoji: '🧊', requiresVariant: false },
  { id: 7, name: 'Hazelnut Iced Filter', price: 125, category: 'BEVERAGES', subcategory: 'ICED FILTER KAAPI', emoji: '🧊', requiresVariant: false },
  { id: 8, name: 'Vanilla Iced Filter', price: 125, category: 'BEVERAGES', subcategory: 'ICED FILTER KAAPI', emoji: '🧊', requiresVariant: false },
  { id: 9, name: 'Sea Salt Caramel Latte', price: 139, category: 'BEVERAGES', subcategory: 'ICED FILTER KAAPI', emoji: '🧊', requiresVariant: false },
  { id: 10, name: 'Strawberry Iced', price: 125, category: 'BEVERAGES', subcategory: 'ICED FILTER KAAPI', emoji: '🍓', requiresVariant: false },
  { id: 11, name: 'Iced Mocha', price: 125, category: 'BEVERAGES', subcategory: 'ICED FILTER KAAPI', emoji: '☕', requiresVariant: false },
  { id: 12, name: 'Roafza Iced Latte', price: 125, category: 'BEVERAGES', subcategory: 'ICED FILTER KAAPI', emoji: '🌸', requiresVariant: false },
  { id: 13, name: 'Iced Caramel Latte', price: 125, category: 'BEVERAGES', subcategory: 'ICED FILTER KAAPI', emoji: '🧊', requiresVariant: false },
  { id: 14, name: 'Mocha Haze', price: 159, category: 'BEVERAGES', subcategory: 'ICED FILTER KAAPI', emoji: '☕', requiresVariant: false },
  { id: 15, name: 'Strawberry Iced Mocha', price: 149, category: 'BEVERAGES', subcategory: 'ICED FILTER KAAPI', emoji: '🍓', requiresVariant: false },
  // BEVERAGES - COLD BREW - 13 items
  { id: 16, name: 'Classic Cold Brew', price: 100, category: 'BEVERAGES', subcategory: 'COLD BREW', emoji: '❄️', requiresVariant: false },
  { id: 17, name: 'Cranberry Cold Brew', price: 120, category: 'BEVERAGES', subcategory: 'COLD BREW', emoji: '🔴', requiresVariant: false },
  { id: 18, name: 'Orange Cold Brew', price: 120, category: 'BEVERAGES', subcategory: 'COLD BREW', emoji: '🍊', requiresVariant: false },
  { id: 19, name: 'Ginger Ale Cold Brew', price: 120, category: 'BEVERAGES', subcategory: 'COLD BREW', emoji: '🫚', requiresVariant: false },
  { id: 20, name: 'Tonic Cold Brew', price: 120, category: 'BEVERAGES', subcategory: 'COLD BREW', emoji: '💧', requiresVariant: false },
  { id: 21, name: 'Kacha Aam Cold Brew', price: 125, category: 'BEVERAGES', subcategory: 'COLD BREW', emoji: '🥭', requiresVariant: false },
  { id: 22, name: 'Rose Cold Brew', price: 125, category: 'BEVERAGES', subcategory: 'COLD BREW', emoji: '🌹', requiresVariant: false },
  { id: 23, name: 'Roafza Cold Brew', price: 125, category: 'BEVERAGES', subcategory: 'COLD BREW', emoji: '🌸', requiresVariant: false },
  { id: 24, name: 'Strawberry Cold Brew', price: 130, category: 'BEVERAGES', subcategory: 'COLD BREW', emoji: '🍓', requiresVariant: false },
  { id: 25, name: 'Kokam Cold Brew', price: 130, category: 'BEVERAGES', subcategory: 'COLD BREW', emoji: '🍒', requiresVariant: false },
  { id: 26, name: 'Blue Ocean Cold Brew', price: 130, category: 'BEVERAGES', subcategory: 'COLD BREW', emoji: '🌊', requiresVariant: false },
  { id: 27, name: 'Vietnamese Cold Brew (with Milk)', price: 159, category: 'BEVERAGES', subcategory: 'COLD BREW', emoji: '☕', requiresVariant: false },
  { id: 28, name: 'Last Light', price: 159, category: 'BEVERAGES', subcategory: 'COLD BREW', emoji: '🌙', requiresVariant: false },
  // BEVERAGES - NON COFFEE - 3 items
  { id: 29, name: 'Coastal Blue', price: 129, category: 'BEVERAGES', subcategory: 'NON COFFEE', emoji: '🌊', requiresVariant: false },
  { id: 30, name: 'Berry Bloom', price: 129, category: 'BEVERAGES', subcategory: 'NON COFFEE', emoji: '🫐', requiresVariant: false },
  { id: 31, name: 'Red Mood', price: 129, category: 'BEVERAGES', subcategory: 'NON COFFEE', emoji: '🔴', requiresVariant: false },
  // GOURMET SANDWICHES - 4 items with REQUIRED Protein variant
  { id: 32, name: 'Chatpata Sandwich', price: 189, category: 'GOURMET SANDWICHES', emoji: '🥪', requiresVariant: true, variantGroup: 'Protein', variantOptions: ['Paneer', 'Chicken'] },
  { id: 33, name: 'Barbecue Sandwich', price: 189, category: 'GOURMET SANDWICHES', emoji: '🥪', requiresVariant: true, variantGroup: 'Protein', variantOptions: ['Paneer', 'Chicken'] },
  { id: 34, name: 'Makhanwala Sandwich', price: 189, category: 'GOURMET SANDWICHES', emoji: '🥪', requiresVariant: true, variantGroup: 'Protein', variantOptions: ['Paneer', 'Chicken'] },
  { id: 35, name: '1996 Carolina Sandwich', price: 189, category: 'GOURMET SANDWICHES', emoji: '🥪', requiresVariant: true, variantGroup: 'Protein', variantOptions: ['Paneer', 'Chicken'] },
  // FRIES - 8 items
  { id: 36, name: 'Salted Fries', price: 179, category: 'FRIES', emoji: '🍟', requiresVariant: false },
  { id: 37, name: 'Salt & Pepper Fries', price: 179, category: 'FRIES', emoji: '🍟', requiresVariant: false },
  { id: 38, name: 'Peri Peri Fries', price: 179, category: 'FRIES', emoji: '🍟', requiresVariant: false },
  { id: 39, name: 'Kolhapuri Spicy Fries', price: 179, category: 'FRIES', emoji: '🍟', requiresVariant: false },
  { id: 40, name: 'Desi Fries (Tangy & Spicy)', price: 179, category: 'FRIES', emoji: '🍟', requiresVariant: false },
  { id: 41, name: '1990s Achari Fries', price: 179, category: 'FRIES', emoji: '🍟', requiresVariant: false },
  { id: 42, name: 'Smoky Barbecue Fries', price: 179, category: 'FRIES', emoji: '🍟', requiresVariant: false, modifierGroups: [{ name: 'Sauce', options: ['BBQ Sauce Dressing'] }] },
  { id: 43, name: '1996 Carolina Fries', price: 179, category: 'FRIES', emoji: '🍟', requiresVariant: false, modifierGroups: [{ name: 'Sauce', options: ['Carolina Sauce Dressing'] }] },
  // TIFFIN - IDLI - 2 items
  { id: 44, name: 'Idli with Veg Curry', price: 80, category: 'TIFFIN', subcategory: 'IDLI', emoji: '🍚', requiresVariant: false },
  { id: 45, name: 'Idli with Chicken Curry', price: 100, category: 'TIFFIN', subcategory: 'IDLI', emoji: '🍗', requiresVariant: false },
  // MALABAR PARATHA - 7 items with REQUIRED Protein variant
  { id: 46, name: 'Chatpata', price: 139, category: 'MALABAR PARATHA', emoji: '🫓', requiresVariant: true, variantGroup: 'Protein', variantOptions: ['Paneer', 'Chicken'] },
  { id: 47, name: 'Saoji', price: 139, category: 'MALABAR PARATHA', emoji: '🫓', requiresVariant: true, variantGroup: 'Protein', variantOptions: ['Paneer', 'Chicken'] },
  { id: 48, name: 'Makhanwala', price: 139, category: 'MALABAR PARATHA', emoji: '🫓', requiresVariant: true, variantGroup: 'Protein', variantOptions: ['Paneer', 'Chicken'] },
  { id: 49, name: 'Achari', price: 139, category: 'MALABAR PARATHA', emoji: '🫓', requiresVariant: true, variantGroup: 'Protein', variantOptions: ['Paneer', 'Chicken'] },
  { id: 50, name: 'Smokey BBQ', price: 139, category: 'MALABAR PARATHA', emoji: '🫓', requiresVariant: true, variantGroup: 'Protein', variantOptions: ['Paneer', 'Chicken'] },
  { id: 51, name: 'Burnt Garlic', price: 139, category: 'MALABAR PARATHA', emoji: '🫓', requiresVariant: true, variantGroup: 'Protein', variantOptions: ['Paneer', 'Chicken'] },
  { id: 52, name: '1996 Carolina', price: 139, category: 'MALABAR PARATHA', emoji: '🫓', requiresVariant: true, variantGroup: 'Protein', variantOptions: ['Paneer', 'Chicken'] },
  // IRANI PAV - 2 items
  { id: 53, name: 'Chicken Keema Irani Pav', price: 189, category: 'IRANI PAV', emoji: '🥪', requiresVariant: false },
  { id: 54, name: 'Paneer Keema Irani Pav', price: 189, category: 'IRANI PAV', emoji: '🥪', requiresVariant: false }
];

async function main() {
  const backupPath = path.join(__dirname, '..', 'backup', 'menu-backup.json');
  const categoriesBackupPath = path.join(__dirname, '..', 'backup', 'categories-backup.json');
  fs.mkdirSync(path.dirname(backupPath), { recursive: true });

  const menuSnapshot = await getDoc(doc(db, 'appData', 'menu'));
  const categoriesSnapshot = await getDoc(doc(db, 'appData', 'categories'));

  const menuPayload = menuSnapshot.exists() ? menuSnapshot.data() : { items: [] };
  const categoriesPayload = categoriesSnapshot.exists() ? categoriesSnapshot.data() : { items: [] };

  fs.writeFileSync(backupPath, JSON.stringify({
    backedUpAt: new Date().toISOString(),
    previousMenu: menuPayload
  }, null, 2));

  fs.writeFileSync(categoriesBackupPath, JSON.stringify({
    backedUpAt: new Date().toISOString(),
    previousCategories: categoriesPayload
  }, null, 2));

  await setDoc(doc(db, 'appData', 'menu'), {
    items: newMenu,
    updatedAt: new Date().toISOString()
  });

  await setDoc(doc(db, 'appData', 'categories'), {
    items: ['BEVERAGES', 'GOURMET SANDWICHES', 'FRIES', 'TIFFIN', 'MALABAR PARATHA', 'IRANI PAV'],
    updatedAt: new Date().toISOString()
  });

  console.log(`Menu backup written to ${backupPath}`);
  console.log(`Updated Firestore menu with ${newMenu.length} items and category ordering.`);
}

main().catch((error) => {
  console.error('Menu migration failed:', error);
  process.exitCode = 1;
});
