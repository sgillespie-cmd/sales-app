import { z } from "zod";
import {
  createContactSchema,
  createDocumentMetadataSchema,
  createInteractionSchema,
  createTaskSchema,
  createVenueSchema,
  listVenuesQuerySchema,
  updateTaskSchema,
  updateVenueSchema,
  updateWeightsSchema,
  upsertVenueScoresSchema,
  venueStatusEnum,
} from "@/lib/validation/schemas";

export type CreateVenueInput = z.infer<typeof createVenueSchema>;
export type UpdateVenueInput = z.infer<typeof updateVenueSchema>;
export type UpsertVenueScoresInput = z.infer<typeof upsertVenueScoresSchema>;
export type UpdateWeightsInput = z.infer<typeof updateWeightsSchema>;
export type CreateContactInput = z.infer<typeof createContactSchema>;
export type CreateInteractionInput = z.infer<typeof createInteractionSchema>;
export type CreateDocumentMetadataInput = z.infer<typeof createDocumentMetadataSchema>;
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type ListVenuesQuery = z.infer<typeof listVenuesQuerySchema>;

export type VenueStatus = z.infer<typeof venueStatusEnum>;

export interface Venue {
  id: string;
  accountId: string;
  name: string;
  city: string | null;
  stateRegion: string | null;
  address: string | null;
  websiteUrl: string | null;
  capacityMin: number | null;
  capacityMax: number | null;
  priceEstimateMin: number | null;
  priceEstimateMax: number | null;
  status: VenueStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface VenueListItem extends Venue {
  weightedScore: number | null;
  completenessPct: number;
  scoredFactorCount: number;
  activeFactorCount: number;
}

export interface ApiErrorShape {
  code: string;
  message: string;
  details?: unknown;
}

export type ApiSuccess<T> = { data: T; error: null };
export type ApiFailure = { data: null; error: ApiErrorShape };
export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;
