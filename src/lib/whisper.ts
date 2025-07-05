import OpenAI from 'openai'
import { prisma } from './prisma'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface TranscriptionResult {
  text: string
  language: string
  segments: TranscriptionSegment[]
}

export interface TranscriptionSegment {
  id: number
  start: number
  end: number
  text: string
  confidence?: number
}

export class WhisperService {
  /**
   * Transcribe a video file using OpenAI Whisper API
   */
  static async transcribeVideo(
    videoId: string,
    audioUrl: string,
    language?: string
  ): Promise<TranscriptionResult> {
    try {
      // Update video status to TRANSCRIBING
      await prisma.video.update({
        where: { id: videoId },
        data: { status: 'TRANSCRIBING' }
      })

      // Call Whisper API for transcription
      const transcription = await openai.audio.transcriptions.create({
        file: audioUrl as any, // This will be a file stream in production
        model: 'whisper-1',
        language: language || undefined,
        response_format: 'verbose_json',
        timestamp_granularities: ['word', 'segment']
      })

      // Parse the response
      const result: TranscriptionResult = {
        text: transcription.text,
        language: transcription.language || 'en',
        segments: transcription.segments?.map((segment, index) => ({
          id: index,
          start: segment.start,
          end: segment.end,
          text: segment.text,
          confidence: segment.avg_logprob
        })) || []
      }

      // Save captions to database
      await this.saveCaptions(videoId, result)

      // Update video status to READY
      await prisma.video.update({
        where: { id: videoId },
        data: { 
          status: 'READY',
          duration: result.segments.length > 0 ? result.segments[result.segments.length - 1].end : 0
        }
      })

      return result
    } catch (error) {
      console.error('Transcription error:', error)
      
      // Update video status to ERROR
      await prisma.video.update({
        where: { id: videoId },
        data: { status: 'ERROR' }
      })

      throw error
    }
  }

  /**
   * Save transcription segments as captions in the database
   */
  private static async saveCaptions(
    videoId: string,
    transcription: TranscriptionResult
  ): Promise<void> {
    // Delete existing captions for this video
    await prisma.caption.deleteMany({
      where: { videoId }
    })

    // Insert new captions
    const captions = transcription.segments.map(segment => ({
      text: segment.text.trim(),
      startTime: segment.start,
      endTime: segment.end,
      language: transcription.language,
      videoId
    }))

    await prisma.caption.createMany({
      data: captions
    })
  }

  /**
   * Get supported languages for transcription
   */
  static getSupportedLanguages() {
    return [
      { code: 'en', name: 'English' },
      { code: 'es', name: 'Spanish' },
      { code: 'fr', name: 'French' },
      { code: 'de', name: 'German' },
      { code: 'it', name: 'Italian' },
      { code: 'pt', name: 'Portuguese' },
      { code: 'ru', name: 'Russian' },
      { code: 'ja', name: 'Japanese' },
      { code: 'ko', name: 'Korean' },
      { code: 'zh', name: 'Chinese' },
      { code: 'ar', name: 'Arabic' },
      { code: 'hi', name: 'Hindi' },
      { code: 'nl', name: 'Dutch' },
      { code: 'sv', name: 'Swedish' },
      { code: 'no', name: 'Norwegian' },
      { code: 'da', name: 'Danish' },
      { code: 'fi', name: 'Finnish' },
      { code: 'pl', name: 'Polish' },
      { code: 'tr', name: 'Turkish' },
      { code: 'he', name: 'Hebrew' },
      { code: 'th', name: 'Thai' },
      { code: 'vi', name: 'Vietnamese' },
      { code: 'id', name: 'Indonesian' },
      { code: 'ms', name: 'Malay' },
      { code: 'auto', name: 'Auto-detect' }
    ]
  }

  /**
   * Estimate transcription cost based on video duration
   */
  static estimateCost(durationSeconds: number): number {
    // Whisper API pricing: $0.006 per minute
    const minutes = durationSeconds / 60
    return minutes * 0.006
  }
} 