import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { auth, db } from '../config/firebase';

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
}

export function useUser() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeUserDoc: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (unsubscribeUserDoc) {
        unsubscribeUserDoc();
        unsubscribeUserDoc = null;
      }

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
            setUserData(snap.data() as UserData);
          } else {
            setUserData(null);
          }
          setLoading(false);
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

  return { userData, loading };
}