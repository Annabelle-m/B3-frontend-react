import { useState } from 'react'
import { FavoritesContext } from './FavoritesContext.jsx'

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState([])

  function toggleFavorite(id) {
    setFavorites((currentFavorites) =>
      currentFavorites.includes(id)
        ? currentFavorites.filter((favoriteId) => favoriteId !== id)
        : [...currentFavorites, id],
    )
  }

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite }}>
      {children}
    </FavoritesContext.Provider>
  )
}
