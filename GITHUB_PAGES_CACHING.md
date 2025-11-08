# Настройка кэширования для GitHub Pages

## Проблема
GitHub Pages автоматически устанавливает заголовок `Cache-Control: max-age=600` (10 минут) для всех статических ресурсов. Это нельзя изменить напрямую через файл `_headers` (который работает только на Netlify/Cloudflare Pages).

## Решение: Fingerprinting + Immutable URLs

### 1. Hugo Fingerprinting (уже настроено)
Hugo автоматически добавляет хэш к именам файлов в production:
```
main.css → main.min.7bab33c83ef1f55596985961df34d35a.css
```

### 2. Обновление GitHub Actions
Добавьте в `.github/workflows/hugo.yml` кастомные заголовки через `actions/configure-pages`:

```yaml
- name: Build with Hugo
  env:
    HUGO_CACHEDIR: ${{ runner.temp }}/hugo_cache
    HUGO_ENVIRONMENT: production
  run: |
    hugo \
      --gc \
      --minify \
      --cleanDestinationDir \
      --baseURL "${{ steps.pages.outputs.base_url }}/"

# Добавить этот шаг ПОСЛЕ билда
- name: Add cache headers
  run: |
    # Создаём .htaccess для Apache (если GitHub Pages его поддерживает)
    cat > public/.htaccess << 'EOF'
    <IfModule mod_expires.c>
      ExpiresActive On
      
      # HTML - короткое кэширование
      ExpiresByType text/html "access plus 1 hour"
      
      # CSS и JS с хэшем - долгое кэширование
      <FilesMatch "\.(css|js)\.[a-f0-9]{32,64}\.(css|js)$">
        ExpiresDefault "access plus 1 year"
        Header set Cache-Control "public, max-age=31536000, immutable"
      </FilesMatch>
      
      # Изображения
      ExpiresByType image/webp "access plus 1 year"
      ExpiresByType image/jpeg "access plus 1 year"
      ExpiresByType image/png "access plus 1 year"
      ExpiresByType image/svg+xml "access plus 1 year"
    </IfModule>
    EOF
```

### 3. Альтернатива: Cloudflare CDN (рекомендуется)

#### Бесплатный план Cloudflare
1. Зарегистрируйтесь на [cloudflare.com](https://www.cloudflare.com/)
2. Добавьте ваш домен `vmstr8.github.io`
3. Настройте Page Rules:

```
Правило 1: vmstr8.github.io/css/*
- Browser Cache TTL: 1 year
- Cache Level: Cache Everything
- Edge Cache TTL: 1 month

Правило 2: vmstr8.github.io/js/*
- Browser Cache TTL: 1 year
- Cache Level: Cache Everything
- Edge Cache TTL: 1 month

Правило 3: vmstr8.github.io/images/*
- Browser Cache TTL: 1 year
- Cache Level: Cache Everything
- Edge Cache TTL: 1 month

Правило 4: vmstr8.github.io/*.html
- Browser Cache TTL: 1 hour
- Cache Level: Cache Everything
- Edge Cache TTL: 4 hours
```

#### Бонусы Cloudflare:
- ✅ HTTP/2 и HTTP/3 автоматически
- ✅ Brotli компрессия
- ✅ Минификация CSS/JS/HTML on-the-fly
- ✅ WebP конвертация изображений
- ✅ DDoS защита
- ✅ Analytics

### 4. Альтернатива: Netlify/Vercel (миграция)

#### Netlify
```bash
# Просто запушьте код на GitHub
# Netlify автоматически деплоит с правильными заголовками из static/_headers
```

#### Vercel
```bash
# Установите vercel CLI
npm i -g vercel

# Деплой
vercel --prod

# Создайте vercel.json
cat > vercel.json << 'EOF'
{
  "headers": [
    {
      "source": "/css/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    },
    {
      "source": "/js/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    },
    {
      "source": "/images/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
EOF
```

## Текущий статус

### ✅ Уже оптимизировано:
- Hugo Fingerprinting включен (хэши в именах файлов)
- Файл `static/_headers` создан (готов для Netlify/Cloudflare Pages)
- Критичный CSS встроен инлайн
- Асинхронная загрузка некритичных ресурсов

### ⚠️ Ограничения GitHub Pages:
- Кэширование: фиксированные 10 минут
- Нет поддержки кастомных заголовков
- Нет HTTP/3
- Нет Brotli (только Gzip)

### 🎯 Рекомендация:
**Используйте Cloudflare CDN (бесплатно)** перед GitHub Pages:
1. Не требует миграции
2. Полный контроль над кэшированием
3. Дополнительная оптимизация (Brotli, WebP, HTTP/3)
4. 5 минут на настройку

## Измерение эффекта

### До оптимизации:
- Повторная загрузка: все ресурсы перезагружаются через 10 минут
- 327 KB трафика при каждом визите после истечения кэша

### После Cloudflare CDN:
- Повторная загрузка: ресурсы кэшируются на 1 год
- ~0 KB трафика при повторных визитах (всё из кэша браузера)

### Метрики:
```bash
# Проверка заголовков
curl -I https://vmstr8.github.io/css/main.min.7bab33c.css

# Ожидаемый результат с Cloudflare:
Cache-Control: public, max-age=31536000, immutable
CF-Cache-Status: HIT
```

## Контакты
- **Автор**: Maxim VMSTR8 Vinokurov
- **Дата**: 8 ноября 2025
