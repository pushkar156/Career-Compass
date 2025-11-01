/**
 * @fileoverview A simple, centralized event emitter for handling specific
 * application-wide events, such as custom Firebase errors.
 */

type Listener<T> = (payload: T) => void;

class Emitter<Events extends Record<string, unknown>> {
  private listeners: { [K in keyof Events]?: Listener<Events[K]>[] } = {};

  on<K extends keyof Events>(event: K, listener: Listener<Events[K]>): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event]!.push(listener);
  }

  emit<K extends keyof Events>(event: K, payload: Events[K]): void {
    if (this.listeners[event]) {
      this.listeners[event]!.forEach(l => l(payload));
    }
  }
}

// Define the events and their payload types
interface AppEvents {
  'permission-error': Error;
}

// Export a singleton instance of the emitter
export const errorEmitter = new Emitter<AppEvents>();
