# EMBER UI Components Guide

Complete production-ready React Native component library for the EMBER community resilience app.

## Overview

All components use:
- **TypeScript** for type safety
- **React Native core components** (View, Text, Pressable, ScrollView)
- **react-native-svg** for vector graphics
- **react-native-reanimated** for smooth animations
- **Dark theme** with peace/crisis/recovery color modes
- **Typography**: DM Sans (UI), JetBrains Mono (data)
- **Spacing scale**: 4/8/12/16/20px
- **Generous spacing** and subtle borders (1px, rgba(255,255,255,0.1))

---

## Components

### 1. EmberLogo
SVG flame logo with mode-based colors and optional glow effect.

```typescript
import { EmberLogo } from './components';

<EmberLogo
  size={56}
  glow={true}
  mode="peace"  // 'peace' | 'crisis' | 'recovery'
/>
```

**Props:**
- `size?: number` (default: 56) - Logo dimensions
- `glow?: boolean` (default: false) - Enable glow effect
- `mode?: 'peace' | 'crisis' | 'recovery'` (default: 'peace') - Color mode

**Colors by mode:**
- Peace: amber (#FBBF24)
- Crisis: red (#EF4444)
- Recovery: green (#22C55E)

---

### 2. ReadinessRing
Circular progress ring with animated stroke and center value display.

```typescript
import { ReadinessRing } from './components';

<ReadinessRing
  value={75}
  size={62}
  color="#FBBF24"
  label="Readiness"
/>
```

**Props:**
- `value: number` - Progress percentage (0-100)
- `size?: number` (default: 62) - Diameter in pixels
- `color: string` - Gradient and text color
- `label: string` - Text displayed below ring

**Features:**
- Smooth 1.2s animation with bezier easing
- Radial gradient fill
- Centered percentage display
- SVG with animated Circle component

---

### 3. ResourceBar
Horizontal resource bar with gradient fill for critical items.

```typescript
import { ResourceBar } from './components';

<ResourceBar
  name="Water"
  quantity={8}
  max={20}
  criticalThreshold={5}
  accent="#FBBF24"
  icon={<WaterIcon />}
  onPress={() => {}}
/>
```

**Props:**
- `name: string` - Resource name
- `quantity: number` - Current amount
- `max: number` - Maximum capacity
- `criticalThreshold: number` - Low stock threshold
- `accent: string` - Bar color (normal state)
- `icon?: React.ReactNode` - Optional left icon
- `onPress?: () => void` - Pressable callback

**Features:**
- Gradient fill: amber → red when critical
- Warning message appears at critical levels
- Monospace quantity display (JetBrains Mono)
- Smooth visual feedback

---

### 4. MemberCard
Expandable member card with status display and check-in buttons.

```typescript
import { MemberCard } from './components';

const member = {
  id: '001',
  name: 'Sarah Chen',
  role: 'Coordinator',
  status: 'safe',
  lastCheckIn: Date.now() - 3600000,
  bio: 'Community leader and emergency response coordinator.',
  skills: ['First Aid', 'Leadership', 'Communications'],
  resources: ['Shelter supplies', 'Medical kit'],
};

<MemberCard
  member={member}
  accent="#FBBF24"
  expanded={false}
  onPress={() => setExpanded(!expanded)}
  onCheckIn={(id, status) => {}}
/>
```

**Props:**
- `member: Member` - Member data object
- `accent: string` - Accent color for styling
- `expanded?: boolean` - Expand/collapse state
- `onPress?: () => void` - Toggle expansion
- `onCheckIn?: (memberId, status) => void` - Check-in handler

**Member interface:**
```typescript
interface Member {
  id: string;
  name: string;
  role: string;
  status: 'safe' | 'help' | 'unknown';
  lastCheckIn: number; // timestamp
  bio?: string;
  skills?: string[];
  resources?: string[];
}
```

**Features:**
- Colored avatar circle (green for safe, red for help, gray for unknown)
- Relative time display ("3h ago")
- Expandable bio, skills, resources
- Safe/Help action buttons in expanded state
- Member ID display

---

### 5. DrillCard
Drill exercise card with difficulty, time, and XP reward display.

```typescript
import { DrillCard } from './components';

const drill = {
  id: 'drill-001',
  name: 'Evacuation Route Check',
  description: 'Verify safe evacuation routes from your residence.',
  difficulty: 'easy',
  timeMinutes: 15,
  xpReward: 50,
  completed: false,
};

<DrillCard
  drill={drill}
  accent="#FBBF24"
  onStart={(id) => startDrill(id)}
/>
```

**Props:**
- `drill: Drill` - Drill data object
- `accent: string` - Primary accent color
- `onStart?: (drillId: string) => void` - Start drill callback

**Drill interface:**
```typescript
interface Drill {
  id: string;
  name: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timeMinutes: number;
  xpReward: number;
  completed?: boolean;
  score?: number;
  icon?: React.ReactNode;
}
```

**Difficulty colors:**
- Easy: green (#22C55E)
- Medium: amber (#FBBF24)
- Hard: red (#EF4444)

**Features:**
- Difficulty, time, and XP pills with colored dots
- DONE badge for completed drills
- Score circle display (completed state)
- Start Drill button (uncompleted state)
- Optional icon display

---

### 6. CheckInButton
Full-width animated check-in button with streak counter.

```typescript
import { CheckInButton } from './components';

<CheckInButton
  onCheckIn={() => submitCheckIn()}
  streak={7}
  isPulsing={true}
  accent="#FBBF24"
/>
```

**Props:**
- `onCheckIn: () => void` - Check-in handler
- `streak?: number` (default: 0) - Current streak count
- `isPulsing?: boolean` (default: false) - Pulse animation state
- `accent: string` - Button background color

**Features:**
- Full-width pressable button
- Scale animation on press (0.95 → 1.1)
- Continuous pulse animation when active
- Streak display below button
- Green color when pulsing

---

### 7. StatCard
Metric display card with value, label, and optional subtitle.

```typescript
import { StatCard } from './components';

<StatCard
  label="Community Members"
  value={42}
  color="#FBBF24"
  subtitle="Checked in this week"
/>
```

**Props:**
- `label: string` - Uppercase metric label
- `value: string | number` - Large value display (auto-formatted)
- `color: string` - Accent and value color
- `subtitle?: string` - Optional small text below value

**Features:**
- Tinted background based on color (20% opacity)
- Large monospace value (JetBrains Mono, 28px, weight 700)
- Uppercase label with letter spacing
- Subtle border (1px, rgba)

---

### 8. SectionHeader
Uppercase section title with accent dot indicator.

```typescript
import { SectionHeader } from './components';

<SectionHeader accent="#FBBF24">
  Recent Activity
</SectionHeader>
```

**Props:**
- `children: string` - Section title text
- `accent: string` - Dot color

**Features:**
- Colored accent dot (6x6px)
- Uppercase text with 1px letter spacing
- Small font size (11px)
- Consistent vertical margins (16px)

---

### 9. PlanCard
Emergency plan card with type/status badges and action buttons.

```typescript
import { PlanCard } from './components';

const plan = {
  id: 'plan-001',
  name: 'Neighborhood Evacuation',
  type: 'evacuation',
  size: '8-10 people',
  status: 'current',
  description: 'Safe assembly point and communication plan for west neighborhood.',
};

<PlanCard
  plan={plan}
  accent="#FBBF24"
  expanded={false}
  onPress={() => setExpanded(!expanded)}
  onView={(id) => viewPlan(id)}
  onEdit={(id) => editPlan(id)}
  onShare={(id) => shareMesh(id)}
/>
```

**Props:**
- `plan: Plan` - Plan data object
- `accent: string` - Primary accent color
- `expanded?: boolean` - Expand/collapse state
- `onPress?: () => void` - Toggle expansion
- `onView?: (planId: string) => void` - View plan handler
- `onEdit?: (planId: string) => void` - Edit plan handler
- `onShare?: (planId: string) => void` - Share via Mesh handler

**Plan interface:**
```typescript
interface Plan {
  id: string;
  name: string;
  type: 'evacuation' | 'shelter' | 'communication' | 'resource' | 'medical';
  size: string;
  status: 'current' | 'needs_review' | 'archived';
  description?: string;
}
```

**Type colors:**
- Evacuation: red (#EF4444)
- Shelter: blue (#3B82F6)
- Communication: purple (#8B5CF6)
- Resource: amber (#FBBF24)
- Medical: teal (#10B981)

**Status colors:**
- Current: green (#22C55E)
- Needs Review: amber (#FBBF24)
- Archived: gray (rgba)

**Features:**
- Type and size pills with colored dots
- Status badge with color-coded dot
- Expandable description section
- View/Edit/Share Mesh action buttons

---

### 10. MessageBubble
Mesh message display with sender, timestamp, and type indicator.

```typescript
import { MessageBubble } from './components';

const message = {
  id: 'msg-001',
  sender: 'System Alert',
  text: 'Evacuation order issued for Zone A. Proceed to assembly point.',
  timestamp: Date.now(),
  type: 'broadcast',
};

<MessageBubble
  message={message}
  accent="#FBBF24"
/>
```

**Props:**
- `message: Message` - Message data object
- `accent: string` - Default accent color

**Message interface:**
```typescript
interface Message {
  id: string;
  sender: string;
  text: string;
  timestamp: number; // milliseconds
  type?: 'system' | 'resource' | 'broadcast' | 'social';
}
```

**Type colors:**
- System: blue (#3B82F6)
- Resource: amber (#FBBF24)
- Broadcast: red (#EF4444)
- Social: purple (#8B5CF6)

**Features:**
- Colored type indicator dot (left side)
- Sender name and relative timestamp
- Multiline message text support
- Subtle card styling with border

---

### 11. Pill
Toggle pill/chip button component.

```typescript
import { Pill } from './components';

<Pill
  label="Water"
  active={true}
  color="#FBBF24"
  onPress={() => togglePill('water')}
/>
```

**Props:**
- `label: string` - Pill text (capitalized)
- `active: boolean` - Active/inactive state
- `color: string` - Border and text color
- `onPress?: () => void` - Press handler

**Features:**
- Tinted background when active (25% color opacity)
- Subtle border when inactive (rgba white)
- Rounded (borderRadius: 20)
- Horizontal padding: 14px, vertical: 8px

---

### 12. Modal
Reusable modal overlay with slide-up animation.

```typescript
import { Modal } from './components';

<Modal
  visible={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  title="Edit Emergency Plan"
>
  {/* Modal content here */}
</Modal>
```

**Props:**
- `visible: boolean` - Show/hide modal
- `onClose: () => void` - Close handler (backdrop press triggers this)
- `children: React.ReactNode` - Modal content
- `title?: string` - Optional header title

**Features:**
- Semi-transparent black overlay (rgba(0,0,0,0.5))
- Slide-up animation (0→500px, 400ms)
- Smooth opacity transition on overlay
- Close button in header (when title provided)
- Backdrop press to close
- Rounded top corners (20px)
- Max height 85% of screen

---

## Design System

### Colors

**Peace Mode (Primary):** `#FBBF24` (Amber)
**Crisis Mode:** `#EF4444` (Red)
**Recovery Mode:** `#22C55E` (Green)

**Status Colors:**
- Safe: `#22C55E` (Green)
- Help: `#EF4444` (Red)
- Unknown: `rgba(255, 255, 255, 0.3)`

**Supporting Colors:**
- System: `#3B82F6` (Blue)
- Resource: `#FBBF24` (Amber)
- Broadcast: `#EF4444` (Red)
- Social: `#8B5CF6` (Purple)
- Medical: `#10B981` (Teal)

### Typography

**Font Families:**
- UI: DM Sans (all weights 400-700)
- Data/Monospace: JetBrains Mono (400-700)

**Size Scale:**
- 28px - Large values (StatCard)
- 18px - Ring values
- 16px - Button text, large labels
- 15px - Card titles
- 14px - Body text
- 13px - Secondary text
- 12px - Small text
- 11px - Mini text (labels, timestamps)
- 10px - Tiny text (section labels)

### Spacing

**Scale:** 4, 8, 12, 16, 20, 24, 32px

**Common gaps:**
- Container padding: 16px
- Section gap: 16px
- Component gap: 8-12px
- Element gap: 4-6px

### Borders

- Width: 1px
- Color: `rgba(255, 255, 255, 0.1)` (default) or `rgba(255, 255, 255, 0.08)` (subtle)
- Radius: 6px (small), 8px (buttons), 12px (cards), 20px (pills)

---

## Usage Examples

### Basic Layout

```typescript
import { ScrollView, View } from 'react-native';
import {
  EmberLogo,
  SectionHeader,
  StatCard,
  CheckInButton,
  MemberCard,
} from './components';

export function HomeScreen() {
  return (
    <ScrollView style={{ backgroundColor: '#1a1a1f', flex: 1 }}>
      <View style={{ padding: 16, gap: 24 }}>
        {/* Header */}
        <EmberLogo size={56} glow={true} mode="peace" />

        {/* Stats section */}
        <SectionHeader accent="#FBBF24">Stats</SectionHeader>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <StatCard
            label="Readiness"
            value={87}
            color="#FBBF24"
          />
          <StatCard
            label="Drills"
            value={12}
            color="#22C55E"
          />
        </View>

        {/* Check-in section */}
        <SectionHeader accent="#FBBF24">Daily Check-in</SectionHeader>
        <CheckInButton
          onCheckIn={() => console.log('Checked in!')}
          streak={5}
          accent="#FBBF24"
        />

        {/* Members section */}
        <SectionHeader accent="#FBBF24">Community</SectionHeader>
        <MemberCard
          member={memberData}
          accent="#FBBF24"
          onCheckIn={() => {}}
        />
      </View>
    </ScrollView>
  );
}
```

### Theme Context (Recommended)

Create a theme context to manage color modes globally:

```typescript
import React, { createContext } from 'react';

export const ThemeContext = createContext({
  mode: 'peace' as 'peace' | 'crisis' | 'recovery',
  accent: '#FBBF24',
});

export function ThemeProvider({ children }) {
  const [mode, setMode] = React.useState('peace');

  const accent = mode === 'crisis'
    ? '#EF4444'
    : mode === 'recovery'
    ? '#22C55E'
    : '#FBBF24';

  return (
    <ThemeContext.Provider value={{ mode, accent }}>
      {children}
    </ThemeContext.Provider>
  );
}
```

### Animation Tips

Components using react-native-reanimated provide smooth animations:

- **ReadinessRing:** 1.2s value animation
- **CheckInButton:** Press scale animation + pulse
- **Modal:** 400ms slide-up + overlay fade

All animations use `Easing.bezier(0.33, 0.66, 0.66, 1)` for consistency.

---

## Dependencies

```json
{
  "react-native": "^0.75+",
  "react-native-svg": "^15.1+",
  "react-native-reanimated": "^3.5+"
}
```

---

## File Structure

```
src/components/
├── EmberLogo.tsx
├── ReadinessRing.tsx
├── ResourceBar.tsx
├── MemberCard.tsx
├── DrillCard.tsx
├── CheckInButton.tsx
├── StatCard.tsx
├── SectionHeader.tsx
├── PlanCard.tsx
├── MessageBubble.tsx
├── Pill.tsx
├── Modal.tsx
├── index.ts
└── COMPONENT_GUIDE.md
```

---

## Notes

- All components use `StyleSheet.create()` for style definitions
- No web-specific APIs (no div, span, canvas) - pure React Native
- Components are self-contained; styling doesn't leak
- Props are fully typed with TypeScript interfaces
- All animations are GPU-accelerated via react-native-reanimated
- Components support light/dark theme via color props (dark theme built in)
