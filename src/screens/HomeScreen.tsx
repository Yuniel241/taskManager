import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { Button, Card, Text, Title, ActivityIndicator, FAB, useTheme } from 'react-native-paper';
import { getUserTasks, deleteTask, toggleTaskCompleted } from '../services/taskService';
import { Task } from '../utils/task';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../utils/navigation';
import { useAuth } from '../context/AuthContext';

const HomeScreen = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { logout } = useAuth();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadTasks = async () => {
    try {
      const userTasks = await getUserTasks();
      setTasks(userTasks);
    } catch (err) {
      console.error('Erreur chargement tâches :', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadTasks);
    return unsubscribe;
  }, [navigation]);

  const handleToggleCompleted = async (task: Task) => {
    try {
      await toggleTaskCompleted(task.id!, task.completed);
      loadTasks();
    } catch (err) {
      console.error('Erreur update completed :', err);
    }
  };

  const renderItem = ({ item }: { item: Task }) => (
    <Card style={[styles.card, item.completed && styles.completedCard]}>
      <Card.Title
        title={`${item.completed ? '✅ ' : ''}${item.title}`}
        titleStyle={item.completed ? styles.completedText : undefined}
      />
      <Card.Content>
        <Text style={item.completed ? styles.completedText : undefined}>{item.description}</Text>
        <Text style={styles.date}>
          📅 Du {new Date(item.startDate).toLocaleDateString()} au {new Date(item.endDate).toLocaleDateString()}
        </Text>
      </Card.Content>
      <Card.Actions style={styles.actions}>
        <Button icon="check" onPress={() => handleToggleCompleted(item)}>
          {item.completed ? 'Annuler' : 'Compléter'}
        </Button>
        <Button icon="pencil" onPress={() => navigation.navigate('EditTask', { task: item })}>
          Modifier
        </Button>
        <Button icon="delete" onPress={async () => {
          await deleteTask(item.id!);
          loadTasks();
        }} color="red">
          Supprimer
        </Button>
      </Card.Actions>
    </Card>
  );

  if (loading) {
    return <ActivityIndicator animating={true} style={styles.loading} />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Title style={styles.title}>Mes tâches</Title>
        <Button mode="outlined" onPress={logout}>
          Se déconnecter
        </Button>
      </View>

      {tasks.length === 0 ? (
        <Text style={styles.empty}>Aucune tâche pour le moment</Text>
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id!}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                loadTasks();
              }}
            />
          }
        />
      )}

      <FAB
        icon="plus"
        label="Ajouter"
        style={styles.fab}
        onPress={() => navigation.navigate('AddTask')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  card: {
    marginBottom: 12,
  },
  completedCard: {
    backgroundColor: '#dff0d8',
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#888',
  },
  date: {
    marginTop: 8,
    color: '#666',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
  },
  empty: {
    marginTop: 50,
    textAlign: 'center',
    fontSize: 16,
    color: '#888',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
  actions: {
    flexWrap: 'wrap',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingRight: 8,
    gap: 4, // si tu veux un peu d'espace entre les boutons
  },
});

export default HomeScreen;
