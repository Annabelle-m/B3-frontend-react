import styles from './Header.module.css'
import { Link } from 'react-router'
import { useFavorites } from '../../contexts/FavoritesContext.jsx'

export default function Header() {
  const { favorites } = useFavorites()

  return (
    <header className={styles.header}>
      <nav>
        <ul>
          <li>
            <Link to="/">Bibliothèque</Link>
          </li>
          <li>
            <Link to="/">Contact</Link>
          </li>
          <li className={styles.favorites}>
            <span
              className="material-symbols-outlined"
              aria-hidden="true"
            >
              favorite
            </span>
            <span>Favoris</span>
            <span className={styles.favoriteCount}>{favorites.length}</span>
          </li>
        </ul>
      </nav>
    </header>
  )
}