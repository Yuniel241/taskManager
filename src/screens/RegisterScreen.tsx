import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { TextInput, Button, Text, useTheme } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface RegisterScreenProps {
  navigation: any;
}

const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const { register } = useAuth();
  const { colors } = useTheme();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [secureConfirmTextEntry, setSecureConfirmTextEntry] = useState(true);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const validateForm = (): boolean => {
    setError('');

    if (!formData.email.trim()) {
      setError('Veuillez entrer votre email');
      return false;
    }

    if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(formData.email)) {
      setError('Veuillez entrer un email valide');
      return false;
    }

    if (!formData.password) {
      setError('Veuillez entrer un mot de passe');
      return false;
    }

    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return false;
    }

    return true;
  };

  const handleRegister = async (): Promise<void> => {
    if (!validateForm()) return;

    setLoading(true);
    setError('');
    setMessage('');

    try {
      await register(formData.email, formData.password);
      setMessage("Un email de vérification a été envoyé. Veuillez vérifier votre email avant de vous connecter.");
    } catch (err: any) {
      let errorMessage = "Erreur lors de l'inscription";
      switch (err.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'Cet email est déjà utilisé par un autre compte';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Email invalide';
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'Opération non autorisée';
          break;
        case 'auth/weak-password':
          errorMessage = 'Le mot de passe est trop faible';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Erreur réseau. Veuillez vérifier votre connexion';
          break;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (name: keyof typeof formData, value: string): void => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.background }]}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.innerContainer}>
          <Icon 
            name="account-plus" 
            size={100} 
            color={colors.primary} 
            style={styles.icon} 
          />
          
          <Text variant="headlineMedium" style={[styles.title, { color: colors.primary }]}>
            Créer un compte
          </Text>

          {error ? (
            <View style={[styles.messageContainer, styles.errorContainer]}>
              <Icon name="alert-circle" size={20} color={colors.error} />
              <Text style={[styles.messageText, { color: colors.error }]}>{error}</Text>
            </View>
          ) : null}

          {message ? (
            <View style={[styles.messageContainer, styles.successContainer, { backgroundColor: colors.primaryContainer }]}>
              <Icon name="check-circle" size={20} color={colors.primary} />
              <Text style={[styles.messageText, { color: colors.onPrimaryContainer }]}>{message}</Text>
            </View>
          ) : null}

          <TextInput
            label="Email"
            value={formData.email}
            onChangeText={(text) => handleChange('email', text)}
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.input}
            mode="outlined"
            left={<TextInput.Icon icon="email" color={colors.primary} />}
            theme={{ colors: { primary: colors.primary, background: colors.surface } }}
            disabled={loading}
          />

          <TextInput
            label="Mot de passe"
            value={formData.password}
            onChangeText={(text) => handleChange('password', text)}
            secureTextEntry={secureTextEntry}
            style={styles.input}
            mode="outlined"
            left={<TextInput.Icon icon="lock" color={colors.primary} />}
            right={
              <TextInput.Icon
                icon={secureTextEntry ? 'eye-off' : 'eye'}
                onPress={() => setSecureTextEntry(!secureTextEntry)}
                color={colors.primary}
                disabled={loading}
              />
            }
            theme={{ colors: { primary: colors.primary, background: colors.surface } }}
            disabled={loading}
          />

          <TextInput
            label="Confirmer le mot de passe"
            value={formData.confirmPassword}
            onChangeText={(text) => handleChange('confirmPassword', text)}
            secureTextEntry={secureConfirmTextEntry}
            style={styles.input}
            mode="outlined"
            left={<TextInput.Icon icon="lock-check" color={colors.primary} />}
            right={
              <TextInput.Icon
                icon={secureConfirmTextEntry ? 'eye-off' : 'eye'}
                onPress={() => setSecureConfirmTextEntry(!secureConfirmTextEntry)}
                color={colors.primary}
                disabled={loading}
              />
            }
            theme={{ colors: { primary: colors.primary, background: colors.surface } }}
            disabled={loading}
          />

          <Button
            mode="contained"
            onPress={handleRegister}
            style={[styles.button, { backgroundColor: colors.primary }]}
            loading={loading}
            disabled={loading}
            labelStyle={styles.buttonLabel}
            contentStyle={styles.buttonContent}
          >
            {loading ? '' : "S'inscrire"}
          </Button>

          <View style={styles.loginContainer}>
            <Text style={{ color: colors.onSurface }}>Déjà un compte ? </Text>
            <TouchableOpacity 
              onPress={() => navigation.navigate('Login')}
              disabled={loading}
            >
              <Text style={{ 
                color: loading ? colors.onSurfaceDisabled : colors.primary, 
                fontWeight: 'bold' 
              }}>
                Se connecter
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  innerContainer: {
    padding: 24,
  },
  icon: {
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: 'bold',
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
    borderRadius: 8,
    elevation: 2,
  },
  buttonLabel: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    height: 48,
    lineHeight: 48,
  },
  buttonContent: {
    height: 48,
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
  },
  successContainer: {
    backgroundColor: 'rgba(0, 255, 0, 0.1)',
  },
  messageText: {
    marginLeft: 8,
    fontSize: 14,
    flexShrink: 1,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
    alignItems: 'center',
  },
});

export default RegisterScreen;