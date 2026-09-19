const admin = require('firebase-admin');

// Inicializar Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    databaseURL: 'https://habitquest-45d72-default-rtdb.europe-west1.firebasedatabase.app'
  });
}

const db = admin.firestore();

async function setTestUser(email, constellationStars, currentConstellation, smallStars, completedConstellations) {
  try {
    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('email', '==', email).get();
    
    if (snapshot.empty) {
      console.log('No user found with email:', email);
      return;
    }

    snapshot.forEach(async (doc) => {
      await doc.ref.update({
        constellationStars,
        currentConstellation,
        smallStars,
        completedConstellations
      });
      console.log('User updated:', email);
    });
  } catch (error) {
    console.error('Error:', error);
  }
}

// Ejemplo de uso:
// node scripts/test-setup.js tu@email.com 7 1 [499,0,0,0,0] [{"constellationIndex":0,"stars":7,"smallStars":499,"date":"2024-01-01"}]

const args = process.argv.slice(2);
if (args.length >= 5) {
  const email = args[0];
  const constellationStars = parseInt(args[1]);
  const currentConstellation = parseInt(args[2]);
  const smallStars = JSON.parse(args[3]);
  const completedConstellations = JSON.parse(args[4]);
  setTestUser(email, constellationStars, currentConstellation, smallStars, completedConstellations);
} else {
  console.log('Usage: node scripts/test-setup.js <email> <constellationStars> <currentConstellation> <smallStars JSON> <completedConstellations JSON>');
}