/**
 * Pratinjau situs profil agen. Situsnya sendiri ({subdomain}.listingku.app)
 * belum dibangun, jadi ini sengaja skematik seperti di file design — bukan
 * pratinjau live seperti editor landing page, yang memang punya renderer nyata.
 */
export function ProfilePreview({
  siteName, fullName, theme, accent,
}: { siteName: string; fullName: string; theme: string; accent: string }) {
  const accentVar = accent === 'Hijau' ? 'var(--leaf)' : accent === 'Hitam' ? 'var(--evergreen)' : 'var(--orange)';

  return (
    <aside className="set__preview">
      <p className="set__previewhead">PREVIEW · {theme}</p>
      <div className="set__previewbody">
        <div className="set__previewtop">
          <span className="set__previewname">{siteName}</span>
          <span className="set__previewbtn" style={{ background: accentVar }}>WhatsApp</span>
        </div>
        <div className="set__previewavatar" aria-hidden="true" />
        <p className="set__previewagent">{fullName}</p>
        <p className="set__previewsub">Agen properti {siteName}</p>
        <span className="set__previewcta" style={{ background: accentVar }}>Lihat Listing</span>
        <div className="set__previewgrid" aria-hidden="true">
          <span /><span />
        </div>
      </div>
    </aside>
  );
}
