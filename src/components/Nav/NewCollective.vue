<!--
  - @copyright Copyright (c) 2020 Azul <azul@riseup.net>
  -
  - @author Azul <azul@riseup.net>
  -
  - @license GNU AGPL version 3 or any later version
  -
  - This program is free software: you can redistribute it and/or modify
  - it under the terms of the GNU Affero General Public License as
  - published by the Free Software Foundation, either version 3 of the
  - License, or (at your option) any later version.
  -
  - This program is distributed in the hope that it will be useful,
  - but WITHOUT ANY WARRANTY; without even the implied warranty of
  - MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
  - GNU Affero General Public License for more details.
  -
  - You should have received a copy of the GNU Affero General Public License
  - along with this program. If not, see <http://www.gnu.org/licenses/>.
  -
  -->
<template>
	<AppNavigationItem v-if="!editing"
		:title="t('collectives', 'Create new collective')"
		icon="icon-add"
		@click.prevent.stop="startCreateCollective">
		<template #actions>
			<ActionButton v-if="anyCircle"
				icon="icon-circles"
				@click.stop.prevent="startSelectCircle">
				{{ t('collectives', 'Create collective for existing circle') }}
			</ActionButton>
		</template>
	</AppNavigationItem>
	<div v-else class="collective-create">
		<form v-show="editing" @submit.prevent.stop="createCollective">
			<EmojiPicker :show-preview="true" @select="addEmoji">
				<button
					class="emoji"
					type="button"
					:aria-label="t('collectives', 'Add emoji')"
					:aria-haspopup="true">
					<span v-if="emoji">{{ emoji }}</span>
					<EmoticonOutline v-else :size="20" />
				</button>
			</EmojiPicker>

			<input v-if="!pickCircle"
				ref="nameField"
				v-model="text"
				:placeholder="t('collectives', 'New collective name')"
				type="text"
				required>
			<Multiselect v-else
				ref="circleSelector"
				v-model="circle"
				:options="circles"
				open-direction="below"
				:placeholder="t('collectives', 'Select circle...')"
				required />
			<input
				type="submit"
				value=""
				class="icon-confirm"
				:class="{ 'icon-loading-small': loading }">
			<Actions>
				<ActionButton icon="icon-close" @click.stop.prevent="cancelEdit" />
			</Actions>
		</form>
	</div>
</template>

<script>
import { subscribe, unsubscribe } from '@nextcloud/event-bus'
import { ActionButton, Actions, AppNavigationItem, Multiselect } from '@nextcloud/vue'
import { GET_CIRCLES, NEW_COLLECTIVE } from '../../store/actions'
import EmojiPicker from '@nextcloud/vue/dist/Components/EmojiPicker'
import EmoticonOutline from 'vue-material-design-icons/EmoticonOutline'
import displayError from '../../util/displayError'

const randomColor = () => '#' + ((1 << 24) * Math.random() | 0).toString(16)

export default {
	name: 'NewCollective',
	components: {
		AppNavigationItem,
		ActionButton,
		Actions,
		EmojiPicker,
		EmoticonOutline,
		Multiselect,
	},
	directives: {},
	data() {
		return {
			classes: [],
			editing: false,
			loading: false,
			color: randomColor(),
			emoji: null,
			text: null,
			circle: null,
			pickCircle: false,
		}
	},
	computed: {
		name() {
			if (this.pickCircle) {
				return this.circle
			} else {
				return this.text
			}
		},
		circles() {
			return this.$store.getters.availableCircles.map(c => c.sanitizedName)
		},
		anyCircle() {
			return this.circles.length > 0
		},
	},

	mounted() {
		this.getCircles()
		subscribe('start-new-collective', this.startCreateCollective)
	},

	unmounted() {
		unsubscribe('start-new-collective', this.startCreateCollective)
	},

	methods: {
		/**
		 * Get list of all circles
		 *
		 * @return {Promise}
		 */
		getCircles() {
			return this.$store.dispatch(GET_CIRCLES)
				.catch(displayError('Could not fetch circles'))
		},

		startCreateCollective(e) {
			this.editing = true
			this.$nextTick(() => {
				this.$refs.nameField.focus()
			})
		},

		startSelectCircle(e) {
			this.editing = true
			this.pickCircle = true
			this.$nextTick(() => {
				this.$refs.circleSelector.$el.focus()
			})
		},

		/**
		 * Create a new collective with the name given in the input
		 *
		 * @param {Event} e - trigger event
		 */
		createCollective(e) {
			const updateCollective = () => {
				this.clear()
				if (this.$store.getters.collectiveChanged) {
					this.$router.push(this.$store.getters.updatedCollectivePath)
				}
			}
			const done = () => {
				this.loading = false
			}
			this.loading = true
			this.$store.dispatch(NEW_COLLECTIVE,
				{ name: this.name, emoji: this.emoji })
				.then(updateCollective)
				.catch(displayError('Could not create the collective'))
				.finally(done)
		},
		cancelEdit(e) {
			this.clear()
		},
		addEmoji(emoji) {
			this.emoji = emoji
		},
		clear() {
			this.editing = false
			this.pickCircle = false
			this.emoji = null
			this.text = null
		},
	},
}
</script>

<style lang="scss" scoped>
.collective-create {
	order: 1;
	display: flex;
	height: 44px;

	form {
		display: flex;
		flex-grow: 1;

		input[type='text'] {
			flex-grow: 1;
		}
	}
}

.popover button {
	background-color: var(--color-main-background);
	border: none;
	font-size: 14px;
}

button.emoji {
	background-color: transparent;
	border: none;
}
</style>
