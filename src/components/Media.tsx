import { useState } from 'react'
import type { Question } from '../types'
import { mediaUrl } from '../media'

export default function Media({ q }: { q: Question }) {
  const [zoom, setZoom] = useState<string | null>(null)
  const poster = q.images[0] ? mediaUrl(q.images[0], 'webp') : undefined
  if (q.video) {
    return <video className="media" src={mediaUrl(q.video, 'mp4')} crossOrigin="anonymous" poster={poster} controls playsInline preload="metadata" key={q.id} />
  }
  if (!q.images.length) return null
  return (
    <>
      <div className="images">
        {q.images.map((i) => (
          <img key={i} className="media" src={mediaUrl(i, 'webp')} crossOrigin="anonymous" alt="" loading="lazy" onClick={() => setZoom(i)} />
        ))}
      </div>
      {zoom && (
        <div className="lightbox" onClick={() => setZoom(null)}>
          <img src={mediaUrl(zoom, 'webp')} alt="" />
        </div>
      )}
    </>
  )
}
