
let recipes = [];

async function loadRecipes() {
    const response = await fetch('recipes.json');
    recipes = await response.json();
    // Enable buttons after recipes are loaded
    document.getElementById('showRecipesBtn').disabled = false;
    document.getElementById('randomRecipeBtn').disabled = false;
}

function filterRecipesByIngredients(userIngredients) {
    const userSet = new Set(userIngredients.map(i => i.trim().toLowerCase()));
    return recipes.filter(recipe => {
        if (!recipe.ingredients) return false;
        const recipeIngredients = recipe.ingredients.toLowerCase().split(",").map(i => i.trim());
        return [...userSet].every(ing => recipeIngredients.includes(ing));
    });
}

function displayRecipes(recipesToShow) {
    const container = document.getElementById('recipesContainer');
    container.innerHTML = '';
    if (recipesToShow.length === 0) {
        container.innerHTML = '<p>No recipes found with these ingredients.</p>';
        return;
    }
    recipesToShow.forEach(recipe => {
        const card = document.createElement('div');
        card.className = 'recipe-card';
        card.innerHTML = `
            <h3>${recipe.name || ''}</h3>
            <p><strong>Ingredients:</strong> ${recipe.ingredients || ''}</p>
            <p><strong>Diet:</strong> ${recipe.diet || ''}</p>
            <p><strong>Prep time:</strong> ${recipe.prep_time !== undefined ? recipe.prep_time + ' min' : ''}</p>
            <p><strong>Cook time:</strong> ${recipe.cook_time !== undefined ? recipe.cook_time + ' min' : ''}</p>
            <p><strong>Flavor profile:</strong> ${recipe.flavor_profile || ''}</p>
            <p><strong>Course:</strong> ${recipe.course || ''}</p>
            <p><strong>State:</strong> ${recipe.state || ''}</p>
            <p><strong>Region:</strong> ${recipe.region || ''}</p>
        `;
        container.appendChild(card);
    });
}

document.getElementById('showRecipesBtn').addEventListener('click', () => {
    const userInput = document.getElementById('ingredientsInput').value;
    const userIngredients = userInput.split(',');
    const filtered = filterRecipesByIngredients(userIngredients);
    displayRecipes(filtered);
});

document.getElementById('randomRecipeBtn').addEventListener('click', () => {
    if (!recipes || recipes.length === 0) {
        displayRecipes([]);
        return;
    }
    const randomIndex = Math.floor(Math.random() * recipes.length);
    displayRecipes([recipes[randomIndex]]);
});

window.onload = loadRecipes;
// Disable buttons until recipes are loaded
document.getElementById('showRecipesBtn').disabled = true;
document.getElementById('randomRecipeBtn').disabled = true;

// Show all recipes button
document.getElementById('showAllBtn').addEventListener('click', () => {
    displayRecipes(recipes);
});
