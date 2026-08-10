import { useLocalSearchParams } from 'expo-router';
import { AttendanceDayScreen } from '../../../modules/attendance/components/attendance-day-screen';

export default function AttendanceDayRoute() {
  const { date } = useLocalSearchParams<{ date: string }>();
  return <AttendanceDayScreen date={date} />;
}
