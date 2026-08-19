import { redirect } from 'next/navigation';
import { db } from '@/lib/data';
import { requireSessionUserId } from '@/lib/session';
import { SettingsTabs, isSettingsTab } from '@/components/settings/SettingsTabs';
import { AppearanceForm } from '@/components/settings/AppearanceForm';
import { ProfileForm } from '@/components/settings/ProfileForm';
import { GeneralForm } from '@/components/settings/GeneralForm';
import { ProfilePreview } from '@/components/settings/ProfilePreview';
import { formatPhoneDisplay } from '@/lib/phone';

export const metadata = { title: 'Pengaturan — Listingku' };

export default async function SettingsPage({
  searchParams,
}: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const userId = await requireSessionUserId();
  const agent = await db.agentProfile.get(userId);
  if (!agent) redirect('/login');

  const rawTab = typeof (await searchParams).tab === 'string' ? ((await searchParams).tab as string) : undefined;
  // Nilai tab asing jatuh ke Tampilan, bukan halaman kosong.
  const tab = isSettingsTab(rawTab) ? rawTab : 'tampilan';

  // `.data/store.json` yang ditulis sebelum field ini ada tidak memuatnya —
  // repairShape hanya memulihkan tabel level atas, bukan field per baris.
  const specialistArea = agent.specialistArea ?? '';
  const notifyOnLead = agent.notifyOnLead ?? true;

  return (
    <>
      <h1 className="lw-h2">Settings</h1>
      <p className="set__sub">Kelola situs profil dan preferensi akun.</p>

      <SettingsTabs active={tab} />

      <div className="set__layout">
        <div>
          {tab === 'tampilan' ? (
            <AppearanceForm theme={agent.theme} colorScheme={agent.colorScheme} siteName={agent.siteName} />
          ) : null}

          {tab === 'profil' ? (
            <ProfileForm
              about={agent.about}
              closings={agent.stats.closings}
              listings={agent.stats.listings}
              specialistArea={specialistArea}
              // Tersimpan kanonik ("6281..."); ditampilkan gaya nasional supaya
              // agen mengenali nomornya sendiri. phoneSchema menerima keduanya.
              whatsapp={formatPhoneDisplay(agent.whatsapp)}
            />
          ) : null}

          {tab === 'umum' ? (
            <GeneralForm
              email={agent.email}
              notifyOnLead={notifyOnLead}
              isPublished={agent.isPublished}
              subdomain={agent.subdomain}
            />
          ) : null}
        </div>

        <ProfilePreview
          siteName={agent.siteName}
          fullName={agent.fullName}
          theme={agent.theme}
          accent={agent.colorScheme}
        />
      </div>
    </>
  );
}
