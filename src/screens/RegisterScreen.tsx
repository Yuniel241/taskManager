import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  ImageBackground,
  Dimensions,
} from 'react-native';
import { TextInput, Button, Text, useTheme } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../utils/navigation';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

interface RegisterScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Register'>;
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


  const getFirebaseErrorMessage = (code: string): string => {
    switch (code) {
      case 'auth/email-already-in-use':
        return 'Cet email est déjà utilisé par un autre compte.';
      case 'auth/invalid-email':
        return "L'adresse email n'est pas valide.";
      case 'auth/user-not-found':
        return "Aucun compte n'est associé à cet email.";
      case 'auth/wrong-password':
        return "L'adresse email ou le mot de passe est incorrect.";
      case 'auth/too-many-requests':
        return "Trop de tentatives. Veuillez réessayer plus tard.";
      case 'auth/operation-not-allowed':
        return "L'inscription est temporairement désactivée.";
      case 'auth/weak-password':
        return 'Le mot de passe est trop faible (minimum 6 caractères).';
      case 'auth/network-request-failed':
        return 'Problème de connexion réseau. Veuillez vérifier votre connexion.';
      default:
        return "Une erreur est survenue. Veuillez réessayer.";
    }
  };
  


  const handleRegister = async (): Promise<void> => {
    if (!validateForm()) return;

    setLoading(true);
    setError('');
    setMessage('');

    try {
      await register(formData.email, formData.password);
      setMessage("Un email de vérification a été envoyé. Veuillez vérifier votre boîte mail.");
      navigation.navigate("VerifyEmail");
    } catch (err: any) {
       console.log("Erreur Firebase:", err); // (optionnel) utile pendant le dev

      const firebaseMessage = getFirebaseErrorMessage(err.code);
      setError(firebaseMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (name: keyof typeof formData, value: string): void => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  return (
    <ImageBackground 
      source={require('../../assets/registerBg.jpg')} 
      style={styles.backgroundImage}
      blurRadius={2}
    >
      <LinearGradient
        colors={['rgba(110, 69, 226, 0.85)', 'rgba(136, 211, 206, 0.85)']}
        style={styles.gradientOverlay}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.card}>
              <View style={styles.logoContainer}>
                <Icon 
                  name="account-plus" 
                  size={80} 
                  color="#FFF" 
                  style={styles.logo} 
                />
                <Text variant="headlineMedium" style={styles.title}>
                  Créer un compte
                </Text>
              </View>

              {error ? (
                <View style={styles.errorContainer}>
                  <Icon name="alert-circle" size={20} color="#FFF" />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              {message ? (
                <View style={styles.successContainer}>
                  <Icon name="check-circle" size={20} color="#FFF" />
                  <Text style={styles.successText}>{message}</Text>
                </View>
              ) : null}

              <TextInput
                label="Email"
                value={formData.email}
                onChangeText={(text) => handleChange('email', text)}
                autoCapitalize="none"
                keyboardType="email-address"
                style={styles.input}
                mode="flat"
                left={<TextInput.Icon icon="email" color="#FFF" />}
                theme={{ 
                  colors: { 
                    primary: '#FFF',
                    text: '#FFF',
                    placeholder: 'rgba(255,255,255,0.7)',
                    background: 'transparent',
                  } 
                }}
                disabled={loading}
              />

              <TextInput
                label="Mot de passe"
                value={formData.password}
                onChangeText={(text) => handleChange('password', text)}
                secureTextEntry={secureTextEntry}
                style={styles.input}
                mode="flat"
                left={<TextInput.Icon icon="lock" color="#FFF" />}
                right={
                  <TextInput.Icon
                    icon={secureTextEntry ? 'eye-off' : 'eye'}
                    onPress={() => setSecureTextEntry(!secureTextEntry)}
                    color="#FFF"
                  />
                }
                theme={{ 
                  colors: { 
                    primary: '#FFF',
                    text: '#FFF',
                    placeholder: 'rgba(255,255,255,0.7)',
                    background: 'transparent',
                  } 
                }}
                disabled={loading}
              />

              <TextInput
                label="Confirmer le mot de passe"
                value={formData.confirmPassword}
                onChangeText={(text) => handleChange('confirmPassword', text)}
                secureTextEntry={secureConfirmTextEntry}
                style={styles.input}
                mode="flat"
                left={<TextInput.Icon icon="lock-check" color="#FFF" />}
                right={
                  <TextInput.Icon
                    icon={secureConfirmTextEntry ? 'eye-off' : 'eye'}
                    onPress={() => setSecureConfirmTextEntry(!secureConfirmTextEntry)}
                    color="#FFF"
                  />
                }
                theme={{ 
                  colors: { 
                    primary: '#FFF',
                    text: '#FFF',
                    placeholder: 'rgba(255,255,255,0.7)',
                    background: 'transparent',
                  } 
                }}
                disabled={loading}
              />

              <Button
                mode="contained"
                onPress={handleRegister}
                style={styles.registerButton}
                loading={loading}
                disabled={loading}
                labelStyle={styles.buttonLabel}
                contentStyle={styles.buttonContent}
              >
                {loading ? '' : "S'inscrire"}
              </Button>

              <View style={styles.loginContainer}>
                <Text style={styles.loginText}>Déjà un compte ? </Text>
                <TouchableOpacity 
                  onPress={() => navigation.navigate('Login')}
                  disabled={loading}
                >
                  <Text style={styles.loginLink}>
                    Se connecter
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 25,
    padding: 30,
    filter: 'blur(10px)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    marginBottom: 15,
  },
  title: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 28,
    textAlign: 'center',
  },
  input: {
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
  },
  registerButton: {
    marginTop: 15,
    borderRadius: 10,
    backgroundColor: '#FFF',
    height: 50,
    justifyContent: 'center',
  },
  buttonLabel: {
    color: '#6e45e2',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonContent: {
    height: 50,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 59, 48, 0.2)',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 48, 0.5)',
  },
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(52, 199, 89, 0.2)',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(52, 199, 89, 0.5)',
  },
  errorText: {
    color: '#FFF',
    marginLeft: 10,
    fontSize: 14,
    flexShrink: 1,
  },
  successText: {
    color: '#FFF',
    marginLeft: 10,
    fontSize: 14,
    flexShrink: 1,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 25,
  },
  loginText: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  loginLink: {
    color: '#FFF',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});

export default RegisterScreen;