import { create } from 'zustand';

interface UIState {
    fabAction: (() => void) | null;
    fabIcon: string;
    // Optional: Label or color if we want more customization
    setFab: (action: () => void, icon?: string) => void;
    hideFab: () => void;
}

export const useUIStore = create<UIState>((set) => ({
    fabAction: null,
    fabIcon: 'add',
    setFab: (action, icon = 'add') => set({ fabAction: action, fabIcon: icon }),
    hideFab: () => set({ fabAction: null, fabIcon: 'add' }),
}));
