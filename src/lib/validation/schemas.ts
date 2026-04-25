import { z } from "zod";

export const memberRoleEnum = z.enum(["owner", "editor", "viewer"]);
export const venueStatusEnum = z.enum([
  "researching",
  "contacted",
  "toured",
  "shortlisted",
  "rejected",
  "selected",
]);
export const preferredChannelEnum = z.enum(["email", "phone", "sms"]);
export const interactionTypeEnum = z.enum(["call", "email", "tour", "meeting", "note"]);
export const docKindEnum = z.enum(["brochure", "menu", "pricing", "contract", "floorplan", "other"]);
export const taskStatusEnum = z.enum(["open", "in_progress", "done"]);

const uuid = z.string().uuid();
const nullableTrimmedString = z.string().trim().max(5000).optional().nullable();

export const createVenueSchema = z
  .object({
    accountId: uuid,
    name: z.string().trim().min(1).max(200),
    city: z.string().trim().max(120).optional().nullable(),
    stateRegion: z.string().trim().max(120).optional().nullable(),
    address: z.string().trim().max(300).optional().nullable(),
    websiteUrl: z.string().url().optional().nullable(),
    capacityMin: z.number().int().min(0).optional().nullable(),
    capacityMax: z.number().int().min(0).optional().nullable(),
    priceEstimateMin: z.number().nonnegative().optional().nullable(),
    priceEstimateMax: z.number().nonnegative().optional().nullable(),
    status: venueStatusEnum.optional(),
    notes: nullableTrimmedString,
  })
  .refine(
    (v) => v.capacityMin == null || v.capacityMax == null || v.capacityMin <= v.capacityMax,
    { message: "capacityMin must be <= capacityMax", path: ["capacityMin"] },
  )
  .refine(
    (v) =>
      v.priceEstimateMin == null || v.priceEstimateMax == null || v.priceEstimateMin <= v.priceEstimateMax,
    { message: "priceEstimateMin must be <= priceEstimateMax", path: ["priceEstimateMin"] },
  );

const createVenueBaseSchema = z.object({
  name: z.string().trim().min(1).max(200),
  city: z.string().trim().max(120).optional().nullable(),
  stateRegion: z.string().trim().max(120).optional().nullable(),
  address: z.string().trim().max(300).optional().nullable(),
  websiteUrl: z.string().url().optional().nullable(),
  capacityMin: z.number().int().min(0).optional().nullable(),
  capacityMax: z.number().int().min(0).optional().nullable(),
  priceEstimateMin: z.number().nonnegative().optional().nullable(),
  priceEstimateMax: z.number().nonnegative().optional().nullable(),
  status: venueStatusEnum.optional(),
  notes: nullableTrimmedString,
});

export const updateVenueSchema = createVenueBaseSchema
  .partial()
  .refine(
    (v) => v.capacityMin == null || v.capacityMax == null || v.capacityMin <= v.capacityMax,
    { message: "capacityMin must be <= capacityMax", path: ["capacityMin"] },
  )
  .refine(
    (v) =>
      v.priceEstimateMin == null || v.priceEstimateMax == null || v.priceEstimateMin <= v.priceEstimateMax,
    { message: "priceEstimateMin must be <= priceEstimateMax", path: ["priceEstimateMin"] },
  );

export const upsertVenueScoresSchema = z.object({
  accountId: uuid,
  venueId: uuid,
  scores: z
    .array(
      z.object({
        factorId: uuid,
        score: z.number().int().min(1).max(10),
        rationale: nullableTrimmedString,
      }),
    )
    .min(1),
});

export const updateWeightsSchema = z.object({
  accountId: uuid,
  weights: z
    .array(
      z.object({
        factorId: uuid,
        weight: z.number().min(0),
      }),
    )
    .min(1),
});

export const createContactSchema = z.object({
  accountId: uuid,
  venueId: uuid,
  name: z.string().trim().min(1).max(200),
  role: z.string().trim().max(120).optional().nullable(),
  email: z.string().email().optional().nullable(),
  phone: z.string().trim().max(50).optional().nullable(),
  preferredChannel: preferredChannelEnum.optional().nullable(),
});

export const createInteractionSchema = z.object({
  accountId: uuid,
  venueId: uuid,
  interactionType: interactionTypeEnum,
  occurredAt: z.string().datetime(),
  summary: z.string().trim().min(1).max(5000),
  transcriptText: z.string().max(100000).optional().nullable(),
  nextAction: z.string().trim().max(1000).optional().nullable(),
});

export const createDocumentMetadataSchema = z.object({
  accountId: uuid,
  venueId: uuid,
  storagePath: z.string().min(1).max(500),
  fileName: z.string().min(1).max(255),
  fileType: z.string().min(1).max(120),
  sizeBytes: z.number().int().nonnegative(),
  docKind: docKindEnum.optional(),
});

export const createTaskSchema = z.object({
  accountId: uuid,
  venueId: uuid,
  title: z.string().trim().min(1).max(500),
  status: taskStatusEnum.optional(),
  dueAt: z.string().datetime().optional().nullable(),
  assignee: uuid.optional().nullable(),
});

export const updateTaskSchema = createTaskSchema.omit({ accountId: true, venueId: true }).partial();

export const listVenuesQuerySchema = z.object({
  search: z.string().trim().max(200).optional(),
  status: venueStatusEnum.optional(),
  city: z.string().trim().max(120).optional(),
  minScore: z.coerce.number().min(0).max(10).optional(),
  sort: z.enum(["score_desc", "price_asc", "price_desc", "updated_desc", "name_asc"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});
