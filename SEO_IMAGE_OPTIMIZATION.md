# SEO Image Optimization Guide

## 📸 Image Best Practices for Tether Link

### Image Dimensions & Sizes

#### Homepage Hero Images
- **Recommended Size**: 1200x600px (2:1 ratio)
- **File Size**: < 200KB (compressed)
- **Format**: WebP (primary), PNG fallback
- **Alt Text Example**: "Tether Link USDT staking platform with fixed APY returns"

#### Feature Cards
- **Recommended Size**: 400x300px (4:3 ratio)
- **File Size**: < 100KB
- **Format**: WebP or optimized PNG
- **Alt Text Example**: "Low minimum $100 entry requirement for USDT staking"

#### Product/Campaign Images
- **Recommended Size**: 800x600px
- **File Size**: < 150KB
- **Format**: WebP (primary), JPG fallback
- **Alt Text Example**: "Transparent 0.5% platform fee structure for USDT stakeholders"

#### Logos
- **Recommended Size**: 200x200px (for header), 400x400px (for footer)
- **File Size**: < 50KB
- **Format**: PNG (with transparency) or SVG
- **Alt Text**: "Tether Link logo"

#### Screenshot/Infographics
- **Recommended Size**: 1200x800px
- **File Size**: < 250KB
- **Format**: PNG or WebP
- **Alt Text Example**: "Step-by-step guide to staking USDT on Tether Link: deposit, select product, earn rewards, withdraw"

---

## 🏷️ Image Alt Text Guidelines

### Alt Text Formula
```
[Subject] + [Action/Context] + [Benefit/Purpose]
```

### Homepage Examples

**Hero Image**
- ❌ Bad: "image.jpg"
- ❌ Bad: "Tether logo"
- ✅ Good: "Tether Link USDT staking platform offering fixed APY returns and transparent fees"

**Feature Card 1 (Low Minimum)**
- ❌ Bad: "dollar sign icon"
- ✅ Good: "Dollar sign icon representing low minimum $100 entry for USDT staking"

**Feature Card 2 (Transparent Fees)**
- ❌ Bad: "shopping icon"
- ✅ Good: "Shopping bag icon showing transparent 0.5% platform fee structure"

**Feature Card 3 (Withdrawal Guidance)**
- ❌ Bad: "chart icon"
- ✅ Good: "Upward trending chart icon representing clear withdrawal guidance and product terms"

---

## How It Works Page

**Step 1 - Deposit**
- ✅ "Step 1: Deposit USDT to assigned wallet address with QR code and network details"

**Step 2 - Choose Product**
- ✅ "Step 2: Browse and select fixed APY staking products with APY, duration, and withdrawal rules"

**Step 3 - Staking & Earning**
- ✅ "Step 3: Staked USDT earning passive income at stated APY displayed in dashboard"

**Step 4 - Withdraw**
- ✅ "Step 4: Request withdrawal according to product terms with fees and processing times shown"

---

## Image Filenames - SEO Best Practices

### Good Examples
- `usdt-staking-platform.png`
- `fixed-apy-returns.png`
- `transparent-fee-structure.png`
- `how-to-stake-usdt-guide.png`
- `crypto-rewards-calculation.png`
- `tether-link-dashboard.png`

### Bad Examples
- ❌ `image1.jpg`
- ❌ `photo.png`
- ❌ `Screenshot_2024.png`
- ❌ `IMG_12345.jpg`
- ❌ `file-copy.png`

---

## Image Optimization Checklist

### Before Upload
- [ ] Dimensions correct (see size guide above)
- [ ] File size optimized (compressed)
- [ ] Format appropriate (PNG, JPG, or WebP)
- [ ] Filename descriptive and SEO-friendly
- [ ] No watermarks or distracting elements
- [ ] Image quality maintained (no pixelation)

### Implementation
- [ ] Alt text added (descriptive and keyword-relevant)
- [ ] Title attribute added (optional but helpful)
- [ ] Image serves a purpose (not decorative)
- [ ] Image linked if it's a call-to-action
- [ ] Responsive image served (different sizes for mobile/desktop)

### Image Hosting
- [ ] Use project's `/public` folder for hosting
- [ ] Use Next.js Image component for optimization
- [ ] Images served over HTTPS
- [ ] Images don't block page load (lazy loading)
- [ ] Backup images hosted (in case of CDN issues)

---

## Next.js Image Optimization Setup

### Using Next.js Image Component

```tsx
import Image from 'next/image';

export default function OptimizedImage() {
  return (
    <Image
      src="/images/usdt-staking-platform.png"
      alt="Tether Link USDT staking platform offering fixed APY returns"
      width={1200}
      height={600}
      priority={true} // For above-the-fold images
      quality={85} // 85% quality is usually fine
      placeholder="blur" // Add placeholder while loading
    />
  );
}
```

### Image Optimization in next.config.js
```javascript
images: {
  formats: ['image/avif', 'image/webp'],
  deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
}
```

---

## Schema.org Image Markup

### Include in Article Schema
```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "How to Stake USDT",
  "image": {
    "@type": "ImageObject",
    "url": "https://tetherlink.io/images/how-to-stake-usdt.png",
    "height": 800,
    "width": 1200
  }
}
```

### Product Image Schema
```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "USDT Staking Product",
  "image": "https://tetherlink.io/images/staking-product.png"
}
```

---

## Image CDN Optimization (Optional)

### Services to Consider
- **Cloudinary** - Image optimization and hosting
- **Imgix** - Real-time image transformation
- **AWS CloudFront** - Content delivery network
- **Vercel Image Optimization** - Built-in to Vercel

---

## Tools for Image Optimization

### Free Online Tools
- [TinyPNG](https://tinypng.com/) - PNG/JPG compression
- [Squoosh](https://squoosh.app/) - Google's image optimizer
- [ImageOptim](https://imageoptim.com/) - macOS app
- [FileOptimizer](https://nikkhokkho.sourceforge.io/) - Windows app

### Batch Processing
- ImageMagick (command line)
- Adobe Lightroom (bulk export)
- Bulk Rename Utility + optimization script

---

## Image Directory Structure

Recommended organization:
```
/public/
  /images/
    /homepage/
      hero.png
      feature-1.png
      feature-2.png
      feature-3.png
    /how-it-works/
      step-1.png
      step-2.png
      step-3.png
      step-4.png
    /products/
      staking-product-1.png
      staking-product-2.png
    /icons/
      dollar-icon.svg
      chart-icon.svg
    /logos/
      tether-link-logo.png
      tether-usdt-logo.svg
```

---

## Image Performance Monitoring

### Metrics to Track (via Google Analytics + PageSpeed Insights)
- Image load time
- Page load time (with images)
- Largest Contentful Paint (LCP)
- Cumulative Layout Shift (CLS)

### Target Metrics
- Images load in < 1 second
- Total page load < 3 seconds
- LCP < 2.5 seconds
- No layout shift from images
