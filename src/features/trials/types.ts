export type TrialStatus = "active" | "expiring" | "expired" | "cancelled";

export type TrialAlertSeverity = "info" | "warning" | "critical";

export interface TrialAlert {
  id: string;
  title: string;
  severity: TrialAlertSeverity;
  message: string;
  createdAt: string;
}

export interface TrialRecord {
  id: string;
  serviceName: string;      // Netflix, Spotify, AWS, etc.
  email: string;             // Email/account used for trial
  cardLast4: string;         // Last 4 digits of card (e.g., "4242")
  startedAt: string;         // When you started the trial
  expiresAt: string;         // When it will charge you
  status: TrialStatus;       // active, expiring, expired, cancelled
  cancelUrl?: string;        // Direct link to cancel subscription
  notifyDaysBefore: number;  // How many days before expiry to notify (default 3)
  category: string;          // streaming, cloud, productivity, etc.
  cost: number;              // How much it will charge if not cancelled
  notes?: string;            // Any notes (e.g., "remember to download playlist first")
  alerts: TrialAlert[];
}

export interface TrialMutationInput {
  id?: string;
  serviceName: string;
  email: string;
  cardLast4: string;
  startedAt: string;
  expiresAt: string;
  status?: TrialStatus;
  cancelUrl?: string;
  notifyDaysBefore: number;
  category: string;
  cost: number;
  notes?: string | null;
}

