import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import bookCover from '../../assets/moby-dick.png'
import { getBook } from '../../api/books.js'
import { useFavorites } from '../../contexts/FavoritesContext.jsx'
import styles from './Book.module.css'

const languages = {
  en: 'Anglais',
  fr: 'Français',
}

function formatDescription(description) {
  const parsedDescription = new DOMParser().parseFromString(
    description,
    'text/html',
  )
  const blockTags = new Set([
    'ADDRESS',
    'ARTICLE',
    'BLOCKQUOTE',
    'DIV',
    'H1',
    'H2',
    'H3',
    'H4',
    'LI',
    'OL',
    'P',
    'SECTION',
    'UL',
  ])

  function extractText(node) {
    if (node.nodeType === 3) {
      return node.nodeValue ?? ''
    }

    if (node.nodeType !== 1) {
      return ''
    }

    const element = node
    if (element.tagName === 'SCRIPT' || element.tagName === 'STYLE') {
      return ''
    }

    if (element.tagName === 'BR') {
      return '\n'
    }

    const text = Array.from(element.childNodes, extractText).join('')
    return blockTags.has(element.tagName) ? `\n${text}\n` : text
  }

  return Array.from(parsedDescription.body.childNodes, extractText)
    .join('')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

export default function Book() {
  const { id } = useParams()
  const { favorites, toggleFavorite } = useFavorites()
  const [book, setBook] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let ignore = false

    async function loadBook() {
      setLoading(true)
      setError('')
      setBook(null)

      try {
        const result = await getBook(id)

        if (!ignore) {
          setBook(result)
          setLoading(false)
        }
      } catch (requestError) {
        if (!ignore) {
          setError(
            requestError instanceof TypeError
              ? 'Impossible de contacter Google Books. Vérifiez votre connexion et réessayez.'
              : requestError instanceof Error
                ? requestError.message
                : 'Impossible de charger ce livre. Réessayez.',
          )
          setLoading(false)
        }
      }
    }

    loadBook()

    return () => {
      ignore = true
    }
  }, [id])

  if (loading) {
    return (
      <main className={styles.page}>
        <div className={styles.feedback} role="status">
          <span className={styles.spinner} aria-hidden="true" />
          <span>Chargement du livre…</span>
        </div>
      </main>
    )
  }

  if (error || !book) {
    return (
      <main className={styles.page}>
        <div className={styles.errorState}>
          <span className="material-symbols-outlined" aria-hidden="true">
            error
          </span>
          <p role="alert">{error || 'Livre introuvable.'}</p>
          <Link className={styles.backLink} to="/">
            Retour à la bibliothèque
          </Link>
        </div>
      </main>
    )
  }

  const volumeInfo = book.volumeInfo ?? {}
  const title = volumeInfo.title ?? 'Titre indisponible'
  const authors = volumeInfo.authors?.length
    ? volumeInfo.authors.join(', ')
    : 'Auteur inconnu'
  const publishedDate = volumeInfo.publishedDate ?? 'Date inconnue'
  const cover =
    volumeInfo.imageLinks?.thumbnail ??
    volumeInfo.imageLinks?.smallThumbnail ??
    bookCover
  const language =
    languages[volumeInfo.language] ?? volumeInfo.language ?? 'Langue inconnue'
  const description = formatDescription(
    volumeInfo.description ?? 'Aucun résumé n’est disponible pour ce livre.',
  )
  const isFavorite = favorites.includes(id)

  return (
    <main className={styles.page}>
      <article className={styles.bookDetail}>
        <div className={styles.bookSidebar}>
          <img
            className={styles.detailCover}
            src={cover.replace(/^http:/, 'https:')}
            alt=""
            width="667"
            height="1000"
          />
          <div className={styles.bookActions}>
            <button
              className={`${styles.bookAction} ${styles.favoriteButton} ${
                isFavorite ? styles.favoriteActive : ''
              }`}
              type="button"
              aria-pressed={isFavorite}
              onClick={() => toggleFavorite(id)}
            >
              <span
                className="material-symbols-outlined"
                aria-hidden="true"
              >
                {isFavorite ? 'favorite' : 'favorite_border'}
              </span>
              <span>
                {isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
              </span>
            </button>
            <a className={styles.bookAction} href="#resume">
              <span className="material-symbols-outlined" aria-hidden="true">
                menu_book
              </span>
              Lire le résumé
            </a>
          </div>
        </div>

        <div className={styles.bookInformation}>
          <nav className={styles.breadcrumb} aria-label="Fil d’Ariane">
            <ol>
              <li>
                <Link to="/">Bibliothèque</Link>
              </li>
              <li aria-current="page">{title}</li>
            </ol>
          </nav>

          <h1>{title}</h1>
          <p className={styles.detailAuthor}>{authors}</p>

          <dl className={styles.detailMetadata}>
            <div>
              <dt>
                <span className="material-symbols-outlined" aria-hidden="true">
                  calendar_today
                </span>
                <span className={styles.visuallyHidden}>
                  Première publication
                </span>
              </dt>
              <dd>
                <time dateTime={publishedDate}>{publishedDate}</time>
              </dd>
            </div>
            <div>
              <dt>
                <span className="material-symbols-outlined" aria-hidden="true">
                  translate
                </span>
                <span className={styles.visuallyHidden}>Langue</span>
              </dt>
              <dd>{language}</dd>
            </div>
            {volumeInfo.categories?.[0] && (
              <div>
                <dt>
                  <span
                    className="material-symbols-outlined"
                    aria-hidden="true"
                  >
                    auto_stories
                  </span>
                  <span className={styles.visuallyHidden}>Genre</span>
                </dt>
                <dd>{volumeInfo.categories[0]}</dd>
              </div>
            )}
          </dl>

          <section className={styles.bookSummary} id="resume">
            <h2 className={styles.visuallyHidden}>Résumé</h2>
            <p>{description}</p>
          </section>
        </div>
      </article>
    </main>
  )
}
