import type { ChromeProps } from '../index';

export function Header({ project }: ChromeProps) {
  return (
    <header className="lp-tw-header">
      <div>
        <div className="lp-tw-header__name">{project.name}</div>
        {project.location ? <div className="lp-tw-header__loc">{project.location}</div> : null}
      </div>
      <a href="#kontak" className="lp-tw-header__cta">Hubungi</a>
    </header>
  );
}
