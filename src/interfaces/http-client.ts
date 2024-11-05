export type Method =
  | 'get'
  | 'GET'
  | 'delete'
  | 'DELETE'
  | 'head'
  | 'HEAD'
  | 'options'
  | 'OPTIONS'
  | 'post'
  | 'POST'
  | 'put'
  | 'PUT'
  | 'patch'
  | 'PATCH'
  | 'purge'
  | 'PURGE'
  | 'link'
  | 'LINK'
  | 'unlink'
  | 'UNLINK'

export class HttpClientHeaderList extends Map<
  string,
  string | ReadonlyArray<string> | number | boolean
> {}

export type HttpClientRequestRedirect = 'error' | 'follow' | 'manual'
export type HttpClientHeaders =
  | string[][]
  | Record<string, string | ReadonlyArray<string> | number | boolean>
  | HttpClientHeaderList

export type HttpClientBody =
  | ArrayBuffer
  | AsyncIterable<Uint8Array>
  | Blob
  | FormData
  | Iterable<Uint8Array>
  | NodeJS.ArrayBufferView
  | URLSearchParams
  | null
  | string

export type HttpClientRequestCredentials = 'omit' | 'include' | 'same-origin'
export type HttpClientRequestMode =
  | 'cors'
  | 'navigate'
  | 'no-cors'
  | 'same-origin'
export type HttpClientReferrerPolicy =
  | ''
  | 'no-referrer'
  | 'no-referrer-when-downgrade'
  | 'origin'
  | 'origin-when-cross-origin'
  | 'same-origin'
  | 'strict-origin'
  | 'strict-origin-when-cross-origin'
  | 'unsafe-url'

export type HttpClientRequestDuplex = 'half'

export interface HttpClientRequestOptions {
  method?: string
  keepalive?: boolean
  headers?: HttpClientHeaders
  body?: HttpClientBody
  redirect?: HttpClientRequestRedirect
  integrity?: string
  signal?: AbortSignal
  credentials?: HttpClientRequestCredentials
  mode?: HttpClientRequestMode
  referrer?: string
  referrerPolicy?: HttpClientReferrerPolicy
  window?: null
  allowUnauthorizedSsl?: boolean
  duplex?: HttpClientRequestDuplex
  keepAlive?: boolean
}

export type HttpClientResponseType =
  | 'basic'
  | 'cors'
  | 'default'
  | 'error'
  | 'opaque'
  | 'opaqueredirect'
