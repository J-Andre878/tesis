import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo, useState } from 'react';
import { Animated, Dimensions, FlatList, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Circle, Line, Polygon } from 'react-native-svg';
import { useUser } from '../../hooks/useUser';
import { useHabits } from '../../hooks/useHabits';
import { auth, db } from '../../config/firebase';
import { collection, onSnapshot, query, where } from 'firebase/firestore';

const { width, height } = Dimensions.get('window');

const STARS_PER_CONSTELLATION = 7;

const CONSTELLATIONS = [
  {
    name: 'Orión',
    stars: [
      { x: 0.5, y: 0.15 },
      { x: 0.65, y: 0.28 },
      { x: 0.55, y: 0.42 },
      { x: 0.5, y: 0.45 },
      { x: 0.45, y: 0.42 },
      { x: 0.35, y: 0.28 },
      { x: 0.5, y: 0.72 },
    ],
    lines: [[0,1],[0,5],[1,2],[5,4],[2,3],[3,4],[2,6],[4,6]],
    colors: ['#050510', '#0a0520', '#080318', '#050510'] as any,
  },
  {
    name: 'Osa Mayor',
    stars: [
      { x: 0.2, y: 0.55 },
      { x: 0.32, y: 0.48 },
      { x: 0.44, y: 0.44 },
      { x: 0.54, y: 0.5 },
      { x: 0.62, y: 0.35 },
      { x: 0.72, y: 0.25 },
      { x: 0.8, y: 0.18 },
    ],
    lines: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6]],
    colors: ['#020810', '#050f1a', '#030c18', '#020810'] as any,
  },
  {
    name: 'Casiopea',
    stars: [
      { x: 0.18, y: 0.5 },
      { x: 0.32, y: 0.3 },
      { x: 0.5, y: 0.45 },
      { x: 0.68, y: 0.3 },
      { x: 0.82, y: 0.5 },
    ],
    lines: [[0,1],[1,2],[2,3],[3,4]],
    colors: ['#100510', '#1a0820', '#120618', '#100510'] as any,
  },
  {
    name: 'Cruz del Sur',
    stars: [
      { x: 0.5, y: 0.15 },
      { x: 0.5, y: 0.85 },
      { x: 0.2, y: 0.5 },
      { x: 0.8, y: 0.5 },
      { x: 0.38, y: 0.72 },
    ],
    lines: [[0,1],[2,3],[0,4]],
    colors: ['#021008', '#030f08', '#021008', '#010805'] as any,
  },
  {
    name: 'Escorpio',
    stars: [
      { x: 0.5, y: 0.15 },
      { x: 0.55, y: 0.25 },
      { x: 0.52, y: 0.35 },
      { x: 0.45, y: 0.45 },
      { x: 0.4, y: 0.55 },
      { x: 0.45, y: 0.65 },
      { x: 0.55, y: 0.72 },
    ],
    lines: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6]],
    colors: ['#100a02', '#1a1002', '#120c02', '#100a02'] as any,
  },
];

function AnimatedStarShape({ x, y, size, opacity, delay, duration }: any) {
  const twinkleOpacity = useMemo(() => new Animated.Value(opacity), [opacity]);
  const center = size * 2;
  const s = size;
  const points = [
    `${center},${center - s}`,
    `${center + s * 0.25},${center - s * 0.25}`,
    `${center + s},${center}`,
    `${center + s * 0.25},${center + s * 0.25}`,
    `${center},${center + s}`,
    `${center - s * 0.25},${center + s * 0.25}`,
    `${center - s},${center}`,
    `${center - s * 0.25},${center - s * 0.25}`,
  ].join(' ');

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(twinkleOpacity, { toValue: opacity * 0.15, duration, useNativeDriver: true, delay }),
        Animated.timing(twinkleOpacity, { toValue: opacity, duration, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [delay, duration, opacity, twinkleOpacity]);

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: x - center,
        top: y - center,
        width: center * 2,
        height: center * 2,
        opacity: twinkleOpacity,
      }}
    >
      <Svg width={center * 2} height={center * 2}>
        <Circle cx={center} cy={center} r={size * 2} fill="#ffffff" opacity={0.12} />
        <Polygon points={points} fill="#ffffff" />
      </Svg>
    </Animated.View>
  );
}

function PulsingConstellationStar({ x, y, index }: any) {
  const pulse = useMemo(() => new Animated.Value(1), []);
  const glow = useMemo(() => new Animated.Value(0.5), []);

  useEffect(() => {
    const delay = index * 300;
    Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 1.4, duration: 2000, useNativeDriver: true, delay }),
      Animated.timing(pulse, { toValue: 1, duration: 2000, useNativeDriver: true }),
    ])).start();
    Animated.loop(Animated.sequence([
      Animated.timing(glow, { toValue: 1, duration: 2000, useNativeDriver: true, delay }),
      Animated.timing(glow, { toValue: 0.5, duration: 2000, useNativeDriver: true }),
    ])).start();
  }, []);

  return (
    <Animated.View style={{
      position: 'absolute',
      left: x - 12, top: y - 12,
      width: 24, height: 24,
      alignItems: 'center', justifyContent: 'center',
      transform: [{ scale: pulse }],
    }}>
      <Animated.View style={{
        position: 'absolute',
        width: 18, height: 18, borderRadius: 9,
        backgroundColor: '#fff', opacity: glow,
        transform: [{ scale: 1.3 }],
      }} />
      <View style={styles.constellationDotLarge} />
    </Animated.View>
  );
}

export default function GameScreen() {
  const { userData } = useUser();
  const { habits } = useHabits();
  const [fullscreen, setFullscreen] = useState(false);
  const [view, setView] = useState<'sky' | 'leaderboard'>('sky');
  const [leaderboard, setLeaderboard] = useState<{ id: string; userName: string; userLevel: number; score: number }[]>([]);
  const [galaxyView, setGalaxyView] = useState(false);
  const [visitedConstellation, setVisitedConstellation] = useState<number | null>(null);

  const currentConstellationIndex = userData?.currentConstellation ?? 0;
  const userCategory = useMemo(() => habits.find(h => h.category)?.category || '', [habits]);

  const weekStart = useMemo(() => {
    const d = new Date();
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    return d.toISOString().split('T')[0];
  }, []);

  useEffect(() => {
    if (view !== 'leaderboard') return;

    const q = query(
      collection(db, 'weeklyScores'),
      where('weekStart', '==', weekStart)
    );

    const unsub = onSnapshot(q, (snap) => {
      const all: { id: string; userName: string; userLevel: number; score: number; category?: string }[] = [];
      snap.forEach((docSnap) => {
        const d = docSnap.data() as { userName?: string; userLevel?: number; score?: number; category?: string };
        if (typeof d.userName === 'string' && typeof d.score === 'number') {
          all.push({ id: docSnap.id, userName: d.userName, userLevel: d.userLevel || 1, score: d.score, category: d.category });
        }
      });

      const filtered = userCategory
        ? all.filter(item => item.category === userCategory)
        : all;
      filtered.sort((a, b) => b.score - a.score);
      setLeaderboard(filtered.slice(0, 50));
    }, (error) => {
      console.error('Error loading leaderboard:', error);
    });

    return unsub;
  }, [view, userCategory, weekStart]);

  const displayConstellationIndex = visitedConstellation ?? currentConstellationIndex;
  const constellationStars = userData?.constellationStars || 0;
  const smallStars = userData?.smallStars?.[displayConstellationIndex] || 0;

  let starsInDisplay = constellationStars - (displayConstellationIndex * STARS_PER_CONSTELLATION);
  if (starsInDisplay < 0) starsInDisplay = 0;
  if (starsInDisplay > STARS_PER_CONSTELLATION) starsInDisplay = STARS_PER_CONSTELLATION;

  let starsInCurrent = constellationStars - (currentConstellationIndex * STARS_PER_CONSTELLATION);
  if (starsInCurrent < 0) starsInCurrent = 0;
  if (starsInCurrent > STARS_PER_CONSTELLATION) starsInCurrent = STARS_PER_CONSTELLATION;

  const displayConst = CONSTELLATIONS[Math.min(displayConstellationIndex, CONSTELLATIONS.length - 1)];
  const svgW = width * 0.95;
  const svgH = height * 0.7;

  const starsNeeded = STARS_PER_CONSTELLATION - starsInDisplay;
  const progressPercent = (starsInDisplay / STARS_PER_CONSTELLATION) * 100;

  const completedConstellations = userData?.completedConstellations || [];

  const isConstellationCompleted = (index: number) => {
    return completedConstellations.some(c => c.constellationIndex === index);
  };

  const getConstellationProgress = (index: number) => {
    if (index < currentConstellationIndex) return STARS_PER_CONSTELLATION;
    if (index === currentConstellationIndex) return starsInCurrent;
    return 0;
  };

  const handleGalaxyBack = () => {
    setGalaxyView(false);
    setVisitedConstellation(null);
  };

  const handleVisitConstellation = (index: number) => {
    const isCompleted = completedConstellations.some(c => c.constellationIndex === index);
    const isCurrent = index === currentConstellationIndex;
    if (isCompleted || isCurrent) {
      setVisitedConstellation(index);
      setGalaxyView(false);
    }
  };

  const handleContinueConstellation = async (index: number) => {
    if (index === currentConstellationIndex) return;
    try {
      const { doc, updateDoc } = await import('firebase/firestore');
      const userRef = doc(db, 'users', auth.currentUser?.uid);
      await updateDoc(userRef, { currentConstellation: index });
      setVisitedConstellation(null);
    } catch (e) {
      console.error('Error changing constellation:', e);
    }
  };

  const handleBackToCurrent = () => {
    setVisitedConstellation(null);
  };

  const getVisitedSmallStars = () => {
    if (visitedConstellation === null) return smallStars;
    return userData?.smallStars?.[visitedConstellation] || 0;
  };

  const visitedSmallStars = getVisitedSmallStars();
  const visitedSmallStarPositions = useMemo(() =>
    Array.from({ length: Math.min(visitedSmallStars, 500) }, (_, i) => ({
      x: ((Math.sin(i * 127.1 + 1.5) * 0.5 + 0.5)) * width,
      y: ((Math.sin(i * 311.7 + 2.3) * 0.5 + 0.5)) * height,
      size: 1.2 + (i % 3) * 0.4,
      opacity: 0.4 + (i % 5) * 0.1,
      delay: i * 237,
      duration: 1800 + (i % 7) * 400,
    })),
  [visitedSmallStars]);

  const renderConstellationMiniature = (constellation: typeof CONSTELLATIONS[0], index: number) => {
    const isCompleted = isConstellationCompleted(index);
    const isCurrent = index === currentConstellationIndex;
    const isVisited = index === visitedConstellation;
    const progress = getConstellationProgress(index);

    return (
      <Pressable
        key={index}
        style={[styles.miniatureCard, isVisited && styles.miniatureCardVisited]}
        onPress={() => {
          handleVisitConstellation(index);
        }}
      >
        <View style={[styles.miniatureGlow, isCompleted && styles.miniatureGlowActive]} />
        <View style={styles.miniatureContent}>
          <Svg width={60} height={60}>
            {constellation.lines.map(([a, b], i) => {
              if (a >= progress || b >= progress) return null;
              const sA = constellation.stars[a];
              const sB = constellation.stars[b];
              return (
                <Line
                  key={i}
                  x1={sA.x * 60} y1={sA.y * 60}
                  x2={sB.x * 60} y2={sB.y * 60}
                  stroke={isCompleted ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.1)"}
                  strokeWidth="1"
                />
              );
            })}
          </Svg>
          <View style={StyleSheet.absoluteFill}>
            {constellation.stars.map((star, i) => {
              if (i >= progress) return null;
              return (
                <View
                  key={i}
                  style={[
                    styles.miniatureDot,
                    isCompleted && styles.miniatureDotCompleted,
                    isCurrent && styles.miniatureDotCurrent,
                    isVisited && styles.miniatureDotVisited,
                  ]}
                />
              );
            })}
          </View>
        </View>
        <Text style={[styles.miniatureName, isCompleted && styles.miniatureNameActive, isVisited && styles.miniatureNameVisited]}>
          {constellation.name}
        </Text>
        {isVisited && (
          <Text style={styles.miniatureVisiting}>Visitando</Text>
        )}
        {isCurrent && !isVisited && (
          <Text style={styles.miniatureProgress}>{progress}/{STARS_PER_CONSTELLATION}</Text>
        )}
        {isCompleted && !isVisited && (
          <Text style={styles.miniatureCompleted}>Completada</Text>
        )}
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      {galaxyView ? (
        <>
          <LinearGradient colors={['#000000', '#0a0a1a', '#000000']} style={StyleSheet.absoluteFill} />
          <View style={styles.galaxyHeader}>
            <Text style={styles.galaxyTitle}>Habit Galaxy</Text>
            <TouchableOpacity onPress={handleGalaxyBack}>
              <Text style={styles.galaxyClose}>Cerrar</Text>
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.galaxyContent}>
            {CONSTELLATIONS.map((constellation, index) => renderConstellationMiniature(constellation, index))}
          </ScrollView>
        </>
      ) : view === 'sky' ? (
        <TouchableOpacity
          activeOpacity={1}
          onPress={fullscreen ? () => setFullscreen(false) : undefined}
          style={styles.skyContainer}
        >
          <LinearGradient colors={displayConst.colors} style={StyleSheet.absoluteFill} />

          {visitedSmallStars > 0 && (
            <View style={StyleSheet.absoluteFill} pointerEvents="none">
              {visitedSmallStarPositions.map((star, i) => (
                <AnimatedStarShape key={i} {...star} />
              ))}
            </View>
          )}

          {!fullscreen && (
            <View style={styles.topContent}>
              <Text style={styles.title}>Habit Galaxy</Text>
              <Text style={styles.subtitle}>
                {starsInDisplay} / {STARS_PER_CONSTELLATION} estrellas · {displayConst.name}
              </Text>
              <View style={styles.viewToggle}>
                <TouchableOpacity
                  style={[styles.viewToggleBtn, view === 'sky' && styles.viewToggleBtnActive]}
                  onPress={() => setView('sky')}
                >
                  <Text style={[styles.viewToggleText, view === 'sky' && styles.viewToggleTextActive]}>Mi Cielo</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.viewToggleBtn, view === 'leaderboard' && styles.viewToggleBtnActive]}
                  onPress={() => setView('leaderboard')}
                >
                  <Text style={[styles.viewToggleText, view === 'leaderboard' && styles.viewToggleTextActive]}>Tabla de Líderes</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <View style={styles.constellationCenter}>
            <View style={styles.constellationInner}>
              <Svg width={svgW} height={svgH}>
                {displayConst.lines.map(([a, b], i) => {
                  if (a >= starsInDisplay || b >= starsInDisplay) return null;
                  const sA = displayConst.stars[a];
                  const sB = displayConst.stars[b];
                  return (
                    <Line
                      key={i}
                      x1={sA.x * svgW} y1={sA.y * svgH}
                      x2={sB.x * svgW} y2={sB.y * svgH}
                      stroke="rgba(255,255,255,0.25)"
                      strokeWidth="1"
                    />
                  );
                })}
              </Svg>

              <View style={StyleSheet.absoluteFill}>
                {displayConst.stars.map((star, i) => {
                  if (i >= starsInDisplay) return null;
                  return (
                    <PulsingConstellationStar
                      key={`pulse-${i}`}
                      x={star.x * svgW}
                      y={star.y * svgH}
                      index={i}
                    />
                  );
                })}
              </View>
            </View>
          </View>

          {!fullscreen && (
            <View style={styles.bottomContent}>
              {starsInDisplay >= STARS_PER_CONSTELLATION ? (
                <Text style={styles.completeText}>Constelacion completada</Text>
              ) : (
                <>
                  <Text style={styles.nextStarText}>
                    Faltan <Text style={styles.highlight}>{starsNeeded} semanas perfectas</Text> para completar esta constelación
                  </Text>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
                  </View>
                </>
              )}
              <Text style={styles.smallStarsText}>{visitedSmallStars} estrellas de constancia diaria</Text>
              {visitedConstellation !== null && visitedConstellation !== currentConstellationIndex && (
                <TouchableOpacity style={styles.continueButton} onPress={() => handleContinueConstellation(visitedConstellation)}>
                  <Text style={styles.continueButtonText}>Continuar en esta constelación</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {!fullscreen && (
            <View style={styles.rightButtons}>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => {
                  if (visitedConstellation !== null) {
                    handleBackToCurrent();
                  } else {
                    setGalaxyView(true);
                  }
                }}
              >
                <Text style={styles.iconButtonText}>✦</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => setFullscreen(true)}
              >
                <Text style={styles.iconButtonText}>⛶</Text>
              </TouchableOpacity>
            </View>
          )}
        </TouchableOpacity>
      ) : (
        <View style={styles.leaderboardContainer}>
          <LinearGradient colors={displayConst.colors} style={StyleSheet.absoluteFill} />
          <View style={styles.leaderboardHeader}>
            <TouchableOpacity onPress={() => setView('sky')} style={styles.leaderboardBackBtn}>
              <Text style={styles.leaderboardBackText}>← Volver</Text>
            </TouchableOpacity>
            <Text style={styles.leaderboardTitle}>Ranking Semanal</Text>
            <View style={{ width: 60 }} />
          </View>
          {!userSubcategory ? (
            <Text style={styles.leaderboardEmpty}>Agrega una subcategoria a algun habito para participar en el ranking</Text>
          ) : (
            <FlatList
              data={leaderboard}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.leaderboardList}
              renderItem={({ item, index }) => {
                const isCurrentUser = auth.currentUser?.uid === item.id;
                const rankTitle = item.score >= 0.9 ? 'Perfecto' : item.score >= 0.6 ? 'Constante' : item.score >= 0.3 ? 'En marcha' : 'Recomenzando';
                return (
                  <View style={[styles.leaderboardItem, isCurrentUser && styles.leaderboardItemActive]}>
                    <Text style={[styles.leaderboardRank, isCurrentUser && styles.leaderboardRankActive]}>{index + 1}</Text>
                    <View style={styles.leaderboardUserInfo}>
                      <Text style={[styles.leaderboardName, isCurrentUser && styles.leaderboardNameActive]}>{item.userName}</Text>
                      <Text style={styles.leaderboardLevel}>Nivel {item.userLevel}</Text>
                    </View>
                    <View style={styles.leaderboardScoreInfo}>
                      <Text style={[styles.leaderboardScore, isCurrentUser && styles.leaderboardScoreActive]}>{item.score.toFixed(2)}</Text>
                      <Text style={[styles.leaderboardTitleText, isCurrentUser && styles.leaderboardTitleTextActive]}>{rankTitle}</Text>
                    </View>
                  </View>
                );
              }}
              ListEmptyComponent={
                <Text style={styles.leaderboardEmpty}>No hay datos disponibles</Text>
              }
            />
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  skyContainer: { flex: 1 },
  topContent: { alignItems: 'center', paddingTop: 65 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff', letterSpacing: 3 },
  subtitle: { fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 4 },
  constellationCenter: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  constellationInner: { width: width * 0.95, height: height * 0.7 },
  constellationDotLarge: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#fff' },
  bottomContent: { position: 'absolute', bottom: 60, left: 0, right: 0, alignItems: 'center', paddingHorizontal: 32 },
  nextStarText: { color: 'rgba(255,255,255,0.65)', fontSize: 13, textAlign: 'center', marginBottom: 10 },
  highlight: { color: '#fff', fontWeight: 'bold' },
  progressBar: { width: width * 0.55, height: 3, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 2, marginBottom: 12 },
  progressFill: { height: 3, backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: 2 },
  smallStarsText: { color: 'rgba(255,255,255,0.4)', fontSize: 12 },
  continueButton: { backgroundColor: '#6C63FF', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 24, marginTop: 12, alignItems: 'center' },
  continueButtonText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  completeText: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  rightButtons: { position: 'absolute', top: 55, right: 20, flexDirection: 'row', gap: 12 },
  iconButton: { padding: 8 },
  iconButtonText: { fontSize: 22, color: 'rgba(255,255,255,0.5)' },
  viewToggle: { flexDirection: 'row', marginTop: 18, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 12, padding: 4 },
  viewToggleBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  viewToggleBtnActive: { backgroundColor: 'rgba(255,255,255,0.18)' },
  viewToggleText: { color: 'rgba(255,255,255,0.55)', fontSize: 13, fontWeight: '600' },
  viewToggleTextActive: { color: '#fff' },
  leaderboardContainer: { flex: 1 },
  leaderboardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingTop: 60, marginBottom: 12 },
  leaderboardBackBtn: { padding: 8 },
  leaderboardBackText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  leaderboardTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', textAlign: 'center' },
  leaderboardList: { paddingHorizontal: 24, paddingBottom: 20 },
  leaderboardItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 14, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.06)', marginBottom: 8 },
  leaderboardItemActive: { backgroundColor: 'rgba(108,99,255,0.25)' },
  leaderboardRank: { width: 32, fontSize: 16, fontWeight: 'bold', color: 'rgba(255,255,255,0.7)' },
  leaderboardRankActive: { color: '#fff' },
  leaderboardUserInfo: { flex: 1, marginLeft: 12 },
  leaderboardName: { fontSize: 15, color: 'rgba(255,255,255,0.85)', marginLeft: 0 },
  leaderboardNameActive: { color: '#fff', fontWeight: 'bold' },
  leaderboardLevel: { fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 },
  leaderboardScoreInfo: { alignItems: 'flex-end' },
  leaderboardScore: { fontSize: 14, color: 'rgba(255,255,255,0.6)', marginLeft: 8 },
  leaderboardScoreActive: { color: '#fff', fontWeight: 'bold' },
  leaderboardTitleText: { fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 },
  leaderboardTitleTextActive: { color: '#fff' },
  leaderboardEmpty: { textAlign: 'center', color: 'rgba(255,255,255,0.4)', marginTop: 40, fontSize: 14 },
  galaxyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24, paddingTop: 60 },
  galaxyTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff', letterSpacing: 3 },
  galaxyClose: { fontSize: 16, color: 'rgba(255,255,255,0.7)' },
  galaxyContent: { paddingHorizontal: 24, paddingBottom: 40, alignItems: 'center' },
  miniatureCard: { width: width * 0.4, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: 16, alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  miniatureGlow: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 16, opacity: 0 },
  miniatureGlowActive: { opacity: 1, backgroundColor: 'rgba(108,99,255,0.15)' },
  miniatureContent: { width: 60, height: 60, alignItems: 'center', justifyContent: 'center' },
  miniatureDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: 'rgba(255,255,255,0.3)', position: 'absolute' },
  miniatureDotCompleted: { backgroundColor: '#fff' },
  miniatureDotCurrent: { backgroundColor: 'rgba(255,255,255,0.8)' },
  miniatureName: { fontSize: 14, fontWeight: 'bold', color: 'rgba(255,255,255,0.4)', marginTop: 10, textAlign: 'center' },
  miniatureNameActive: { color: '#fff' },
  miniatureProgress: { fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 4 },
  miniatureCompleted: { fontSize: 11, color: '#6C63FF', marginTop: 4, fontWeight: 'bold' },
  miniatureCardVisited: { borderColor: '#6C63FF', borderWidth: 2 },
  miniatureDotVisited: { backgroundColor: '#6C63FF' },
  miniatureNameVisited: { color: '#6C63FF' },
  miniatureVisiting: { fontSize: 11, color: '#6C63FF', marginTop: 4, fontWeight: 'bold' },
});