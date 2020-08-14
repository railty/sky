<script>
	import moment from 'moment';
	import { onMount} from 'svelte';
	import FormEntry from './FormEntry.svelte';
	import {
		callServer,
	} from '../components/utils';

	const blankItem = {
		trainer_id: "",
		user_id: "",
		Staff: '',
		Trainer: '',
		Client: '',
		Time: getCurrentTime(),
		Amount: 15,
		Method: 'Cash',
	};

	let item = { ...blankItem };	//clone the blank item
	let users;
	let trainers;
	
	function getCurrentTime(){
		let dm = 15*60;	// 15 minutes, 
		let tm1 = moment().unix();
		let tm2 = ((tm1/dm).toFixed())*dm;
		let tm = moment.unix(tm2);	//round to the closest 15 minutes

		let date = tm.format("YYYY-MM-DD");
		let hour = tm.format("hh");
		let minute = tm.format("mm");
		let ampm = tm.format("A");

		let time = date + " " + hour + ":" + minute + ":00 " + ampm;
		return time;
	}
	async function itemIndex() {
		let url = "/entriesPublic.json";
		let rc = await callServer('GET', url);
		return rc;
	}

	async function refreshData() {
		let rc = await itemIndex();
		trainers = rc.trainers;
		users = rc.users;

		item = { ...blankItem };
	};

	onMount(async () => {
		console.log("on mount");
		await refreshData();
	});
	
	async function updateItem(){
		let trainer = document.getElementById("trainer");
		if(!trainer.validity.valid) {
			notify('warning', "trainer is required!");
			return;
		}

		let staff = document.getElementById("staff");
		if(!staff.validity.valid) {
			notify('warning', "staff is required!");
			return;
		}

		let client = document.getElementById("client");
		if(!client.validity.valid) {
			notify('warning', "client is required!");
			return;
		}

		let amount = document.getElementById("amount");
		if(!amount.validity.valid) {
			notify('warning', "amount is required!");
			return;
		}

		let method = document.getElementById("method");
		if(!method.validity.valid) {
			notify('warning', "method is required!");
			return;
		}

		let data = { ...item };

		let rc;
		if (item.id) {
			rc = await callServer('PUT', '/entries/'+item.id, data);
		}
		else {
			rc = await callServer('POST', '/entries', data);
		}
		notify(rc.code, rc.message);
		if (rc.code == 'success') {
			await refreshData();
		}
	}

</script>
<div class="columns">
  <div class="column is-3">
		<FormEntry {blankItem} {trainers} {users} {item} {updateItem} />
  </div>
</div>

<style>
	* {
		box-sizing: border-box;
	}
</style>