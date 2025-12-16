import { TextStyle, ViewStyle } from "react-native";

export interface TimeConfig {
  type: 'now';
  offsetMinutes?: number; 
  roundUp?: boolean;      
}

export interface TimePickerTheme {
  primary?: string;
  primarySoft?: string;
  bg?: string;
  bgSoft?: string;
  textMain?: string;
  textSec?: string;
  border?: string;
  white?: string;
  disabled?: string;
  disabledBtn?: string;
  error?: string;
  success?: string;
}

export interface TimePickerStyles {
  // --- Main Layout Containers ---
  modalContainer?: ViewStyle;       // The main modal card
  heroContainer?: ViewStyle; 
  headerContainer?: ViewStyle;      // Wrapper for Title, Toggle, Time, and Feedback
  wheelContainer?: ViewStyle;       // Wrapper around the Hours/Minutes lists
  footerContainer?: ViewStyle;      // Bottom wrapper for Cancel/Confirm buttons

  // --- Header Elements ---
  headerTitle?: TextStyle;          // Text style for "Select Time" title
  timeText?: TextStyle;             // Text style for the large selected time (e.g. 09:30)
  rangeText?: TextStyle;            // Text style for the limit feedback text
  
  // --- Top Right Toggle (12h/24h) ---
  toggleButton?: ViewStyle;         // Container style for the 12h/24h button
  toggleButtonText?: TextStyle;     // Text style inside the toggle button

  // --- Presets Section ---
  presetContainer?: ViewStyle;      // Wrapper around the horizontal scroll view
  presetButton?: ViewStyle;         // Style for individual preset pills
  presetButtonActive?: ViewStyle;   // Style for the selected preset pill
  presetText?: TextStyle;           // Text style inside preset pills

  // --- Picker Wheels ---
  columnContainer?: ViewStyle;      // Wrapper for a specific column (Hours or Minutes)
  columnLabel?: TextStyle;          // Labels "Hours" and "Minutes" above columns
  hourSwitchText?: TextStyle;
  itemContainer?: ViewStyle;        // The touchable area for a specific number item
  highlightPill?: ViewStyle;        // The background color bar behind the selected row
  separator?: TextStyle;            // Style for the ":" colon separator

  // --- Wheel Numbers ---
  wheelText?: TextStyle;            // Style for unselected numbers
  wheelTextSelected?: TextStyle;    // Style for the currently selected number (center)

  // --- Footer Buttons ---
  confirmButton?: ViewStyle;        // Container for Confirm button
  cancelButton?: ViewStyle;         // Container for Cancel button
  btnTextConfirm?: TextStyle;       // Text style inside Confirm
  btnTextCancel?: TextStyle;        // Text style inside Cancel
}

export interface TimePickerProps {
  // Visibility
  isVisible?: boolean;
  onClose?: () => void;
  onConfirm?: (time: string) => void;
  
  // Configuration
  title?: string; 
  hoursLabel?: string;   // Default: "Hours"
  minutesLabel?: string; // Default: "Minutes"
  confirmLabel?: string; // Default: "Confirm"
  cancelLabel?: string;  // Default: "Cancel"
  
  // Time Logic
  initialTime?: string;
  minTime?: string | TimeConfig; 
  maxTime?: string | TimeConfig;
  minuteInterval?: number;
  use12Hour?: boolean;
  
  // Exclusions / Constraints (What NOT to select)
  disabledHours?: number[]; // Array of hours (0-23) to disable
  shouldDisableTime?: (h: number, m: number) => boolean; // Custom logic
  
  // Presets
  showPresets?: boolean;
  presets?: string[]; 
  presetStep?: number;
  
  // Styling
  theme?: TimePickerTheme;
  customStyles?: TimePickerStyles;
}