// Appointments store the service slug; this turns it into the service's name and area
// of care using GET /api/admin/services. Older rows that stored the name still resolve.
import { useMemo } from 'react';
import { useAdminData } from '../../hooks/useApi';

interface AdminService { name: string; slug: string; category: string }

export function useServiceLookup() {
  const { data, loading } = useAdminData<AdminService[]>('services', []);

  return useMemo(() => {
    const byKey = new Map<string, AdminService>();
    for (const s of data) {
      byKey.set(s.slug, s);
      byKey.set(s.name, s);
    }
    return {
      loading,
      nameOf: (service: string) => byKey.get(service)?.name ?? service,
      categoryOf: (service: string) => byKey.get(service)?.category,
      // the areas of care in the order the services list them
      categories: [...new Set(data.map((s) => s.category).filter(Boolean))],
    };
  }, [data, loading]);
}

export type ServiceLookup = ReturnType<typeof useServiceLookup>;
