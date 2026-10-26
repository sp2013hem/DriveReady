import { useState } from 'react'
import type { Question } from '../types'

export default function Media({ q }: { q: Question }) {
  const [zoom, setZoom] = useState<string | null>(null)
  const poster = q.images[0] ? `/media/${q.images[0]}.webp` : undefined
  if (q.video) {
    return <video className="media" src={`/media/${q.video}.mp4`} poster={poster} controls playsInline preload="metadata" key={q.id} />
  }
  if (!q.images.length) return null
  return (
    <>
      <div className="images">
        {q.images.map((i) => (
          <img key={i} className="media" src={`/media/${i}.webp`} alt="" loading="lazy" onClick={() => setZoom(i)} />
        ))}
      </div>
      {zoom && (
        <div className="lightbox" onClick={() => setZoom(null)}>
          <img src={`/media/${zoom}.webp`} alt="" />
        </div>
      )}
    </>
  )
}
