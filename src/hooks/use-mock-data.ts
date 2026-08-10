import { useCallback, useEffect, useState } from "react";

import { fetchMock } from "@/lib/mock-data";

/**
 * Hook temporário que simula um fetch assíncrono para exercitar
 * skeletons, erros e estados vazios. Trocar por useQuery + backend.
 */
export function useMockData<T>(data: T, delay = 600) {
  const [state, setState] = useState<{ data: T | null; loading: boolean; error: boolean }>({
    data: null,
    loading: true,
    error: false,
  });
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    let active = true;
    setState({ data: null, loading: true, error: false });
    fetchMock(data, delay)
      .then((result) => active && setState({ data: result, loading: false, error: false }))
      .catch(() => active && setState({ data: null, loading: false, error: true }));
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nonce]);

  const retry = useCallback(() => setNonce((n) => n + 1), []);
  return { ...state, retry };
}
