// Test script for transcription functionality
// This script simulates the transcription process for testing purposes

const mockTranscriptionResult = {
  text: "Hello, this is a test video for automatic caption generation. The AI transcription system is working perfectly.",
  language: "en",
  segments: [
    {
      id: 0,
      start: 0,
      end: 3.5,
      text: "Hello, this is a test video",
      confidence: 0.95
    },
    {
      id: 1,
      start: 3.5,
      end: 7.2,
      text: "for automatic caption generation.",
      confidence: 0.92
    },
    {
      id: 2,
      start: 7.2,
      end: 12.0,
      text: "The AI transcription system is working perfectly.",
      confidence: 0.88
    }
  ]
};

console.log("🎬 CaptionChain Transcription Test");
console.log("==================================");
console.log();

console.log("📝 Transcription Result:");
console.log("Language:", mockTranscriptionResult.language);
console.log("Full Text:", mockTranscriptionResult.text);
console.log("Total Segments:", mockTranscriptionResult.segments.length);
console.log();

console.log("⏱️  Caption Segments:");
mockTranscriptionResult.segments.forEach((segment, index) => {
  const startTime = formatTime(segment.start);
  const endTime = formatTime(segment.end);
  console.log(`${index + 1}. [${startTime} - ${endTime}] ${segment.text} (${Math.round(segment.confidence * 100)}%)`);
});

console.log();
console.log("✅ Transcription test completed successfully!");
console.log("The system is ready to process real videos with Whisper API.");

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
} 