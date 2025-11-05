# Red Dawn - Hugo Site

Red Dawn team website built with Hugo and hosted on GitHub Pages.

## Requirements

- Hugo v0.151.0 or newer (install via Homebrew: `brew install hugo`)

## Local Development

### Start Dev Server

```bash
hugo server -D
```

Site will be available at: http://localhost:1313/

### Production Build

```bash
hugo --gc --minify
```

Built site will be in the `public/` folder

## Project Structure

```
reddawn/
├── content/          # Site content (markdown files)
│   └── news/        # News articles
├── layouts/         # HTML templates
│   ├── _default/    # Base templates
│   ├── partials/    # Reusable components (header, footer)
│   └── news/        # News templates
├── static/          # Static files (images, CSS, JS)
├── hugo.toml        # Hugo configuration
└── .github/         # GitHub Actions for auto-deploy
```

## Adding a News Article

Create a new markdown file in `content/news/`:

```bash
hugo new content/news/my-news.md
```

Or manually create a file with this content:

```markdown
---
title: "Article Title"
date: 2025-11-03
draft: false
---

Article text...

## Subheading

More text...
```

## Deploying to GitHub Pages

1. Ensure GitHub Pages is enabled in your GitHub repository settings
2. Go to Settings → Pages and select Source: GitHub Actions
3. Every push to the `main` branch will automatically trigger deployment

## Technologies

- **Hugo** - static site generator
- **Tailwind CSS** - via CDN for styling
- **GitHub Pages** - hosting
- **GitHub Actions** - automatic deployment
