import { Injectable, signal, computed } from "@angular/core";

export interface ProfileMeta {
  id: number;
  name: string;
}

const PROFILES_KEY = "pdc_profiles";
const ACTIVE_PROFILE_KEY = "pdc_active_profile";
const INFLOW_KEY = "pdc_inflows";
const OUTFLOW_KEY = "pdc_outflows";

@Injectable({
  providedIn: "root",
})
export class ProfileService {
  private loadedProfiles =
    this.loadFromStorage<ProfileMeta[]>(PROFILES_KEY) ?? [
      { id: 0, name: "Default" },
    ];
  private loadedActiveId =
    this.loadFromStorage<number>(ACTIVE_PROFILE_KEY) ?? 0;

  profiles = signal<ProfileMeta[]>(this.loadedProfiles);
  activeProfileId = signal<number>(this.loadedActiveId);

  activeProfile = computed(
    () =>
      this.profiles().find((p) => p.id === this.activeProfileId()) ??
      this.profiles()[0],
  );

  activeInflowKey = computed(() =>
    this.inflowKeyForId(this.activeProfileId()),
  );

  activeOutflowKey = computed(() =>
    this.outflowKeyForId(this.activeProfileId()),
  );

  inflowKeyForId(id: number): string {
    return id === 0 ? INFLOW_KEY : `${INFLOW_KEY}_${id}`;
  }

  outflowKeyForId(id: number): string {
    return id === 0 ? OUTFLOW_KEY : `${OUTFLOW_KEY}_${id}`;
  }

  switchProfile(id: number): void {
    this.activeProfileId.set(id);
    localStorage.setItem(ACTIVE_PROFILE_KEY, JSON.stringify(id));
  }

  createProfile(name: string): number {
    const maxId = Math.max(...this.profiles().map((p) => p.id));
    const newId = maxId + 1;
    const updated = [...this.profiles(), { id: newId, name }];
    this.profiles.set(updated);
    this.persistProfiles();
    this.switchProfile(newId);
    return newId;
  }

  renameProfile(id: number, name: string): void {
    const updated = this.profiles().map((p) =>
      p.id === id ? { ...p, name } : p,
    );
    this.profiles.set(updated);
    this.persistProfiles();
  }

  deleteProfile(id: number): void {
    if (this.profiles().length <= 1) return;

    localStorage.removeItem(this.inflowKeyForId(id));
    localStorage.removeItem(this.outflowKeyForId(id));

    const updated = this.profiles().filter((p) => p.id !== id);
    this.profiles.set(updated);
    this.persistProfiles();

    if (this.activeProfileId() === id) {
      this.switchProfile(updated[0].id);
    }
  }

  private persistProfiles(): void {
    localStorage.setItem(PROFILES_KEY, JSON.stringify(this.profiles()));
    localStorage.setItem(
      ACTIVE_PROFILE_KEY,
      JSON.stringify(this.activeProfileId()),
    );
  }

  private loadFromStorage<T>(key: string): T | null {
    const stored = localStorage.getItem(key);
    if (!stored) return null;
    try {
      return JSON.parse(stored) as T;
    } catch {
      return null;
    }
  }
}
