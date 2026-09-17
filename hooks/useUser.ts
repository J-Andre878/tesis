import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { useEffect, useRef, useState } from 'react';
import { auth, db } from '../config/firebase';

const STARS_PER_CONSTELLATION = 7;

export interface UserData {
  name: string;
  email: string;
  age?: number;
  gender?: string;
  xp: number;
  level: number;
  photoURL: string | null;
  smallStars: number[];
  constellationStars: number;
  currentConstellation: number;
  lastCompletedDate?: string;
  completedConstellations?: Array<{
    constellationIndex: number;
    stars: number;
    smallStars: number;
    date: string;
  }>;
}

function computeCurrentConstellation(constellationStars: number): number {
  return Math.floor(constellationStars / STARS_PER_CONSTELLATION);
}

function computeCompletedConstellations(constellationStars: number, currentConstellation: number, existing: any[]): any[] {
  const completed: any[] = [];
  for (let i = 0; i < currentConstellation; i++) {
    const existingEntry = existing.find(e => e.constellationIndex === i);
    if (existingEntry) {
      completed.push(existingEntry);
    } else {
      completed.push({
        constellationIndex: i,
        stars: STARS_PER_CONSTELLATION,
        smallStars: 0,
        date: new Date().toISOString().split('T')[0],
      });
    }
  }
  return completed;
}

export function useUser() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const processedRef = useRef(false);

  useEffect(() => {
    let unsubscribeUserDoc: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (unsubscribeUserDoc) {
        unsubscribeUserDoc();
        unsubscribeUserDoc = null;
      }
      processedRef.current = false;

      if (!user) {
        setUserData(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      unsubscribeUserDoc = onSnapshot(
        doc(db, 'users', user.uid),
        (snap) => {
          if (snap.exists()) {
            const data = snap.data() as UserData & { currentConstellation?: number; lastCompletedDate?: string; completedConstellations?: any[] };
            const currentConstellation = data.currentConstellation ?? computeCurrentConstellation(data.constellationStars || 0);
            const completedConstellations = computeCompletedConstellations(data.constellationStars || 0, currentConstellation, data.completedConstellations || []);
            const needsUpdate = !('constellationStars' in (data as any)) || !('currentConstellation' in (data as any));
            if (needsUpdate) {
              const updates: any = {};
              if (!('constellationStars' in (data as any))) updates.constellationStars = 0;
              if (!('currentConstellation' in (data as any))) updates.currentConstellation = 0;
              updateDoc(doc(db, 'users', user.uid), updates).catch(console.error);
            }

            setUserData({
              ...data,
              constellationStars: data.constellationStars || 0,
              currentConstellation,
              smallStars: Array.isArray(data.smallStars) ? data.smallStars : [],
              completedConstellations,
            });
            setLoading(false);
          } else {
            setUserData(null);
            setLoading(false);
          }
        },
        (error) => {
          console.error('Error loading user profile:', error);
          setLoading(false);
        }
      );
    });

    return () => {
      if (unsubscribeUserDoc) {
        unsubscribeUserDoc();
      }
      unsubscribeAuth();
    };
  }, []);

  useEffect(() => {
    const applySmallStarsDecay = async () => {
      const user = auth.currentUser;
      if (!user || !userData || processedRef.current) return;

      const lastCompletedDate = userData.lastCompletedDate;
      if (!lastCompletedDate) {
        processedRef.current = true;
        return;
      }

      const lastDate = new Date(lastCompletedDate);
      const now = new Date();
      const diffTime = now.getTime() - lastDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays > 0) {
        const currentConstellation = userData.currentConstellation || 0;
        const currentSmallStars = userData.smallStars?.[currentConstellation] || 0;
        const newSmallStars = Math.max(0, currentSmallStars - diffDays);
        const today = now.toISOString().split('T')[0];

        try {
          const userRef = doc(db, 'users', user.uid);
          const newSmallStarsArray = Array.isArray(userData.smallStars) ? [...userData.smallStars] : [];
          while (newSmallStarsArray.length <= currentConstellation) {
            newSmallStarsArray.push(0);
          }
          newSmallStarsArray[currentConstellation] = newSmallStars;
          await updateDoc(userRef, {
            smallStars: newSmallStarsArray,
            lastCompletedDate: today,
          });
          setUserData(prev => prev ? { ...prev, smallStars: newSmallStarsArray, lastCompletedDate: today } : null);
        } catch (e) {
          console.error('Error applying small stars decay:', e);
        }
      }

      processedRef.current = true;
    };

    applySmallStarsDecay();
  }, [userData]);

  return { userData, loading };
}