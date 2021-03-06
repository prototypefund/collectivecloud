<template>
	<AppContentList>
		<!-- loading -->
		<div v-if="loading('backlinks')" class="emptycontent">
			<div class="icon icon-loading" />
		</div>

		<!-- error message -->
		<div v-else-if="error" class="emptycontent">
			<div class="icon icon-error" />
			<h2>{{ error }}</h2>
		</div>

		<!-- backlinks list -->
		<template v-else-if="!loading('backlinks') && backlinks.length">
			<div v-for="backlinkPage in backlinks"
				:key="backlinkPage.id"
				class="app-content-list-item">
				<div class="app-content-list-item-icon">
					<div class="icon-page-white" />
				</div>
				<router-link class="app-content-list-item-link" :to="pagePath(backlinkPage)">
					<div class="app-content-list-item-line-one">
						{{ pagePathTitle(backlinkPage) }}
					</div>
					<div class="app-content-list-item-line-two">
						{{ lastUpdate(page) }}
					</div>
				</router-link>
			</div>
		</template>

		<!-- no backlinks found -->
		<EmptyContent v-else icon="icon-search">
			<h2>{{ t('collectives', 'No backlinks available') }}</h2>
			<template #desc>
				{{ t( 'collectives', 'If other pages link to this one, they will be listed here.') }}
			</template>
		</EmptyContent>
	</AppContentList>
</template>

<script>
import AppContentList from '@nextcloud/vue/dist/Components/AppContentList'
import EmptyContent from '@nextcloud/vue/dist/Components/EmptyContent'
import moment from '@nextcloud/moment'
import { mapState, mapGetters, mapMutations } from 'vuex'
import { GET_BACKLINKS } from '../../store/actions'

export default {
	name: 'SidebarTabBacklinks',

	 components: {
		AppContentList,
		EmptyContent,
	},

	props: {
		page: {
			type: Object,
			required: true,
		},
	},

	data() {
		return {
			error: '',
		}
	},

	computed: {
		...mapState({
			backlinks: (state) => state.pages.backlinks,
		}),
		...mapGetters([
			'loading',
			'pagePath',
			'pagePathTitle',
		]),

		lastUpdate() {
			return (page) => moment.unix(page.timestamp).fromNow()
		},
	},

	watch: {
		'page.id'() {
			this.load('backlinks')
			this.unsetBacklinks()
			this.getBacklinks()
		},
	},

	mounted() {
		this.getBacklinks()
	},

	methods: {
		...mapMutations(['load', 'unsetBacklinks']),

		/**
		 * Get backlinks for a page
		 */
		async getBacklinks() {
			try {
				this.$store.dispatch(GET_BACKLINKS, this.page)
			} catch (e) {
				this.error = t('collectives', 'Could not get page backlinks')
				console.error('Failed to get page backlinks', e)
			}
		},
	},
}
</script>

<style lang="scss" scoped>
.app-content-list {
	max-width: none;
	border-right: none;
}

.app-content-list-item {
	border-bottom: 1px solid rgba(100, 100, 100, 0.1);
}

.app-content-list-item .app-content-list-item-icon {
	line-height: 40px;
	width: 26px;
	height: 34px;
	left: 12px;
	font-size: 24px;
	background-color: var(--color-background-darker);
	border-radius: 4px;
}

.app-content-list-item .app-content-list-item-icon div {
	border-radius: 3px 12px 3px 3px;
}

.app-content-list .app-content-list-item .app-content-list-item-link {
	overflow: hidden;
	text-overflow: ellipsis;
}

.app-content-list .app-content-list-item .app-content-list-item-line-one {
	font-size: 120%;

	// Crop the string at the beginning, not end
	// TODO: Untested with RTL script
	text-align: left;
	direction: rtl;
}

.app-content-list .app-content-list-item .app-content-list-item-line-two {
	opacity: .5;
}

.app-content-list-item:hover {
	background-color: var(--color-background-hover);
}
</style>
