import { View, Text, StyleSheet, Pressable, Modal, ScrollView } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { format, addDays, addMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isWithinInterval, isBefore, isAfter } from 'date-fns';
import { useTheme } from '@/hooks/useTheme';

interface DatePickerProps {
  checkIn: Date;
  checkOut: Date;
  onCheckInChange: (date: Date) => void;
  onCheckOutChange: (date: Date) => void;
}

export function DatePicker({ checkIn, checkOut, onCheckInChange, onCheckOutChange }: DatePickerProps) {
  const theme = useTheme();
  const [isVisible, setIsVisible] = useState(false);
  const [selecting, setSelecting] = useState<'checkIn' | 'checkOut'>('checkIn');
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const today = new Date();

  const getDaysInMonth = () => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  };

  const handleDayPress = (day: Date) => {
    if (selecting === 'checkIn') {
      onCheckInChange(day);
      if (isAfter(day, checkOut) || isSameDay(day, checkOut)) {
        onCheckOutChange(addDays(day, 1));
      }
      setSelecting('checkOut');
    } else {
      if (isBefore(day, checkIn)) {
        onCheckInChange(day);
        setSelecting('checkOut');
      } else {
        onCheckOutChange(day);
        setIsVisible(false);
        setSelecting('checkIn');
      }
    }
  };

  const isSelected = (day: Date) => isSameDay(day, checkIn) || isSameDay(day, checkOut);
  const isInRange = (day: Date) => isWithinInterval(day, { start: checkIn, end: checkOut });
  const isDisabled = (day: Date) => isBefore(day, today);

  return (
    <>
      <Pressable
        onPress={() => setIsVisible(true)}
        style={[styles.container, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}
      >
        <View style={styles.dateBlock}>
          <Text style={[styles.label, { color: theme.textTertiary }]}>Check-in</Text>
          <Text style={[styles.date, { color: theme.text }]}>
            {format(checkIn, 'MMM d, yyyy')}
          </Text>
        </View>
        <View style={[styles.divider, { backgroundColor: theme.border }]} />
        <View style={styles.dateBlock}>
          <Text style={[styles.label, { color: theme.textTertiary }]}>Check-out</Text>
          <Text style={[styles.date, { color: theme.text }]}>
            {format(checkOut, 'MMM d, yyyy')}
          </Text>
        </View>
        <Ionicons name="calendar-outline" size={24} color="#059669" />
      </Pressable>

      <Modal visible={isVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modal, { backgroundColor: theme.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                Select {selecting === 'checkIn' ? 'Check-in' : 'Check-out'} Date
              </Text>
              <Pressable onPress={() => setIsVisible(false)}>
                <Ionicons name="close" size={24} color={theme.text} />
              </Pressable>
            </View>

            <View style={styles.monthNav}>
              <Pressable onPress={() => setCurrentMonth(addMonths(currentMonth, -1))}>
                <Ionicons name="chevron-back" size={24} color={theme.text} />
              </Pressable>
              <Text style={[styles.monthText, { color: theme.text }]}>
                {format(currentMonth, 'MMMM yyyy')}
              </Text>
              <Pressable onPress={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                <Ionicons name="chevron-forward" size={24} color={theme.text} />
              </Pressable>
            </View>

            <View style={styles.weekDays}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <Text key={day} style={[styles.weekDay, { color: theme.textTertiary }]}>
                  {day}
                </Text>
              ))}
            </View>

            <View style={styles.days}>
              {getDaysInMonth().map((day, index) => {
                const disabled = isDisabled(day);
                const selected = isSelected(day);
                const inRange = isInRange(day) && !selected;

                return (
                  <Pressable
                    key={index}
                    onPress={() => !disabled && handleDayPress(day)}
                    style={[
                      styles.day,
                      selected && styles.daySelected,
                      inRange && styles.dayInRange,
                      disabled && styles.dayDisabled,
                    ]}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        { color: theme.text },
                        selected && styles.dayTextSelected,
                        disabled && { color: theme.textTertiary },
                      ]}
                    >
                      {format(day, 'd')}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.selectedDates}>
              <View style={styles.selectedDate}>
                <Text style={[styles.selectedLabel, { color: theme.textSecondary }]}>Check-in</Text>
                <Text style={[styles.selectedValue, { color: theme.text }]}>
                  {format(checkIn, 'EEE, MMM d')}
                </Text>
              </View>
              <Ionicons name="arrow-forward" size={20} color={theme.textTertiary} />
              <View style={styles.selectedDate}>
                <Text style={[styles.selectedLabel, { color: theme.textSecondary }]}>Check-out</Text>
                <Text style={[styles.selectedValue, { color: theme.text }]}>
                  {format(checkOut, 'EEE, MMM d')}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  dateBlock: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    marginBottom: 4,
  },
  date: {
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    width: 1,
    height: 40,
    marginHorizontal: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modal: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  monthNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  monthText: {
    fontSize: 18,
    fontWeight: '600',
  },
  weekDays: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  weekDay: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
  },
  days: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  day: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  daySelected: {
    backgroundColor: '#059669',
  },
  dayInRange: {
    backgroundColor: '#d1fae5',
  },
  dayDisabled: {
    opacity: 0.4,
  },
  dayText: {
    fontSize: 16,
  },
  dayTextSelected: {
    color: '#ffffff',
    fontWeight: '600',
  },
  selectedDates: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 20,
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  selectedDate: {
    flex: 1,
  },
  selectedLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  selectedValue: {
    fontSize: 16,
    fontWeight: '600',
  },
});