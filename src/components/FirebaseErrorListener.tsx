'use client';

/**
 * @fileoverview A client-side component that listens for custom
 * 'permission-error' events and throws them to be caught by Next.js's
 * development error overlay. This is crucial for debugging security rules.
 */

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';

export function FirebaseErrorListener() {
  useEffect(() => {
    const handleError = (error: Error) => {
      // Throw the error so Next.js can catch it and display the overlay
      // in development. This provides a much better debugging experience
      // for security rule violations.
      throw error;
    };

    errorEmitter.on('permission-error', handleError);

    // No cleanup function is returned because the emitter should be active
    // for the entire lifecycle of the application.
  }, []);

  // This component renders nothing to the DOM.
  return null;
}
