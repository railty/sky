<script>
	import moment from 'moment';
	import { onMount} from 'svelte';
	import Paginator from '../components/Paginator.svelte';
	import ItemList from '../components/ItemList.svelte';
	import FormEntry from './FormEntry.svelte';
	import {
		callServer,
	} from '../components/utils';

	async function itemIndex() {
		let sortBy = '';
		if (headers){
			sortBy = headers
				.filter((h)=>{return h.sort})	//only sort is true
				.sort((a, b)=>{return b.order-a.order}) //order by order
				.map((h)=>{return h.name+' '+(h.sort=='up' ? 'asc' : 'desc')})	//return 'name desc'
				.reduce((last, h)=>{return last + h + ','}, '')	//return name desc, size desc
				.slice(0, -1);	//remove the last ,
			console.log(sortBy);
		}
		let url = "/entries.json?sort=" + sortBy;
		if (page) url = url+"&page="+page;
		let rc = await callServer('GET', url);
		return rc;
	}

	let page;
	let pages;
	let items = [];
	let headers;	
	let selectedIdx = -1;

	const blankItem = {
		trainer_id: "",
		user_id: "",
		Staff: '',
		Trainer: '',
		Client: '',
		Time: getCurrentTime(),
		initTime: getCurrentTime(),
		Amount: 15,
		Method: 'Cash',
	};

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

	let item = { ...blankItem };	//clone the blank item
	let users;
	let trainers;
	
	async function refreshData() {
		let rc = await itemIndex();
		items = rc.rows;
		pages = rc.pages;
		trainers = rc.trainers;
		users = rc.users;

		items = items.map((item)=>{
			item.initTime = item.Time;
			return item;
		});

		if (items[0])
		if (!headers) headers = Object.keys(items[0])
		.filter((h)=>{return !(['trainer_id', 'user_id', 'dt', 'hour', 'minute', 'ampm', 'initTime'].includes(h)) })
		.map((h)=>{
			return {
				name: h,
				sort: "",
				order: 0
			};
		});

		item = { ...blankItem };
		selectedIdx = -1;
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

	async function deleteItem(){
		if (item){
			if (confirm("Are you sure?")){
				let rc = await callServer('DELETE', "/entries/"+item.id);
				notify(rc.code, rc.message);
				if (rc.code=="success") await refreshData();
				selectedIdx = -1;
			}
		}
	}
	async function pageChanged(p){
		page = p;
		await refreshData();
	}


	let profile = null;
	window.updateProfile = function(p){
		profile = p;
	}

    function onSignIn(user) {
      	profile = user.getBasicProfile();
    }
    
    function onSignOut() {
		profile = null;		
	  
	 	let auth2 = gapi.auth2.getAuthInstance();
      	auth2.signOut().then(function () {
        	console.log('User signed out.');
      	});
    }

    function exportExcel(){
      console.log("export");
      let auth = gapi.auth2.getAuthInstance();
      if (auth.isSignedIn.get()) {
        let accessToken = auth.currentUser.get().getAuthResponse().access_token;

        let http = new XMLHttpRequest();
        http.open("POST", '/entries/export', true);
        http.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        http.setRequestHeader("Accept", "application/json");
        http.setRequestHeader('Authorization', 'Bearer ' + accessToken);

        http.onreadystatechange = function() { //Call a function when the state changes.
          if(http.readyState == 4 && http.status == 200) {
            var rc = JSON.parse(http.responseText);
            console.log("exported " + rc.message);

            let htmlNotification = "<div class='notification is-" + rc.code + "'>" + rc.message + "</div>";
            let divNotification = document.getElementById("notification");
            divNotification.innerHTML = htmlNotification;
            setTimeout(()=>{
              divNotification.innerHTML = "";
            }, 2000);
          }
        }
      
        var data = {
          '_csrf': csrf,
        };

        var params = JSON.stringify(data);
        http.send(params);
      }
      else{
        console.log('Signin required.');
      }
    }


		async function RemoveHistory(){
			if (confirm("Are you sure?")){
				let rc = await callServer('DELETE', "/entries/");
				notify(rc.code, rc.message);
				if (rc.code=="success") await refreshData();
				selectedIdx = -1;
			}
		}
</script>

<div class="columns">
  <div class="column is-two-thirds">
    <h2 class="title">
      Total {pages? pages.total : ''} entries 
    </h2>
  	{#if items.length > 0}
	  	<ItemList {headers} {items} {blankItem} {refreshData} bind:item bind:selectedIdx />
		<Paginator {pages} {pageChanged}/>
	{/if}
  </div>

  <div class="column">
		<h2 class="title">&nbsp;</h2>
		<FormEntry {blankItem} {trainers} {users} {item} {updateItem} {deleteItem} />
  </div>
</div>

<div class="g-signin2" data-onsuccess="onSignIn" style="visibility: {profile ? 'hidden': 'visible'};"></div>

{#if profile}
	<div id="profile" style="margin: 0 20px;">
		<b id="profile_name" class="name"></b><br/>
		<i id="profile_email" class="email"></i>
	</div>	
	<button id="btnExport" class="button is-primary" on:click={exportExcel}>Export</button>
	<button class="button is-primary" on:click={onSignOut}>Signout</button>

	<button id="btnDelete" class="button is-danger is-pulled-right" on:click={RemoveHistory}>Delete</button>
{/if}

<style>
	* {
		box-sizing: border-box;
	}
</style>