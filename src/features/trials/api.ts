import { MOCK_TRIALS } from "./data/mockTrials";
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
  try {
    const { data } = await fetchJson<{ data: TrialRecord[] }>("/api/trials");
    return data;
  } catch (error) {
    console.warn("Falling back to mock trials", error);
    return MOCK_TRIALS;
  }
};

export const fetchTrialById = async (id: string): Promise<TrialRecord | null> => {
  try {
    const { data } = await fetchJson<{ data: TrialRecord }>(`/api/trials/${id}`);
    return data;
  } catch (error) {
    console.warn("Falling back to mock trial", error);
    return MOCK_TRIALS.find((trial) => trial.id === id) ?? null;
  }
};

