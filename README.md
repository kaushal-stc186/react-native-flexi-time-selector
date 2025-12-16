# react-native-flexi-time-selector

A modern, highly customizable Time Picker for React Native. Supports 12/24h formats, intervals, min/max ranges, and dynamic "Now" logic. Designed for productivity and beautiful UIs, this picker offers advanced restriction and presentation options for all your scheduling needs.

---

## ⏰ Time Format (Important)

All time inputs and outputs are **strings in the `"HH:MM"` (24-hour) format**.  
Even if you enable `use12Hour={true}` for the UI, the `onConfirm` callback **always returns a string like `"14:30"`** (2:30 PM).

---

## 🚀 Installation

Install the package with npm or yarn:

```bash
npm install react-native-flexi-time-selector
```
or
```bash
yarn add react-native-flexi-time-selector
```

---

## 📦 Usage Examples

Import and use the `TimePicker` in your React Native app.  
All examples assume you are using functional components and React hooks.

### 1. Strict Range – Office Hours

A basic picker limited to office hours, 9:00 AM to 5:00 PM.  
Users can only select times within this range.

```jsx
import React, { useState } from 'react';
import { View, Button } from 'react-native';
import { TimePicker } from 'react-native-flexi-time-selector';

export default function OfficeHoursExample() {
  const [visible, setVisible] = useState(false);

  return (
    <View>
      <Button title="Pick Office Hour" onPress={() => setVisible(true)} />
      {visible && (
      <TimePicker
        isVisible={visible}
        title="Schedule Meeting"
        minTime="09:00"
        maxTime="17:00"
        use12Hour={true}
        minuteInterval={30}
        onClose={() => setVisible(false)}
        onConfirm={time => {
          setVisible(false);
          // time will be a string like "14:00"
          console.log('Selected:', time);
        }}
      />
      )}
    </View>
  );
}
```

---

### 2. Dynamic "ASAP" Picker

Start time is always "now + 15 minutes", rounded up to the next available interval (live).  
This is ideal for delivery, booking, and real-time scheduling UIs.

```jsx
{visible && (
<TimePicker
  isVisible={visible}
  title="Pick Up Time"
  minTime={{ type: 'now', offsetMinutes: 15, roundUp: true }}
  minuteInterval={5}
  use12Hour={true}
  onClose={() => setVisible(false)}
  onConfirm={time => {
    // time will be a string like "14:35"
  }}
/>
)}
```

---

### 3. 24-Hour Format with 15-Minute Interval

A picker using military time (24-hour notation), with 15-minute steps.

```jsx
{visible && (
<TimePicker
  isVisible={visible}
  title="Select Time (24h)"
  use12Hour={false}
  minuteInterval={15}
  minTime="06:00"
  maxTime="22:00"
  onClose={() => setVisible(false)}
  onConfirm={time => {
    // time will be a string like "13:45"
  }}
/>
)}
```

---

### 4. Pre-selected Time

Show the picker with an initial pre-selected value (`"14:30"`, or 2:30 PM).

```jsx
{visible && (
<TimePicker
  isVisible={visible}
  title="Edit Time"
  initialTime="14:30"
  minuteInterval={10}
  onClose={() => setVisible(false)}
  onConfirm={time => {
    // time will be a string like "14:30"
  }}
/>)}
```

---

### 5. Custom Styling & Theming

Show how to override colors and fonts via the `theme` and `customStyles` props.

```jsx
{visible && (
<TimePicker
  isVisible={visible}
  title="Custom Theme"
  minTime="08:00"
  maxTime="20:00"
  use12Hour={false}
  theme={{
    primary: '#0D9488', // Teal
    bg: '#F0FDFA',
    textMain: '#134E4A',
    textSec: '#0D9488',
  }}
  customStyles={{
    confirmButton: { borderRadius: 24, backgroundColor: '#0D9488' },
    modalContainer: { borderWidth: 2, borderColor: '#14B8A6' },
  }}
  onClose={() => setVisible(false)}
  onConfirm={time => {
    // time will be a string like "12:00"
  }}
/>)}
```

---

## 📑 Props Reference

Below is a comprehensive reference for all TimePicker props.  
Default values are shown where appropriate.

| Prop             | Type / Shape          | Required | Default    | Description                                                                                      |
|------------------|----------------------|----------|------------|--------------------------------------------------------------------------------------------------|
| `isVisible`      | `boolean`            | Yes      |            | Whether the modal picker is visible.                                                             |
| `onClose`        | `() => void`         | Yes      |            | Callback when the modal should close (cancel or overlay tap).                                    |
| `onConfirm`      | `(time: string) => void` | Yes      |            | Called with selected time in `"HH:MM"` (24hr) string.                                            |
| `initialTime`    | `string`             | No       | (now)      | Pre-selected time as `"HH:MM"`.                                                                  |
| `minTime`        | `string` OR `{type:'now', offsetMinutes?:number, roundUp?:boolean}` | No |            | Lower limit as `"HH:MM"` or dynamic config object (see below).                                   |
| `maxTime`        | `string`             | No       |            | Upper limit as `"HH:MM"`.                                                                        |
| `minuteInterval` | `1` \| `5` \| `10` \| `15` \| `30` \| `60` | No | `1`        | Minutes step increments.                                                                         |
| `use12Hour`      | `boolean`            | No       | `true`     | Show times in 12-hour (AM/PM) or 24-hour mode.                                                   |
| `title`          | `string`             | No       | "Select Time" | Title text in the modal header.                                                                |
| `theme`          | `{ primary, bg, textMain, textSec }` | No |            | Color overrides for primary, backgrounds, and text colors.                                       |
| `customStyles`   | `{ ...ViewStyle/TextStyle }` | No |            | Fine-grained RN style overrides for containers, buttons, etc.                                    |

### Min Time Dynamic Config

You can pass an object for `minTime` to always start from "now + N minutes", optionally rounding up to the next interval:

```js
minTime={{
  type: 'now',
  offsetMinutes: 15, // (optional) Minutes to add to "now"
  roundUp: true      // (optional) Round to next valid interval
}}
```

---

## 🎨 Theming and Styling

- Use the `theme` prop for quick color changes (primary, background, text).
- Use the `customStyles` prop for advanced per-component overrides (e.g., confirm button, modal container, text).

---

## 🏆 Features At a Glance

- **12/24h Support:** Switchable on the fly.
- **Minute Intervals:** 1, 5, 10, 15, 30, or 60-minute steps.
- **Min/Max Range:** Enforce allowed time slots.
- **Dynamic "Now" Min:** Set earliest selectable time to "now + N min."
- **Pre-selection:** Start with any time pre-selected.
- **Accessible & Responsive:** Touch friendly, works on all React Native platforms.
- **Fully Customizable:** Theming and style overrides for perfect UI integration.

---

## 📢 License

MIT

---

## 💡 Contributing

PRs and suggestions are welcome! Please open issues for bugs or feature requests.

---

### 📝 Summary

- All times are **"HH:MM"** (24-hour strings) for configuration and callbacks.
- 12/24-hour display is for UI only.
- Highly flexible, super easy to integrate.

---

```card
{
  "title": "Time Format Consistency",
  "content": "All props and callbacks use HH:MM (24-hour) strings. UI can show 12h or 24h, but output is always 24h."
}
```