# CaptionChain Setup Guide

## Pexels API Integration

To use real media content in your video generation, you need to set up the Pexels API:

### 1. Get a Pexels API Key

1. Go to [Pexels API](https://www.pexels.com/api/)
2. Sign up for a free account
3. Get your API key from the dashboard
4. The free tier includes 200 requests per hour

### 2. Add Environment Variable

Add your Pexels API key to your `.env` file:

```env
PEXELS_API_KEY="your-pexels-api-key-here"
```

### 3. Restart the Development Server

After adding the API key, restart your development server:

```bash
npm run dev
```

## Features Now Available

With Pexels integration, you can now:

### Video Generation
- Generate videos using real Pexels content
- AI analyzes your script and finds relevant videos/images
- Automatic media selection based on script content

### Video Editor
- Search for real videos from Pexels
- Add professional content to your timeline
- Edit video segments with real media
- Create professional video compositions

### Media Search
- Search for videos by keywords
- Browse high-quality stock footage
- Add media directly to your timeline
- Preview thumbnails before adding

## Usage

1. **Generate Video from Script:**
   - Write a script in the "Script to Video" tab
   - Click "Generate AI Video from Script"
   - AI will find relevant Pexels content and create a video

2. **Edit Video Timeline:**
   - Click the scissors icon on any video
   - Use the timeline editor to modify segments
   - Search for additional Pexels content
   - Add, remove, or reorder video segments

3. **Search for Media:**
   - In the video editor, use the search bar
   - Type keywords like "sunset", "ocean", "city"
   - Click on results to add them to your timeline

## API Limits

- **Free Tier:** 200 requests per hour
- **Paid Plans:** Available for higher limits
- **Rate Limiting:** Requests are automatically throttled

## Fallback Content

If the Pexels API is unavailable or rate-limited, the system will:
- Use sample videos for demonstration
- Show placeholder content
- Continue to function normally

## Next Steps

For production use, consider:
- Upgrading to a paid Pexels plan
- Implementing video processing with FFmpeg
- Adding cloud storage for generated videos
- Integrating with other media APIs (Unsplash, Pixabay) 