import { db } from './firebase';
import { StoreSettings } from './types';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const SETTINGS_DOC_ID = 'global_settings';

export const getStoreSettings = async (): Promise<StoreSettings | null> => {
  try {
    const docRef = doc(db, 'settings', SETTINGS_DOC_ID);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as StoreSettings;
    }
    return null;
  } catch (error) {
    console.error('Error fetching store settings:', error);
    return null;
  }
};

export const updateStoreSettings = async (settings: StoreSettings): Promise<boolean> => {
  try {
    const docRef = doc(db, 'settings', SETTINGS_DOC_ID);
    await setDoc(docRef, settings);
    return true;
  } catch (error) {
    console.error('Error updating store settings:', error);
    return false;
  }
};
