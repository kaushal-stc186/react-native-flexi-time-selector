import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { FlatList } from 'react-native';
import { TimePickerProps } from './types';
import { ITEM_HEIGHT_SCALED } from './constants';
import { parseTime, formatTimeDisplay, getMinutesFromMidnight, roundToInterval, resolveTimeProp, pad } from './helpers';

export const useTimePicker = ({
  isVisible,
  initialTime,
  minTime,
  maxTime,
  disabledHours,
  shouldDisableTime,
  showPresets,
  presets,
  presetStep,
  use12Hour,
  minuteInterval,
}: Pick<TimePickerProps, 
  'isVisible' | 'initialTime' | 'minTime' | 'maxTime' | 'disabledHours' | 
  'shouldDisableTime' | 'showPresets' | 'presets' | 'presetStep' | 
  'use12Hour' | 'minuteInterval'
>) => {
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

    setTimeout(() => {
      hourListRef.current?.scrollToIndex({ index: safeHIndex, animated });
      minuteListRef.current?.scrollToIndex({ index: safeMIndex, animated });
      setTimeout(() => { isProgrammaticScroll.current = false; }, 500);
    }, 50);
  }, [minuteInterval, minutesData.length]);

  useEffect(() => {
    if (isVisible) {
      scrollToTime(selectedH, selectedM, is12HourMode, false);
    }
  }, [is12HourMode]);

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

  const handlePresetPress = useCallback((timeStr: string) => {
    const { h, m } = parseTime(timeStr);
    scrollToTime(h, m, is12HourMode, true);
  }, [scrollToTime, is12HourMode]);

  const handleScrollEnd = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>, type: 'hour' | 'minute') => {
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
  }, [hoursData, minutesData, is12HourMode, selectedH, selectedM]);

  const handleHourTap = useCallback((index: number, val: number) => {
    let newH = val;
    if (is12HourMode) {
      const isPm = selectedH >= 12;
      if (val === 12) newH = isPm ? 12 : 0;
      else newH = isPm ? val + 12 : val;
    }
    hourListRef.current?.scrollToIndex({ index, animated: true });
    setSelectedH(newH);
  }, [is12HourMode, selectedH]);

  const handleMinuteTap = useCallback((index: number, val: number) => {
    minuteListRef.current?.scrollToIndex({ index, animated: true });
    setSelectedM(val);
  }, []);

  const toggleAmPm = useCallback(() => {
    let newH = selectedH;
    if (selectedH >= 12) newH = selectedH - 12;
    else newH = selectedH + 12;
    setSelectedH(newH);
  }, [selectedH]);

  const toggleMode = useCallback(() => {
    setIs12HourMode(prev => !prev);
  }, []);

  const getItemLayout = useCallback((_: any, index: number) => ({
    length: ITEM_HEIGHT_SCALED,
    offset: ITEM_HEIGHT_SCALED * index,
    index,
  }), []);

  const getHourStatus = useCallback((displayH: number) => {
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
  }, [is12HourMode, selectedH, disabledHours, internalMin, internalMax]);

  const getMinuteStatus = useCallback((m: number) => {
    if (!checkValidity(selectedH, m)) return 'invalid';
    return 'valid';
  }, [selectedH, checkValidity]);

  return {
    selectedH,
    selectedM,
    is12HourMode,
    internalMin,
    internalMax,
    hourListRef,
    minuteListRef,
    hoursData,
    minutesData,
    isSelectionValid,
    validPresets,
    presetColumns,
    handlePresetPress,
    handleScrollEnd,
    handleHourTap,
    handleMinuteTap,
    toggleAmPm,
    toggleMode,
    getItemLayout,
    getHourStatus,
    getMinuteStatus,
    scrollToTime,
  };
};
