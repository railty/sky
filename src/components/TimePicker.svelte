<script>
	//<TimePicker initTime={initTime} bind:time={time}/>

	import moment from "moment";
    export let showDate = true;
	export let initTime = null;
	$: {
        let tm;

		if (initTime){
			tm = moment(initTime, "YYYY-MM-DD hh:mm:ss A");
		}
		else{
        	let dm = 15*60;	// 15 minutes, 
            let tm1 = moment().unix();
            let tm2 = ((tm1/dm).toFixed())*dm;
            tm = moment.unix(tm2);	//round to the closest 15 minutes
		}
        date = tm.format("YYYY-MM-DD");
		hour = tm.format("hh");
		minute = tm.format("mm");
		ampm = tm.format("A");
	}

	let date;
	let hour;
	let minute;
	let ampm;
	$: {
		time = date + " " + hour + ":" + minute + ":00 " + ampm;
	}
	export let time;

</script>
<div>
    {#if showDate}
        <input id="date" class="input" type="date" min="2020-01-01" bind:value={date}>
    {:else}
        <input id="date" class="input" type="date" min="2020-01-01" bind:value={date} readonly>
    {/if}
    <div class="select">
        <select id="hour" bind:value={hour}>
        {#each ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'] as h}
            <option value={h}> { h } </option>
        {/each}
        </select>
    </div>      

    <div class="select">
        <select id="minute" bind:value={minute}>
        {#each ['00', '15', '30', '45'] as min}
            <option value={min}> { min } </option>
        {/each}
        </select>
    </div>      

    <div class="select">
        <select id="ampm" bind:value={ampm}>
        {#each ['AM', 'PM'] as ampm}
            <option value={ampm}> { ampm } </option>
        {/each}
        </select>
    </div>

</div>