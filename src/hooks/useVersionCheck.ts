import { useEffect, useRef, useState } from 'react';

interface VersionInfo {
  buildTime: number;
  version: string;
}

export function useVersionCheck(options?: {
  checkInterval?: number; // in milliseconds, default 5 minutes
  onNewVersion?: () => void;
  autoReload?: boolean;
}) {
  const {
    checkInterval = 5 * 60 * 1000, // 5 minutes
    onNewVersion,
    autoReload = false,
  } = options || {};

  const [hasNewVersion, setHasNewVersion] = useState(false);
  const currentVersionRef = useRef<number | null>(null);
  const isFirstCheckRef = useRef(true);

  const checkVersion = async () => {
    try {
      // Add cache-busting query parameter
      const response = await fetch(`/version.json?t=${Date.now()}`, {
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });

      if (!response.ok) {
        console.warn('Failed to fetch version info');
        return;
      }

      const versionInfo: VersionInfo = await response.json();

      // Store the initial version on first check
      if (isFirstCheckRef.current) {
        currentVersionRef.current = versionInfo.buildTime;
        isFirstCheckRef.current = false;
        console.log('Initial version:', versionInfo.version);
        return;
      }

      // Check if version has changed
      if (
        currentVersionRef.current !== null &&
        versionInfo.buildTime !== currentVersionRef.current
      ) {
        console.log('New version detected:', versionInfo.version);
        setHasNewVersion(true);
        onNewVersion?.();

        if (autoReload) {
          console.log('Auto-reloading...');
          window.location.reload();
        }
      }
    } catch (error) {
      console.warn('Error checking version:', error);
    }
  };

  const reloadPage = () => {
    window.location.reload();
  };

  useEffect(() => {
    // Initial check
    checkVersion();

    // Set up periodic checks
    const interval = setInterval(checkVersion, checkInterval);

    return () => clearInterval(interval);
  }, [checkInterval]);

  return { hasNewVersion, reloadPage };
}
