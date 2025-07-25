import React from 'react';
import { useNavigate } from 'react-router-dom';
import './style.css';

export default function HomePage() {
  const navigate = useNavigate();

  // ✅ Hardcoded featured recipes with real Firestore IDs
  const featuredRecipes = [
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

  const handleVoiceAssistant = () => {
    navigate('/favorites');
  };

  const handleBrowseRecipes = () => {
    navigate('/search');
  };

  const handleRecipeClick = (recipeId) => {
    navigate(`/recipe/${recipeId}`);
  };

  return (
    <div className="page" id="home">
      <div className="hero">
        <div className="container">
          <h1>Cook with Your Voice</h1>
          <p>Hands-free cooking made simple with voice-guided recipes</p>
          <div className="hero-actions">
            <button
              className="btn btn-voice"
              onClick={handleVoiceAssistant}
              title="Saved Recipes"
            >
              🎤
            </button>
            <button
              className="btn btn-primary btn-large"
              onClick={handleBrowseRecipes}
            >
              Browse Recipes
            </button>
          </div>
        </div>
      </div>

      <div className="featured-recipes">
        <div className="container">
          <h2 className="section-title">Featured Recipes</h2>
          <div className="recipe-grid">
            {featuredRecipes.map((recipe) => (
              <div
                key={recipe.id}
                className="recipe-card"
                onClick={() => handleRecipeClick(recipe.id)}
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
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
