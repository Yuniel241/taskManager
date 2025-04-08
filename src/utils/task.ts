export interface Task {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  completed: boolean;
  createdAt: string;
  userId: string;
  notificationId?: {
    dayBeforeId?: string;
    sameDayId?: string;
    startDayId?: string;
    sevenDaysAfterId?: string;
  };
}
