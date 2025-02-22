
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

    const openai = new OpenAI({
      apiKey: Deno.env.get('OPENAI_API_KEY'),
    })

    // 1. Transcribe the video
    const transcriptionResponse = await fetch(video.stored_url)
    const audioBlob = await transcriptionResponse.blob()
    
    const formData = new FormData()
    formData.append('file', audioBlob)
    formData.append('model', 'whisper-1')
    
    const transcriptionResult = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
      },
      body: formData,
    }).then(res => res.json())

    const transcript = transcriptionResult.text

    // 2. Generate summary using GPT-4
    const summaryResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a helpful assistant that creates concise video summaries in ${targetLanguage}. Focus on key points and main ideas.`
        },
        {
          role: "user",
          content: `Please provide a summary of this video transcript in ${targetLanguage}:\n\n${transcript}`
        }
      ],
    })

    const summary = summaryResponse.choices[0].message.content

    // 3. Translate the transcript
    const translationResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a professional translator. Translate the following text to ${targetLanguage}. Maintain the original meaning and tone.`
        },
        {
          role: "user",
          content: transcript
        }
      ],
    })

    const translatedTranscript = translationResponse.choices[0].message.content

    // 4. Generate audio from translated text
    const audioResponse = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1',
        input: translatedTranscript,
        voice: 'alloy',
      }),
    })

    if (!audioResponse.ok) {
      throw new Error('Failed to generate translated audio')
    }

    // 5. Upload translated audio to Supabase Storage
    const audioBlob2 = await audioResponse.blob()
    const translatedPath = `translated/${videoId}.mp3`

    const { data: storageData, error: storageError } = await supabase.storage
      .from('videos')
      .upload(translatedPath, audioBlob2, {
        contentType: 'audio/mpeg',
        upsert: true
      })

    if (storageError) {
      throw storageError
    }

    // Get public URL for translated audio
    const { data: publicUrlData } = supabase.storage
      .from('videos')
      .getPublicUrl(translatedPath)

    // Update video record with results
    const { error: updateError } = await supabase
      .from('videos')
      .update({
        status: 'completed',
        transcript,
        translated_transcript: translatedTranscript,
        summary,
        translated_url: publicUrlData.publicUrl
      })
      .eq('id', videoId)

    if (updateError) {
      throw updateError
    }

    return new Response(
      JSON.stringify({
        message: 'Video processed successfully',
        video: {
          transcript,
          translated_transcript: translatedTranscript,
          summary,
          translated_url: publicUrlData.publicUrl
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
