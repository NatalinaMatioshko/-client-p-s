import { Link, NavLink } from "react-router-dom";
import { Container } from "./Container";

export function Header() {
  return (
    <header className="site-header">
      <Container className="site-header__inner">
        <Link className="brand" to="/">
          Є <span>рішення</span>
        </Link>
        <nav className="site-nav" aria-label="Головна навігація">
          <NavLink className="site-nav__link" to="/" end>
            Головна
          </NavLink>
          <NavLink className="site-nav__link" to="/search">
            Пошук
          </NavLink>
          <NavLink className="site-nav__link" to="/upload">
            Завантаження
          </NavLink>
          <NavLink className="site-nav__link" to="/admin">
            Адмін-панель
          </NavLink>
        </nav>
      </Container>
    </header>
  );
}
