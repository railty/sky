<script>
	import FormItem from '../components/FormItem.svelte';

	export let blankItem;
	export let item = { ...blankItem };	//clone the blank item
	export let trainers = [];
	export let users = [];
	export let deleteItem = null;
	export let updateItem;
</script>

<FormItem label={"Trainer"} >
	<div class="select">
		<select id="trainer" required bind:value={item.trainer_id}>
			<option value="" selected={item.trainer_id==""}> Please Select </option>
			{#each trainers as trainer}
				<option value={trainer.id} selected={item.trainer_id===trainer.id}> {trainer.name} </option>
			{/each}
		</select>
	</div>      
</FormItem>

<FormItem label={"Staff"} >
	<div class="select">
		<select id="staff" required bind:value={item.user_id}>
			<option value="" selected={item.user_id==""}> Please Select </option>
			{#each users as user}
				<option value={user.id} selected={item.user_id===user.id}> {user.username} </option>
			{/each}
		</select>
	</div>      

</FormItem>

<FormItem label={"Client"} >
	<input id="client" required class="input" type="text" bind:value={item.Client}>
</FormItem>

<FormItem label={"Time: (" + item.dt + ")"}>
	<!--	the html5 version, works better for mobile
		<input class="input" type="datetime-local" id="time" min="2020-01-01T00:00" step="900" bind:value={item.Time}>
		<input id="time" class="input" type="time" step="900" value='08:15'>
	-->

	<div class="select">
		<select id="hour" bind:value={item.hour}>
		{#each ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'] as h}
			<option value={h}> { h } </option>
		{/each}
		</select>
	</div>      

	<div class="select">
		<select id="minute" bind:value={item.minute}>
		{#each ['00', '15', '30', '45'] as min}
			<option value={min}> { min } </option>
		{/each}
		</select>
	</div>      

	<div class="select">
		<select id="ampm" bind:value={item.ampm}>
		{#each ['AM', 'PM'] as ampm}
			<option value={ampm}> { ampm } </option>
		{/each}
		</select>
	</div>


</FormItem>
	
<FormItem label={"Amount"} icon={"dollar-sign"}>
	<input id="amount" required class="input" type="number" min="10.00" max="100.00" step="1"  bind:value={item.Amount}>
</FormItem>

<FormItem label={"Method"}>
	<div class="select">
		<select id="method" required bind:value={item.Method}>
			<option value="" selected={item.Method==""}> Please Select </option>
			<option value='Cash' selected={item.Method==='Cash'}> Cash </option>
			<option value='Credit' selected={item.Method==='Credit'}> Credit </option>
			<option value='Debit' selected={item.Method==='Debit'}> Debit </option>
		</select>
	</div>      
</FormItem>

<div class="field is-grouped">
	<div class="control"><button class="button is-link" on:click={updateItem}>{item.id ? 'Update' : 'Create'}</button></div>
	{#if item.id}
		<div class="control"><button class="button is-link is-danger" on:click={deleteItem}>Delete</button></div>
	{/if}
</div>
