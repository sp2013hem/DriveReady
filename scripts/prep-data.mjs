// Converts the raw scraped catalogue in data/ into web-ready assets in public/.
//   node scripts/prep-data.mjs [--skip-media]
import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync } from 'node:fs'
import { basename, join } from 'node:path'
import { spawn } from 'node:child_process'
import { cpus } from 'node:os'
import ffmpeg from 'ffmpeg-static'
import sharp from 'sharp'

const RAW = 'data'
const OUT = 'public'
const skipMedia = process.argv.includes('--skip-media')

const raw = JSON.parse(readFileSync(join(RAW, 'driving_theory_questions.json'), 'utf8'))
mkdirSync(join(OUT, 'media'), { recursive: true })
mkdirSync(join(OUT, 'data'), { recursive: true })

const stem = (p) => basename(p).replace(/\.[^.]+$/, '')
const num = (s) => Number(String(s).match(/\d+/)?.[0])
const letterIdx = (l) => l.trim().toUpperCase().charCodeAt(0) - 65

const questions = raw.map((q) => {
  const images = [...new Set(q.local_image_paths.map(stem))]
  const video = q.local_video_paths[0] ? stem(q.local_video_paths[0]) : null
  const base = {
    id: q.question_id,
    section: q.question_id.startsWith('1.') ? 'basic' : 'class',
    theme: q.theme_number.replace(/^Theme\s*/, '').replace(/\.$/, ''),
    themeName: q.theme_name,
    chapter: q.chapter_number.replace(/\s*Chapter$/, ''),
    chapterName: q.chapter_name,
    points: num(q.points),
    text: q.question_text,
    explanation: q.comment || '',
    images,
    video,
  }
  if (q.options.length === 0) {
    return { ...base, type: 'number', answer: Number(q.correct_answers[0].letter) }
  }
  const options = q.options.map((o) => o.text)
  const correct = q.correct_answers.map((a) => letterIdx(a.letter)).sort()
  return { ...base, type: 'choice', options, correct }
})

writeFileSync(join(OUT, 'data', 'questions.json'), JSON.stringify(questions))
console.log(`questions.json: ${questions.length} questions`)

if (skipMedia) process.exit(0)

const jobs = []
for (const q of raw) {
  for (const p of new Set(q.local_image_paths)) jobs.push({ kind: 'img', src: join(RAW, p), dst: join(OUT, 'media', stem(p) + '.webp') })
  for (const p of q.local_video_paths) jobs.push({ kind: 'vid', src: join(RAW, p), dst: join(OUT, 'media', stem(p) + '.mp4') })
}

const run = (cmd, args) =>
  new Promise((res, rej) => {
    const c = spawn(cmd, args, { stdio: ['ignore', 'ignore', 'pipe'] })
    let err = ''
    c.stderr.on('data', (d) => (err += d))
    c.on('close', (code) => (code === 0 ? res() : rej(new Error(err.slice(-400)))))
  })

async function convert(j) {
  if (existsSync(j.dst) && statSync(j.dst).size > 0) return
  if (j.kind === 'img') {
    await sharp(j.src).resize({ width: 900, withoutEnlargement: true }).webp({ quality: 78 }).toFile(j.dst)
  } else {
    await run(ffmpeg, ['-y', '-i', j.src, '-an', '-vf', "scale='min(720,iw)':-2", '-c:v', 'libx264', '-crf', '30', '-preset', 'slow', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', j.dst])
  }
}

let done = 0
const queue = [...jobs]
const worker = async () => {
  while (queue.length) {
    const j = queue.shift()
    try { await convert(j) } catch (e) { console.error('FAIL', j.src, e.message) }
    if (++done % 50 === 0) console.log(`${done}/${jobs.length}`)
  }
}
await Promise.all(Array.from({ length: Math.max(2, cpus().length - 1) }, worker))
console.log('media done', jobs.length)
