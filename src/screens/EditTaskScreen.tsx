import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { TextInput, Button, Title, useTheme } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { updateTask } from '../services/taskService';
import { Task } from '../utils/task';
import { scheduleTaskNotification, cancelNotification } from '../services/notifications';
import { useNavigation, RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../utils/navigation';

type EditTaskRouteProp = RouteProp<RootStackParamList, 'EditTask'>;

const EditTaskScreen = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const route = useRoute<EditTaskRouteProp>();
  const task = route.params.task;

  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [startDate, setStartDate] = useState(new Date(task.startDate));
  const [endDate, setEndDate] = useState(new Date(task.endDate));
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    if (!title.trim()) {
      Alert.alert('Erreur', 'Le titre est requis');
      return;
    }
    if (endDate < startDate) {
      Alert.alert('Erreur', 'La date de fin ne peut pas être avant la date de début');
      return;
    }
  
    setLoading(true);
    try {
      await updateTask(task.id!, {
        title,
        description,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });
  
      Alert.alert('Succès', 'Projet mis à jour');
      navigation.goBack();
    } catch (err) {
      console.error(err);
      Alert.alert('Erreur', 'Mise à jour échouée');
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}>
      <Title style={[styles.title, { color: colors.primary }]}>Modifier le projet</Title>

      <TextInput
        label="Titre"
        value={title}
        onChangeText={setTitle}
        mode="outlined"
        style={styles.input}
      />

      <TextInput
        label="Description"
        value={description}
        onChangeText={setDescription}
        mode="outlined"
        multiline
        numberOfLines={4}
        style={styles.input}
      />

      <Button
        onPress={() => setShowStartPicker(true)}
        mode="outlined"
        style={styles.dateButton}
      >
        Début : {startDate.toLocaleDateString()}
      </Button>
      {showStartPicker && (
        <DateTimePicker
          value={startDate}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowStartPicker(false);
            if (selectedDate) setStartDate(selectedDate);
          }}
        />
      )}

      <Button
        onPress={() => setShowEndPicker(true)}
        mode="outlined"
        style={styles.dateButton}
      >
        Fin : {endDate.toLocaleDateString()}
      </Button>
      {showEndPicker && (
        <DateTimePicker
          value={endDate}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowEndPicker(false);
            if (selectedDate) setEndDate(selectedDate);
          }}
        />
      )}

      <Button
        mode="contained"
        onPress={handleUpdate}
        loading={loading}
        disabled={loading}
        style={styles.saveButton}
      >
        Sauvegarder les modifications
      </Button>
    </ScrollView>
  );
};

export default EditTaskScreen;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    marginBottom: 16,
  },
  dateButton: {
    marginBottom: 16,
  },
  saveButton: {
    marginTop: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
});
