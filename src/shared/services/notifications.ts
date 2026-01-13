
export class NotificationService {
  static async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support desktop notification');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  }

  static async sendNotification(title: string, body: string, icon?: string) {
    if (Notification.permission === 'granted') {
      try {
        if ('serviceWorker' in navigator) {
          const registration = await navigator.serviceWorker.ready;
          if (registration) {
            registration.showNotification(title, {
              body,
              icon: icon || '/favicon.ico',
              tag: 'signalhub-alert',
              vibrate: [200, 100, 200]
            } as any);
            return;
          }
        }

        new Notification(title, {
          body,
          icon: icon || '/favicon.ico',
          tag: 'signalhub-alert'
        });
      } catch (e) {
        console.error('Notification failed', e);
      }
    }
  }

  static simulateBackgroundAlerts() {
    setTimeout(() => {
      this.sendNotification(
        'Volumetric Divergence Detected',
        'NVDA volume 4.2x above average with no news catalyst.'
      );
    }, 10000);
  }
}
