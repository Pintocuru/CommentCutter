// src\types\CutterThresholdSchema.ts
import { z } from 'zod'
import {
  AccessConditionSchema,
  CountConditionSchema,
  GiftConditionSchema,
  thresholdConditionDescriptions,
  thresholdConditionLabels,
} from '@shared/types/Threshold/'

/**
 * コメントカッタープラグイン用Threshold
 */
export const CutterThresholdCondition = ['comment', 'access', 'gift', 'count', 'userId', 'username'] as const
export type CutterThresholdCondition = (typeof CutterThresholdCondition)[number]

export const CutterThresholdConditionLabels = Object.fromEntries(
  CutterThresholdCondition.map((key) => [key, thresholdConditionLabels[key]])
) as Record<CutterThresholdCondition, string>

export const CutterThresholdConditionDescriptions = Object.fromEntries(
  CutterThresholdCondition.map((key) => [key, thresholdConditionDescriptions[key]])
) as Record<CutterThresholdCondition, string>

export const CutterThresholdConditionSchema = z.enum(CutterThresholdCondition).default('comment').catch('comment')

export const CutterThresholdSchema = z.object({
  conditions: z.array(CutterThresholdConditionSchema).catch([]),
  comment: z.array(z.string()).catch([]).optional(),
  access: z.array(AccessConditionSchema).catch([]).optional(),
  gift: z.array(GiftConditionSchema).catch([]).optional(),
  count: CountConditionSchema.catch(CountConditionSchema.parse({})).optional(),
  userId: z.array(z.string()).catch([]).optional(),
  username: z.array(z.string()).catch([]).optional(),
})

export type CutterThresholdType = z.infer<typeof CutterThresholdSchema>
