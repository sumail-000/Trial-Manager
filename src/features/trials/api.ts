import type { TrialRecord } from "./types";

const fetchJson = async <T>(input: RequestInfo | URL): Promise<T> => {
  const response = await fetch(input, {
    credentials: "same-origin",
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json();
};

export const fetchTrials = async (): Promise<TrialRecord[]> => {
  const { data } = await fetchJson<{ data: TrialRecord[] }>("/api/trials");
  return data;
};

export const fetchTrialById = async (id: string): Promise<TrialRecord | null> => {
  const { data } = await fetchJson<{ data: TrialRecord }>(`/api/trials/${id}`);
  return data;
};

