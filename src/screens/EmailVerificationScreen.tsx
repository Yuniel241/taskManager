import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Text, Title, useTheme, ActivityIndicator } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Linking from 'expo-linking';

const EmailVerificationScreen = ({ navigation, route }: any) => {
  const { user, reloadUser, sendEmailVerification } = useAuth();
  const { email } = route.params;
  const { colors } = useTheme();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [countdown, setCountdown] = useState(30);

  useEffect(() => {
    let isMounted = true;

    const checkEmailVerification = async () => {
      await reloadUser();
      if (isMounted && user?.emailVerified) {
        navigation.replace('Login', {
          message: 'Votre email a été vérifié. Veuillez vous connecter.',
        });
      }
    };

    const interval = setInterval(checkEmailVerification, 5000);

    const timer = countdown > 0 && setInterval(() => {
      if (isMounted) setCountdown((prev) => prev - 1);
    }, 1000);

    const handleDeepLink = ({ url }: { url: string }) => {
      if (url.includes('/email-verified')) {
        checkEmailVerification();
      }
    };

    const subscription = Linking.addEventListener('url', handleDeepLink);

    return () => {
      isMounted = false;
      clearInterval(interval);
      if (timer) clearInterval(timer);
      subscription.remove();
    };
  }, [countdown, user]);

  const handleResendEmail = async () => {
    setLoading(true);
    setMessage('');
    try {
      if (user) {
        await sendEmailVerification();
        setMessage('Un nouvel email de vérification a été envoyé');
        setCountdown(30);
      }
    } catch (error) {
      setMessage("Erreur lors de l'envoi de l'email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Icon name="email" size={80} color={colors.primary} />
      <Title style={[styles.title, { color: colors.primary }]}>Vérification requise</Title>

      <Text style={[styles.text, { color: colors.onSurface }]}>
        Nous avons envoyé un email de vérification à {email}
      </Text>

      <Text style={[styles.instructions, { color: colors.onSurface }]}>
        Veuillez cliquer sur le lien dans l'email pour activer votre compte.
      </Text>

      {message ? (
        <Text style={[styles.message, { color: colors.primary }]}>{message}</Text>
      ) : null}

      <Button
        mode="outlined"
        onPress={handleResendEmail}
        style={styles.button}
        loading={loading}
        disabled={countdown > 0 || loading}
        icon="email-send"
      >
        {countdown > 0 ? `Renvoyer (${countdown}s)` : "Renvoyer l'email"}
      </Button>

      <Button
        onPress={() => navigation.navigate('Login')}
        mode="text"
        style={{ marginTop: 10 }}
      >
        Retour à la connexion
      </Button>

      <ActivityIndicator animating={true} size="small" color={colors.primary} style={{ marginTop: 30 }} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 20,
    textAlign: 'center',
  },
  text: {
    textAlign: 'center',
    marginBottom: 10,
    fontSize: 16,
  },
  instructions: {
    textAlign: 'center',
    marginBottom: 30,
    fontSize: 15,
    paddingHorizontal: 20,
  },
  button: {
    marginTop: 20,
    width: '80%',
  },
  message: {
    marginVertical: 15,
    fontSize: 14,
    textAlign: 'center',
  },
});

export default EmailVerificationScreen;
