import { nextTick } from 'vue';

export default async () => {
	await nextTick();
	await new Promise( res => setTimeout( res, 1 ) );
};