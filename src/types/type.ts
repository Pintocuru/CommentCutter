// src/type.ts
import { z } from 'zod'
import { BaseSchema } from '@shared/types/'
import { CutterThresholdSchema } from './CutterThresholdSchema'

/**
 * preset data
 */
export const PresetSchema = z.object({
  ...BaseSchema.shape,
  threshold: CutterThresholdSchema.default(
    CutterThresholdSchema.parse({
      conditions: ['comment'],
      comment: ['おみくじ'],
    })
  ).catch(CutterThresholdSchema.parse({})), // コメント発火条件
})

/**
 * コメントカッタープラグインの全体の型
 */
export const DataSchema = z.object({
  target: z.string().default('omikuji').catch('omikuji'), // 使用するプリセットkey
  presets: z.array(PresetSchema).catch([]),
})

export type DataSchemaType = z.infer<typeof DataSchema>
export type PresetType = z.infer<typeof PresetSchema>
