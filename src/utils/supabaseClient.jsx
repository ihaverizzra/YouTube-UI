import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper function to upload video
export const uploadVideo = async (videoFile, title, description) => {
  try {
    // Generate unique filename
    const timestamp = Date.now()
    const fileName = `${timestamp}-${videoFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
    
    // Upload video to storage
    const { data: videoData, error: videoError } = await supabase.storage
      .from('videos')
      .upload(fileName, videoFile, {
        cacheControl: '3600',
        upsert: false
      })

    if (videoError) throw videoError

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('videos')
      .getPublicUrl(fileName)

    // Insert video metadata into database
    const { data, error } = await supabase
      .from('videos')
      .insert([
        {
          title,
          description,
          video_url: publicUrl,
          thumbnail_url: null, // You can generate this later
          views: 0
        }
      ])
      .select()

    if (error) throw error

    return { success: true, data: data[0] }
  } catch (error) {
    console.error('Error uploading video:', error)
    return { success: false, error: error.message }
  }
}

// Fetch all videos with sorting
export const fetchVideos = async () => {
  try {
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    // Apply 50/50 new vs popular sorting
    return sortVideos(data)
  } catch (error) {
    console.error('Error fetching videos:', error)
    return []
  }
}

// Sort videos: 50% newest, 50% most popular
const sortVideos = (videos) => {
  if (!videos || videos.length === 0) return []

  const newVideos = [...videos].sort((a, b) => 
    new Date(b.created_at) - new Date(a.created_at)
  )
  
  const popularVideos = [...videos].sort((a, b) => 
    b.views - a.views
  )
  
  const result = []
  const maxLength = Math.max(newVideos.length, popularVideos.length)
  
  for (let i = 0; i < maxLength; i++) {
    if (Math.random() < 0.5) {
      if (newVideos[i] && !result.find(v => v.id === newVideos[i].id)) {
        result.push(newVideos[i])
      }
      if (popularVideos[i] && !result.find(v => v.id === popularVideos[i].id)) {
        result.push(popularVideos[i])
      }
    } else {
      if (popularVideos[i] && !result.find(v => v.id === popularVideos[i].id)) {
        result.push(popularVideos[i])
      }
      if (newVideos[i] && !result.find(v => v.id === newVideos[i].id)) {
        result.push(newVideos[i])
      }
    }
  }
  
  return result
}

// Increment video views
export const incrementViews = async (videoId) => {
  try {
    const { data, error } = await supabase.rpc('increment_views', {
      video_id: videoId
    })

    if (error) {
      // Fallback if function doesn't exist
      const { data: video } = await supabase
        .from('videos')
        .select('views')
        .eq('id', videoId)
        .single()

      if (video) {
        await supabase
          .from('videos')
          .update({ views: video.views + 1 })
          .eq('id', videoId)
      }
    }

    return { success: true }
  } catch (error) {
    console.error('Error incrementing views:', error)
    return { success: false }
  }
}

// Fetch video by ID
export const fetchVideoById = async (videoId) => {
  try {
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .eq('id', videoId)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error fetching video:', error)
    return null
  }
}

// Add comment
export const addComment = async (videoId, username, commentText) => {
  try {
    const { data, error } = await supabase
      .from('comments')
      .insert([
        {
          video_id: videoId,
          username,
          comment_text: commentText
        }
      ])
      .select()

    if (error) throw error
    return { success: true, data: data[0] }
  } catch (error) {
    console.error('Error adding comment:', error)
    return { success: false, error: error.message }
  }
}

// Fetch comments for a video
export const fetchComments = async (videoId) => {
  try {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('video_id', videoId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error fetching comments:', error)
    return []
  }
}
