# Design Guidelines: Full-Stack Library Platform

## Design Approach

**Reference-Based Design** drawing from Patreon's creator-focused monetization UI, PDFdrive's content discovery patterns, and modern 3D web experiences like Spline and Awwwards showcase sites. This platform requires visual sophistication to compete in the digital content marketplace while maintaining excellent usability for content discovery.

## Core Design Principles

1. **Immersive 3D Experience**: Strategic use of Three.js for hero sections, navigation transitions, and content showcases
2. **Content-First Hierarchy**: Books, manga, and images are the stars—UI supports, not competes
3. **Creator Empowerment**: Clear monetization indicators, professional creator profiles
4. **Discovery-Optimized**: Advanced filtering, visual browsing, instant preview

## Typography System

**Primary Font**: Inter (Google Fonts) - Clean, modern, excellent readability
**Display Font**: Sora (Google Fonts) - Bold headers, CTAs, 3D overlays

**Type Scale**:
- Hero/Display: text-6xl to text-8xl, font-bold (Sora)
- Page Titles: text-4xl, font-semibold (Sora)
- Section Headers: text-2xl to text-3xl, font-semibold (Inter)
- Content Titles: text-xl, font-medium (Inter)
- Body Text: text-base, font-normal (Inter)
- Metadata/Labels: text-sm, font-medium (Inter)
- Captions: text-xs, font-normal (Inter)

## Layout System

**Spacing Primitives**: Tailwind units of 2, 4, 6, 8, 12, 16, 24
- Component padding: p-4 to p-8
- Section spacing: py-16 to py-24
- Grid gaps: gap-6 to gap-8
- Card spacing: p-6

**Containers**:
- Full-width sections: w-full with max-w-7xl mx-auto
- Content grids: max-w-6xl
- Reading content: max-w-4xl
- Forms: max-w-lg

**Grid Systems**:
- Content Browse: grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 (compact cards)
- Featured Content: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 (larger cards)
- Creator Profiles: grid-cols-1 md:grid-cols-2 (detailed showcases)
- Groups List: grid-cols-1 md:grid-cols-2 lg:grid-cols-3

## Page-Specific Layouts

### Landing Page (Logged Out)
1. **3D Hero Section** (100vh): Animated 3D floating books with Three.js, dissolving into particles. Overlay with large heading + CTA buttons (blurred backgrounds on buttons)
2. **Feature Showcase** (grid-cols-1 md:grid-cols-3): Upload, Discover, Monetize with animated icons
3. **Popular Content Preview** (grid-cols-2 md:grid-cols-4): Top-rated books with hover effects
4. **Creator Spotlight** (grid-cols-1 md:grid-cols-2): Featured translators/authors with earnings highlights
5. **Community Stats**: Large numbers with animations (books uploaded, active readers, earnings distributed)
6. **CTA Section**: Strong dual-CTA (Join as Reader / Start Creating)

### Main Dashboard (Logged In)
**Sidebar Navigation** (fixed left, w-64):
- Profile avatar + name
- Browse, My Library, Upload, Groups, Settings
- Monetization summary widget

**Content Area** (ml-64):
- Search bar (sticky top, with advanced filters dropdown)
- Category tabs (All, Books, Manga, Images)
- Content grid with infinite scroll
- Each card: Cover image, title, creator, rating stars, price badge

### Content Detail Page
**Hero Area**: Large cover preview (left 60%) + metadata panel (right 40%)
- Download/Purchase button (prominent, blurred background if over image)
- Rating display + "Rate this" button
- Creator profile link
- Tags, category, file info

**Tabbed Content**: Description, Comments, Related Content
**Comment Section**: Nested replies, user avatars, rating submission

### Upload Page
**Multi-step Form** (centered, max-w-3xl):
1. File upload (drag-drop zone with preview)
2. Metadata (title, description, category, tags)
3. Monetization (Free/Paid toggle, price input, revenue split display)
4. Preview before publishing

### Profile Pages
**Cover Image** (h-64) with 3D parallax effect
**Profile Info** (overlapping cover): Avatar, name, bio, join date
**Content Tabs**: Uploaded, Saved, Reviews Given
**Stats Cards** (grid-cols-3): Total Uploads, Avg Rating, Total Earnings

### Groups Page
**Group Cards** (grid-cols-1 md:grid-cols-2 lg:grid-cols-3):
- Group cover image
- Member count, post count
- Privacy badge (Open/Public/Private)
- Join/Request button

**Group Detail**: 
- Cover + info header
- Activity feed (posts, new uploads, discussions)
- Member list sidebar

## Component Library

### Navigation
**Top Bar** (fixed, backdrop-blur-lg, border-b):
- Logo (left)
- Search (center, expandable)
- Notifications, Profile (right)

**3D Transition Effects**: Page changes trigger subtle 3D flip or slide animations

### Cards
**Content Card**:
- Cover image (aspect-ratio-[2/3])
- Gradient overlay at bottom for text readability
- Title (text-lg, font-semibold)
- Creator (text-sm, with avatar)
- Rating stars + count
- Price badge (absolute top-right, rounded-full, backdrop-blur)

**Creator Card**:
- Banner image background
- Profile photo (large, rounded-full, border)
- Name, specialty, follower count
- Top content previews (grid-cols-3)

### Forms
**Input Fields**:
- Floating labels
- Focus: ring offset
- Error states with messages
- File upload: Dashed border drop zone with icon

**Buttons**:
- Primary: Large, rounded, font-semibold
- Secondary: Outline variant
- Icon buttons: Square, centered icon
- All buttons have built-in hover/active states

### Interactive Elements
**Rating System**: 
- Clickable stars (empty/filled states)
- Display with half-star precision
- Show count beside stars

**Comment Thread**:
- Indented replies (pl-8 per level, max 3 levels)
- Vote arrows (upvote/downvote)
- Timestamp, reply button

**Price Badge**:
- Rounded-full, px-3, py-1
- "FREE" or "$X.XX"
- Backdrop-blur for visibility on images

### 3D Elements
**Hero 3D Scene**: 
- Floating book models with subtle rotation
- Particle effects on hover/interaction
- Camera follows mouse movement (parallax)

**Navigation Transitions**:
- Page flip effect for major route changes
- Depth-based slide transitions

**Content Hover Effects**:
- Slight 3D lift (transform: translateZ)
- Glow effects on cards

## Responsive Behavior

**Mobile** (< md):
- Sidebar becomes bottom nav bar
- Content grid: 2 columns
- Hero: Reduced 3D complexity, static background
- Search: Full-width when active

**Tablet** (md to lg):
- Sidebar collapses to icons only
- Content grid: 3-4 columns
- Full 3D effects

**Desktop** (lg+):
- Full sidebar
- 4-5 column grids
- Advanced 3D animations and effects

## Images

**Hero Section**: Large, high-quality image of diverse books/manga floating in stylized 3D space. Abstract, artistic composition with depth of field blur. Books should appear modern and inviting.

**Landing Page Sections**: 
- Feature illustrations showing upload process, discovery interface, payment flows
- Creator spotlight photos (professional headshots with their content)
- Community photos (diverse readers enjoying content)

**Content Cards**: User-uploaded covers (books, manga, images)

**Profile Covers**: User-selected banner images (recommend 1400x400px)

**Group Images**: Custom group covers or default illustrated patterns

**All images**: Use aspect-ratio utilities to prevent layout shift, lazy load below fold, WebP format

---

**Icon Library**: Heroicons (CDN) for consistent, modern iconography throughout the application.