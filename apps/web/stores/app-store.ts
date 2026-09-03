import { create } from 'zustand';

import { PIKO_COMPANION_KIND, type PetdexCatalogEntry } from "@/features/companion/petdex/petdex-pets";
import type { PikoAccessoryDisplayId } from "@/features/companion/piko-accessories";

type AppState = {
  companionKind: string;
  companionPet: PetdexCatalogEntry | null;
  pikoAccessory: PikoAccessoryDisplayId;
  companionXPercent: number | null;
  companionYPercent: number | null;
  companionHidden: boolean;

  setCompanionPosition: (xPercent: number, yPercent: number) => void;
  setCompanionHidden: (hidden: boolean) => void;
  setCompanionConfig: (kind: string, pet: PetdexCatalogEntry | null, accessory: PikoAccessoryDisplayId) => void;
};

export const useAppStore = create<AppState>((set) => ({
  companionKind: PIKO_COMPANION_KIND,
  companionPet: null,
  pikoAccessory: 'none',
  companionXPercent: null,
  companionYPercent: null,
  companionHidden: false,

  setCompanionPosition: (xPercent, yPercent) => set({ companionXPercent: xPercent, companionYPercent: yPercent }),
  setCompanionHidden: (hidden) => set({ companionHidden: hidden }),
  setCompanionConfig: (kind, pet, accessory) => set({ companionKind: kind, companionPet: pet, pikoAccessory: accessory }),
}));
