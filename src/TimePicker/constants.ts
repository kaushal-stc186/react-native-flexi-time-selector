import { Dimensions } from "react-native";
import { s } from "react-native-size-matters";

const DEFAULT_THEME = {
  primary: '#4338CA',        
  primarySoft: '#EEF2FF',    
  bg: '#FFFFFF',             
  bgSoft: '#F8FAFC',         
  textMain: '#0F172A',       
  textSec: '#64748B',        
  border: '#E2E8F0',         
  white: '#FFFFFF',
  disabled: '#CBD5E1', 
  disabledBtn: '#94A3B8', 
  error: '#E11D48',          
  success: '#059669',        
};

const LAYOUT_CONFIG = {
  modalOpacity: 0.6,
  containerWidthPct: 0.90,
  itemHeight: 56, 
  visibleItems: 3, 
};

const SCREEN_WIDTH = Dimensions.get('window').width;
const CONTAINER_WIDTH = Math.floor(SCREEN_WIDTH * LAYOUT_CONFIG.containerWidthPct);
const ITEM_HEIGHT_SCALED = Math.round(s(LAYOUT_CONFIG.itemHeight));
const LIST_PADDING_VERTICAL = (ITEM_HEIGHT_SCALED * LAYOUT_CONFIG.visibleItems - ITEM_HEIGHT_SCALED) / 2;
const PICKER_HEIGHT = ITEM_HEIGHT_SCALED * LAYOUT_CONFIG.visibleItems;
const HALF_PICKER_HEIGHT = PICKER_HEIGHT / 2;

export { DEFAULT_THEME, LAYOUT_CONFIG, SCREEN_WIDTH, CONTAINER_WIDTH, ITEM_HEIGHT_SCALED, LIST_PADDING_VERTICAL, PICKER_HEIGHT, HALF_PICKER_HEIGHT }