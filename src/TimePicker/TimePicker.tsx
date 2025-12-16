import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Platform,
  UIManager,
  LayoutAnimation,
  NativeSyntheticEvent,
  NativeScrollEvent,
  ScrollView,
} from 'react-native';
import Modal from 'react-native-modal';
import { DEFAULT_THEME, ITEM_HEIGHT_SCALED, LAYOUT_CONFIG, LIST_PADDING_VERTICAL } from "./constants"
import { TimePickerProps } from './types';
import { styles } from './styles';
import { parseTime, formatTimeDisplay, getMinutesFromMidnight, roundToInterval, resolveTimeProp, pad } from './helpers';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// --- COMPONENT ---
const TimePicker = ({
  isVisible = false,
  onClose,
  onConfirm,
  
  // Labels
  title = "Select Time",
  hoursLabel = "Hours",
  minutesLabel = "Minutes",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",

  // Logic
  initialTime,
  minTime,
  maxTime,
  disabledHours,
  shouldDisableTime,
  
  // Settings
  showPresets = true,
  presets = [],
  presetStep = 30,
  use12Hour = true,
  minuteInterval = 1,
  
  // Styling
  theme,
  customStyles,
}: TimePickerProps) => {

  const colors = useMemo(() => ({ ...DEFAULT_THEME, ...theme }), [theme]);
  
  const [selectedH, setSelectedH] = useState(0);
  const [selectedM, setSelectedM] = useState(0);
  const [is12HourMode, setIs12HourMode] = useState(use12Hour);

  const [internalMin, setInternalMin] = useState<string | undefined>(undefined);
  const [internalMax, setInternalMax] = useState<string | undefined>(undefined);

  const hourListRef = useRef<FlatList>(null);
  const minuteListRef = useRef<FlatList>(null);
  const isProgrammaticScroll = useRef(false);

  const isDynamicMode = useMemo(() => {
    return (typeof minTime === 'object' && minTime.type === 'now') ||
           (typeof maxTime === 'object' && maxTime.type === 'now');
  }, [minTime, maxTime]);

  const hoursData = useMemo(() => {
    const base = [];
    if (is12HourMode) {
      for (let i = 1; i <= 12; i++) base.push(i);
    } else {
      for (let i = 0; i < 24; i++) base.push(i);
    }
    return base;
  }, [is12HourMode]);

  const minutesData = useMemo(() => {
    const base = [];
    for (let i = 0; i < 60; i += minuteInterval) {
      base.push(i);
    }
    return base;
  }, [minuteInterval]);

  // --- SCROLLING ---
  const scrollToTime = useCallback((h: number, m: number, mode12: boolean, animated: boolean = false) => {
      isProgrammaticScroll.current = true;
      
      let targetHIndex = 0;
      if (mode12) {
          const h12 = h % 12 || 12;
          targetHIndex = h12 - 1; 
      } else {
          targetHIndex = h; 
      }

      const roundedM = roundToInterval(m, minuteInterval) % 60;
      const targetMIndex = Math.floor(roundedM / minuteInterval);

      const safeHIndex = Math.max(0, targetHIndex);
      const safeMIndex = Math.max(0, Math.min(targetMIndex, minutesData.length - 1));

      setSelectedH(h);
      setSelectedM(roundedM);

      // Timeout allows FlatList to mount/render data before scrolling
      setTimeout(() => {
        hourListRef.current?.scrollToIndex({ index: safeHIndex, animated });
        minuteListRef.current?.scrollToIndex({ index: safeMIndex, animated });
        setTimeout(() => { isProgrammaticScroll.current = false; }, 500);
      }, 50);
  }, [minuteInterval, minutesData.length]);

  // --- FIX: Sync Scroll when Mode Changes ---
  // When switching 12h <-> 24h, the list remounts. We must re-scroll to the current selection.
  useEffect(() => {
    if (isVisible) {
        scrollToTime(selectedH, selectedM, is12HourMode, false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [is12HourMode]); // Trigger specifically on mode toggle

  // --- INIT & LIMITS ---
  useEffect(() => {
    if (!isVisible) return;

    const updateLimits = (isInitial: boolean) => {
      const resolvedMin = resolveTimeProp(minTime, minuteInterval);
      const resolvedMax = resolveTimeProp(maxTime, minuteInterval);
      
      setInternalMin(prev => (prev !== resolvedMin ? resolvedMin : prev));
      setInternalMax(prev => (prev !== resolvedMax ? resolvedMax : prev));

      if (isInitial) {
        let { h, m } = parseTime(initialTime);
        let roundedM = roundToInterval(m, minuteInterval) % 60;

        // Auto-correct if initial time is invalid
        if (resolvedMin) {
          const { h: minH, m: minM } = parseTime(resolvedMin);
          const currentTotal = h * 60 + roundedM;
          const minTotal = minH * 60 + minM;
          if (currentTotal < minTotal) {
            const nextValidM = Math.ceil(minM / minuteInterval) * minuteInterval;
            h = minH;
            roundedM = nextValidM;
            if (roundedM >= 60) { h = (h + 1) % 24; roundedM = 0; }
          }
        }

        setIs12HourMode(use12Hour);
        scrollToTime(h, roundedM, use12Hour, false);
      }
    };

    updateLimits(true);

    let intervalId: NodeJS.Timeout | null = null;
    if (isDynamicMode) {
      intervalId = setInterval(() => updateLimits(false), 10000);
    }
    return () => { if (intervalId) clearInterval(intervalId); };
  }, [isVisible, initialTime, minTime, maxTime, use12Hour, minuteInterval, scrollToTime, isDynamicMode]);

  // --- CORE VALIDITY LOGIC ---
  const checkValidity = useCallback((h: number, m: number) => {
    const currentMins = getMinutesFromMidnight(h, m);
    if (internalMin) {
      const { h: minH, m: minM } = parseTime(internalMin);
      if (currentMins < getMinutesFromMidnight(minH, minM)) return false;
    }
    if (internalMax) {
      const { h: maxH, m: maxM } = parseTime(internalMax);
      if (currentMins > getMinutesFromMidnight(maxH, maxM)) return false;
    }
    if (disabledHours && disabledHours.includes(h)) {
      return false;
    }
    if (shouldDisableTime && shouldDisableTime(h, m)) {
      return false;
    }
    return true;
  }, [internalMin, internalMax, disabledHours, shouldDisableTime]);

  const isSelectionValid = useMemo(() => {
    return checkValidity(selectedH, selectedM);
  }, [selectedH, selectedM, checkValidity]);

  // --- PRESET GENERATION ---
  const generatedPresets = useMemo(() => {
    if (presets && presets.length > 0) return presets;
    if (!internalMin || !internalMax) return [];

    const { h: minH, m: minM } = parseTime(internalMin);
    const { h: maxH, m: maxM } = parseTime(internalMax);
    
    let currentTotal = getMinutesFromMidnight(minH, minM);
    const maxTotal = getMinutesFromMidnight(maxH, maxM);

    const slots = [];
    while (currentTotal <= maxTotal) {
      const h = Math.floor(currentTotal / 60);
      const m = currentTotal % 60;
      slots.push(`${pad(h)}:${pad(m)}`);
      currentTotal += presetStep;
    }
    return slots;
  }, [presets, internalMin, internalMax, presetStep]);

  const validPresets = useMemo(() => {
    return generatedPresets.filter(p => {
      const { h, m } = parseTime(p);
      return checkValidity(h, m);
    });
  }, [generatedPresets, checkValidity]);

  const presetColumns = useMemo(() => {
    const cols = [];
    for (let i = 0; i < validPresets.length; i += 2) {
      cols.push(validPresets.slice(i, i + 2));
    }
    return cols;
  }, [validPresets]);

  // --- HANDLERS ---
  const handlePresetPress = (timeStr: string) => {
    const { h, m } = parseTime(timeStr);
    scrollToTime(h, m, is12HourMode, true);
  };

  const handleScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>, type: 'hour' | 'minute') => {
     if (isProgrammaticScroll.current) return;
     const offsetY = e.nativeEvent.contentOffset.y;
     const index = Math.round(offsetY / ITEM_HEIGHT_SCALED);
     
     if (type === 'hour') {
         if (index >= 0 && index < hoursData.length) {
             const val = hoursData[index];
             let newH = val;
             if (is12HourMode) {
                const isPm = selectedH >= 12;
                if (val === 12) newH = isPm ? 12 : 0;
                else newH = isPm ? val + 12 : val;
             }
             if (newH !== selectedH) setSelectedH(newH);
         }
     } else {
         if (index >= 0 && index < minutesData.length) {
             const val = minutesData[index];
             if (val !== selectedM) setSelectedM(val);
         }
     }
  };

  const handleHourTap = (index: number, val: number) => {
    let newH = val;
    if (is12HourMode) {
      const isPm = selectedH >= 12;
      if (val === 12) newH = isPm ? 12 : 0;
      else newH = isPm ? val + 12 : val;
    }
    hourListRef.current?.scrollToIndex({ index, animated: true });
    setSelectedH(newH);
  };

  const handleMinuteTap = (index: number, val: number) => {
    minuteListRef.current?.scrollToIndex({ index, animated: true });
    setSelectedM(val);
  };

  const toggleAmPm = () => {
    let newH = selectedH;
    if (selectedH >= 12) newH = selectedH - 12;
    else newH = selectedH + 12;
    setSelectedH(newH);
  };

  const toggleMode = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIs12HourMode(prev => !prev);
  };

  const handleConfirm = () => {
    if (isSelectionValid && onConfirm) {
      onConfirm(`${pad(selectedH)}:${pad(selectedM)}`);
    }
  };

  // --- RENDER HELPERS ---
  const getItemLayout = (_: any, index: number) => ({
    length: ITEM_HEIGHT_SCALED,
    offset: ITEM_HEIGHT_SCALED * index,
    index,
  });

  const getHourStatus = (displayH: number) => {
     let hToCheck = displayH;
     if (is12HourMode) {
         const isPm = selectedH >= 12;
         if (displayH === 12) hToCheck = isPm ? 12 : 0;
         else hToCheck = isPm ? displayH + 12 : displayH;
     }
     
     if (disabledHours && disabledHours.includes(hToCheck)) return 'invalid';

     let minH = 0, maxH = 23;
     if (internalMin) minH = parseTime(internalMin).h;
     if (internalMax) maxH = parseTime(internalMax).h;

     if (hToCheck < minH || hToCheck > maxH) return 'invalid';
     return 'valid';
  };

  const getMinuteStatus = (m: number) => {
      if (!checkValidity(selectedH, m)) return 'invalid';
      return 'valid';
  };

  const getRangeFeedback = () => {
    if (!internalMin && !internalMax) return null;
    
    const fmt = (t: string) => {
        const { h, m } = parseTime(t);
        return formatTimeDisplay(h, m, is12HourMode);
    };

    let text = "";
    if (internalMin && internalMax) {
      text = `You can select a time between ${fmt(internalMin)} and ${fmt(internalMax)}`;
    } else if (internalMin) {
      text = `You can select a time from ${fmt(internalMin)} onwards`;
    } else if (internalMax) {
      text = `You can select a time up to ${fmt(internalMax)}`;
    }

    return (
      <View style={styles.feedbackContainer}>
        <Text style={[styles.rangeText, { color: colors.textSec }, customStyles?.rangeText]}>{text}</Text>
      </View>
    );
  };

  return (
    <Modal 
      isVisible={isVisible} 
      style={styles.modal} 
      backdropOpacity={LAYOUT_CONFIG.modalOpacity}
      onBackdropPress={onClose}
      animationIn="fadeInUp"
      animationOut="fadeOutDown"
      useNativeDriver
      hideModalContentWhileAnimating
    >
      <View style={[styles.container, { backgroundColor: colors.bg, borderColor: colors.border }, customStyles?.modalContainer]}>
        
        {/* HEADER */}
        <View style={[styles.header, { borderColor: colors.border }, customStyles?.headerContainer]}>
          <View style={styles.headerTopRow}>
            <Text style={[styles.headerTitle, { color: colors.textSec }, customStyles?.headerTitle]}>
              {title}
            </Text>
            
            <TouchableOpacity 
              style={[styles.modeButton, { backgroundColor: colors.bgSoft, borderColor: colors.border }]} 
              onPress={toggleMode}
            >
              <Text style={[styles.modeButtonText, { color: colors.textMain }, customStyles?.hourSwitchText]}>{is12HourMode ? "24H" : "12H"}</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.headerBottomRow, customStyles?.heroContainer]}>
            <Text style={[
                styles.selectedTimeText, 
                { color: isSelectionValid ? colors.textMain : colors.error },
                customStyles?.timeText
            ]}>
                {formatTimeDisplay(selectedH, selectedM, is12HourMode)}
            </Text>

            {getRangeFeedback()}
          </View>
        </View>

        {/* PRESETS */}
        {showPresets && validPresets.length > 0 && (
          <View style={[styles.presetsWrapper, { borderColor: colors.border }, customStyles?.presetContainer]}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.presetsScrollContent}
            >
              {presetColumns.map((col, colIndex) => (
                <View key={`col-${colIndex}`} style={styles.presetColumn}>
                  {col.map((preset) => {
                    const { h, m } = parseTime(preset);
                    const isActive = h === selectedH && m === selectedM;
                    return (
                      <TouchableOpacity
                        key={preset}
                        style={[
                          styles.presetItem,
                          { borderColor: colors.border, backgroundColor: colors.bg },
                          customStyles?.presetButton,
                          isActive && { borderColor: colors.primary, backgroundColor: colors.primarySoft },
                          isActive && customStyles?.presetButtonActive
                        ]}
                        onPress={() => handlePresetPress(preset)}
                      >
                        <Text style={[
                          styles.presetText, 
                          { color: isActive ? colors.primary : colors.textMain },
                          customStyles?.presetText
                        ]}>
                          {formatTimeDisplay(h, m, is12HourMode)}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* PICKER WHEELS */}
        <View style={[styles.pickerBody, customStyles?.wheelContainer]}>
          <View style={styles.wheelsWrapper}>
            {/* Highlight Pill */}
            <View 
                style={[
                    styles.highlightPill, 
                    { backgroundColor: colors.primarySoft },
                    customStyles?.highlightPill
                ]} 
                pointerEvents="none" 
            />

            {/* Hour List */}
            <View style={[styles.column, customStyles?.columnContainer]}>
                <Text style={[styles.columnLabel, { color: colors.textSec }, customStyles?.columnLabel]}>{hoursLabel}</Text>
                <FlatList
                    ref={hourListRef}
                    data={hoursData}
                    key={is12HourMode ? '12h' : '24h'}
                    keyExtractor={(item) => `h-${item}`}
                    showsVerticalScrollIndicator={false}
                    snapToInterval={ITEM_HEIGHT_SCALED}
                    snapToAlignment="start"
                    decelerationRate={0.9}
                    getItemLayout={getItemLayout}
                    onMomentumScrollEnd={(e) => handleScrollEnd(e, 'hour')}
                    contentContainerStyle={{ paddingVertical: LIST_PADDING_VERTICAL }}
                    renderItem={({ item, index }) => {
                        let isSelected = false;
                        if (is12HourMode) {
                            const h12 = selectedH % 12 || 12;
                            isSelected = item === h12;
                        } else {
                            isSelected = item === selectedH;
                        }
                        
                        let textColor = colors.textMain;
                        let status = getHourStatus(item);
                        if (status === 'invalid') textColor = colors.disabled;
                        if (isSelected) textColor = colors.primary;

                        return (
                            <TouchableOpacity
                                activeOpacity={1}
                                onPress={() => handleHourTap(index, item)}
                                style={[
                                    styles.itemContainer,
                                    customStyles?.itemContainer,
                                ]}
                            >
                                <Text style={[
                                    styles.itemText,
                                    { color: textColor },
                                    customStyles?.wheelText,
                                    isSelected && styles.selectedItemText,
                                    isSelected && customStyles?.wheelTextSelected,
                                ]}>
                                    {pad(item)}
                                </Text>
                            </TouchableOpacity>
                        );
                    }}
                />
            </View>

            {/* Separator */}
            <View style={styles.separatorContainer} pointerEvents="none">
                <Text style={[styles.separator, { color: colors.textMain }, customStyles?.separator]}>:</Text>
            </View>

            {/* Minute List */}
            <View style={[styles.column, customStyles?.columnContainer]}>
                <Text style={[styles.columnLabel, { color: colors.textSec }, customStyles?.columnLabel]}>{minutesLabel}</Text>
                <FlatList
                    ref={minuteListRef}
                    data={minutesData}
                    keyExtractor={(item) => `m-${item}`}
                    showsVerticalScrollIndicator={false}
                    snapToInterval={ITEM_HEIGHT_SCALED}
                    snapToAlignment="start"
                    decelerationRate={0.9}
                    getItemLayout={getItemLayout}
                    onMomentumScrollEnd={(e) => handleScrollEnd(e, 'minute')}
                    contentContainerStyle={{ paddingVertical: LIST_PADDING_VERTICAL }}
                    renderItem={({ item, index }) => {
                        const isSelected = item === selectedM;
                        let textColor = colors.textMain;
                        let status = getMinuteStatus(item);
                        if (status === 'invalid') textColor = colors.disabled;
                        if (isSelected) textColor = colors.primary;

                        return (
                            <TouchableOpacity
                                activeOpacity={1}
                                onPress={() => handleMinuteTap(index, item)}
                                style={[
                                    styles.itemContainer,
                                    customStyles?.itemContainer,
                                ]}
                            >
                                <Text style={[
                                    styles.itemText,
                                    { color: textColor },
                                    customStyles?.wheelText,
                                    isSelected && styles.selectedItemText,
                                    isSelected && customStyles?.wheelTextSelected,
                                ]}>
                                    {pad(item)}
                                </Text>
                            </TouchableOpacity>
                        );
                    }}
                />
            </View>
          </View>

          {/* AM/PM Toggle */}
          {is12HourMode && (
              <View style={[styles.amPmContainer, { borderColor: colors.border, backgroundColor: colors.bgSoft }]}>
                  <TouchableOpacity
                    style={[
                        styles.amPmButton,
                        selectedH < 12 && styles.amPmButtonActive,
                        selectedH < 12 && { backgroundColor: colors.white, borderColor: colors.border, borderWidth: 1 }
                    ]}
                    onPress={() => toggleAmPm()}
                  >
                      <Text style={[
                          styles.amPmText, 
                          { color: selectedH < 12 ? colors.primary : colors.textSec }
                        ]}>AM</Text>
                  </TouchableOpacity>
                  <View style={[styles.amPmDivider, { backgroundColor: colors.border }]} />
                  <TouchableOpacity
                    style={[
                        styles.amPmButton,
                        selectedH >= 12 && styles.amPmButtonActive,
                        selectedH >= 12 && { backgroundColor: colors.white, borderColor: colors.border, borderWidth: 1 }
                    ]}
                    onPress={() => toggleAmPm()}
                  >
                      <Text style={[
                          styles.amPmText, 
                          { color: selectedH >= 12 ? colors.primary : colors.textSec }
                        ]}>PM</Text>
                  </TouchableOpacity>
              </View>
          )}
        </View>

        {/* FOOTER */}
        <View style={[styles.footer, { borderColor: colors.border }, customStyles?.footerContainer]}>
          <TouchableOpacity 
             style={[
                styles.cancelButton, 
                { borderColor: colors.border },
                customStyles?.cancelButton
             ]} 
             onPress={onClose}
          >
            <Text style={[styles.btnText, { color: colors.textMain }, customStyles?.btnTextCancel]}>{cancelLabel}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
             style={[
                styles.confirmButton, 
                { 
                  backgroundColor: isSelectionValid ? colors.primary : colors.bgSoft, 
                  borderColor: isSelectionValid ? 'transparent' : colors.border,
                  borderWidth: isSelectionValid ? 0 : 1
                },
                customStyles?.confirmButton
             ]} 
             onPress={handleConfirm}
             disabled={!isSelectionValid}
          >
            <Text style={[
              styles.btnText, 
              { color: isSelectionValid ? colors.white : colors.disabledBtn },
              customStyles?.btnTextConfirm
            ]}>{confirmLabel}</Text>
          </TouchableOpacity>
        </View>

      </View>
    </Modal>
  );
};

export default TimePicker;