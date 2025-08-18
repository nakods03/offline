import { create } from 'zustand';
import { Contact, QRData } from '@/types';
import { getRealm, dbWrite, dbRead } from '@/db/realm';
import { ContactSchema } from '@/db/models';
import { hashString } from '@/crypto/signing';

interface ContactState {
  // State
  contacts: Contact[];
  loading: boolean;
  
  // Actions
  loadContacts: () => Promise<void>;
  addContact: (contact: Omit<Contact, 'id' | 'createdAt'>) => void;
  updateContact: (id: string, updates: Partial<Contact>) => void;
  deleteContact: (id: string) => void;
  trustContact: (id: string) => void;
  untrustContact: (id: string) => void;
  addContactFromQR: (qrData: QRData, label?: string) => void;
  getContactByPhone: (phone: string) => Contact | null;
  getTrustedContacts: () => Contact[];
}

export const useContactStore = create<ContactState>((set, get) => ({
  // Initial state
  contacts: [],
  loading: false,

  // Actions
  loadContacts: async () => {
    try {
      set({ loading: true });
      
      const contacts = dbRead(() => {
        const realm = getRealm();
        const results = realm.objects('Contact')
          .sorted('createdAt', true) as Realm.Results<ContactSchema>;
        
        return Array.from(results).map(contact => ({
          id: contact.id,
          phoneE164: contact.phoneE164,
          publicKeyB64: contact.publicKeyB64,
          label: contact.label,
          trusted: contact.trusted,
          createdAt: contact.createdAt,
        } as Contact));
      });

      set({ contacts, loading: false });
    } catch (error) {
      console.error('Failed to load contacts:', error);
      set({ loading: false });
      throw error;
    }
  },

  addContact: (contactData) => {
    try {
      const id = hashString(contactData.phoneE164 + contactData.publicKeyB64);
      const contact: Contact = {
        ...contactData,
        id,
        createdAt: new Date(),
      };

      // Save to database
      dbWrite(() => {
        const realm = getRealm();
        realm.create('Contact', {
          id: contact.id,
          phoneE164: contact.phoneE164,
          publicKeyB64: contact.publicKeyB64,
          label: contact.label,
          trusted: contact.trusted,
          createdAt: contact.createdAt,
        }, 'modified'); // Use modified to update if exists
      });

      // Update local state
      set(state => ({
        contacts: [contact, ...state.contacts.filter(c => c.id !== contact.id)],
      }));
    } catch (error) {
      console.error('Failed to add contact:', error);
      throw error;
    }
  },

  updateContact: (id, updates) => {
    try {
      // Update database
      dbWrite(() => {
        const realm = getRealm();
        const contact = realm.objectForPrimaryKey('Contact', id) as ContactSchema;
        if (contact) {
          if (updates.label !== undefined) contact.label = updates.label;
          if (updates.trusted !== undefined) contact.trusted = updates.trusted;
          if (updates.publicKeyB64 !== undefined) contact.publicKeyB64 = updates.publicKeyB64;
        }
      });

      // Update local state
      set(state => ({
        contacts: state.contacts.map(contact =>
          contact.id === id ? { ...contact, ...updates } : contact
        ),
      }));
    } catch (error) {
      console.error('Failed to update contact:', error);
      throw error;
    }
  },

  deleteContact: (id) => {
    try {
      // Delete from database
      dbWrite(() => {
        const realm = getRealm();
        const contact = realm.objectForPrimaryKey('Contact', id);
        if (contact) {
          realm.delete(contact);
        }
      });

      // Update local state
      set(state => ({
        contacts: state.contacts.filter(contact => contact.id !== id),
      }));
    } catch (error) {
      console.error('Failed to delete contact:', error);
      throw error;
    }
  },

  trustContact: (id) => {
    get().updateContact(id, { trusted: true });
  },

  untrustContact: (id) => {
    get().updateContact(id, { trusted: false });
  },

  addContactFromQR: (qrData, label) => {
    const contactData: Omit<Contact, 'id' | 'createdAt'> = {
      phoneE164: qrData.phone,
      publicKeyB64: qrData.pubKey,
      label: label || qrData.name,
      trusted: true, // QR scanned contacts are trusted by default
    };

    get().addContact(contactData);
  },

  getContactByPhone: (phone) => {
    return get().contacts.find(contact => contact.phoneE164 === phone) || null;
  },

  getTrustedContacts: () => {
    return get().contacts.filter(contact => contact.trusted);
  },
}));

// Initialize contact store
export const initializeContactStore = async () => {
  try {
    await useContactStore.getState().loadContacts();
  } catch (error) {
    console.error('Failed to initialize contact store:', error);
  }
};