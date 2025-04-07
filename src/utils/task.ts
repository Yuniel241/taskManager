export type Task = {
  id?: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  userId: string;
  completed: boolean;
  notificationId?: {
    dayBeforeId?: string;
    sameDayId?: string;
  }; // 🆕 pour pouvoir l’annuler plus tard
};
