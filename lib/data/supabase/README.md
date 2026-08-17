# Implementasi Supabase (belum diisi)

Saat integrasi backend dimulai, buat `index.ts` di direktori ini yang mengekspor
`createSupabaseStore(): DataStore` — memenuhi kontrak yang sama persis di
`lib/data/repo.ts` — lalu tambahkan cabangnya di `lib/data/index.ts`
(`DATA_DRIVER=supabase`). Komponen UI tidak perlu disentuh.

Yang perlu diperhatikan saat itu:
- Policy `select` publik hanya boleh memaparkan baris `status = 'published'`.
- `media.url` berpindah dari `/uploads/...` ke URL bucket Storage.
- Setiap perubahan skema wajib disertai peninjauan policy RLS.
