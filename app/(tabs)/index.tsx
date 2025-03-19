import { useEffect, useState } from 'react';
import { Platform, StyleSheet, Text, View, FlatList, AppState, AppStateStatus } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

interface Notification {
  id: string;
  title: string;
  body: string;
  timestamp: Date;
  packageName?: string;
}

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [permissionStatus, setPermissionStatus] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let subscription: any;
    let notificationSubscription: any;

    const setup = async () => {
      try {
        if (Platform.OS !== 'android') return;
        
        await Notifications.setNotificationHandler({
          handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: true,
          }),
        });

        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== 'granted') {
          setError('Notification permissions not granted');
          return;
        }

        notificationSubscription = Notifications.addNotificationReceivedListener((notification) => {
          const newNotification = {
            id: String(Date.now()),
            title: notification.request.content.title || 'No Title',
            body: notification.request.content.body || 'No Content',
            timestamp: new Date(),
            packageName: notification.request.content.data?.packageName as string,
          };
          
          setNotifications((current) => [newNotification, ...current]);
        });

        subscription = AppState.addEventListener('change', (nextAppState) => {
          if (nextAppState === 'active') {
            checkPermissions();
          }
        });
      } catch (err) {
        console.error('Setup error:', err);
        setError('Error setting up notifications: ' + (err instanceof Error ? err.message : String(err)));
      }
    };

    setup();

    return () => {
      subscription?.remove();
      notificationSubscription?.remove();
    };
  }, []);

  const checkPermissions = async () => {
    try {
      if (Platform.OS === 'web') {
        setPermissionStatus('Notifications are not supported on web');
        return;
      }

      if (!Device.isDevice) {
        setPermissionStatus('Must use a physical device for notifications');
        return;
      }

      const { status } = await Notifications.getPermissionsAsync();
      setPermissionStatus(status);

      if (status !== 'granted') {
        setError('Please enable notification access in your device settings');
      } else {
        setError(null);
      }
    } catch (err) {
      console.error('Permission check error:', err);
      setError('Error checking permissions: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  const renderNotification = ({ item }: { item: Notification }) => (
    <View style={styles.notificationCard}>
      {item.packageName && (
        <Text style={styles.packageName}>From: {item.packageName}</Text>
      )}
      <Text style={styles.notificationTitle}>{item.title}</Text>
      <Text style={styles.notificationBody}>{item.body}</Text>
      <Text style={styles.timestamp}>
        {item.timestamp.toLocaleTimeString()}
      </Text>
    </View>
  );

  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <Text style={styles.warning}>
          Notification reading is not supported on web platforms.
          Please use an Android device.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
      
      {permissionStatus !== 'granted' ? (
        <View style={styles.messageContainer}>
          <Text style={styles.warning}>
            Notification access required
          </Text>
          <Text style={styles.helpText}>
            Please follow these steps:
            {'\n\n'}1. Go to Settings > Apps > Special app access
            {'\n'}2. Tap on Notification access
            {'\n'}3. Find this app and enable access
            {'\n'}4. Return to this app
          </Text>
        </View>
      ) : notifications.length === 0 ? (
        <View style={styles.messageContainer}>
          <Text style={styles.emptyText}>
            No notifications yet
          </Text>
          <Text style={styles.helpText}>
            Notifications from other apps will appear here once they are received
          </Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderNotification}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  errorContainer: {
    backgroundColor: '#fee2e2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
    textAlign: 'center',
  },
  messageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  listContainer: {
    paddingBottom: 16,
  },
  notificationCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  packageName: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#1a1a1a',
  },
  notificationBody: {
    fontSize: 16,
    color: '#4a4a4a',
    marginBottom: 8,
  },
  timestamp: {
    fontSize: 12,
    color: '#888',
    alignSelf: 'flex-end',
  },
  warning: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ff6b6b',
    textAlign: 'center',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
    marginBottom: 12,
  },
  helpText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
});