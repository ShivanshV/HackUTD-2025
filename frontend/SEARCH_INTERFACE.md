# Toyota Smart Search Interface

A modern, AI-powered search interface with Toyota branding and styling.

## 📁 File Structure

```
frontend/
├── app/
│   ├── page.tsx                    # Main page with search/chat toggle
│   ├── page.module.css             # Page styles
│   ├── layout.tsx                  # Root layout with fonts
│   └── globals.css                 # Global Toyota styles & variables
│
└── components/
    ├── search/                     # NEW: Smart search components
    │   ├── SearchInterface.tsx     # Main search container
    │   ├── SearchInterface.module.css
    │   ├── SearchInput.tsx         # Gradient border search box
    │   ├── SearchInput.module.css
    │   ├── FilterChip.tsx          # Interactive filter chips
    │   └── FilterChip.module.css
    │
    ├── chat/                       # Existing chat components
    │   ├── ChatInterface.tsx
    │   ├── ChatInput.tsx
    │   └── ChatMessageBubble.tsx
    │
    └── ui/                         # Existing UI components
        └── Header.tsx
```

## 🎨 Design Features

### 1. **Gradient Search Box**
- Beautiful gradient border (blue → purple → pink → red)
- Modern rounded corners (16px)
- Smooth hover and focus effects
- Location/ZIP code input integrated
- Responsive design

### 2. **Toyota Branding**
- Official Toyota red (#EB0A1E)
- Inter font (clean, modern alternative to Toyota Type)
- Professional color scheme
- Gradient text effects

### 3. **Interactive Filter Chips**
- Hover animations
- Active/inactive states
- Removable with X button
- Rotating icon on interaction
- Toyota red highlights

### 4. **Responsive Layout**
- Mobile-first design
- Adapts to all screen sizes
- Touch-friendly on mobile

## 🚀 How It Works

### User Flow:
1. **Landing Page**: Shows SearchInterface with gradient search box
2. **Enter Query**: User types what they want (e.g., "I need a family SUV")
3. **Add Filters**: Optional filter chips (low mileage, price, etc.)
4. **Search**: Click the blue arrow button or press Enter
5. **Chat Interface**: Transitions to AI chat for conversation

### State Management:
```typescript
const [showChat, setShowChat] = useState(false)
const [searchQuery, setSearchQuery] = useState('')
const [activeFilters, setActiveFilters] = useState<string[]>([])
```

## 🎯 Components Overview

### SearchInterface
Main container component that includes:
- Hero section with animated sparkle ✨
- Gradient headline text
- SearchInput component
- Filter chips grid
- "Pick up where you left off" section

**Props:**
```typescript
interface SearchInterfaceProps {
  onSearch?: (query: string, filters: string[]) => void;
}
```

### SearchInput
The gradient-bordered search box with:
- Main text input
- ZIP code input with location icon
- Search button with arrow icon
- Keyboard support (Enter to search)

**Props:**
```typescript
interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  zipCode: string;
  onZipCodeChange: (value: string) => void;
  onSearch: () => void;
  placeholder?: string;
}
```

### FilterChip
Individual filter button with:
- Rotating icon animation
- Active/hover states
- Remove button (×)
- Toyota red theming

**Props:**
```typescript
interface FilterChipProps {
  label: string;
  active?: boolean;
  onClick?: () => void;
}
```

## 🎨 Color Palette

```css
/* Toyota Brand Colors */
--toyota-red: #EB0A1E
--toyota-red-dark: #C40818
--toyota-red-hover: #D00916

/* UI Colors */
--text-color: #333333
--text-secondary: #666666
--bg-light: #F8F9FA
--border-color: #e0e0e0

/* Gradients */
--gradient-primary: linear-gradient(135deg, #4A90E2 0%, #8B3FF5 25%, #E91E63 75%, #FF6B6B 100%)
--gradient-text: linear-gradient(135deg, #8B3FF5 0%, #E91E63 50%, #EB0A1E 100%)
```

## 📱 Responsive Breakpoints

- **Desktop**: Full layout with all features
- **Tablet** (≤768px): Adjusted padding and sizing
- **Mobile** (≤480px): Simplified layout, hidden ZIP on small screens

## 🔧 Customization

### Change Filter Options
Edit `SearchInterface.tsx`:
```typescript
const filterOptions = [
  'Low mileage vehicles',
  'Under 30000 miles',
  'Your custom filter here',
  // Add more...
];
```

### Modify Gradient Colors
Edit any `.module.css` file:
```css
.gradientBorder {
  background: linear-gradient(135deg, 
    #4A90E2 0%,    /* Start color */
    #8B3FF5 25%,   /* Mid color 1 */
    #E91E63 75%,   /* Mid color 2 */
    #FF6B6B 100%   /* End color */
  );
}
```

### Update Toyota Branding
Edit `globals.css`:
```css
:root {
  --toyota-red: #EB0A1E;  /* Change this */
  --toyota-red-dark: #C40818;
  --toyota-red-hover: #D00916;
}
```

## 🚀 Next Steps

1. **Connect to Backend**: 
   - Wire up the `onSearch` callback
   - Send query and filters to your AI API
   - Display results in ChatInterface

2. **Add Results View**:
   - Create vehicle cards
   - Show search results before chat
   - Add comparison features

3. **Enhance Filters**:
   - Add price range sliders
   - Vehicle type selector
   - Advanced options dropdown

4. **Analytics**:
   - Track popular searches
   - Monitor filter usage
   - A/B test UI variations

## 💡 Tips

- The search smoothly transitions to chat mode
- Back button returns to search interface
- All animations use CSS for performance
- Mobile-optimized touch targets
- Accessible keyboard navigation

## 🎉 Features Checklist

- ✅ Gradient border search box
- ✅ Toyota brand colors
- ✅ Interactive filter chips
- ✅ Responsive design
- ✅ Smooth animations
- ✅ Modern typography (Inter font)
- ✅ Location/ZIP integration
- ✅ Search/chat toggle
- ✅ Hover effects
- ✅ Mobile optimization

---

Built with ❤️ for Toyota | HackUTD 2025

