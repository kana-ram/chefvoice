import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import './style.css';

export default function SearchPage() {
  const navigate = useNavigate();

  // Hardcoded featured recipes (same as HomePage)
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

  // Firestore recipes
  const [allRecipes, setAllRecipes] = useState([]);

  // Search & filter state
  const [query, setQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  // Load all recipes from Firestore
  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'recipes'));
        const data = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(r => r.title && r.title.trim() !== '');
        setAllRecipes(data);
      } catch (err) {
        console.error('Error fetching recipes:', err);
      }
    };
    fetchRecipes();
  }, []);

  // Handle filtering
  useEffect(() => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    let results = allRecipes.filter(r =>
      (r.title || '').toLowerCase().includes(query.trim().toLowerCase())
    );

    if (activeFilters.length > 0) {
      results = results.filter(r =>
        r.tags &&
        activeFilters.every(tag =>
          r.tags.map(t => (t || '').toLowerCase()).includes(tag.toLowerCase())
        )
      );
    }

    setSearchResults(results);
    setSelectedRecipe(null);
  }, [query, activeFilters, allRecipes]);

  const handleRecipeClick = (recipe) => {
    setSelectedRecipe(recipe);
  };

  const handleFilterClick = (filter) => {
    setSelectedRecipe(null);
    setActiveFilters(prev =>
      prev.includes(filter)
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  };

  return (
    <div className="page" id="search">
      <div className="search-header">
        <div className="container">
          <div className="search-bar">
            <input
              type="text"
              className="search-input"
              placeholder="Search recipes..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button
              className="btn btn-voice"
              title="Voice Search (coming soon)"
              onClick={() => console.log('Voice search placeholder')}
            >
              🎤
            </button>
          </div>

          <div className="filters">
            {['Veg', 'Non-Veg', 'Indian', 'Dessert', 'Quick', 'Italian', 'Asian', 'Gluten-Free'].map(filter => (
              <div
                key={filter}
                className={`filter-tag ${activeFilters.includes(filter) ? 'active' : ''}`}
                onClick={() => handleFilterClick(filter)}
              >
                {filter}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container">
        {/* ✅ 1. Show featured recipes ONLY if search bar is empty */}
        {!query.trim() && (
          <div className="featured-recipes">
            <h2 className="section-title">Featured Recipes</h2>
            <div className="recipe-grid">
              {featuredRecipes.map((recipe) => (
                <div
                  key={recipe.id}
                  className="recipe-card"
                  onClick={() => navigate(`/recipe/${recipe.id}`)}
                >
                  <div className="recipe-image">{recipe.emoji}</div>
                  <div className="recipe-content">
                    <h3 className="recipe-title">{recipe.title}</h3>
                    <div className="recipe-meta">
                      <span>⏱️ {recipe.time} min</span>
                      <span>👥 {recipe.servings} servings</span>
                      <span>⭐ {recipe.rating}</span>
                    </div>
                    <p className="recipe-tagline">
                      {recipe.tagline}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ✅ 2. Show search results ONLY when search is active */}
        {query.trim() && (
          <div className="results-list" style={{ padding: '1rem 0' }}>
            {searchResults.length > 0 ? (
              <>
                <h3>Results:</h3>
                <ul>
                  {searchResults.map((recipe) => (
                    <li
                      key={recipe.id}
                      onClick={() => handleRecipeClick(recipe)}
                      style={{
                        cursor: 'pointer',
                        padding: '0.5rem 0',
                        borderBottom: '1px solid #ddd'
                      }}
                    >
                      {recipe.title}
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p>No recipes found.</p>
            )}
          </div>
        )}

        {/* ✅ 3. Show detail view */}
        {selectedRecipe && (
          <div
            className="recipe-detail-card"
            style={{
              marginTop: '2rem',
              border: '1px solid #ccc',
              padding: '1rem',
              borderRadius: '8px'
            }}
          >
            <h2>{selectedRecipe.title}</h2>
            <p>{selectedRecipe.description}</p>
            <div className="recipe-meta">
              {selectedRecipe.time && <span>⏱️ {selectedRecipe.time} min</span>}
              {selectedRecipe.servings && <span> 👥 {selectedRecipe.servings} servings</span>}
              {selectedRecipe.rating && <span> ⭐ {selectedRecipe.rating}</span>}
            </div>
            {selectedRecipe.tags && (
              <div style={{ marginTop: '0.5rem' }}>
                Tags: {selectedRecipe.tags.join(', ')}
              </div>
            )}
            <button
              className="btn btn-primary"
              style={{ marginTop: '1rem' }}
              onClick={() => navigate(`/recipe/${selectedRecipe.id}`)}
            >
              Show Recipe
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
