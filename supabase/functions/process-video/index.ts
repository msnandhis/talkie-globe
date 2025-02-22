
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import OpenAI from 'https://esm.sh/openai@4.20.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { videoId, targetLanguage } = await req.json()
    
    if (!videoId || !targetLanguage) {
      throw new Error('Video ID and target language are required')
    }

    console.log('Processing video:', videoId, 'to language:', targetLanguage)

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get video details
    const { data: video, error: videoError } = await supabase
      .from('videos')
      .select('*')
      .eq('id', videoId)
      .single()

    if (videoError || !video) {
      throw new Error('Video not found')
    }

    console.log('Found video:', video.title)

    // Update status to processing
    await supabase
      .from('videos')
      .update({ status: 'processing' })
      .eq('id', videoId)

    // Download video content
    console.log('Downloading video from:', video.stored_url)
    const videoResponse = await fetch(video.stored_url)
    if (!videoResponse.ok) {
      throw new Error('Failed to fetch video content')
    }

    const videoBlob = await videoResponse.blob()
    const videoFile = new File([videoBlob], 'video.mp4', { type: videoBlob.type })
    
    // Start dubbing with ElevenLabs
    const formData = new FormData()
    formData.append('file', videoFile)
    formData.append('target_lang', targetLanguage)
    formData.append('source_lang', video.original_language || 'auto')
    formData.append('num_speakers', '0')
    formData.append('watermark', 'true')
    formData.append('highest_resolution', 'true')
    formData.append('name', `Translation_${video.title || 'Untitled'}_${targetLanguage}`)

    console.log('Starting ElevenLabs dubbing...')
    const dubbingResponse = await fetch('https://api.elevenlabs.io/v1/dubbing', {
      method: 'POST',
      headers: {
        'xi-api-key': Deno.env.get('ELEVEN_LABS_API_KEY') ?? '',
        'Accept': 'application/json',
      },
      body: formData,
    })

    if (!dubbingResponse.ok) {
      const errorData = await dubbingResponse.text()
      console.error('ElevenLabs error:', errorData)
      throw new Error(`Failed to start dubbing: ${errorData}`)
    }

    const dubbingResult = await dubbingResponse.json()
    console.log('Dubbing started with ID:', dubbingResult.dubbing_id)

    // Poll for dubbing completion
    let dubbingComplete = false
    let translatedUrl = null
    let attempts = 0
    const maxAttempts = 60

    while (!dubbingComplete && attempts < maxAttempts) {
      console.log(`Checking dubbing status (attempt ${attempts + 1})...`)
      
      const statusResponse = await fetch(`https://api.elevenlabs.io/v1/dubbing/${dubbingResult.dubbing_id}`, {
        headers: {
          'xi-api-key': Deno.env.get('ELEVEN_LABS_API_KEY') ?? '',
          'Accept': 'application/json',
        },
      })

      if (!statusResponse.ok) {
        const errorText = await statusResponse.text()
        console.error('Status check error:', errorText)
        throw new Error(`Failed to check dubbing status: ${errorText}`)
      }

      const status = await statusResponse.json()
      console.log('Dubbing status:', status.status)

      if (status.status === 'done') {
        dubbingComplete = true
        translatedUrl = status.audio_url
        console.log('Dubbing completed. Audio URL:', translatedUrl)
      } else if (status.status === 'failed') {
        throw new Error(`Dubbing failed: ${status.error || 'Unknown error'}`)
      }

      if (!dubbingComplete) {
        await new Promise(resolve => setTimeout(resolve, 5000))
        attempts++
      }
    }

    if (!dubbingComplete) {
      throw new Error('Dubbing timed out after 5 minutes')
    }

    // Download and store translated audio
    console.log('Downloading translated audio...')
    const audioResponse = await fetch(translatedUrl)
    if (!audioResponse.ok) {
      throw new Error('Failed to fetch translated audio')
    }

    const audioBlob = await audioResponse.blob()
    const audioPath = `${videoId}/${crypto.randomUUID()}.mp3`

    console.log('Storing translated audio in Supabase...')
    const { error: audioUploadError } = await supabase
      .storage
      .from('translations')
      .upload(audioPath, audioBlob, {
        contentType: 'audio/mpeg',
        cacheControl: '3600'
      })

    if (audioUploadError) {
      console.error('Audio upload error:', audioUploadError)
      throw new Error('Failed to store translated audio')
    }

    const { data: { publicUrl: storedAudioUrl } } = supabase
      .storage
      .from('translations')
      .getPublicUrl(audioPath)

    // Generate summary
    console.log('Generating summary...')
    const openai = new OpenAI({
      apiKey: Deno.env.get('OPENAI_API_KEY'),
    })

    const summaryResponse = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a helpful assistant that creates concise video summaries in ${targetLanguage}. Focus on key points and main ideas.`
        },
        {
          role: "user",
          content: `Please provide a summary of this video in ${targetLanguage}. The video is about: ${video.title}`
        }
      ],
    })

    const summary = summaryResponse.choices[0].message.content

    // Update video record
    console.log('Updating video record...')
    const { error: updateError } = await supabase
      .from('videos')
      .update({
        status: 'completed',
        summary,
        translated_url: storedAudioUrl,
        target_language: targetLanguage
      })
      .eq('id', videoId)

    if (updateError) {
      console.error('Update error:', updateError)
      throw updateError
    }

    return new Response(
      JSON.stringify({
        message: 'Video processed successfully',
        video: {
          summary,
          translated_url: storedAudioUrl
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Processing error:', error)
    
    // Update video status to failed
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )
    
    try {
      await supabase
        .from('videos')
        .update({ status: 'failed' })
        .eq('id', (await req.json()).videoId)
    } catch (updateError) {
      console.error('Failed to update video status:', updateError)
    }

    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
