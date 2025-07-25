import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../firebase';
import './style.css';

export default function RecipeDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [checkedIngredients, setCheckedIngredients] = useState([]);

  const [user, setUser] = useState(null);
  const [saving, setSaving] = useState(false);

  // ✅ Watch auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  // ✅ Fetch this recipe
  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const ref = doc(db, 'recipes', id);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setRecipe({ id: snap.id, ...snap.data() });
        } else {
          setError('Recipe not found.');
        }
      } catch (err) {
        console.error('Error fetching recipe:', err);
        setError('Failed to load recipe.');
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [id]);

  const toggleIngredient = (ingredient) => {
    setCheckedIngredients((prev) =>
      prev.includes(ingredient)
        ? prev.filter((item) => item !== ingredient)
        : [...prev, ingredient]
    );
  };

  const handleVoiceAssistant = () => {
    if (recipe && recipe.id) {
      navigate(`/voice/${recipe.id}`);
    }
  };

  // ✅ SAVE RECIPE BUTTON
  const handleSaveRecipe = async () => {
  if (!user) {
  alert('You are not logged in. Please log in to save recipes.');
  // navigate('/auth');
  return;
}
    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        favorites: arrayUnion(recipe.id),
      });
      console.log('Recipe saved to favorites!');
    } catch (error) {
      console.error('Error saving recipe:', error);
    } finally {
      setSaving(false);
    }
  };

  // ✅ SHARE BUTTON
  const handleShare = () => {
    const appLink = `https://your-app.com/recipe/${id}`;
    const message = `Check out this recipe on Your App: ${appLink}`;
    const whatsappURL = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappURL, '_blank');
  };

  if (loading) {
    return (
      <div className="page">
        <div className="container">
          <p>Loading recipe...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <div className="container">
          <h2>Error</h2>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={() => navigate('/')}>
            Back to Search
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page" id="recipe">
      <div className="recipe-header">
        <div className="container">
          <h1>{recipe.title}</h1>
          <div className="recipe-meta" style={{ justifyContent: 'center', marginBottom: '2rem' }}>
            {recipe.time && <span>⏱️ {recipe.time} min</span>}
            {recipe.servings && <span>👥 {recipe.servings} servings</span>}
            {recipe.rating && <span>⭐ {recipe.rating}</span>}
          </div>
          <div className="recipe-actions">
            <button
              className="btn btn-voice"
              onClick={handleVoiceAssistant}
              title="Start Voice Assistant"
            >
              🎤
            </button>
            <button
              className="btn btn-secondary"
              onClick={handleSaveRecipe}
              disabled={saving}
            >
              ❤️ {saving ? 'Saving...' : 'Save Recipe'}
            </button>
            <button
              className="btn btn-outline"
              onClick={handleShare}
            >
              📤 Share
            </button>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="recipe-details">

          {recipe.description && (
            <div className="recipe-description" style={{ marginBottom: '2rem' }}>
              <p>{recipe.description}</p>
            </div>
          )}

          {recipe.ingredients && recipe.ingredients.length > 0 && (
            <div className="ingredients-section">
              <h3 style={{ marginBottom: '1.5rem', fontFamily: "'Playfair Display', serif" }}>
                Ingredients
              </h3>
              <ul className="ingredients-list">
                {recipe.ingredients.map((item) => (
                  <li key={item} className="ingredient-item">
                    <div
                      className={`ingredient-checkbox ${
                        checkedIngredients.includes(item) ? 'checked' : ''
                      }`}
                      onClick={() => toggleIngredient(item)}
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {recipe.instructions && recipe.instructions.length > 0 && (
            <div className="steps-section">
              <h3 style={{ marginBottom: '1.5rem', fontFamily: "'Playfair Display', serif" }}>
                Instructions
              </h3>
              {recipe.instructions.map((step, index) => {
                const stepText = typeof step === 'string' ? step : step.text;
                const timer = typeof step === 'object' && step.timer;
                return (
                  <div key={index} className="step-item">
                    <div className="step-number">{index + 1}</div>
                    <div className="step-content">
                      <div className="step-text">{stepText}</div>
                      {timer && (
                        <div className="step-timer">
                          <span>⏱️ Timer: {timer}</span>
                          <button
                            className="btn btn-outline"
                            style={{
                              marginLeft: '1rem',
                              padding: '0.25rem 0.75rem',
                              fontSize: '0.8rem'
                            }}
                          >
                            Start Timer
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
