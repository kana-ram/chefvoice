// scripts/seedRecipes.js

const admin = require('firebase-admin');

// IMPORTANT: Replace 'path/to/your/serviceAccountKey.json' with the actual path
// to the JSON file you downloaded from Firebase.
// For security, it's often better to load credentials from environment variables
// in production. For a one-time script, direct pathing is common.
const serviceAccount = require('./serviceAccountKey.json'); // Adjust path as needed

// Import your recipes data
const recipesToUpload = require('../data/myRecipesData'); // Adjust path as needed

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore(); // Get Firestore instance

async function seedRecipes() {
  console.log(`Starting to seed ${recipesToUpload.length} recipes...`);

  if (!db) {
    console.error("Firestore DB instance is not initialized.");
    process.exit(1); // Exit with an error code
  }

  const batch = db.batch(); // Get a new write batch
  const recipesCollectionRef = db.collection('recipes'); // Reference to the 'recipes' collection

  try {
    recipesToUpload.forEach((recipe, index) => {
      // Create a new document reference with an auto-generated ID
      const docRef = recipesCollectionRef.doc();
      batch.set(docRef, {
        ...recipe,
        createdAt: admin.firestore.FieldValue.serverTimestamp() // Use server timestamp for accuracy
      });
      console.log(`Added recipe ${index + 1}: ${recipe.title} to batch.`);
    });

    await batch.commit(); // Commit the batch write
    console.log(`\n✅ Successfully pushed ${recipesToUpload.length} recipes to Firestore!`);
    console.log("Check your Firebase Console -> Firestore Database.");
  } catch (error) {
    console.error("❌ Error pushing recipes:", error);
  } finally {
    // Exit the process after completion (success or failure)
    process.exit(0);
  }
}

// Run the seeding function
seedRecipes();