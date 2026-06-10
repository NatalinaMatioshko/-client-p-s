import { Link } from 'react-router-dom'
import { Container } from '../../components/layout/Container'
import './NotFoundPage.css'

export default function NotFoundPage() {
  return (
    <main className="not-found-page">
      <Container>
        <h1>404 – Сторінка не знайдена</h1>
        <p className="muted">
          Вибачте, сторінка, яку ви шукаєте, не існує.
        </p>
        <Link className="btn btn--primary" to="/">
          Повернутися на головну
        </Link>
      </Container>
    </main>
  )
}
