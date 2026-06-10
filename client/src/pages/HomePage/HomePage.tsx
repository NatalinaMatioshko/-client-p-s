import { Link } from 'react-router-dom'
import { Container } from '../../components/layout/Container'
import './HomePage.css'

export function HomePage() {
  return (
    <main className="home">
      <section className="home-hero">
        <Container className="home-hero__inner">
          <p className="home-hero__kicker">Прозорість рішень місцевої влади</p>
          <h1 className="home-hero__title">Вітаємо</h1>
          <p className="home-hero__text">
            «Є рішення» допомагає знаходити та переглядати стратегії розвитку міст у
            зручному вигляді — з посиланням на документ і офіційне джерело.
          </p>
          <Link className="btn btn--primary" to="/search">
            Перейти до пошуку
          </Link>
        </Container>
      </section>

      <section id="about" className="home-section">
        <Container>
          <h2>Про сайт</h2>
          <p className="muted">
            Сервіс збирає стратегії та плани розвитку територіальних громад і областей.
            Дані завантажуються з бази через API.
          </p>
        </Container>
      </section>
    </main>
  )
}
