const apiUrl = 'https://www.googleapis.com/books/v1/volumes'

function getApiKey() {
  const apiKey = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY

  if (!apiKey) {
    throw new Error('La clé API Google Books est manquante.')
  }

  return apiKey
}

async function readResponse(response) {
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Livre introuvable.')
    }

    let apiMessage
    try {
      const data = await response.json()
      apiMessage = data.error?.message
    } catch (parseError) {
      if (!(parseError instanceof SyntaxError)) {
        throw parseError
      }
    }

    throw new Error(
      apiMessage
        ? `Google Books : ${apiMessage}`
        : `La requête Google Books a échoué (erreur ${response.status}).`,
    )
  }

  return response.json()
}

export async function searchBooks(query) {
  const params = new URLSearchParams({
    q: query,
    key: getApiKey(),
    maxResults: '12',
  })
  const response = await fetch(`${apiUrl}?${params}`)

  return readResponse(response)
}

export async function getBook(id) {
  const params = new URLSearchParams({ key: getApiKey() })
  const response = await fetch(
    `${apiUrl}/${encodeURIComponent(id)}?${params}`,
  )

  return readResponse(response)
}
