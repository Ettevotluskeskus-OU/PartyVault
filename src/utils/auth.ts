import { User, Party } from '../types';
import { storage } from './storage';

const checkExpiredParties = () => {
  const parties = storage.get('parties') || [];
  const now = Date.now();
  const activeParties = parties.filter((party: Party) => {
    if (!party.expiresAt) return true;
    return party.expiresAt > now;
  });

  if (activeParties.length < parties.length) {
    storage.save('parties', activeParties);
    
    const media = storage.get('media') || [];
    const activePartyNames = activeParties.map((p: Party) => p.name.toLowerCase());
    const activeMedia = media.filter((m: any) => 
      activePartyNames.includes(m.creator.toLowerCase())
    );
    storage.save('media', activeMedia);
  }
};

export const auth = {
  login: async (partyName: string, password: string): Promise<User> => {
    checkExpiredParties();
    
    const parties = storage.get('parties') || [];
    const party = parties.find((p: Party) => 
      p.name.toLowerCase() === partyName.toLowerCase()
    );
    
    if (!party) {
      throw new Error('Party not found');
    }
    
    if (party.password !== password) {
      throw new Error('Invalid password');
    }

    const user: User = {
      id: `party-${Date.now()}`,
      username: party.name,
      email: `${party.name.toLowerCase().replace(/\s+/g, '-')}@party.com`,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${party.name}`
    };

    storage.save('currentUser', user);
    return user;
  },

  createParty: async (partyName: string, password: string): Promise<User> => {
    if (!partyName.trim() || !password.trim()) {
      throw new Error('Party name and password are required');
    }

    const parties = storage.get('parties') || [];
    
    if (parties.some((p: Party) => p.name.toLowerCase() === partyName.toLowerCase())) {
      throw new Error('A party with this name already exists');
    }

    // Always set 7-day expiration
    const newParty: Party = {
      name: partyName,
      password: password,
      createdAt: Date.now(),
      expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days from now
    };

    storage.save('parties', [...parties, newParty]);

    const user: User = {
      id: `party-${Date.now()}`,
      username: partyName,
      email: `${partyName.toLowerCase().replace(/\s+/g, '-')}@party.com`,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${partyName}`
    };

    storage.save('currentUser', user);
    return user;
  },

  deleteParty: (partyName: string) => {
    const parties = storage.get('parties') || [];
    const updatedParties = parties.filter((p: Party) => p.name !== partyName);
    storage.save('parties', updatedParties);

    const media = storage.get('media') || [];
    const updatedMedia = media.filter((m: any) => m.creator.toLowerCase() !== partyName.toLowerCase());
    storage.save('media', updatedMedia);

    storage.remove('currentUser');
  },

  logout: () => {
    storage.remove('currentUser');
  },

  getCurrentUser: (): User | null => {
    checkExpiredParties();
    return storage.get('currentUser');
  }
};