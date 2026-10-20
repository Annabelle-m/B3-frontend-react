import bookCover from '../../assets/moby-dick.png'
import { searchBooks } from '../../api/books.js'
import BookCard from '../../components/BookCard/BookCard.jsx'
import styles from './Home.module.css'
import { useEffect, useRef, useState } from 'react'

export default function Home() {
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('subject:fiction')
  const [searchRequest, setSearchRequest] = useState(0)
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const inputRef = useRef(null)

  function handleSearchChange(event) {
    setSearch(event.target.value)
  }

  function handleSearchSubmit(event) {
    event.preventDefault()
    setQuery(search.trim() || 'subject:fiction')
    setSearchRequest((request) => request + 1)
  }

  function handleSearchClear() {
    setSearch('')
    inputRef.current?.focus()
  }

  useEffect(() => {
    let ignore = false

    async function loadBooks() {
      setLoading(true)
      setError('')

      try {
        const data = await searchBooks(query)
        const results = (Array.isArray(data.items) ? data.items : []).map(
          (item) => {
            const volumeInfo = item.volumeInfo ?? {}
            const cover =
              volumeInfo.imageLinks?.thumbnail ??
              volumeInfo.imageLinks?.smallThumbnail ??
              bookCover

            return {
              id: item.id,
              title: volumeInfo.title ?? 'Titre indisponible',
              authors:
                Array.isArray(volumeInfo.authors) && volumeInfo.authors.length
                  ? volumeInfo.authors
                  : ['Auteur inconnu'],
              publishedDate: volumeInfo.publishedDate ?? 'Date inconnue',
              cover: cover.replace(/^http:/, 'https:'),
            }
          },
        )

        if (!ignore) {
          setBooks(results)
          setLoading(false)
        }
      } catch (error) {
        if (!ignore) {
          setBooks([])
          setError(
            error instanceof TypeError
              ? 'Impossible de contacter Google Books. Vérifiez votre connexion et réessayez.'
              : error instanceof Error
                ? error.message
                : 'Impossible de charger les livres. Réessayez.',
          )
          setLoading(false)
        }
      }
    }

    loadBooks()

    return () => {
      ignore = true
    }
  }, [query, searchRequest])

  return (
    <main className={styles.page}>
      <h1 className={styles.title}>Bibliothèque</h1>

      <p className={styles.description}>
        Bienvenue dans notre bibliothèque. Découvrez notre{' '}
        <strong>sélection de romans d’aventure</strong> et consultez la fiche
        d’un livre pour en savoir plus. Cette sélection vous invite à explorer
        des récits d’aventure et des univers imaginaires.{' '}
        <em>Quel sera votre prochain voyage ?</em>
      </p>

      <form onSubmit={handleSearchSubmit}>
        <div className={styles.searchField}>
          <input
            type="search"
            name="q"
            id="book-name"
            aria-label="Rechercher un livre"
            placeholder="Rechercher un titre, un auteur..."
            value={search}
            onChange={handleSearchChange}
            ref={inputRef}
          />

          <button type="submit" aria-label="Rechercher">
            <span className="material-symbols-outlined" aria-hidden="true">
              search
            </span>
          </button>

          <button
            type="button"
            aria-label="Effacer la recherche"
            onClick={handleSearchClear}
          >
            <span className="material-symbols-outlined" aria-hidden="true">
              close
            </span>
          </button>
        </div>
      </form>

      <p>
        Recherche : <strong>{query}</strong>
      </p>

      <section className={styles.catalogue}>
        <h2>Les livres de la bibliothèque ({books.length})</h2>

        <ul className={styles.bookList}>
          {loading ? (
            <li className={styles.feedback} role="status">
              <span className={styles.spinner} aria-hidden="true" />
              <span>Chargement des livres...</span>
            </li>
          ) : error ? (
            <li className={`${styles.feedback} ${styles.error}`} role="alert">
              <span className="material-symbols-outlined" aria-hidden="true">
                error
              </span>
              <span>{error}</span>
            </li>
          ) : books.length === 0 ? (
            <li className={styles.feedback}>
              <span className="material-symbols-outlined" aria-hidden="true">
                search_off
              </span>
              <span>Aucun résultat pour cette recherche.</span>
            </li>
          ) : (
            books.map((book) => (
              <BookCard key={book.id} book={book} />
            ))
          )}
        </ul>
      </section>
    </main>
  )
}
