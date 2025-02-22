
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
    const { videoId } = await req.json()
    
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
          content: "You are a helpful assistant that creates concise video summaries. Focus on key points and main ideas."
        },
        {
          role: "user",
          content: `Please provide a summary of this video transcript:\n\n${transcript}`
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
          content: `You are a professional translator. Translate the following text to ${video.target_language}. Maintain the original meaning and tone.`
        },
        {
          role: "user",
          content: transcript
        }
      ],
    })

    const translatedTranscript = translationResponse.choices[0].message.content

    // Update video record with results
    const { error: updateError } = await supabase
      .from('videos')
      .update({
        status: 'completed',
        transcript,
        translated_transcript: translatedTranscript,
        summary,
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
