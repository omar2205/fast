class ServerError extends Error {
  expose: boolean;
  init: ResponseInit;

  constructor(status: number, message?: string, init: ResponseInit = {}) {
    super(message ?? "Internal Server Error");
    this.init = { status, ...init };
    this.expose = status < 500;
  }
}

type CtxAssertFn = (
  expr: unknown,
  status?: number,
  message?: string,
  init?: ResponseInit,
) => asserts expr;

const assert: CtxAssertFn = (
  expr,
  status = 500,
  message = "Assertion failed",
  init,
) => {
  if (expr) return;
  throw new ServerError(status, message, init);
};

class State {
  // deno-lint-ignore no-explicit-any
  #state: Record<string, any> = {};
  get = <T>(key: string): T | null => this.#state[key] ?? null;
  set = <T>(key: string, value: T) => this.#state[key] = value;
}

export interface ContextInit {
  request: Request;
  params?: Record<string, string>;
}

export class Context {
  request: Request;
  params: Record<string, string>;
  #url?: URL;
  state = new State();
  assert: CtxAssertFn;

  constructor({ request, params }: ContextInit) {
    this.request = request;
    this.params = params ?? {};
    this.assert = assert;
  }

  // deno-fmt-ignore
  get url() { return this.#url ?? (this.#url = new URL(this.request.url)) }

  throw(
    status: number,
    message = "Internal Server Error",
    init: ResponseInit = {},
    // deno-fmt-ignore
  ) { throw new ServerError(status, message, init); }

  redirect(pathname: string, status = 302) {
    const { href } = new URL(pathname, this.request.url);
    const headers = { location: href };
    return new Response(null, { status, headers });
  }
}
