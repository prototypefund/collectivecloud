<template>
	<AppNavigation>
		<template v-if="loading('collectives')" #default>
			<EmptyContent icon="icon-loading" />
		</template>
		<template #list>
			<AppNavigationCaption
				:title="t('collectives', 'Select a collective')" />
			<CollectiveListItem v-for="collective in collectives"
				:key="collective.id"
				:collective="collective" />
			<NewCollective v-if="!isPublic" />
		</template>
		<template #footer>
			<CollectivesTrash v-if="displayTrash"
				@restore-collective="restoreCollective"
				@delete-collective="deleteCollective" />
			<CollectivesGlobalSettings v-if="!isPublic" />
		</template>
	</AppNavigation>
</template>

<script>
import { mapGetters } from 'vuex'
import { RESTORE_COLLECTIVE, DELETE_COLLECTIVE } from '../store/actions'
import AppNavigation from '@nextcloud/vue/dist/Components/AppNavigation'
import AppNavigationCaption from '@nextcloud/vue/dist/Components/AppNavigationCaption'
import NewCollective from './Nav/NewCollective'
import EmptyContent from '@nextcloud/vue/dist/Components/EmptyContent'
import CollectiveListItem from './Nav/CollectiveListItem'
import CollectivesGlobalSettings from './Nav/CollectivesGlobalSettings'
import CollectivesTrash from './Nav/CollectivesTrash'
import displayError from '../util/displayError'

export default {
	name: 'Nav',

	components: {
		AppNavigation,
		AppNavigationCaption,
		NewCollective,
		CollectiveListItem,
		CollectivesGlobalSettings,
		CollectivesTrash,
		EmptyContent,
	},

	computed: {
		...mapGetters([
			'isPublic',
			'loading',
			'collectives',
			'trashCollectives',
		]),

		displayTrash() {
			return !this.isPublic
				&& this.trashCollectives.length
				&& !this.loading('collectives')
				&& !this.loading('collectiveTrash')
		},
	},

	methods: {

		/**
		 * Restore a collective with the given name from trash
		 *
		 * @param {object} collective Properties of the collective
		 * @return {Promise}
		 */
		restoreCollective(collective) {
			return this.$store.dispatch(RESTORE_COLLECTIVE, collective)
				.catch(displayError('Could not restore collective from trash'))
		},

		/**
		 * Delete a collective with the given name from trash
		 *
		 * @param {object} collective Properties of the collective
		 * @param {boolean} circle Whether to delete the circle as well
		 * @return {Promise}
		 */
		deleteCollective(collective, circle) {
			return this.$store.dispatch(DELETE_COLLECTIVE, { ...collective, circle })
				.catch(displayError('Could not delete collective from trash'))
		},
	},
}
</script>

<style>
@media print {
	#app-navigation-vue {
		display: none !important;
	}
}
</style>
