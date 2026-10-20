import styles from './BookCard.module.css'
import { Link } from 'react-router'

export default function BookCard({ book }) {
  return (
    <li>
      <Link className={styles.bookCard} to={`/books/${book.id}`}>
        <img className={styles.bookCover} src={book.cover} alt="" />
        <div className={styles.bookContent}>
          <h3 className={styles.bookTitle}>{book.title}</h3>
          <p className={styles.bookMeta}>
            <span className={styles.bookAuthor}>
              {book.authors.join(', ')}
            </span>
            <time dateTime={book.publishedDate}>{book.publishedDate}</time>
          </p>
        </div>
      </Link>
    </li>
  )
}