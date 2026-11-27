const FAVORITES_KEY = "pawpop_favorites";
export const getFavorites = () => {
  try {
    return JSON.parse(localStorage.getItem(FAVORITES_KEY)) || [];
  } catch {
    return [];
  }
};

export const isFavorite = (petId) => {
  return getFavorites().some(
    (pet) => pet.PetID === petId
  );
};

export const toggleFavorite = (pet) => {
  const favorites = getFavorites();

  const exists = favorites.some(
    (item) => item.PetID === pet.PetID
  );

  const updatedFavorites = exists
    ? favorites.filter((item) => item.PetID !== pet.PetID)
    : [...favorites, pet];

  localStorage.setItem(
    FAVORITES_KEY,
    JSON.stringify(updatedFavorites)
  );

  return !exists;
};
