# Development Cache Management Guide

## The Problem

Next.js 15 with Turbopack has aggressive caching that can cause stale chunk references, resulting in 404 errors for static assets when code changes.

## Quick Fixes (Choose One)

### Option 1: Browser Cache Clear (Quickest)

1. Open DevTools (F12)
2. Right-click refresh button → "Hard Reload and Empty Cache"
3. Or use Ctrl+Shift+R

### Option 2: Clear Site Data (Most Effective)

1. Open DevTools (F12)
2. Go to Application tab
3. Click "Clear storage"
4. Click "Clear site data"

### Option 3: Incognito/Private Mode

- Open site in incognito/private browsing mode

## Development Scripts

### Fresh Development Start

```bash
npm run dev:fresh
```

This clears all caches and starts development server.

### Reset Development (Nuclear Option)

```bash
npm run reset:dev
```

This completely resets the development environment.

## When to Use Each Method

- **Browser cache clear**: Quick code changes
- **Site data clear**: After major refactoring or component changes
- **dev:fresh script**: When starting development session
- **Incognito mode**: Testing without affecting normal browsing

## Root Causes

1. Browser caches old chunk references
2. Service Worker caches (if enabled)
3. Turbopack internal caching
4. Next.js build caching

## Prevention

- Use `npm run dev:fresh` when starting development
- Clear browser cache before testing major changes
- Use different browser profiles for development vs normal browsing
