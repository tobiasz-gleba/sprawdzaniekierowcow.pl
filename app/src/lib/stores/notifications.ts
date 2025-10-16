import { writable } from 'svelte/store';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface Notification {
	id: string;
	message: string;
	type: NotificationType;
	duration?: number;
}

function createNotificationStore() {
	const { subscribe, update } = writable<Notification[]>([]);

	return {
		subscribe,
		add: (message: string, type: NotificationType = 'info', duration = 5000) => {
			const id = Math.random().toString(36).substring(2, 9);
			const notification: Notification = { id, message, type, duration };

			update((notifications) => [...notifications, notification]);

			if (duration > 0) {
				setTimeout(() => {
					update((notifications) => notifications.filter((n) => n.id !== id));
				}, duration);
			}

			return id;
		},
		remove: (id: string) => {
			update((notifications) => notifications.filter((n) => n.id !== id));
		},
		clear: () => {
			update(() => []);
		}
	};
}

export const notifications = createNotificationStore();

