import { ScaledSheet } from "react-native-size-matters";
import { CONTAINER_WIDTH, HALF_PICKER_HEIGHT, ITEM_HEIGHT_SCALED, PICKER_HEIGHT } from "./constants";

export const styles = ScaledSheet.create({
  modal: {
    justifyContent: 'center',
    alignItems: 'center',
    margin: 0,
  },
  container: {
    width: CONTAINER_WIDTH,
    borderRadius: '16@s',
    padding: '20@s',
    gap: '12@s',
    borderWidth: 1, 
    maxHeight: '90%' 
  },
  
  header: {
    flexDirection: 'column',
    paddingBottom: '12@s',
    borderBottomWidth: 1,
    gap: '8@s',
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  headerBottomRow: {
    alignItems: 'flex-start',
    gap: '4@s',
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
    paddingBottom: '10@s',
    borderBottomWidth: 1,
  },
  presetsScrollContent: {
    gap: '8@s',
    paddingRight: '12@s'
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
    flexDirection: 'row',
    height: PICKER_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: '20@s', 
  },
  
  wheelsWrapper: {
    flexDirection: 'row',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
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
    zIndex: 10,
  },
  columnLabel: {
    position: 'absolute',
    top: -30, 
    fontSize: '10@s',
    fontWeight: '600',
    letterSpacing: 0.5,
    includeFontPadding: false,
    width: '100%',
    textAlign: 'center',
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
    paddingBottom: '4@s',
    paddingTop: '6@s', 
    width: '20@s',
    alignItems: 'center',
    zIndex: 10,
  },
  separator: {
    fontSize: '24@s',
    fontWeight: 'bold',
    includeFontPadding: false,
    textAlignVertical: 'center',
    lineHeight: '28@s',
  },

  // AM/PM Toggle
  amPmContainer: {
    marginLeft: '16@s',
    height: ITEM_HEIGHT_SCALED * 2,
    width: '36@s',
    borderRadius: '12@s',
    borderWidth: 1,
    justifyContent: 'space-between',
    padding: '2@s',
    zIndex: 10,
  },
  amPmButton: {
    flex: 1,
    borderRadius: '10@s',
    justifyContent: 'center',
    alignItems: 'center',
  },
  amPmButtonActive: {}, 
  amPmDivider: {
    height: 1,
    width: '60%',
    alignSelf: 'center',
    opacity: 0.5,
  },
  amPmText: {
    fontSize: '11@s',
    fontWeight: '800',
    includeFontPadding: false,
  },

  // Footer
  footer: {
    paddingTop: '12@s',
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