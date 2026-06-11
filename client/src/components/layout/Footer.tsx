import { Container } from "./Container";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <Container className="site-footer__inner">
        <p>© {year} Є рішення</p>
      </Container>
    </footer>
  );
}
