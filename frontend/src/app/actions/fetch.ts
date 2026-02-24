"use server";

import { headers } from "next/headers";

/**
 * Server Action はサーバー側で実行されるため、fetch() には絶対URLが必要。
 * NEXT_PUBLIC_API_BASE_URL が相対パス（/api 等）の場合は絶対URLのフォールバックを使用。
 */
const DEFAULT_SERVER_API_URL = "http://localhost/api";

const getBaseUrl = (): string => {
  const url = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (url && (url.startsWith("http://") || url.startsWith("https://"))) {
    return url;
  }
  return DEFAULT_SERVER_API_URL;
};

const BASE_URL = getBaseUrl();

type GetFetchArgs = {
  path: string;
  tagName: string;
  cacheType?: RequestCache;
};

export const getFetch = async ({ path, tagName, cacheType }: GetFetchArgs) => {
  const header = await headers();
  const base_url = await getBaseUrl();
  return fetch(`${base_url}/${path}`, {
    headers: new Headers(header),
    next: { tags: [tagName] },
    cache: cacheType,
  });
};

type PostFetchArgs = {
  path: string;
  body: Record<string, unknown>;
  token?: string;
};

export const postFetch = async ({ path, body, token }: PostFetchArgs) => {
  const request_headers = new Headers({
    "Content-Type": "application/json",
  });
  if (token) {
    request_headers.set("Authorization", `Bearer ${token}`);
  }
  const base_url = await getBaseUrl();
  return fetch(`${base_url}/${path}`, {
    method: "POST",
    headers: request_headers,
    body: JSON.stringify(body),
  });
};

type PutFetchArgs = {
  path: string;
  body: Record<string, unknown>;
};

export const putFetch = async ({ path, body }: PutFetchArgs) => {
  const base_url = await getBaseUrl();
  return fetch(`${base_url}/${path}`, {
    method: "PUT",
    headers: new Headers({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(body),
  });
};

type GetFetchForPathArgs = {
  path: string;
};

export const getFetchForPath = async ({ path }: GetFetchForPathArgs) => {
  const base_url = await getBaseUrl();
  return fetch(`${base_url}/${path}`, {
    method: "GET",
    headers: new Headers({
      "Content-Type": "application/json",
    }),
  });
};

type GetFetchWithAuthArgs = {
  path: string;
  token: string;
};

export const getFetchWithAuth = async ({
  path,
  token,
}: GetFetchWithAuthArgs) => {
  const base_url = await getBaseUrl();
  return fetch(`${base_url}/${path}`, {
    method: "GET",
    headers: new Headers({
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    }),
  });
};

type DeleteFetchArgs = {
  path: string;
};

export const deleteFetch = async ({ path }: DeleteFetchArgs) => {
  const base_url = await getBaseUrl();
  return fetch(`${base_url}/${path}`, {
    method: "DELETE",
    headers: new Headers({
      "Content-Type": "application/json",
    }),
  });
};

type DeleteFetchWithAuthArgs = {
  path: string;
  token: string;
};

export const deleteFetchWithAuth = async ({
  path,
  token,
}: DeleteFetchWithAuthArgs) => {
  const base_url = await getBaseUrl();
  return fetch(`${base_url}/${path}`, {
    method: "DELETE",
    headers: new Headers({
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    }),
  });
};
