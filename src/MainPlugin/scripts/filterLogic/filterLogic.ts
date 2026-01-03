// src\MainPlugin\scripts\filterLogic\filterLogic.ts
import { checkAllConditions } from '@shared/utils/threshold/ThresholdChecker'
import { ConsolePost } from '@shared/sdk/postMessage/ConsolePost'
import { Comment } from '@onecomme.com/onesdk/types/Comment'
import { ElectronStoreManager } from '../../store/ElectronStoreManager'

export async function handleFilterComment(comment: Comment): Promise<Comment | false> {
  try {
    // info/errorであれば必ずcommentを返す
    if (comment.id === 'COMMENT_TESTER' && comment.data.name === 'info') return comment
    if (comment.id === 'COMMENT_TESTER' && comment.data.name === 'error') return comment

    const esm = ElectronStoreManager.getInstance()
    const currentPreset = esm.currentPreset()
    if (!currentPreset) return comment

    const { threshold, isBlacklist, isFilterSpeech } = currentPreset

    // 条件がなければスルー
    if (!threshold || threshold.conditions.length === 0) return comment

    const isMatched = checkAllConditions(comment, threshold)
    console.info(threshold, `test:${isMatched ? '弾かれたよ' : '通ったよ'}`)

    // スピーチ部分だけ消す処理をまとめる
    const clearSpeech = (): Comment => {
      comment.data.speechText = ''
      return comment
    }

    // ブラックリスト方式
    if (isBlacklist) {
      if (isFilterSpeech && isMatched) return clearSpeech()
      return isMatched ? false : comment
    }

    // ホワイトリスト方式
    if (isFilterSpeech && !isMatched) return clearSpeech()
    return isMatched ? comment : false
  } catch (error) {
    console.error('Filter comment error:', error)
    ConsolePost('error', `フィルタリングエラー: ${error}`)
    return comment
  }
}
