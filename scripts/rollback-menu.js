const fs = require('fs');
const path = require('path');
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc } = require('firebase/firestore');

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

async function main() {
  const backupPath = path.join(__dirname, '..', 'backup', 'menu-backup.json');
  const categoriesBackupPath = path.join(__dirname, '..', 'backup', 'categories-backup.json');

  if (!fs.existsSync(backupPath)) {
    throw new Error(`Backup file not found: ${backupPath}`);
  }

  const backup = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
  const categoriesBackup = JSON.parse(fs.readFileSync(categoriesBackupPath, 'utf8'));
  const previousMenu = backup.previousMenu || { items: [] };
  const previousCategories = categoriesBackup.previousCategories || { items: [] };

  await setDoc(doc(db, 'appData', 'menu'), {
    items: previousMenu.items || [],
    updatedAt: new Date().toISOString()
  });

  await setDoc(doc(db, 'appData', 'categories'), {
    items: previousCategories.items || [],
    updatedAt: new Date().toISOString()
  });

  console.log('Restored previous menu and categories from backup.');
}

main().catch((error) => {
  console.error('Rollback failed:', error);
  process.exitCode = 1;
});
