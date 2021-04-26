import 'reflect-metadata';

export function prop_(_options?: unknown, _kind?: unknown): PropertyDecorator {
  return () => {
    // empty
  };
}

export function hash(_: string): string { throw Error(); }

export function pre<_T>(_method: unknown, _fn: unknown): PropertyDecorator {
  return () => {
    // empty
  };
}
