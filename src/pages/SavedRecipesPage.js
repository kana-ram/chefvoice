import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, getDoc, doc, getDocs, updateDoc, arrayRemove } from 'firebase/firestore';
import './style.css'; 

export default function SavedRecipesPage() {
  const navigate = useNavigate();

  const [userId, setUserId] = useState(null);
  const [userFavorites, setUserFavorites] = useState([]);
  const [allRecipes, setAllRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Default recipes if user is unauthenticated or has no favorites
  const defaultRecipes = [
    {
      id: 'gx4GsOVyrTEYWnExIR8k',
      title: 'Kachori',
      time: 30,
      servings: 4,
      rating: 4.8,
      emoji: '🥟',
      tagline: 'Crispy, spicy, and bursting with Rajasthani flavor.',
    },
    {
      id: 'r6cSwFDWi3zYg4Cs8G6s',
      title: 'Keema Pizza',
      time: 40,
      servings: 3,
      rating: 4.9,
      emoji: '🍕',
      tagline: 'Fusion delight — spicy meat meets cheesy crust.',
    },
    {
      id: 'uxFIKw0OPbJYYvDKASRO',
      title: 'Pink Sauce Pasta (Vegetarian)',
      time: 25,
      servings: 2,
      rating: 4.7,
      emoji: '🍝',
      tagline: 'Creamy, dreamy, and perfect for vegetarians.',
    },
  ];

  // ✅ Fetch user and favorites on load
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        try {
          // Get user favorites from Firestore
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          const favorites = userDoc.exists() && Array.isArray(userDoc.data().favorites)
            ? userDoc.data().favorites
            : [];
          setUserFavorites(favorites);
        } catch (error) {
          console.error('Error fetching user favorites:', error);
          setUserFavorites([]);
        }
      } else {
        setUserId(null);
        setUserFavorites([]);
      }
    });

    return () => unsubscribe();
  }, []);

  // ✅ Fetch all recipes from Firestore
  useEffect(() => {
    const fetchAllRecipes = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'recipes'));
        const recipes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAllRecipes(recipes);
      } catch (error) {
        console.error('Error fetching all recipes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllRecipes();
  }, []);

  // ✅ Get recipes to show: user's favorites if logged in, else defaults
  const displayedRecipes = userId && userFavorites.length > 0
    ? allRecipes.filter(r => userFavorites.includes(r.id))
    : defaultRecipes;

  const handleViewRecipe = (recipeId) => {
    navigate(`/recipe/${recipeId}`);
  };

  const handleRemoveRecipe = async (recipeId) => {
    if (!userId) return;
    try {
      await updateDoc(doc(db, 'users', userId), {
        favorites: arrayRemove(recipeId),
      });
      setUserFavorites(prev => prev.filter(id => id !== recipeId));
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  return (
    <div className="page" id="saved">
      <div className="saved-header">
        <div className="container">
          <h1 className="section-title">Saved Recipes</h1>
          <p style={{ color: 'var(--text-light)', fontSize: '1.1rem' }}>
            Your favorite recipes, ready to cook
          </p>
        </div>
      </div>

      <div className="container">
        {loading ? (
          <p>Loading recipes...</p>
        ) : (
          <div className="saved-grid">
            {displayedRecipes.length > 0 ? (
              displayedRecipes.map((recipe) => (
                <div
                  key={recipe.id}
                  className="recipe-card"
                  onClick={() => handleViewRecipe(recipe.id)}
                >
                  <div className="recipe-image">{recipe.emoji}</div>
                  <div className="recipe-content">
                    <h3 className="recipe-title">{recipe.title}</h3>
                    <div className="recipe-meta">
                      <span>⏱️ {recipe.time ? `${recipe.time} min` : 'Time: N/A'}</span>
                      <span>👥 {recipe.servings ? `${recipe.servings} servings` : 'Servings: N/A'}</span>
                      <span>⭐ {recipe.rating ? recipe.rating : 'Rating: N/A'}</span>
                    </div>
                    <p className="recipe-tagline">
                      {recipe.tagline || 'A delicious recipe to make your day better!'}
                    </p>
                    {userId && userFavorites.includes(recipe.id) && (
                      <div style={{ marginTop: '1rem' }}>
                        <button
                          className="btn btn-outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveRecipe(recipe.id);
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p>No saved recipes found.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
