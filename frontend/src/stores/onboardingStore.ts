import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Region } from "@/lib/currency";

export interface PersonalProfile {
  fullName: string;
  phone: string;
  role: string;
}

export interface BusinessProfile {
  companyName: string;
  // Region drives currency formatting, AI voice, FAQ bank, compliance
  // references. Default "US"; user can flip to "IN" in /profile.
  region: Region;
  gstin: string;
  pan: string;
  cin: string;
  industry: string;
  entityType: string;
  servicesDescription: string;
  websiteUrl: string;
  yearFounded: string;
  hadPivot: boolean;
  pivotDescription: string;
  turnoverRange: string;
  employeeCount: string;
  accountingSoftware: string;
}

export interface UploadConfig {
  financialYears: string[];
  uploadType: string;
  isDemoMode: boolean;
}

interface OnboardingState {
  currentStep: number;
  completed: boolean;
  personal: PersonalProfile;
  business: BusinessProfile;
  upload: UploadConfig;

  setStep: (step: number) => void;
  setPersonal: (data: Partial<PersonalProfile>) => void;
  setBusiness: (data: Partial<BusinessProfile>) => void;
  setUpload: (data: Partial<UploadConfig>) => void;
  completeOnboarding: () => void;
  reset: () => void;
}

const defaultPersonal: PersonalProfile = {
  fullName: "",
  phone: "",
  role: "",
};

const defaultBusiness: BusinessProfile = {
  companyName: "",
  region: "US",
  gstin: "",
  pan: "",
  cin: "",
  industry: "",
  entityType: "",
  servicesDescription: "",
  websiteUrl: "",
  yearFounded: "",
  hadPivot: false,
  pivotDescription: "",
  turnoverRange: "",
  employeeCount: "",
  accountingSoftware: "",
};

const defaultUpload: UploadConfig = {
  financialYears: [],
  uploadType: "trial_balance",
  isDemoMode: false,
};

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      currentStep: 0,
      completed: false,
      personal: { ...defaultPersonal },
      business: { ...defaultBusiness },
      upload: { ...defaultUpload },

      setStep: (step) => set({ currentStep: step }),
      setPersonal: (data) =>
        set((state) => ({ personal: { ...state.personal, ...data } })),
      setBusiness: (data) =>
        set((state) => ({ business: { ...state.business, ...data } })),
      setUpload: (data) =>
        set((state) => ({ upload: { ...state.upload, ...data } })),
      completeOnboarding: () => set({ completed: true, currentStep: 4 }),
      reset: () =>
        set({
          currentStep: 0,
          completed: false,
          personal: { ...defaultPersonal },
          business: { ...defaultBusiness },
          upload: { ...defaultUpload },
        }),
    }),
    {
      name: "cortexcfo-onboarding",
      version: 2,
      // Deep merge on rehydrate: existing users in localStorage have the
      // old shape (no `region`, etc). Shallow merge would leave the gap
      // and `business.region` would be undefined at runtime. Explicit
      // merge guarantees every field in defaultBusiness has a value
      // even if the persisted blob predates the field.
      merge: (persisted, current) => {
        const p = (persisted as Partial<OnboardingState>) ?? {};
        return {
          ...current,
          ...p,
          personal: { ...current.personal, ...(p.personal ?? {}) },
          business: { ...current.business, ...(p.business ?? {}) },
          upload: { ...current.upload, ...(p.upload ?? {}) },
        };
      },
    }
  )
);
