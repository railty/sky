<script>
	import { onMount, afterUpdate, tick } from 'svelte';
	import Paginator from '../components/Paginator.svelte';
	import ItemList from '../components/ItemList.svelte';
		import FormItem from '../components/FormItem.svelte';
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
		let url = "/trainers.json?sort=" + sortBy;
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
		name: '',
		phone: '',
		email: ''
	};

	let item = { ...blankItem };	//clone the blank item
	
	async function refreshData() {
		let rc = await itemIndex();
		items = rc.rows;
		pages = rc.pages;
		
		if (items[0])
		if (!headers) headers = Object.keys(items[0]).map((h)=>{
			return {
				name: h,
				sort: "",
				order: 0
			};
		});

		item = { ...blankItem };
	};

	onMount(async () => {
		console.log("on mount");
		await refreshData();
	});
	
	async function updateItem(){
		let name = document.getElementById("name");
		if(!name.validity.valid) {
			notify('warning', "name is required!");
			return;
		}

		let phone = document.getElementById("phone");
		if(!phone.validity.valid) {
			notify('warning', "phone is required!");
			return;
		}

		let emailTrainer = document.getElementById("trainer-email");
		if(!emailTrainer.validity.valid) {
			notify('warning', "email is required!");
			return;
		}

		let data = { ...item };
		let rc;
		if (item.id) {
			rc = await callServer('PUT', '/trainers/'+item.id, data);
		}
		else {
			rc = await callServer('POST', '/trainers', data);
		}
		notify(rc.code, rc.message);
		if (rc.code == 'success') {
			await refreshData();
		}
	}

	async function deleteItem(){
		if (item){
			if (confirm("Are you sure?")){
				let rc = await callServer('DELETE', "/trainers/"+item.id);
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
        http.open("POST", '/trainers/export', true);
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

</script>

<div class="columns">
  <div class="column is-two-thirds">
    <h2 class="title">
      Total {pages ? pages.total : ''} trainers 
    </h2>
  	{#if items.length > 0}
	  	<ItemList {headers} {items} {blankItem} {refreshData} bind:item bind:selectedIdx />
		<Paginator {pages} {pageChanged}/>
	{/if}
  </div>

  <div class="column">
		<h2 class="title">&nbsp;</h2>

		<FormItem label={"Name"} >
			<div class="control"><input id="name" required class="input" type="text" placeholder="name" bind:value={item.name}></div>
		</FormItem>

		<FormItem label={"Phone"} icon={"phone"}>
			<input id="phone" required pattern='\d{'{'}3{'}'}-\d{'{'}3{'}'}-\d{'{'}4{'}'}' class="input" type="tel" placeholder="416-123-4567" bind:value={item.phone}>
		</FormItem>
	
		<FormItem label={"Email"} icon={"envelope"}>
			<input id="trainer-email" required class="input" type="email" placeholder="email" bind:value={item.email}>
		</FormItem>

		<div class="field is-grouped">
			<div class="control"><button class="button is-link" on:click={updateItem}>{item.id ? 'Update' : 'Create'}</button></div>
			{#if item}
				<div class="control"><button class="button is-link is-danger" on:click={deleteItem}>Delete</button></div>
			{/if}
		</div>
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
{/if}

<style>
	* {
		box-sizing: border-box;
	}
</style>