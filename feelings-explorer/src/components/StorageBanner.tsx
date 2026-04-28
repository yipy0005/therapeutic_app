import React, { useState } from 'react';
import { isStorageAvailable } from '../storage/adapter';

/**
 * Non-blocking banner shown when localStorage is unavailable.
 * Dismissible by the user.
 */
export function StorageBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || isStorageAvailable()) {
    return null;
  }

  return (
    <div
      role="alert"
      style={{
        background: '#fff3cd',
        borderBottom: '1px solid #ffc107',
        padding: '8px 16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '14px',
      }}
    >
      <span>Your progress won't be saved on this device</span>
      <button
        onClick={() => setDismissed(true)}
        aria-label="Dismiss"
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: '16px',
          padding: '0 4px',
        }}
      >
        ×
      </button>
    </div>
  );
}
