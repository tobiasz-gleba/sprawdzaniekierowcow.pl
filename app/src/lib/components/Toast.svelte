<script lang="ts">
	import { notifications, type Notification } from '$lib/stores/notifications';
	import { fly } from 'svelte/transition';

	let notificationList: Notification[] = $state([]);

	notifications.subscribe((value) => {
		notificationList = value;
	});

	function getAlertClass(type: string) {
		switch (type) {
			case 'success':
				return 'alert-success';
			case 'error':
				return 'alert-error';
			case 'warning':
				return 'alert-warning';
			case 'info':
				return 'alert-info';
			default:
				return '';
		}
	}

	function getIcon(type: string) {
		switch (type) {
			case 'success':
				return `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`;
			case 'error':
				return `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`;
			case 'warning':
				return `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>`;
			case 'info':
				return `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="h-6 w-6 shrink-0 stroke-current"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`;
			default:
				return '';
		}
	}
</script>

{#if notificationList.length > 0}
	<div class="toast toast-end toast-bottom z-50">
		{#each notificationList as notification (notification.id)}
			<div
				class="alert {getAlertClass(notification.type)} shadow-lg"
				transition:fly={{ x: 300, duration: 300 }}
			>
				{@html getIcon(notification.type)}
				<span>{notification.message}</span>
				<button
					class="btn btn-circle btn-ghost btn-sm"
					onclick={() => notifications.remove(notification.id)}
					aria-label="Close notification"
				>
					✕
				</button>
			</div>
		{/each}
	</div>
{/if}
