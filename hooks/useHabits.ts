import { onAuthStateChanged } from 'firebase/auth';
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, increment, onSnapshot, query, updateDoc, where } from 'firebase/firestore';
import { useEffect, useRef, useState } from 'react';
import { auth, db } from '../config/firebase';

export interface Habit {
  id?: string;
  name: string;
  category: string;
  subcategory?: string;
  frequency: 'daily' | 'weekly';
  weeklyDays?: number;
  goal: number;
  icon: string;
  color: string;
  userId: string;
  createdAt: Date;
  streak: number;
  completedDates: string[];
  consecutiveDays: number;
}

function getWeekMondayIso(date: Date) {
  const monday = new Date(date);
  const day = monday.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  monday.setDate(monday.getDate() + diff);
  return monday.toISOString().split('T')[0];
}

export function useHabits() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const processingRef = useRef(false);

  const fetchHabits = async () => {
    const user = auth.currentUser;
    if (!user) {
      setHabits([]);
      setLoading(false);
      return;
    }
    try {
      const q = query(collection(db, 'habits'), where('userId', '==', user.uid));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Habit));
      setHabits(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const addHabit = async (habit: Omit<Habit, 'id' | 'userId' | 'createdAt' | 'streak' | 'completedDates'>) => {
    const user = auth.currentUser;
    if (!user) return;
    try {
      const cleanHabit = Object.fromEntries(
        Object.entries(habit).filter(([_, value]) => value !== undefined)
      );
      await addDoc(collection(db, 'habits'), {
        ...cleanHabit,
        userId: user.uid,
        createdAt: new Date(),
        streak: 0,
        consecutiveDays: 0,
        completedDates: [],
      });
      await fetchHabits();
    } catch (e) {
      console.error(e);
    }
  };

  const deleteHabit = async (habitId: string) => {
    const user = auth.currentUser;
    if (!user) return false;

    try {
      const habitRef = doc(db, 'habits', habitId);
      await deleteDoc(habitRef);
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };
  const completeHabit = async (habitId: string, currentStreak: number, currentCompletedDates: string[]) => {
    if (processingRef.current) {
      return { alreadyDone: false, ignored: true };
    }

    processingRef.current = true;
    setIsProcessing(true);
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    try {
      if (currentCompletedDates.includes(today)) {
        return { alreadyDone: true };
      }

      const habit = habits.find(h => h.id === habitId);
      if (!habit) return { alreadyDone: false, xpEarned: 0 };

      const habitRef = doc(db, 'habits', habitId);
      const newCompletedDates = [...currentCompletedDates, today];

      let consecutiveDays = habit.consecutiveDays || 0;
      let streakBroken = false;

      if (consecutiveDays > 0) {
        const lastCompleted = currentCompletedDates[currentCompletedDates.length - 1];
        const lastDate = new Date(lastCompleted);
        const diffTime = now.getTime() - lastDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (habit.frequency === 'daily') {
          if (diffDays > 1) streakBroken = true;
        } else {
          if (diffDays > 7) streakBroken = true;
        }
      }

      if (streakBroken) {
        consecutiveDays = 0;
      }

      consecutiveDays += 1;

      let gotConstellationStar = false;
      if (consecutiveDays >= 7) {
        gotConstellationStar = true;
        consecutiveDays = 0;
      }

      const newStreak = streakBroken ? 1 : currentStreak + 1;

      await updateDoc(habitRef, {
        completedDates: newCompletedDates,
        streak: newStreak,
        consecutiveDays,
      });

      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        const userData = userSnap.data() as { constellationStars?: number; currentConstellation?: number; completedConstellations?: any[]; smallStars?: number } | undefined;

        const userUpdates: {
          xp: ReturnType<typeof increment>;
          smallStars: ReturnType<typeof increment>;
          constellationStars?: ReturnType<typeof increment>;
          lastConstellationStarDate?: string;
          currentConstellation?: number;
          lastCompletedDate?: string;
          completedConstellations?: any[];
        } = {
          xp: increment(10),
          smallStars: increment(1),
          lastCompletedDate: today,
        };

        if (gotConstellationStar) {
          userUpdates.constellationStars = increment(1);
          userUpdates.lastConstellationStarDate = today;

          const currentConstellation = userData?.currentConstellation || 0;
          const newTotalStars = (userData?.constellationStars || 0) + 1;
          const starsInCurrent = newTotalStars % 7;

          if (starsInCurrent === 0) {
            userUpdates.currentConstellation = currentConstellation + 1;

            const completed = userData?.completedConstellations || [];
            const snapshot = {
              constellationIndex: currentConstellation,
              stars: STARS_PER_CONSTELLATION,
              smallStars: userData?.smallStars || 0,
              date: today,
            };
            userUpdates.completedConstellations = [...completed, snapshot];
          }
        }

        await updateDoc(userRef, userUpdates);
      }

      await fetchHabits();
      return {
        alreadyDone: false,
        xpEarned: 10,
        gotConstellationStar,
      };
    } catch (e) {
      console.error(e);
      return { alreadyDone: false, xpEarned: 0 };
    } finally {
      processingRef.current = false;
      setIsProcessing(false);
    }
  };
  useEffect(() => {
    let unsubscribeHabits: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (unsubscribeHabits) {
        unsubscribeHabits();
        unsubscribeHabits = null;
      }

      if (!user) {
        setHabits([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      const q = query(collection(db, 'habits'), where('userId', '==', user.uid));
      unsubscribeHabits = onSnapshot(
        q,
        (snapshot) => {
          const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Habit));
          setHabits(data);
          setLoading(false);
        },
        (error) => {
          console.error('Error loading habits:', error);
          setLoading(false);
        }
      );
    });

    return () => {
      if (unsubscribeHabits) {
        unsubscribeHabits();
      }
      unsubscribeAuth();
    };
  }, []);

  return { habits, loading, isProcessing, addHabit, fetchHabits, completeHabit, deleteHabit };
}