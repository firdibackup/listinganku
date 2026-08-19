import { db } from '@/lib/data';
import { requireSessionUserId } from '@/lib/session';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { LeadFilters } from '@/components/leads/LeadFilters';
import { LeadsTable, type LeadRow } from '@/components/leads/LeadsTable';
import { isLeadStatus } from '@/components/leads/leadStatus';
import { computeLeadMetrics } from '@/lib/leads/metrics';
import { formatNumber, formatPercent } from '@/lib/format';

export const metadata = { title: 'Leads — Listingku' };

function deltaLabel(value: number): string {
  return `+${formatNumber(value)} / 7 HARI`;
}

export default async function LeadsPage({
  searchParams,
}: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const userId = await requireSessionUserId();
  const params = await searchParams;

  const [projects, allLeads, events] = await Promise.all([
    db.projects.list(userId),
    db.leads.listByUser(userId),
    db.events.listByUser(userId),
  ]);

  // Nama tipe rumah diselesaikan di server: tabel menampilkan nama, sementara
  // lead hanya menyimpan houseTypeId (blocks/leads menyimpan referensi, bukan salinan).
  const houseTypesPerProject = await Promise.all(projects.map((p) => db.houseTypes.listByProject(p.id)));
  const houseTypeName = new Map(houseTypesPerProject.flat().map((ht) => [ht.id, ht.name]));

  const rawStatus = typeof params.status === 'string' ? params.status : undefined;
  const rawProject = typeof params.project === 'string' ? params.project : undefined;
  // Nilai status asing diperlakukan sebagai "tanpa filter". Menyaringnya apa
  // adanya akan menghasilkan tabel kosong tanpa penjelasan saat URL salah ketik.
  const filters = {
    status: isLeadStatus(rawStatus) ? rawStatus : null,
    project: rawProject ?? null,
  };

  const filtered = allLeads.filter(
    (l) => (!filters.status || l.status === filters.status)
      && (!filters.project || l.projectId === filters.project),
  );

  const rows: LeadRow[] = filtered.map((lead) => ({
    ...lead,
    houseTypeName: lead.houseTypeId ? houseTypeName.get(lead.houseTypeId) ?? null : null,
  }));

  // Metrik dihitung dari SEMUA lead dan event milik agen, bukan dari hasil
  // saringan — kartu tren mengukur performa akun, bukan isi tabel di bawahnya.
  const metrics = computeLeadMetrics(events, new Date());

  return (
    <>
      <div className="leads__head">
        <div>
          <h1 className="lw-h2">Leads</h1>
          <p className="leads__sub">Prospek dari landing page Anda.</p>
        </div>
        <LeadFilters filters={filters} projects={projects} />
      </div>

      <div className="leads__metrics">
        <MetricCard label="Visitors" value={formatNumber(metrics.visitors)} delta={deltaLabel(metrics.deltas.visitors)} />
        <MetricCard label="Klik WhatsApp" value={formatNumber(metrics.whatsappClicks)} delta={deltaLabel(metrics.deltas.whatsappClicks)} />
        <MetricCard label="Form Masuk" value={formatNumber(metrics.formSubmits)} delta={deltaLabel(metrics.deltas.formSubmits)} />
        <MetricCard label="Conversion" value={formatPercent(metrics.conversionRate)} delta="VISITOR → LEAD" />
      </div>

      {rows.length === 0 ? (
        <div className="leads__empty">
          <p className="lw-label-lg">Belum ada lead</p>
          <p className="leads__sub">
            {allLeads.length === 0
              ? 'Prospek muncul di sini setelah pengunjung mengisi form atau menekan tombol WhatsApp di landing page Anda.'
              : 'Tidak ada lead yang cocok dengan filter ini.'}
          </p>
        </div>
      ) : (
        <LeadsTable leads={rows} />
      )}
    </>
  );
}
