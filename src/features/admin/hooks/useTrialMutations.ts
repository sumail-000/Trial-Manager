"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  createTrialAction,
  deleteTrialAction,
  syncTrialsAction,
} from "@/app/(portal)/admin/actions";
import { TRIALS_QUERY_KEY } from "@/features/trials/hooks/useTrials";
import type { TrialMutationInput } from "@/features/trials/types";

export const useTrialMutations = () => {
  const queryClient = useQueryClient();

  const createTrial = useMutation({
    mutationFn: (input: TrialMutationInput) => createTrialAction(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRIALS_QUERY_KEY });
    },
  });

  const deleteTrial = useMutation({
    mutationFn: (trialId: string) => deleteTrialAction(trialId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRIALS_QUERY_KEY });
    },
  });

  const syncTrials = useMutation({
    mutationFn: () => syncTrialsAction(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRIALS_QUERY_KEY });
    },
  });

  return {
    createTrial,
    deleteTrial,
    syncTrials,
  };
};

