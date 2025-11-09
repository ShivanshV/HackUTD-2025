# Car Images Guide

## Quick Start Options

### Option 1: Use External URLs (Fastest)

Simply update `CarSuggestions.tsx` with direct image URLs:

```javascript
const defaultCars: Car[] = [
  {
    id: '1',
    name: 'Toyota Camry',
    year: 2024,
    price: '$28,400',
    type: 'Sedan',
    mpg: '28/39 MPG',
    image: 'https://www.toyota.com/imgix/content/dam/toyota/vehicles/2024/camry/overview/desktop_camry_hero.jpg'
  },
  // ... more cars
];
```

**Pros:** No download needed, always up-to-date  
**Cons:** Requires internet, slower loading

---

### Option 2: Local Images (Best for Production)

1. **Download car images** from:
   - Toyota Official: https://www.toyota.com
   - Unsplash: https://unsplash.com/s/photos/toyota
   - Pexels: https://www.pexels.com/search/toyota/

2. **Place images in:** `frontend/public/cars/`
   ```
   frontend/public/cars/
   ├── camry-2024.jpg
   ├── rav4-2024.jpg
   ├── prius-2024.jpg
   ├── tacoma-2024.jpg
   └── highlander-2024.jpg
   ```

3. **Reference them:**
   ```javascript
   image: '/cars/camry-2024.jpg'
   ```

**Pros:** Fast loading, works offline, better performance  
**Cons:** Need to download and manage files

---

### Option 3: Backend API (Dynamic)

If your backend provides car data with images:

```javascript
// In ChatInterface.tsx, fetch from backend
const [suggestedCars, setSuggestedCars] = useState([]);

useEffect(() => {
  fetch('http://localhost:8000/api/suggested-cars')
    .then(res => res.json())
    .then(data => setSuggestedCars(data));
}, [chatHistory]);

// Pass to CarSuggestions
<CarSuggestions cars={suggestedCars} />
```

Backend would return:
```json
[
  {
    "id": "1",
    "name": "Toyota Camry",
    "year": 2024,
    "price": "$28,400",
    "image": "https://your-cdn.com/camry.jpg",
    "type": "Sedan",
    "mpg": "28/39 MPG"
  }
]
```

---

## Image Specifications

### Recommended Sizes:
- **Width:** 800-1200px
- **Height:** 600-800px
- **Aspect Ratio:** 4:3 or 16:9
- **Format:** JPG (best for photos)
- **File Size:** < 500KB (optimized)

### Image Optimization Tools:
- TinyPNG: https://tinypng.com
- Squoosh: https://squoosh.app
- ImageOptim (Mac): https://imageoptim.com

---

## Example: Using Free Stock Photos

### From Unsplash:

```javascript
const defaultCars: Car[] = [
  {
    id: '1',
    name: 'Toyota Camry',
    year: 2024,
    price: '$28,400',
    type: 'Sedan',
    mpg: '28/39 MPG',
    image: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&q=80'
  },
  {
    id: '2',
    name: 'Toyota RAV4',
    year: 2024,
    price: '$35,800',
    type: 'SUV',
    mpg: '27/35 MPG',
    image: 'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?w=800&q=80'
  },
  {
    id: '3',
    name: 'Toyota Prius',
    year: 2024,
    price: '$34,500',
    type: 'Hybrid',
    mpg: '54/50 MPG',
    image: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&q=80'
  }
];
```

---

## Testing Images

1. **Add an image URL** to any car object
2. **Refresh your browser**
3. If no image loads, the 🚗 emoji placeholder will show
4. Check browser console for errors

---

## For Your Backend Integration

When backend sends car recommendations, ensure each car object includes an `image` field:

```python
# backend/app/services/vehicle_service.py
{
    "id": "camry-2024",
    "name": "Camry",
    "year": 2024,
    "price": "$28,400",
    "image": "/cars/camry-2024.jpg",  # or full URL
    "type": "Sedan",
    "mpg_city": 28,
    "mpg_highway": 39
}
```

---

## Next.js Image Optimization (Optional)

For better performance, use Next.js Image component:

```javascript
import Image from 'next/image';

<Image
  src={car.image}
  alt={`${car.year} ${car.name}`}
  width={400}
  height={300}
  className={styles.carImageImg}
  priority={false}
/>
```

This provides automatic optimization, lazy loading, and responsive images!

