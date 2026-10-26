# DriveReady

A web app for practising the German driving theory test (Class B), with a mock exam that follows the real exam rules.

## ⚠️ Personal use only

This project is **for personal, non-commercial learning use only**. It is not intended for public distribution or commercial use.

The question catalogue, images and videos are not mine. They come from the official TÜV/DEKRA question catalogue and are likely protected by copyright. Do not redistribute, republish or monetise this repository or the deployed site. If you fork it, you are responsible for how you use the content.

## Features

- Practice by theme and chapter, plus New, Weak, 5-pointer and Bookmarked questions
- Mock exam: 30 questions (20 basic + 10 class-specific), 45 minutes, fail above 10 error points or with two wrong 5-point questions
- Multi-select, numeric-entry, image and video questions, each with an explanation
- Search, stats and progress tracking, all stored in the browser's `localStorage`
- Installable PWA that works offline once media has been cached

Exam rules are in `src/config.ts`. They come from guide sites, not official sources, so check them with TÜV/DEKRA or your driving school.

## Development

```sh
npm install
npm run prep     # converts backup/ into public/ (needs the raw backup/ folder)
npm run dev
npm run build
```

`backup/` holds the raw source files and is git-ignored. `public/` holds the processed questions and media.

## Deployment

Netlify builds from GitHub using `netlify.toml`. All media is served as static files.
