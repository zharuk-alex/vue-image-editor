<template>
	<v-speed-dial :value="value" absolute top right direction="bottom" transition="slide-y-reverse-transition">
		<template v-slot:activator>
			<v-btn :value="value" color="secondary" elevation="2" fab>
				<v-icon v-if="value">
					mdi-close
				</v-icon>
				<v-icon v-else>
					mdi-cog
				</v-icon>
			</v-btn>
			<v-dialog transition="dialog-top-transition" hide-overlay max-width="600" v-model="dialogInformation">
				<template v-slot:default="dialog">
					<v-card>
						<v-card-text>
							<v-list dense>
								<v-subheader>Short tut</v-subheader>
								<v-list-item v-for="(tut,i) in listItems" :key="i">
									<v-list-item-content>
										<v-list-item-title v-text="tut" />
									</v-list-item-content>
								</v-list-item>
							</v-list>
						</v-card-text>
						<v-card-actions class="justify-end">
							<v-btn text @click="dialog.value = false">
								<v-icon v-text="'mdi-check'"></v-icon>
							</v-btn>
						</v-card-actions>
					</v-card>
				</template>
			</v-dialog>
		</template>
		<v-btn fab dark small color="green" :loading="isImageLoading" @click="$emit('image-save')">
			<v-icon>mdi-download</v-icon>
		</v-btn>
		<v-btn color="primary" fab small @click="dialogInformation=true">
			<v-icon v-text="'mdi-information-variant'"></v-icon>
		</v-btn>
	</v-speed-dial>
</template>
<script>
module.exports = {
	name: "speedDialSettings",
	props: {
		value: {
			type: Boolean
		},
		isImageLoading: {
			type: Boolean
		},
		listItems: {
			type: Array,
			default: []
		}
	},
	data: () => ({
		dialogInformation: false
	}),
}
</script>