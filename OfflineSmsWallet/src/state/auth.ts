import create from 'zustand';

type AuthState = {
  locked: boolean;
  pin?: string;
  setPin: (pin: string) => void;
  lock: () => void;
  unlockWithPin: (pin: string) => boolean;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  locked: true,
  pin: undefined,
  setPin(pin) {
    set({ pin, locked: false });
  },
  lock() {
    set({ locked: true });
  },
  unlockWithPin(pin) {
    if (get().pin && get().pin === pin) {
      set({ locked: false });
      return true;
    }
    return false;
  },
}));

