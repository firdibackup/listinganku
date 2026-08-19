import type { ChromeProps } from '../index';

export function Footer({ project, agent }: ChromeProps) {
  const year = new Date().getFullYear();
  const contact = [agent.whatsapp, agent.email].filter(Boolean).join(' · ');
  return (
    <footer className="lp-tw-footer">
      <div className="lp-tw-in">
        <div className="lp-tw-footer__name">{project.name}</div>
        <div className="lp-tw-footer__addr">
          {project.location ? <>{project.location}<br /></> : null}
          Dipasarkan oleh {agent.fullName}
          {contact ? <><br />{contact}</> : null}
        </div>
        <nav className="lp-tw-footer__links" aria-label="Navigasi footer">
          <a href="#unit">Tipe Unit</a>
          <a href="#kontak">Kontak</a>
        </nav>
        <div className="lp-tw-footer__copy">© {year} {project.name}</div>
      </div>
    </footer>
  );
}
