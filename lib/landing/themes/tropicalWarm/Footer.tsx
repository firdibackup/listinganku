import type { ChromeProps } from '../index';

export function Footer({ project, agent }: ChromeProps) {
  const year = new Date().getFullYear();
  return (
    <footer className="lp-tw-footer">
      <div className="lp-tw-in">
        <div className="lp-tw-footer__name">{project.name}</div>
        {project.location ? <div style={{ marginTop: 4 }}>{project.location}</div> : null}

        <div className="lp-tw-footer__row">
          {agent.whatsapp ? <span>WhatsApp {agent.whatsapp}</span> : null}
          {agent.email ? <span>{agent.email}</span> : null}
        </div>

        <nav className="lp-tw-footer__links" aria-label="Navigasi footer">
          <a href="#unit">Tipe unit</a>
          <a href="#kontak">Kontak</a>
        </nav>

        <div className="lp-tw-footer__copy">
          © {year} {project.name}. Dipasarkan oleh {agent.fullName}.
        </div>
      </div>
    </footer>
  );
}
