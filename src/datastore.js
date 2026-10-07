// Picks where the app's data lives: on this device for the POS, in the cloud for the customer QR menu
// (customers' phones cannot reach the café device, so the QR menu keeps using the cloud).
import * as cloud from 'firebase/firestore';
import * as local from './localdb';
import { cloudDb } from './cloud';

export const IS_PUBLIC_MENU = (() => {
  const p = new URLSearchParams(window.location.search);
  const h = window.location.hostname;
  return p.get('tab') === 'publicmenu'
    || h === 'menukaapfi.vercel.app'
    || h === 'menu-kaapfi.vercel.app'
    || h === 'kaapfi-menu.vercel.app';
})();

const impl = IS_PUBLIC_MENU ? cloud : local;

export const db = IS_PUBLIC_MENU ? cloudDb : null;
export const collection = (...a) => impl.collection(...a);
export const doc = (...a) => impl.doc(...a);
export const query = (...a) => impl.query(...a);
export const where = (...a) => impl.where(...a);
export const getDoc = (...a) => impl.getDoc(...a);
export const getDocs = (...a) => impl.getDocs(...a);
export const setDoc = (...a) => impl.setDoc(...a);
export const updateDoc = (...a) => impl.updateDoc(...a);
export const addDoc = (...a) => impl.addDoc(...a);
export const deleteDoc = (...a) => impl.deleteDoc(...a);
export const onSnapshot = (...a) => impl.onSnapshot(...a);
