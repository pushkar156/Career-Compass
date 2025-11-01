'use client';

/**
 * @fileoverview Defines custom error types for Firebase interactions,
 * specifically for surfacing detailed security rule permission errors.
 */

export type SecurityRuleContext = {
  path: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  requestResourceData?: any;
};

/**
 * A custom error that encapsulates the full context of a Firestore
 * security rule denial. This is intended to be thrown on the client-side
 * during development to provide a rich, debuggable error message in the
 * Next.js error overlay.
 */
export class FirestorePermissionError extends Error {
  public readonly context: SecurityRuleContext;

  constructor(context: SecurityRuleContext) {
    const message = `FirestoreError: Missing or insufficient permissions: The following request was denied by Firestore Security Rules:\n${JSON.stringify(context, null, 2)}`;
    super(message);
    this.name = 'FirestorePermissionError';
    this.context = context;

    // This is to ensure the stack trace is captured correctly in V8.
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, FirestorePermissionError);
    }
  }
}
