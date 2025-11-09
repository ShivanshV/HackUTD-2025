# Car Images

Add your Toyota car images to this folder.

## File Naming Convention:
- `camry-2024.jpg`
- `rav4-2024.jpg`
- `prius-2024.jpg`
- `tacoma-2024.jpg`
- `highlander-2024.jpg`
- etc.

## Image Requirements:
- **Format**: JPG, PNG, or WebP
- **Recommended Size**: 800x600 or 1200x800 pixels
- **Aspect Ratio**: 4:3 or 16:9
- **File Size**: Keep under 500KB for best performance

## Where to Get Images:

### Option 1: Toyota Official Website
Download from https://www.toyota.com

### Option 2: Free Stock Photos
- Unsplash: https://unsplash.com/s/photos/toyota
- Pexels: https://www.pexels.com/search/toyota/

### Option 3: Use External URLs
Instead of downloading, you can use direct URLs:

```javascript
image: 'https://example.com/path/to/car.jpg'
```

## Usage in Code:

```javascript
{
  id: '1',
  name: 'Toyota Camry',
  year: 2024,
  price: '$28,400',
  image: '/cars/camry-2024.jpg', // ← Points to this folder
  type: 'Sedan',
  mpg: '28/39 MPG'
}
```

