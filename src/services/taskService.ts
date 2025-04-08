import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { Task } from '../utils/task';
import { cancelNotification, scheduleTaskNotification } from './notifications';

const taskRef = firestore().collection('tasks');

export const addTask = async (
  task: Omit<Task, 'id' | 'createdAt' | 'userId' | 'notificationId'>
) => {
  const userId = auth().currentUser?.uid;
  if (!userId) throw new Error('User not authenticated');

  const newTask = {
    ...task,
    userId,
    createdAt: new Date().toISOString(),
    completed: false,
  };

  const docRef = await taskRef.add(newTask);
  const doc = taskRef.doc(docRef.id);

  // 🛎 Planification des notifications
  const notifIds = await scheduleTaskNotification(
    docRef.id,
    task.title,
    new Date(task.endDate),
    new Date(task.startDate)
  );

  // 🔄 Mise à jour avec les ID des notifications
  await doc.update({
    notificationId: notifIds,
  });

  return doc;
};



export const getUserTasks = async () => {
  const userId = auth().currentUser?.uid;
  if (!userId) throw new Error('User not authenticated');

  const snapshot = await taskRef.where('userId', '==', userId).get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Task[];
};

export const deleteTask = async (id: string) => {
  const doc = await taskRef.doc(id).get();
  const task = doc.data() as Task;

  if (task.notificationId) {
    const {
      dayBeforeId,
      sameDayId,
      startDayId,
      sevenDaysAfterId,
    } = task.notificationId;

    if (dayBeforeId) await cancelNotification(dayBeforeId);
    if (sameDayId) await cancelNotification(sameDayId);
    if (startDayId) await cancelNotification(startDayId);
    if (sevenDaysAfterId) await cancelNotification(sevenDaysAfterId);
  }

  await taskRef.doc(id).delete();
};


export const updateTask = async (id: string, updates: Partial<Task>) => {
  const taskDoc = await taskRef.doc(id).get();
  const existingTask = taskDoc.data() as Task;

  if (!existingTask) throw new Error('Task not found');

  const updatesRequireNotificationReschedule =
    updates.startDate || updates.endDate || updates.title;

  let newNotificationIds = existingTask.notificationId;

  if (updatesRequireNotificationReschedule) {
    // 🗑 Supprimer les anciennes notifications
    const {
      dayBeforeId,
      sameDayId,
      startDayId,
      sevenDaysAfterId,
    } = existingTask.notificationId || {};

    if (dayBeforeId) await cancelNotification(dayBeforeId);
    if (sameDayId) await cancelNotification(sameDayId);
    if (startDayId) await cancelNotification(startDayId);
    if (sevenDaysAfterId) await cancelNotification(sevenDaysAfterId);

    // 📆 Reprogrammer avec les nouvelles dates
    const startDate = updates.startDate
      ? new Date(updates.startDate)
      : new Date(existingTask.startDate);

    const endDate = updates.endDate
      ? new Date(updates.endDate)
      : new Date(existingTask.endDate);

    const title = updates.title || existingTask.title;

    newNotificationIds = await scheduleTaskNotification(id, title, endDate, startDate);
  }

  // 🔄 Mise à jour de la tâche avec les nouvelles infos + nouvelles notifications
  await taskRef.doc(id).update({
    ...updates,
    notificationId: newNotificationIds,
  });
};


export const toggleTaskCompleted = async (taskId: string, currentValue: boolean) => {
  await taskRef.doc(taskId).update({
    completed: !currentValue,
  });
};
