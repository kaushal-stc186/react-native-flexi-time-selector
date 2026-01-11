import { useMemo } from 'react';
import {
  View,
  Text,
  Pressable,
  FlatList,
  Modal,
  StyleSheet,
  ScrollView,
} from 'react-native';
import Animated from 'react-native-reanimated';
import { DEFAULT_THEME, ITEM_HEIGHT_SCALED, LIST_PADDING_VERTICAL } from "./constants";
import { TimePickerProps } from './types';
import { styles } from './styles';
import { parseTime, formatTimeDisplay, pad } from './helpers';
import { useTimePicker } from './useTimePicker';
import { useTimePickerAnimations } from './useTimePickerAnimations';

const TimePicker = ({
  isVisible = false,
  onClose,
  onConfirm,
  
  title = "Select Time",
  hoursLabel = "Hours",
  minutesLabel = "Minutes",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",

  initialTime,
  minTime,
  maxTime,
  disabledHours,
  shouldDisableTime,
  
  showPresets = true,
  presets = [],
  presetStep = 30,
  use12Hour = true,
  minuteInterval = 1,
  
  theme,
  customStyles,
}: TimePickerProps) => {

  const colors = useMemo(() => ({ ...DEFAULT_THEME, ...theme }), [theme]);
  
  const {
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
  } = useTimePicker({
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
  });

  const { backdropAnimatedStyle, modalAnimatedStyle } = useTimePickerAnimations(isVisible);

  const handleConfirm = () => {
    if (isSelectionValid && onConfirm) {
      onConfirm(`${pad(selectedH)}:${pad(selectedM)}`);
    }
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
      visible={isVisible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.modalWrapper}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
        >
          <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }, backdropAnimatedStyle]} />
        </Pressable>
        <Animated.View style={[styles.modal, modalAnimatedStyle]} pointerEvents="box-none">
          <View style={[styles.container, { backgroundColor: colors.bg, borderColor: colors.border }, customStyles?.modalContainer]}>
        
            {/* HEADER */}
            <View style={[styles.header, { borderColor: colors.border }, customStyles?.headerContainer]}>
              <View style={styles.headerTopRow}>
                <Text style={[styles.headerTitle, { color: colors.textSec }, customStyles?.headerTitle]}>
                  {title}
                </Text>
                
                <View style={styles.headerTopRowRight}>
                  {is12HourMode && (
                    <View style={[styles.amPmContainerHorizontal, { borderColor: colors.border, backgroundColor: colors.bgSoft }]}>
                      <Pressable
                        style={[
                          styles.amPmButtonHorizontal,
                          selectedH < 12 && styles.amPmButtonActiveHorizontal,
                          selectedH < 12 && { backgroundColor: colors.white, borderColor: colors.border, borderWidth: 1 }
                        ]}
                        onPress={toggleAmPm}
                      >
                        <Text style={[
                          styles.amPmTextHorizontal, 
                          { color: selectedH < 12 ? colors.primary : colors.textSec }
                        ]}>AM</Text>
                      </Pressable>
                      <View style={[styles.amPmDividerHorizontal, { backgroundColor: colors.border }]} />
                      <Pressable
                        style={[
                          styles.amPmButtonHorizontal,
                          selectedH >= 12 && styles.amPmButtonActiveHorizontal,
                          selectedH >= 12 && { backgroundColor: colors.white, borderColor: colors.border, borderWidth: 1 }
                        ]}
                        onPress={toggleAmPm}
                      >
                        <Text style={[
                          styles.amPmTextHorizontal, 
                          { color: selectedH >= 12 ? colors.primary : colors.textSec }
                        ]}>PM</Text>
                      </Pressable>
                    </View>
                  )}
                  
                  <Pressable 
                    style={[styles.modeButton, { backgroundColor: colors.bgSoft, borderColor: colors.border }]} 
                    onPress={toggleMode}
                  >
                    <Text style={[styles.modeButtonText, { color: colors.textMain }, customStyles?.hourSwitchText]}>{is12HourMode ? "24H" : "12H"}</Text>
                  </Pressable>
                </View>
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
                          <Pressable
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
                          </Pressable>
                        );
                      })}
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* PICKER WHEELS */}
            <View style={[styles.pickerBody, customStyles?.wheelContainer]}>
              {/* Column Headers */}
              <View style={styles.columnHeaders}>
                <View style={styles.columnHeaderItem}>
                  <Text style={[styles.columnLabel, { color: colors.textSec }, customStyles?.columnLabel]}>{hoursLabel}</Text>
                </View>
                <View style={styles.columnHeaderSpacer} />
                <View style={styles.columnHeaderItem}>
                  <Text style={[styles.columnLabel, { color: colors.textSec }, customStyles?.columnLabel]}>{minutesLabel}</Text>
                </View>
              </View>

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
                        <Pressable
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
                        </Pressable>
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
                        <Pressable
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
                        </Pressable>
                      );
                    }}
                  />
                </View>
              </View>

            </View>

            {/* FOOTER */}
            <View style={[styles.footer, { borderColor: colors.border }, customStyles?.footerContainer]}>
              <Pressable 
                style={[
                  styles.cancelButton, 
                  { borderColor: colors.border },
                  customStyles?.cancelButton
                ]} 
                onPress={onClose}
              >
                <Text style={[styles.btnText, { color: colors.textMain }, customStyles?.btnTextCancel]}>{cancelLabel}</Text>
              </Pressable>

              <Pressable 
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
              </Pressable>
            </View>

          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default TimePicker;
