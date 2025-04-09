import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, RefreshControl, Platform } from 'react-native';
import { Button, Card, Text, Title, ActivityIndicator, FAB, useTheme, TextInput, AnimatedFAB } from 'react-native-paper';
import { getUserTasks, deleteTask, toggleTaskCompleted } from '../services/taskService';
import { Task } from '../utils/task';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../utils/navigation';
import { useAuth } from '../context/AuthContext';
import { Alert } from 'react-native';
import Toast from 'react-native-toast-message';
import Animated, { 
  FadeIn, 
  FadeOut, 
  SlideInRight, 
  SlideOutRight,
  useSharedValue,
  withSpring 
} from 'react-native-reanimated';

const HomeScreen = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { logout } = useAuth();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'completed' | 'todo'>('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [searchQuery, setSearchQuery] = useState('');
  const fabAnimation = useSharedValue(0);

  const loadTasks = async () => {
    try {
      const userTasks = await getUserTasks();
      setTasks(userTasks);
    } catch (err) {
      console.error('Erreur chargement projet :', err);
      showToast('error', 'Erreur de chargement des tâches');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadTasks);
    fabAnimation.value = withSpring(1, { damping: 10 });
    return unsubscribe;
  }, [navigation]);

  const showToast = (type: 'success' | 'error', text: string) => {
    Toast.show({
      type,
      text1: text,
      position: 'bottom',
    });
  };

  const handleToggleCompleted = async (task: Task) => {
    try {
      await toggleTaskCompleted(task.id!, task.completed);
      loadTasks();
      showToast('success', `Tâche marquée comme ${task.completed ? 'à faire' : 'complétée'}`);
    } catch (err) {
      console.error('Erreur update completed :', err);
      showToast('error', 'Erreur lors de la mise à jour');
    }
  };

  const toggleExpanded = (taskId: string) => {
    setExpandedTasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

  const renderItem = ({ item, index }: { item: Task, index: number }) => {
    const isExpanded = expandedTasks.has(item.id!);
    const description = item.description || '';
    const truncated = description.length > 100 && !isExpanded;
  
    return (
      <Animated.View entering={SlideInRight.delay(index * 50)} exiting={SlideOutRight}>
        <Card style={[styles.card, item.completed && styles.completedCard]}>
          <Card.Title
            title={`${item.completed ? '✅ ' : ''}${item.title}`}
            titleStyle={item.completed ? styles.completedText : undefined}
          />
          <Card.Content>
            <Text style={item.completed ? styles.completedText : undefined}>
              {truncated ? `${description.slice(0, 100)}...` : description}
            </Text>
    
            {description.length > 100 && (
              <Button
                compact
                mode="text"
                onPress={() => toggleExpanded(item.id!)}
                labelStyle={{ fontSize: 12 }}
              >
                {isExpanded ? 'Voir moins' : 'Voir plus'}
              </Button>
            )}
    
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
            <Button
              icon="delete"
              onPress={() => {
                Alert.alert(
                  "Confirmer la suppression",
                  "Êtes-vous sûr de vouloir supprimer ce projet ? Cette action est irréversible.",
                  [
                    {
                      text: "Annuler",
                      style: "cancel",
                    },
                    {
                      text: "Supprimer",
                      style: "destructive",
                      onPress: async () => {
                        try {
                          await deleteTask(item.id!);
                          loadTasks();
                          showToast('success', 'Tâche supprimée');
                        } catch (err) {
                          showToast('error', 'Erreur lors de la suppression');
                        }
                      },
                    },
                  ],
                  { cancelable: true }
                );
              }}
              buttonColor="red"
            >
              Supprimer
            </Button>
          </Card.Actions>
        </Card>
      </Animated.View>
    );
  };

  const getFilteredAndSortedTasks = () => {
    let filtered = [...tasks];
  
    if (selectedFilter === 'completed') {
      filtered = filtered.filter((t) => t.completed);
    } else if (selectedFilter === 'todo') {
      filtered = filtered.filter((t) => !t.completed);
    }
  
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.title.toLowerCase().includes(query) ||
          (t.description && t.description.toLowerCase().includes(query))
      );
    }
  
    return filtered.sort((a, b) => {
      const dateA = new Date(a.startDate).getTime();
      const dateB = new Date(b.startDate).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });
  };

  if (loading) {
    return <ActivityIndicator animating={true} style={styles.loading} />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Title style={styles.title}>Mes projets</Title>
        <Button mode="outlined" onPress={logout}>
          Se déconnecter
        </Button>
      </View>

      <TextInput
        mode="outlined"
        placeholder="Rechercher..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        left={<TextInput.Icon icon="magnify" />}
        style={{ marginBottom: 16 }}
      />

      <View style={styles.filterButtonsContainer}>
        <Button 
          mode={selectedFilter === 'all' ? 'contained' : 'outlined'} 
          onPress={() => setSelectedFilter('all')}
          style={styles.filterButton}
        >
          Tous
        </Button>
        <Button 
          mode={selectedFilter === 'todo' ? 'contained' : 'outlined'} 
          onPress={() => setSelectedFilter('todo')}
          style={styles.filterButton}
        >
          À faire
        </Button>
        <Button 
          mode={selectedFilter === 'completed' ? 'contained' : 'outlined'} 
          onPress={() => setSelectedFilter('completed')}
          style={styles.filterButton}
        >
          Complétés
        </Button>
        <Button 
          onPress={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          style={styles.filterButton}
        >
          Trier : {sortOrder === 'asc' ? '↑' : '↓'}
        </Button>
      </View>

      {tasks.length === 0 ? (
        <Text style={styles.empty}>Aucune tâche pour le moment</Text>
      ) : (
        <FlatList
          data={getFilteredAndSortedTasks()}
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


      <AnimatedFAB
        icon={'plus'}
        label={'Ajouter'}
        extended={true}
        onPress={() => navigation.navigate('AddTask')}
        visible={true}
        animateFrom={'right'}
        style={[styles.fab, { backgroundColor: colors.primary }]}
      />

      <Toast />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Platform.select({
      ios: 16,
      android: 16,
    }),
    paddingTop: 16,
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
    marginHorizontal: Platform.select({
      web: 'auto',
    }),
    maxWidth: 800,
    width: Platform.select({
      web: '90%',
      default: '100%',
    }),
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
    gap: 4,
  },
  filterButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    flexWrap: 'wrap',
    gap: 8,
  },
  filterButton: {
    flex: 1,
    minWidth: 80,
    maxWidth: 120,
  },
});

export default HomeScreen;