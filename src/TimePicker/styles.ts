import { StyleSheet } from "react-native";
import { ScaledSheet } from "react-native-size-matters";
import { CONTAINER_WIDTH, HALF_PICKER_HEIGHT, ITEM_HEIGHT_SCALED, PICKER_HEIGHT } from "./constants";

export const styles = ScaledSheet.create({
  modalWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: CONTAINER_WIDTH,
    borderRadius: '16@s',
    padding: '16@s',
    gap: '10@s',
    borderWidth: 1,
  },
  
  header: {
    flexDirection: 'column',
    paddingBottom: '10@s',
    borderBottomWidth: 1,
    gap: '6@s',
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  headerTopRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: '8@s',
  },
  headerBottomRow: {
    alignItems: 'flex-start',
    gap: '4@s',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: '12@s',
    flexWrap: 'nowrap',
    width: '100%',
  },
  headerTitle: {
    fontSize: '11@s',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  selectedTimeText: { 
    fontSize: '32@s', 
    fontWeight: '800',
    letterSpacing: -0.5,
    lineHeight: '40@s',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  
  feedbackContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap', 
    maxWidth: '100%',
    gap: '6@s', 
  },
  rangeText: {
    fontSize: '11@s',
    fontWeight: '500',
    flexShrink: 1,
  },

  modeButton: {
    paddingHorizontal: '10@s',
    paddingVertical: '4@s',
    borderRadius: '8@s', 
    borderWidth: 1,
  },
  modeButtonText: { 
    fontSize: '11@s', 
    fontWeight: '700' 
  },

  // PRESETS STYLE
  presetsWrapper: {
    paddingBottom: '8@s',
    borderBottomWidth: 1,
  },
  presetsScrollContent: {
    gap: '8@s',
    paddingHorizontal: '12@s',
  },
  presetColumn: {
    flexDirection: 'column',
    gap: '8@s',
  },
  presetItem: {
    paddingHorizontal: '12@s',
    paddingVertical: '8@s',
    borderRadius: '8@s',
    borderWidth: 1,
    minWidth: '70@s',
    alignItems: 'center',
  },
  presetText: {
    fontSize: '12@s',
    fontWeight: '600',
    includeFontPadding: false,
  },

  // Picker Body
  pickerBody: {
    paddingTop: '10@s',
    paddingBottom: '10@s',
    gap: '4@s',
  },
  
  columnHeaders: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: '8@s',
  },
  columnHeaderItem: {
    width: '64@s',
    alignItems: 'center',
    justifyContent: 'center',
  },
  columnHeaderSpacer: {
    width: '20@s',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  wheelsWrapper: {
    flexDirection: 'row',
    height: PICKER_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    flexWrap: 'nowrap',
  },

  highlightPill: {
    position: 'absolute',
    top: HALF_PICKER_HEIGHT - (ITEM_HEIGHT_SCALED / 2),
    height: ITEM_HEIGHT_SCALED,
    width: '100%',
    borderRadius: '8@s', 
  },

  column: {
    width: '64@s',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    flexShrink: 0,
  },
  columnLabel: {
    fontSize: '11@s',
    fontWeight: '600',
    letterSpacing: 0.5,
    includeFontPadding: false,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  
  itemContainer: {
    height: ITEM_HEIGHT_SCALED,
    width: '64@s',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemText: {
    fontSize: '20@s',
    fontWeight: '600', 
    includeFontPadding: false,
    textAlign: 'center',
    textAlignVertical: 'center',
    opacity: 0.3,
  },
  selectedItemText: {
    fontSize: '24@s',
    fontWeight: '800', 
    opacity: 1,
    transform: [{ scale: 1.05 }]
  },
  
  separatorContainer: {
    height: '100%',
    justifyContent: 'center',
    width: '20@s',
    alignItems: 'center',
    zIndex: 10,
    flexShrink: 0,
  },
  separator: {
    fontSize: '24@s',
    fontWeight: 'bold',
    includeFontPadding: false,
    textAlignVertical: 'center',
    lineHeight: '28@s',
  },

  // AM/PM Toggle (Horizontal - in header top row)
  amPmContainerHorizontal: {
    flexDirection: 'row',
    borderRadius: '8@s',
    borderWidth: 1,
    justifyContent: 'space-between',
    padding: '2@s',
    zIndex: 10,
    flexShrink: 0,
    alignItems: 'center',
  },
  amPmButtonHorizontal: {
    paddingHorizontal: '10@s',
    paddingVertical: '4@s',
    borderRadius: '6@s',
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: '36@s',
  },
  amPmButtonActiveHorizontal: {}, 
  amPmDividerHorizontal: {
    width: 1,
    height: '16@s',
    alignSelf: 'center',
    opacity: 0.5,
  },
  amPmTextHorizontal: {
    fontSize: '11@s',
    fontWeight: '800',
    includeFontPadding: false,
  },

  // Footer
  footer: {
    paddingTop: '10@s',
    flexDirection: 'row',
    gap: '12@s',
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    paddingVertical: '12@s',
    borderRadius: '10@s',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButton: {
    flex: 1,
    paddingVertical: '12@s',
    borderRadius: '10@s',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    fontSize: '14@s',
    fontWeight: '700',
    includeFontPadding: false,
  }
});