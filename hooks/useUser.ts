import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { CONSTELLATIONS } from '../constants/constellations';
import { auth, db } from '../config/firebase';

export interface ConstellationProgress {
  id: string;
  constellationStars: number;
  smallStars: number;
  completed: boolean;
  locked: boolean;
}

export interface UserData {
  name: string;
  email: string;
  age?: number;
  gender?: string;
  xp: number;
  level: number;
  photoURL: string | null;
  tutorialSessions?: number;
  tutorialActive?: boolean;
  constellations: ConstellationProgress[];
  activeConstellation: string;
  smallStars?: number[];
  constellationStars?: number;
  currentConstellation?: number;
  lastCompletedDate?: string;
}

function migrateConstellations(data: Partial<UserData>): ConstellationProgress[] {
  if (Array.isArray(data.constellations) && data.constellations.length) {
    const normalized = CONSTELLATIONS.map((definition, index) => {
      const existing = data.constellations?.find(item => item.id === definition.id);
      return {
        id: definition.id,
        constellationStars: Math.min(definition.stars.length, existing?.constellationStars || 0),
        smallStars: Math.min(500, existing?.smallStars || 0),
        completed: Boolean(existing?.completed) || (existing?.constellationStars || 0) >= definition.stars.length || index < (data.currentConstellation || 0),
        locked: existing?.locked ?? index > 0,
      };
    });
    return normalized.map((item, index) => ({
      ...item,
      locked: index > 0 ? !normalized[index - 1].completed : false,
    }));
  }

  const legacyStars = data.constellationStars || 0;
  const legacySmallStars = Array.isArray(data.smallStars) ? data.smallStars : [];
  return CONSTELLATIONS.map((definition, index) => {
    const stars = Math.min(definition.stars.length, Math.max(0, legacyStars - CONSTELLATIONS.slice(0, index).reduce((sum, item) => sum + item.stars.length, 0)));
    return {
      id: definition.id,
      constellationStars: stars,
      smallStars: Math.min(500, legacySmallStars[index] || 0),
      completed: stars >= definition.stars.length,
      locked: index > 0 && stars < definition.stars.length,
    };
  }).map((item, index, all) => ({
    ...item,
    locked: index > 0 ? !all[index - 1].completed : false,
  }));
}

export function useUser() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeDoc: (() => void) | null = null;
    const unsubscribeAuth = onAuthStateChanged(auth, user => {
      unsubscribeDoc?.();
      if (!user) {
        setUserData(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      unsubscribeDoc = onSnapshot(doc(db, 'users', user.uid), snapshot => {
        if (!snapshot.exists()) {
          setUserData(null);
          setLoading(false);
          return;
        }

        const raw = snapshot.data() as Partial<UserData>;
        const constellations = migrateConstellations(raw);
        const requestedActive = raw.activeConstellation
          ? constellations.find(item => item.id === raw.activeConstellation && !item.locked)
          : undefined;
        const activeConstellation = requestedActive?.id || constellations.find(item => !item.locked)?.id || CONSTELLATIONS[0].id;
        const migration: Record<string, unknown> = {};
        if (!Array.isArray(raw.constellations)) migration.constellations = constellations;
        if (!raw.activeConstellation) migration.activeConstellation = activeConstellation;
        if (typeof raw.tutorialSessions !== 'number') migration.tutorialSessions = 0;
        if (Object.keys(migration).length) {
          updateDoc(doc(db, 'users', user.uid), migration).catch(error => console.error('Error migrating user progress:', error));
        }
        setUserData({
          ...raw,
          constellations,
          activeConstellation,
          tutorialSessions: raw.tutorialSessions || 0,
          name: raw.name || '',
          email: raw.email || user.email || '',
          xp: raw.xp || 0,
          level: raw.level || 1,
          photoURL: raw.photoURL || null,
        } as UserData);
        setLoading(false);
      }, error => {
        console.error('Error loading user profile:', error);
        setLoading(false);
      });
    });

    return () => {
      unsubscribeDoc?.();
      unsubscribeAuth();
    };
  }, []);

  return { userData, loading };
}
