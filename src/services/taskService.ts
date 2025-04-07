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
  return taskRef.doc(docRef.id); // retourne la référence du document
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
    if (task.notificationId.dayBeforeId) {
      await cancelNotification(task.notificationId.dayBeforeId);
    }
    if (task.notificationId.sameDayId) {
      await cancelNotification(task.notificationId.sameDayId);
    }
  }

  await taskRef.doc(id).delete();
};

export const updateTask = async (id: string, updates: Partial<Task>) => {
  await taskRef.doc(id).update(updates);
};

export const toggleTaskCompleted = async (taskId: string, currentValue: boolean) => {
  await taskRef.doc(taskId).update({
    completed: !currentValue,
  });
};
