
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

    // Update status to processing
    await supabase
      .from('videos')
      .update({ status: 'processing' })
      .eq('id', videoId)

    // 1. Start dubbing with ElevenLabs
    const formData = new FormData()
    
    // Add video URL and required parameters
    formData.append('source_url', video.stored_url)
    formData.append('target_lang', targetLanguage)
    formData.append('source_lang', 'auto')
    formData.append('num_speakers', '0') // Auto-detect speakers
    formData.append('watermark', 'true') // Required for non-premium users
    formData.append('highest_resolution', 'true') // Get best quality
    formData.append('name', `Translation_${video.title || 'Untitled'}_${targetLanguage}`)
    
    console.log('Starting ElevenLabs dubbing with parameters:', {
      source_url: video.stored_url,
      target_lang: targetLanguage,
      watermark: true,
      highest_resolution: true
    })

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
      console.error('ElevenLabs error response:', errorData)
      throw new Error(`Failed to start dubbing: ${errorData}`)
    }

    const { dubbing_id } = await dubbingResponse.json()
    console.log('Dubbing started with ID:', dubbing_id)

    // 2. Poll for dubbing completion
    let dubbingComplete = false
    let translatedUrl = null
    let attempts = 0
    const maxAttempts = 60 // 5 minutes maximum (with 5s intervals)

    while (!dubbingComplete && attempts < maxAttempts) {
      console.log(`Checking dubbing status (attempt ${attempts + 1})...`)
      const statusResponse = await fetch(`https://api.elevenlabs.io/v1/dubbing/${dubbing_id}`, {
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
      console.log('Dubbing status:', status)

      if (status.status === 'done') {
        dubbingComplete = true
        translatedUrl = status.audio_url
        console.log('Dubbing completed successfully:', translatedUrl)
      } else if (status.status === 'failed') {
        throw new Error(`Dubbing failed: ${status.error || 'Unknown error'}`)
      }

      if (!dubbingComplete) {
        await new Promise(resolve => setTimeout(resolve, 5000)) // Wait 5 seconds before next check
        attempts++
      }
    }

    if (!dubbingComplete) {
      throw new Error('Dubbing timed out after 5 minutes')
    }

    // 3. Generate summary using GPT-4
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

    // 4. Update video record with results
    const { error: updateError } = await supabase
      .from('videos')
      .update({
        status: 'completed',
        summary,
        translated_url: translatedUrl,
        target_language: targetLanguage
      })
      .eq('id', videoId)

    if (updateError) {
      throw updateError
    }

    return new Response(
      JSON.stringify({
        message: 'Video processed successfully',
        video: {
          summary,
          translated_url: translatedUrl
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
