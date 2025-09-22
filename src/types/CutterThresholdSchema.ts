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

// 対象となるフィルタリングの値
/**
 * comment: 'チャットワード',
 *  access: 'ユーザーの役職',
 * gift: 'ギフト',
 *  count: 'チャット数',
 * service: '配信プラットフォーム',
 * userId: 'ユーザーID',
 * username: 'ユーザー名',
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
  comment: z.array(z.string()).catch([]),
  access: z.array(AccessConditionSchema).catch([]),
  gift: z.array(GiftConditionSchema).catch([]),
  count: CountConditionSchema.catch(CountConditionSchema.parse({})),
  userId: z.array(z.string()).catch([]),
  username: z.array(z.string()).catch([]),
})
export type CutterThresholdType = z.infer<typeof CutterThresholdSchema>
