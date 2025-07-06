import { useEffect, useState } from 'react';

/**
 * Custom hook to determine if the component is running on the client side.
 * This helps prevent hydration mismatches by ensuring certain operations
 * only run after the initial render on the client.
 */
export function useIsClient() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient;
}
