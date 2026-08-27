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
  smallStars: number;
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
            setUserData({
              ...data,
              constellationStars: data.constellationStars || 0,
              currentConstellation,
              completedConstellations: data.completedConstellations || [],
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
        const currentSmallStars = userData.smallStars || 0;
        const newSmallStars = Math.max(0, currentSmallStars - diffDays);
        const today = now.toISOString().split('T')[0];

        try {
          const userRef = doc(db, 'users', user.uid);
          await updateDoc(userRef, {
            smallStars: newSmallStars,
            lastCompletedDate: today,
          });
          setUserData(prev => prev ? { ...prev, smallStars: newSmallStars, lastCompletedDate: today } : null);
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