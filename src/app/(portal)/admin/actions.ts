'use server';

import { revalidatePath } from "next/cache";

import {
  deleteTrial,
  upsertTrial,
} from "@/features/trials/server/repository";

import type { TrialMutationInput } from "@/features/trials/types";

const revalidateTrialViews = () => {
  revalidatePath("/dashboard");
  revalidatePath("/trials");
};

export const createTrialAction = async (input: TrialMutationInput) => {
  const result = await upsertTrial(input);
  revalidateTrialViews();
  return result;
};

export const updateTrialAction = async (input: TrialMutationInput) => {
  const result = await upsertTrial(input);
  revalidateTrialViews();
  return result;
};

export const deleteTrialAction = async (trialId: string) => {
  await deleteTrial(trialId);
  revalidateTrialViews();
  return { ok: true };
};

export const syncTrialsAction = async () => {
  revalidateTrialViews();
  return { ok: true };
};

