// SMUM CHECKIN APP
// This project is thanks to contributions of people like Kush Jain.
// FUNCTION naming covention Prefix:
// -->   ui....  interact with User Interface [HTML]
// -->   nav...  provide Nav Section and Tab navigation
// -->   util..  provide general utility
// -->   db....  interact with AWS DynamoDB service
// -->   cog...  interact with AWS Cognito service
// Function naming syntax [prefix][action][subject]

// **********************************************************************************************************
// *********************************************** GLOBAL VARS **********************************************
// **********************************************************************************************************
let aws = "https://hjfje6icwa.execute-api.us-west-2.amazonaws.com/prod"
let rowNum = 1
let MAX_ID_DIGITS = 4
let uiDate = 'MM/DD/YYYY'
let uiDateTime = 'MM/DD/YYYY HH:mm'
let longDate = "MMMM Do, YYYY  |  LT"
let date = 'YYYY-MM-DD'
let dateTime = 'YYYY-MM-DDTHH:mm'
let clientData = null // current client search results
let clientNotes = []
let client = {} // current client
let serviceType = null
let emergencyFood = false
let currentNavTab = "clients"
// cognito config
let CognitoUserPool = AmazonCognitoIdentity.CognitoUserPool;
let  poolData = {
		UserPoolId : 'us-west-2_AufYE4o3x', // Your user pool id here
		ClientId : '7j3jhm5a3pkc67m52bf7tv10au' // Your client id here
};
let userPool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(poolData);
let session = {}
let cognitoUser = {}
let authorization = {}

// **********************************************************************************************************
// **********************************************************************************************************
uiFillDate()
uiShowHideLogin('show')
navGotoTab("tab1")

document.onkeydown = function(e) {
	if ($("#searchField").is(":focus")&&e.keyCode==13) {event.preventDefault(); dbSearchClients()}
}
// control the "save button" behaviour
$(document.body).on('change','.clientForm',function(){uiSaveButton('client', 'Save')});
$(document.body).on('change','.serviceTypeForm',function(){uiSaveButton('serviceType', 'Save')});
$(document).ready(function(){
	uiShowServicesDateTime();
  setInterval(uiShowServicesDateTime, 10000);
});
$(document).ready(function(){
	uiShowLastServed();
  setInterval(uiShowLastServed, 60000);
});



// **********************************************************************************************************
// ********************************************** NAV FUNCTIONS *********************************************
// **********************************************************************************************************
function navSwitch(link){
	switch (link) {
		case "clients":
			navGotoSec("nav1")
			navGotoTab("tab1")
			uiShowServicesButtons()
			break
		case "newClient":
			navGotoSec("nav2")
			addClient()
			break
		case "admin":
			navGotoSec("nav3")
			navGotoTab("aTab1")
			uiShowServiceTypes()
			break
		case "user":
			navGotoSec("nav4")
			navGotoTab("uTab1")
			// userProfile()
			break
		case "logInOut":
			navGotoSec("nav5")
	}
}

function navGotoSec(nav){
	for (let i = 0; i < 5; i++) $("#nav"+i).removeClass("navActive")
	$("#"+nav).addClass("navActive")
	$("#"+currentNavTab).hide()
	switch (nav) {
		case "nav1": // SERVICES
			currentNavTab = "clientsDiv"
			break
		case "nav2": // PROGRAMS
			currentNavTab = "programsDiv"
			break
		case "nav3": // ADMIN
			currentNavTab = "adminDiv"
			break
		case "nav4": // USER
			uiFillUserData()
			uiShowUserEdit()
			currentNavTab = "userDiv"
			break
		case "nav5": // LOGINOUT
			// currentNavTab = "logInOut"
			if ($('#nav5').html() === 'Login'){
				uiShowHideLogin('show')
			} else {
				cogLogoutUser()
				$('#nav5').html('Login')
				$('#nav4').html('')
			}
		}
	$("#"+currentNavTab).show()
}

function navGotoTab(tab){
	let useAttr = document.getElementById(tab);
	useAttr.setAttribute('checked', true);
	useAttr['checked'] = true;
}

// **********************************************************************************************************
// *********************************************** UI FUNCTIONS *********************************************
// **********************************************************************************************************
function uiAddNewDependentsRow(){
	let nextRow = '00';
	if (client.dependents!=null){
		nextRow = client.dependents.length;
		// if (nextRow < 10) nextRow = "0" + nextRow
	}
	let dependentRow = "<tr>"
	dependentRow+="<td><input id='givenName["+nextRow+"]' class='inputBox inputForTable dependentsForm'></td>"
	dependentRow+="<td><input id='familyName["+nextRow+"]' class='inputBox inputForTable dependentsForm'></td>"
	dependentRow+="<td><select id='relationship["+nextRow+"]' class='inputBox inputForTable dependentsForm'><option value='Child'>Child</option><option value='Spouse'>Spouse</option><option value='Other Dependent'>Other Dependent</option></select></td>"
	dependentRow+="<td><select id='gender["+nextRow+"]' class='inputBox inputForTable dependentsForm'><option value='Male'>Male</option><option value='Female'>Female</option></select></td>"
	dependentRow+="<td><input id='dob["+nextRow+"]' class='inputBox inputForTable dependentsForm' onchange='utilCalcDependentAge("+ parseInt(nextRow)+")' type='date'></td>"
	dependentRow+="<td class='dependentsViewOnly'><input id='age["+nextRow+"]' class='inputBox inputForTable dependentsForm' style='width:50px'></td><td>"
	dependentRow+="<select id='isActive["+nextRow+"]' class='inputBox inputForTable dependentsForm'><option value='Active'>Active</option><option value='Inactive'>Inactive</option></select></td>"
	dependentRow+="</tr>"
	$('#dependentsTable').append(dependentRow)
	uiToggleDependentsViewEdit('edit');
}

function uiBuildHistoryBottom(){
	// lastServed.
  columns = ["createdDateTime","updatedDateTime","firstSeenDate", "lastSeenDate", "familyIdCheckedDate"]
	let clientArray = []
	clientArray.push(client)
	uiGenSelectHTMLTable('#historyTop',clientArray,columns,'historyTable')
}

function uiBuildHistoryTop(){
  //data = dbGetServicesNotes(client.clientId)
  columns = ["createdDateTime","updatedDateTime","firstSeenDate", "lastServed[0].serviceDateTime", "familyIdCheckedDate"]
	let clientArray = []
	clientArray.push(client)
	uiGenSelectHTMLTable('#historyTop',clientArray,columns,'historyTable')
}

function uiOutlineTableRow(table, row){
	$('#' + table + ' tr:eq('+ row + ')').css('outline', '2px solid').siblings().css('outline', 'none')
}

function uiToggleButtonColor(action, serviceTypeId, serviceButtons){
	if (action == "gray") {
		$("#btn-"+serviceTypeId).css({'color': 'var(--grey-green', 'border-color': 'var(--grey-green'}) //addClass("buttonGrayOut")
		if (serviceButtons == "Primary") $("#image-"+serviceTypeId).addClass("imageGrayOut")
	} else {
		$("#btn-"+serviceTypeId).removeClass("buttonGrayOut")
		if (serviceButtons == "Primary") $("#image-"+serviceTypeId).removeClass("imageGrayOut")
	}
}

function uiUpdateCurrentClient(index) {
	uiOutlineTableRow('clientTable', index + 1)
	uiSetClientsHeader('#' + client.clientId + ' | ' + client.givenName + ' ' + client.familyName)
	uiShowServicesButtons()
	uiShowClientEdit(false)
}

function uiResetDependentsTable() {
	// TODO write reset code
}

function uiSaveButton(form, action){
	if (action === 'Save') {
		if ($('#'+form+'SaveButton').val() !== 'Save'){
			$('#'+form+'SaveButton').val('Save')
			$('#'+form+'SaveButton').removeClass('saving')
			$('#'+form+'SaveButton').removeClass('saved')
			$('#'+form+'SaveButton').removeClass('failed')
		}
		return
	} else {
		$('#'+form+'SaveButton').val(action)
		action = action.toLowerCase()
		action = action.replace(/[#_!.*]/g, '')
		$('#'+form+'SaveButton').addClass(action)
	}
}

function uiShowFamilyCounts(totalAdults, totalChildren, totalOtherDependents, totalSize){
	if (document.getElementById("family.totalAdults") != null){
		document.getElementById("family.totalAdults").value = totalAdults
		document.getElementById("family.totalChildren").value = totalChildren
		document.getElementById("family.totalOtherDependents").value = totalOtherDependents
		document.getElementById("family.totalSize").value = totalSize
	}
}

function uiShowHideLogin(todo){
	if (todo === 'show'){
		$('.loginOverlay').show().css('display', 'flex')
	} else {
		$('.loginOverlay').hide()
		$('#loginEmail').val('')
		$('#loginPassword').val('')
	}
}

function uiShowHidePassword(){
	console.log('in functoin')
	if ($('#loginPassword').attr('type') == 'password') {
    $('#loginPassword').attr('type', 'text');
	} else {
    $('#loginPassword').attr('type', 'password');
	}
}

function uiShowHistory(){
	uiBuildHistoryTop()
	uiBuildHistoryBottom()
}

let uiShowLastServed = function() {
	if (client.clientId != undefined){
		let visitHeader = "FIRST SERVICE VISIT";
		if (client.lastServed[0] != undefined) {
			let lastServed = utilCalcLastServedDays()
			let lowestDaysServed = lastServed.daysUSDA
			if (lastServed.daysNonUSDA < lowestDaysServed) lowestDaysServed = lastServed.daysNonUSDA
			let servedDate = moment().subtract(lowestDaysServed, "days");
			let displayLastServed = moment(servedDate).fromNow() //lastServedFood[0].serviceDateTime
			visitHeader = 'LAST SERVED ' + displayLastServed.toUpperCase()
		}
		$('#serviceLastVisit').html(visitHeader)
	}
}

function uiShowPrimaryServiceButtons(btnPrimary, lastVisit, activeServiceTypes) {
	// if (lastVisit < 14 && lastVisit > 1) {
	// 	emergencyFood = true
	// 	// TODO remove old static emergency button
	// 	$('#servicePrimaryButtons').html('<div class="btnEmergency" onclick="utilAddService('+"'USDA Food','Items: 1','food'"+')">EMERGENCY FOOD ONLY</div>');
	// } else {

console.log(btnPrimary)

		let primaryButtons = "" //'<div class="primaryButtonContainer"><div class="buttonCenteredContainer">';
		for (let i=0; i<btnPrimary.length; i++){
			let x = btnPrimary[i]; // index of active serviceTypes
			let btnClass = "btnPrimary";
			if (activeServiceTypes[x].serviceCategory == "Administration") btnClass = "btnAdmin";
			let attribs = "\'" + activeServiceTypes[x].serviceTypeId + "\', \'" + activeServiceTypes[x].serviceCategory + "\', \'" + activeServiceTypes[x].serviceButtons + "\'";
			let image = "<img id=\'image-" + activeServiceTypes[x].serviceTypeId + "\' src='images/PrimaryButton" + activeServiceTypes[x].serviceCategory + ".png'>";
			primaryButtons += '<div class=\"' + btnClass + '\" id=\"btn-'+ activeServiceTypes[x].serviceTypeId +'\" onclick=\"utilAddService('+ attribs +')\">' + activeServiceTypes[x].serviceName + "<br>" + image + "</div>";
		}
		$('#servicePrimaryButtons').html(primaryButtons)
	//}
}

let uiShowServicesDateTime = function() {
	if (client.clientId != undefined){
		$('#serviceDateTime').html(moment().format(longDate))
	}
}

function uiShowUserEdit(){
	$('#userFormContainer').html(uiGetTemplate('#userForm'))
}

function uiShowClientEdit(isEdit){
	uiDisplayNotes("Client Notes")
	$('#clientFormContainer').html(uiGetTemplate('#clientForm'))
	uiPopulateForm(client, 'clientForm')
	if (isEdit){
		uiToggleClientViewEdit('edit')
	} else {
		uiToggleClientViewEdit('view')
	}
	uiShowDependents(isEdit)
	addClientNotes(client['clientId'])
}

function uiShowDependents(isEdit){
	if (client.dependents!=null){
		uiGenSelectHTMLTable('#dependentsFormContainer',client.dependents,["givenName","familyName",'relationship','gender',"dob","age","isActive"],'dependentsTable')
	}
	// if (isEdit){
	// 	let plusButton = '<a href="#" onclick="uiAddTableRow()" style="font-size:18px;width:150px;margin-bottom:8px;margin-top:10px;display: inline-block;" class="btn btn-block btn-primary btn-success">+</a>'
	// 	$('#dependents').append('<div class="formEntry">'+plusButton+'</div>')
	// }
}

function uiShowNewServiceTypeForm(){
	$('#serviceTypeFormContainer').html(uiGetTemplate('#serviceTypeForm'))
	$('#serviceTypeId').val(cuid())
	navGotoTab("aTab2")
}

function uiShowNote(text,text2){
	$('.notes').append('<tr><td class="data">'+text+'</td>'+'<td class="data">'+text2+'</td></tr>')
}

function uiShowNewClientForm(){
	client = ""
	$('#clientFormContainer').html(uiGetTemplate('#clientForm'))
	$('#createdDateTime.clientForm').val(utilNow())
	$('#updatedDateTime.clientForm').val(utilNow())
	$('#firstSeenDate.clientForm').val(today())
	$('#homeless.clientForm').val('false')
	$('#city.clientForm').val('San Jose')
	$('#state.clientForm').val('CA')
	navGotoTab("tab3")
}

function uiShowSecondaryServiceButtons(activeServiceTypes){
	if (emergencyFood) return
	$('#serviceSecondaryButtons').html("")
	for (let i=0; i<btnSecondary.length; i++){
		let x = btnSecondary[i];
		let attribs = "\'" + activeServiceTypes[x].serviceTypeId + "\', \'" + activeServiceTypes[x].serviceCategory + "\', \'" + activeServiceTypes[x].serviceButtons + "\'"
		let service = '<div id="btn-' + activeServiceTypes[x].serviceTypeId +'\" class="btnSecondary" onclick=\"utilAddService('+ attribs +')\">' + activeServiceTypes[x].serviceName + "</div>"
		// + '\"\, 'Items: '+client.family.totalSize+"'"+', '+(i+100)+')">'+activeServiceTypes[x].serviceName+"</a></div>"
		$('#serviceSecondaryButtons').append(service)
	}
}

function uiShowServicesButtons(){
	// builds the Services tab
	// return if client object is empty
	if ($.isEmptyObject(client)) return

//	let lastIdCheck = utilCalcLastIdCheckDays()
// TODO IF lastidcheck is current service then may not need idCheck field

	let lastServed = utilCalcLastServedDays() // Returns number of days since for USDA & NonUSDA
	let activeServiceTypes = utilCalcActiveServiceTypes() // checks active date ranges from admin serviceTypes
	let targetServices = utilCalcTargetServices(activeServiceTypes); // changes setting to specific variables in client
	let btnPrimary = utilCalcActiveServicesButtons("primary", activeServiceTypes, targetServices, lastServed);
	let btnSecondary = utilCalcActiveServicesButtons("secondary", activeServiceTypes, targetServices, lastServed);
	uiShowServicesDateTime()
	uiShowLastServed()

	uiShowPrimaryServiceButtons(btnPrimary, lastServed, activeServiceTypes)

	uiShowSecondaryServiceButtons(activeServiceTypes)
}

function uiShowServiceTypeForm(){
	$('#serviceTypeFormContainer').html(uiGetTemplate('#serviceTypeForm'))
	uiPopulateForm(serviceType, 'serviceTypeForm')
}

function uiPopulateForm(data, form){
	$.each(data, function(key,value){
		if (typeof(data[key])=='object') {
			let obj = data[key]
			$.each(obj, function(key2,value2){
				let el = '.inputBox[id="'+key+'.'+key2+'"].'+form
				if($(el).is("select")) {
					el = el + ' option[value="'+ value2 +'"]'
					$(el).prop('selected', true);
				} else {
					$(el).val(value2)
				}
			});
		} else {
			let el = '[id="'+key+'"].'+form
			if($(el).is("select")) {
				el = el + ' option[value="'+ value +'"]'
				$(el).prop('selected', true);
			} else {
				$(el).val(value)
			}
		}
	});

	if (form === 'serviceTypeForm') {
		uiToggleAgeGrade()
		uiToggleFulfillDates()
	} else if (form === 'clientForm'){
		$('#clientAge').val(client.age) // readonly unsaved value
		uiToggleClientAddress()
	}
	return
}

function uiSetClientsHeader(title){
	$("#clientsTitle").html(title)
}

function uiSetServiceTypeHeader(){
	$("#adminTitle").html($('#serviceName').val())
}

function uiSetAdminHeader(title){
	$("#adminTitle").html(title)
}

function uiShowServiceTypes(){
	uiGenSelectHTMLTable('#serviceTypesContainer',serviceTypes,["serviceName","serviceDescription","isActive"],'serviceTypesTable')
}

function uiGenSelectHTML(val,options,col,id){
	html = "<select id='"+col+"["+id+"]' class='inputBox dependentsForm'>"
	for (let i =0; i<options.length;i++){
		let select = "";
		if (val == options[i]) {
			 select = "selected='selected'";
		}
		html += "<option value='"+options[i]+"' "+select+">"+options[i]+"</option>"
	}
	html+="</select>"
	return html
}

function uiGenSelectHTMLTable(selector,data,col,tableID){
  // CREATES DYNAMIC TABLE.
  let table = document.createElement("table")
  table.setAttribute("id", tableID)
  let tr = table.insertRow(-1)
  for (let i = 0; i < col.length; i++) {
    let th = document.createElement("th")
    th.innerHTML = utilKeyToLabel(col[i])
		if (col[i] == "age") th.className = "dependentsViewOnly"
    tr.appendChild(th)
  }
  // ADD JSON DATA TO THE TABLE AS ROWS.
  for (let i = 0; i < data.length; i++) {
    tr = table.insertRow(-1);
    if (tableID == 'clientTable'){
			tr.setAttribute("onclick", 'utilSetCurrentClient(' + i + ')')
		} else if (tableID == 'serviceTypesTable'){
			tr.setAttribute("onclick", 'utilSetCurrentServiceType(' + i + ')')
		}
    for (let j = 0; j < col.length; j++) {
			let depNum = i
			//if (depNum < 10) depNum = "0" + depNum
    	let tabCell = tr.insertCell(-1);
      if (tableID == 'dependentsTable'){
    		if (col[j]=="age" ){
					tabCell.className = "dependentsViewOnly";
					tabCell.innerHTML = "<input id='"+col[j]+"["+depNum+"]' class='inputBox inputForTable dependentsForm dependentsViewOnly' style='width:50px' value='"+data[i][col[j]]+"'>"
				} else if (col[j]=="dob"){
					tabCell.innerHTML = "<input id='"+col[j]+"["+depNum+"]' class='inputBox inputForTable dependentsForm' type='date' onchange='utilCalcDependentAge("+ parseInt(depNum)+")' value='"+data[i][col[j]]+"'>";
				} else if (col[j]=="isActive"){
					tabCell.innerHTML = uiGenSelectHTML(data[i][col[j]],['Active','Inactive'],"isActive",depNum)
				} else if (col[j]=="relationship"){
					tabCell.innerHTML =uiGenSelectHTML(data[i][col[j]],['Child','Spouse','Other Dependent'],"relationship",depNum)
				} else if (col[j]=="gender"){
					tabCell.innerHTML =uiGenSelectHTML(data[i][col[j]],['Female','Male'],"gender",depNum)
				} else{
					tabCell.innerHTML="<input id='"+col[j]+"["+depNum+"]' class='inputBox inputForTable dependentsForm' value='"+data[i][col[j]]+"'>";
				}
    	} else if (col[j]=="dob"||col[j]=="firstSeenDate"){
				tabCell.className = "historyTopText"
        tabCell.innerHTML = moment(data[i][col[j]]).format('MMM DD, YYYY')
			} else if (col[j]=="lastSeenDate"||col[j]=="familyIdCheckedDate"){
				tabCell.className = "historyTopText"
				tabCell.innerHTML = moment(data[i][col[j]]).fromNow()
			} else if (col[j]=="createdDateTime"||col[j]=="updatedDateTime"){
				tabCell.className = "historyTopText"
        tabCell.innerHTML = moment(data[i][col[j]]).format('MMM DD, YYYY | h:mm a')
    	} else if (col[j]=="adultsServed"||col[j]=="childrenServed"||col[j]=="individualsServed"){
    		tabCell.innerHTML=data[i]['total'][col[j]].toString();
    	} else if (col[j]=="itemCount"){
    		tabCell.innerHTML=data[i]['fulfillment'][col[j]];
    	} else {
		 		tabCell.innerHTML=data[i][col[j]];
			}
    }
  }
  $(selector).html(table);
	if (tableID == 'dependentsTable') uiToggleDependentsViewEdit('view');
}

function uiToggleClientViewEdit(side){
	console.log(side)
	if (side == 'view') {
		$('#clientLeftSlider').addClass('sliderActive')
		$('#clientRightSlider').removeClass('sliderActive')
		$('input.clientForm').prop('readonly', true)
		$('select.clientForm').prop('disabled', true)
		$('select.clientForm').addClass('selectBox')
		$('.editOnly').hide('slow')
		$('.viewOnly').show('slow')
	} else {
		$('#clientLeftSlider').removeClass('sliderActive')
		$('#clientRightSlider').addClass('sliderActive')
		$('input.clientForm').prop('readonly', false)
		$('select.clientForm').prop('disabled', false)
		$('select.clientForm').removeClass('selectBox')
		$('.editOnly').show('slow')
		$('.viewOnly').hide('slow')
	}
}

function uiToggleDependentsViewEdit(side){
	console.log(side)
	if (side == 'view') {
		$('#dependentdLeftSlider').addClass('sliderActive')
		$('#dependentdRightSlider').removeClass('sliderActive')
		$('input.dependentsForm').prop('readonly', true)
		$('select.dependentsForm').prop('disabled', true)
		$('select.dependentsForm').addClass('selectBox')
		$('.dependentsEditOnly').hide('slow')
		$('.dependentsViewOnly').show('slow')
	} else {
		$('#dependentdLeftSlider').removeClass('sliderActive')
		$('#dependentdRightSlider').addClass('sliderActive')
		$('input.dependentsForm').prop('readonly', false)
		$('select.dependentsForm').prop('disabled', false)
		$('select.dependentsForm').removeClass('selectBox')
		$('.dependentsViewOnly').hide('slow')
		$('.dependentsEditOnly').show('slow')

	}
}

function uiToggleAgeGrade(){
	if ($('[id="target.child"]').val() == 'YES') {
		$('.childDiv').show('slow')
	} else {
		$('.childDiv').hide('slow')
	}
}

function uiToggleFulfillDates(){
	if ($('[id="fulfillment.type"]').val() == 'Voucher') {
		$('.fulfillDiv').show('slow')
	} else {
		$('.fulfillDiv').hide('slow')
	}
}

function uiToggleClientAddress(){
	if ($('#homeless.clientForm').val() == 'NO') {
		$('.addressDiv').show('slow')
	} else {
		$('.addressDiv').hide('slow')
	}
}

function uiGetTemplate(t){
	let imp = document.querySelector('link[rel="import"]');
	let temp = imp.import.querySelector(t);
	let clone = document.importNode(temp.content, true);
	//document.querySelector('.main-div').appendChild(clone);
	return clone
}

function uiFillUserData(){
	console.log(session)

	$('#userTitle').html(session.user.username);
}

function uiFillDate(){
	$('.contentTitle').html(moment().format("dddd, MMM DD YYYY"));
}

function uiResetServiceTypeForm(){
	console.log('in reset')
	uiPopulateForm(serviceType, 'serviceTypeForm')
}

function uiDisplayNotes(pageName){/**Displays notes table for a given page**/
	//setMainSideDiv()
	var tableStr = '<table class="notes"></table>'
	$('#notesContainer').html(tableStr)
	var headerRow = '<tr style="height:50px;padding:10px;"><td><h4 class="siteHeading">'+pageName+'</h4>'
	headerRow+='<h5 class="siteHeading">'+moment().format(uiDate)+'</h5></td></tr>'
	$('.notes').append(headerRow)
}

function uiAddNoteButtonRow(){
	var buttonRow = '<div class="row"><a data-toggle="modal" data-target="#myModal" class="btn-nav addNoteButton">'
	buttonRow+='+Note</a></div></table>'
	$('#notesContainer').append(buttonRow)
}

// **********************************************************************************************************
// ************************************************ DB FUNCTIONS ********************************************
// **********************************************************************************************************
function dbGetClientNotes(id){
	let URL = aws+"/clients/notes/"+id;
	arr = dbGetData(URL).notes
console.log(arr)
	return arr
}
function dbGetData(uUrl){
	let urlNew = uUrl;
	let ans = null;
// console.log('idToken + ' + authorization.idToken)
	$.ajax({
	    type: "GET",
	    url: urlNew,
			headers: {"Authorization": authorization.idToken},
	    async: false,
	    dataType: "json",
			contentType:'application/json',
	    success: function(json){
				if (json!==undefined) {
					// console.log(json.count)
					// console.log(urlNew)
				}
	    	ans = json
		},
		error: function(message, status, error){
			console.log(message + ", " + status + ", " + error)
			alert(error);
			if (message.readyState == 0) {
				console.log("Error of some kind!")
			}
		}
	});
	return ans
}
function dbGetNewClientID(){
	json = dbGetData(aws+"/clients/lastid")
	lastid = json['lastId']
//***** TODO confirm this works and put safeguards in place
	request = {}
	newID = Number(lastid)+1
	newID = newID.toString()
	request['lastId']=newID
	dbPostData(aws+"/clients/lastid",JSON.stringify(request))
	return newID
}

function dbGetServicesNotes(id){
	return dbGetData(aws+"/services/"+id).services
}

function dbGetServicesTypes(){
	return dbGetData(aws+"/servicetypes").serviceTypes
}

function dbPostData(uUrl,dataU){
	if (authorization.idToken == 'undefined') {
		utilBeep()
		consol.log("need to log in")
		return
	}

// console.log(JSON.stringify(dataU))

	var urlNew = uUrl;
	var uData = dataU;
	var ans = null;
	$.ajax({
	    type: "POST",
	    url: urlNew,
			headers: {"Authorization": authorization.idToken},
	    async: false,
	    dataType: "json",
	    data: uData,
	    contentType:'application/json',
	    success: function(message){
	    	console.log(message)
				if (typeof message.message !== 'undefined') {
					utilBeep()
					// ***** TODO error message
				} else {
					if (uUrl.includes('/servicetypes')) {
						serviceTypes = dbGetServicesTypes()
						uiShowServiceTypes()
						uiSetServiceTypeHeader()
						uiPopulateForm(serviceType, 'serviceTypes')
						uiSaveButton('serviceType', 'SAVED!!')
					} else if (uUrl.includes('/clients')) {
						let row = utilUpdateClientsData()
						uiGenSelectHTMLTable('#searchContainer',clientData,["clientId","givenName","familyName","dob","street"],'clientTable')
						uiOutlineTableRow('clientTable', row)
						uiSetClientsHeader('#'+client.clientId + ' | ' + client.givenName + ' ' + client.familyName)
						uiSaveButton('client', 'SAVED!!')
					}
				}
		},
		error: function(json){
	    	console.log(json)
				if (uUrl.includes('/servicetypes')) {
					uiSaveButton('serviceType', 'ERROR!!')
				} else if (uUrl.includes('/clients')) {
					uiSaveButton('client', 'ERROR!!')
				}
		}
	});
	return ans
}

function dbSaveLastServed(serviceTypeId, serviceCategory, isUSDA){
	if (!utilValidateArguments(arguments.callee.name, arguments, 3)) return
	let serviceDateTime = moment().format(dateTime)
	let newRecord = {serviceTypeId, serviceDateTime, serviceCategory, isUSDA}
	let newLastServed = []
	let notPushed = true
	if (client.lastServed.length > 0) {
		for (var i = 0; i < client.lastServed.length; i++) {
			if (serviceTypeId == client.lastServed[i].serviceTypeId) {
				notPushed = false
				newLastServed.push(newRecord)
			} else {
				newLastServed.push(client.lastServed[i])
			}
		}
	} else {
		notPushed = false
		newLastServed.push(newRecord)
	}
	if (notPushed) {
		newLastServed.push(newRecord)
	}
	client.lastServed = newLastServed
	data = client
	data = JSON.stringify(data)

console.log(data)

	let URL = aws+"/clients/"
	result = dbPostData(URL,data)
	if (result == null) {
		utilBloop() // TODO move bloop to successful POST ()
		console.log(result)
	}
}

function dbSaveService(serviceTypeId, serviceCategory, serviceButtons){
	if (!utilValidateArguments(arguments.callee.name, arguments, 3)) return
	// TODO ADD serviceTotalServed & serviceItemsServed to the ServicesRendered Table
	if (serviceButtons == "Primary"){
		let serviceType = serviceTypes.filter(function( obj ) {
			return obj.serviceTypeId == serviceTypeId
		})
		dbSaveLastServed(serviceTypeId, serviceCategory, serviceType[0].isUSDA)
	}
	dbSaveServiceRendered(serviceTypeId)

}

function dbSaveServiceRendered(serviceTypeId){
	if (!utilValidateArguments(arguments.callee.name, arguments, 1)) return
	// TODO Create table by clientID and add new services to top of array
}

function dbPostNote(text){
	// TODO replace hardcoded values with real user variables
	// Are we using uuid here?
	let ans = {}
	ans['noteOnClientId'] = client['clientId']
	ans['noteText'] = text.toString()
	ans['createdDateTime']=Math.round((new Date()).getTime() / 1000).toString()
	ans['noteByUserId'] = '12f8176c38186cad1705a6f3af8b8c0ad0b23200'
	ans['noteByUserName']="Kush Jain"
	ans['clientNoteId'] = uuidv1().toString()
console.log(JSON.stringify(ans))
	dbPostData(aws+"/clients/notes/",JSON.stringify(ans))
}

function dbSaveClientForm(){
console.log(JSON.stringify(client.dependents))
	$("#updatedDateTime.clientForm").val(utilNow())
	let data = ""
	if (client == "") {
		$("#clientId.clientForm").val(dbGetNewClientID())
		data = utilFormToJSON('.clientForm')
		data.dependents = []
		data.lastServed = []
	} else {
		data = utilFormToJSON('.clientForm')

console.log(JSON.stringify(data.dependents))
console.log(JSON.stringify(client.dependents))

		data.dependents = client.dependents
		data.lastServed = client.lastServed
		for (var i = 0; i < data.dependents.length; i++) {
			delete data.dependents[i].age
		}


		if (data.lastServed == undefined||data.lastServed == "") {
			data.lastServed = []
		}
	}
console.log(data)
console.log(JSON.stringify(data))
	uiSaveButton('client', 'Saving...')
	let URL = aws+"/clients/"
	result = dbPostData(URL,JSON.stringify(data))
	if (result == null) uiToggleClientViewEdit("view")
}

function dbSaveDependentsTable(){
	let dependents = [] // client.dependents
	data = utilFormToJSON('.dependentsForm')
	let numKey = Object.keys(data).length
	for (var i = 0; i < numKey; i++) {
		let key = Object.keys(data)[i]
		let keyName = key.slice(0, key.indexOf("["))
		let keyNum = key.slice(key.indexOf("[")+1,-1)
		if (dependents[keyNum] == undefined) dependents[keyNum] = {updatedDateTime: utilNow()}
		if (client.dependents[keyNum] != undefined) {
			if (client.dependents[keyNum].createdDateTime != undefined) {
				dependents[keyNum].createdDateTime = client.dependents[keyNum].createdDateTime
			}
		} else {
			dependents[keyNum].createdDateTime = utilNow()
		}
		dependents[keyNum][keyName] = data[Object.keys(data)[i]]
	}
	client.dependents = dependents
// TODO - fix lastServed
//	client.lastServed = []
	data = client
	let URL = aws+"/clients/"
	result = dbPostData(URL,JSON.stringify(data))
	if (result == null) {
		utilCalcFamilyCounts()
		uiToggleDependentsViewEdit("view")
	}
}

function dbSaveServiceTypeForm(){
	let data = utilFormToJSON('.serviceTypeForm')
	let URL = aws+"/servicetypes"
	uiSaveButton('serviceType', 'Saving...')
	dbPostData(URL,JSON.stringify(data))
}

function dbSearchClients(){
	a =  $('#searchField').val()
	$('#searchField').val('')
	if (a === '') {
		utilBeep()
		return
	}
	if (currentNavTab !== "clients") navGotoSec("nav1")
	clientData = null
	if (a.includes("/")){
		a = moment(a, uiDate).format(date)
		clientData = dbGetData(aws+"/clients/dob/"+a).clients
	} else if (!isNaN(a)&&a.length<MAX_ID_DIGITS){
		clientData = dbGetData(aws+"/clients/"+a).clients
	} else if (a.includes(" ")){
		a = utilChangeWordCase(a)
		let split = a.split(" ")
//*** TODO deal with more than two words ***
		let d1 = dbGetData(aws+"/clients/givenname/"+split[0]).clients
		let d2 = dbGetData(aws+"/clients/familyname/"+split[0]).clients
		let d3 = dbGetData(aws+"/clients/givenname/"+split[1]).clients
		let d4 = dbGetData(aws+"/clients/familyname/"+split[1]).clients
		clientData = utilRemoveDupClients(d1.concat(d2).concat(d3).concat(d4))
	} else if (clientData==null||clientData.length==0){
		a = utilChangeWordCase(a)
		let d2 = dbGetData(aws+"/clients/givenname/"+a).clients
		let d1 = dbGetData(aws+"/clients/familyname/"+a).clients
		if (d1.length>0&&d2.length<1){
			clientData = utilRemoveDupClients(d1.concat(d2))
		}	else if (d2.length>0){
			clientData = utilRemoveDupClients(d2.concat(d1))
		}
	}
	if (clientData==null||clientData.length==0){
		utilBeep()
		uiSetClientsHeader("0 Clients Found")
	} else {
		uiGenSelectHTMLTable('#searchContainer',clientData,["clientId","givenName","familyName","dob","street"],'clientTable')
		if (clientData.length === 1){
			utilSetCurrentClient(0) // go straight to SERVICES
			navGotoTab("tab2")
		} else {
			uiSetClientsHeader(clientData.length + ' Clients Found')
			navGotoTab("tab1")
		}
	}
}

// **********************************************************************************************************
// *********************************************** COG FUNCTIONS ********************************************
// **********************************************************************************************************
function cogLogoutUser(){
	authorization = {}
	if (authorization.idToken == undefined) {
		cognitoUser.signOut();
		uiShowHideLogin('show')
	}
}

function cogUserChangePassword(){
	cognitoUser.changePassword('oldPassword', 'newPassword', function(err, result) {
    if (err) {
      alert(err);
      return;
    }
    console.log('call result: ' + result);
  });
}

function cogNewPasswordRequired(){

console.log("in new password required")

}

function cogLoginUser() {
	let username = $('#loginEmail').val()
	let password = $('#loginPassword').val()
  let authData = {
     Username: username,
     Password: password
  };
  let authDetails = new AWSCognito.CognitoIdentityServiceProvider.AuthenticationDetails(authData);
  let userData = {
     Username: username,
     Pool: userPool
  };
  cognitoUser = new AWSCognito.CognitoIdentityServiceProvider.CognitoUser(userData);
  cognitoUser.authenticateUser(authDetails, {
    onSuccess: (result) => {
      session.user = cognitoUser;
			authorization.accessToken = result.getAccessToken().getJwtToken()
			authorization.idToken = result.idToken.jwtToken
			$('#nav4').html('<i class="fa fa-user" aria-hidden="true"></i> ' + session.user.username)
			$('#nav5').html('Logout')
			uiShowHideLogin('hide')
			navGotoSec('nav1')
			cogGetUserAttributes()
			serviceTypes = dbGetServicesTypes()
    },
    onFailure: (err) => {
			if (err === 'Error: Incorrect username or password.') {
				utilBeep()
			} else if (err === 'UserNotFoundException: User does not exist.') {
				utilBeep()
				utilBeep()
				// NotAuthorizedException: Incorrect username or password.
			}
        console.log('||'+err+'||');
    },
		newPasswordRequired: function(userAttributes, requiredAttributes) {
				// User was signed up by an admin and must provide new
				// password and required attributes, if any, to complete
				// authentication.
console.log(requiredAttributes)


console.log("needs new password - change the form")
let newPassword = "Password123#"

				// the api doesn't accept this field back
				delete userAttributes.email_verified;
				delete userAttributes.phone_number_verified;


				// Get these details and call
				cognitoUser.completeNewPasswordChallenge(newPassword, userAttributes, this);
		}
  });
}

function cogGetUserAttributes(){

	// var params = {
	//   AccessToken: authorization.accessToken /* required */
	// };
	// cognitoidentityserviceprovider.getUser(params, function(err, data) {
	//   if (err) console.log(err, err.stack); // an error occurred
	//   else     console.log(data);           // successful response
	// });

// 	cognitoUser.getUserAttributes(function(err, result) {
// 		if (err) {
// 				alert(err);
// 				return;
// 		}
// 		for (i = 0; i < result.length; i++) {
// 				console.log('attribute ' + result[i].getName() + ' has value ' + result[i].getValue());
// 		}
// });
}

// function cognitoSignUp(){
// 	var attributeList = [];
//
// 	var dataEmail = {
// 			Name : 'email',
// 			Value : 'jleal67@gmail.com'
// 	};
//
// 	var dataPhoneNumber = {
// 			Name : 'phone_number',
// 			Value : '+12096011038'
// 	};
// 	var attributeEmail = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserAttribute(dataEmail);
// 	var attributePhoneNumber = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserAttribute(dataPhoneNumber);
//
// 	attributeList.push(attributeEmail);
// 	attributeList.push(attributePhoneNumber);
//
// 	userPool.signUp('jleal67@gmail.com', 'Password123!', attributeList, null, function(err, result){
// 			if (err) {
// 					alert(err);
// 					return;
// 			}
// 			cognitoUser = result.user;
// 			console.log('user name is ' + cognitoUser.getUsername());
// 	});
// }

// let userData = {
// 	 Username: 'jleal67',
// 	 Pool: userPool
// };
//
// cognitoUser = new AWSCognito.CognitoIdentityServiceProvider.CognitoUser(userData);

function cogLoginAdmin(){

console.log("IN AUTHENTICATION")

	let authenticationData = {
		 Username : 'jleal67@gmail.com', // your username here
		 Password : 'Password123!', // your password here
 	};

	let userData = {
		 Username : 'jleal67@gmail.com', // your username here
		 Password : 'Password123!', // your password here
 	};

  let authenticationDetails = new AWSCognito.CognitoIdentityServiceProvider.AuthenticationDetails(authenticationData);

  let cognitoUser = new AWSCognito.CognitoIdentityServiceProvider.CognitoUser(userData);
  cognitoUser.authenticateUser(authenticationDetails, {
		onSuccess: function (result) {
			console.log('access token + ' + result.getAccessToken().getJwtToken());
		},
		onFailure: function(err) {
			alert(err);
		},
		mfaRequired: function(codeDeliveryDetails) {
			let verificationCode = prompt('Please input verification code' ,'');
			cognitoUser.sendMFACode(verificationCode, this);
		}
 });
}

function cogListUsers(){
	// Set the region where your identity pool exists (us-east-1, eu-west-1)
	AWSCognito.config.region = 'us-west-2';

	// Configure the credentials provider to use your identity pool
	AWSCognito.config.credentials = new AWSCognito.CognitoIdentityCredentials({
	    IdentityPoolId: 'us-west-2:d6cc97a3-a582-4295-a901-4d312b92c47a',
	});

	// Make the call to obtain credentials
	AWSCognito.config.credentials.get(function(){

	    // Credentials will be available when this function is called.
	    let accessKeyId = AWSCognito.config.credentials.accessKeyId;
	    let secretAccessKey = AWSCognito.config.credentials.secretAccessKey;
	    let sessionToken = AWSCognito.config.credentials.sessionToken;

	});

console.log('in list users')
console.log(session.user)
console.log(userPool.userPoolId)

///ClientId : '7j3jhm5a3pkc67m52bf7tv10au',

// AWSCognito.config.update({ })

let logPool = "cognito-idp.us-west-2.amazonaws.com/"+ userPool.userPoolId

	AWSCognito.config.region = 'us-west-2'

	let loginsCognitoKey = 'cognito-idp.us-west-2.amazonaws.com/us-west-2_AufYE4o3x'
	let loginsIdpData = {};
	loginsIdpData[loginsCognitoKey] = authorization.accessToken
	AWSCognito.config.credentials = new AWSCognito.CognitoIdentityCredentials({
	    IdentityPoolId: 'us-west-2:d6cc97a3-a582-4295-a901-4d312b92c47a',
	    Logins: loginsIdpData
	});

console.log(AWSCognito.config.credentials)

console.log('made it past config')

	//
	// AWSCognito.config.credentials = new AWSCognito.CognitoIdentityCredentials({
	//     IdentityPoolId: userPool.userPoolId,
	// 		Logins : {
	// 			logPool : authorization.accessToken
	// 		}
	// });

	// Need to provide placeholder keys unless unauthorised user access is enabled for user pool
	params = {
		UserPoolId: userPool.userPoolId, /* required */
		AttributesToGet: [],
		Filter: '',
		Limit: 0,
		PaginationToken: ''
	};

	let cognitoidentityserviceprovider = new AWSCognito.CognitoIdentityServiceProvider();
	cognitoidentityserviceprovider.listUsers(params, function(err, data) {
	  if (err) console.log(err, err.stack); // an error occurred
	  else     console.log(data);           // successful response
	});
}

// **********************************************************************************************************
// *********************************************** UTIL FUNCTIONS *******************************************
// **********************************************************************************************************
function utilAddService(serviceTypeId, serviceCategory, serviceButtons){
	if (!utilValidateArguments(arguments.callee.name, arguments, 3)) return
console.log("IN ADD SERVICE");
	let serviceType = serviceTypes.filter(function( obj ) {
		return obj.serviceTypeId == serviceTypeId
	})
	// let itemsServed = "4"
	// TODO Need real numberItems
	// let totalServed = client.family.totalSize
	// TODO Need items per [family][person] in Service Types

	dbSaveService(serviceTypeId, serviceCategory, serviceButtons);
	uiShowLastServed()
	uiShowNote(serviceTypeId)
	uiToggleButtonColor("gray", serviceTypeId, serviceType.serviceButtons)
	// TODO Create ability to UNDO the adding of a service.
	// TODO Create tally of added services on the screen [the print button will be added there]
}

function utilBeep(){
	let sound = document.getElementById("beep")
	sound.volume= .1
	sound.loop = false
	sound.play()
};

function utilBloop(){
	let sound = document.getElementById("bloop")
	sound.volume= .1
	sound.loop = false
	sound.play()
};

function utilCalcActiveServicesButtons(array, activeServiceTypes, targetServices, lastServed) {
	if (!utilValidateArguments(arguments.callee.name, arguments, 4)) return
	btnPrimary = [];
	btnSecondary = [];
	for (let i = 0; i < activeServiceTypes.length; i++) {
		// loop throught to find items to compare
		// presume that item will be displayed unless not valid
		let display = true;
		// check for not a valid service based on interval between services
		if (!utilValidateServiceInterval(activeServiceTypes[i], activeServiceTypes, lastServed)) continue;
		// loop through each property in each activeServiceType
		for (let prop in targetServices[i]) {
			// check service interval for service
			// if (activeServiceTypes[i].serviceInterval > 0) {
			// }
			// cleanup true false
			//let tarProp = targetServices[i][prop]
			// if (tarProp == true) tarProp = "true"
			// if (tarProp == false) tarProp = "false"
			// let cliProp = client[prop]
      //
      //
			// if (cliProp == true) tarProp = "true"
			// if (cliProp == false) tarProp = "false"
			// if (tarProp != cliProp) {
			// 	console.log(false)
			// 	display = false;
			// }
			if (targetServices[i][prop] != client[prop]) {
				display = false
			}
		}

console.log(activeServiceTypes[i].serviceName)
console.log("display " + display)

		// cross validate USDA NonUSDA & Emergency
		if (activeServiceTypes[i].serviceButtons == "Primary" && activeServiceTypes[i].serviceCategory == "Food") {
			let validUSDA = utilValidateUSDAFood(i, activeServiceTypes, lastServed)
			let validNonUSDA = utilValidateNonUSDAFood(i, activeServiceTypes, lastServed)

console.log("USDA: " + validUSDA)
console.log("NonUSDA: " + validNonUSDA)

			if (activeServiceTypes[i].isUSDA == "Emergency") {
				if (validUSDA || validNonUSDA) {
					display = false
				}
			} else if (activeServiceTypes[i].isUSDA == "NonUSDA") {
				if (validUSDA) {
					display = false
				}
			}
		}

		if (display) {
			if (activeServiceTypes[i].serviceButtons == "Primary") {
				if (activeServiceTypes[i].serviceCategory == "Food") {
					btnPrimary.unshift(i)
				} else {
					btnPrimary.push(i)
				}
			} else {
				btnSecondary.push(i)
			}
		}
	}

console.log(btnPrimary)

	if (array == "primary") return btnPrimary
	if (array == "secondary") return btnSecondary
}

function utilCalcActiveServiceTypes(){
	// build Active Service Types array of Service Types which cover today's date
	let activeServiceTypes = []
	for (let i=0; i<serviceTypes.length; i++){
		if (serviceTypes[i].isActive == "Active"){
			// FROM
			let fromDateString = []
			fromDateString.push(moment().year())
			fromDateString.push(Number(serviceTypes[i].available.dateFromMonth))
			fromDateString.push(Number(serviceTypes[i].available.dateFromDay))
			let fromDate = moment(fromDateString)
			// TO
			let toDateString = []
			toDateString.push(moment().year())
			toDateString.push(Number(serviceTypes[i].available.dateToMonth))
			toDateString.push(Number(serviceTypes[i].available.dateToDay))
			let toDate = moment(toDateString)
			// Adjust year dependent on months of TO and FROM
			if (moment(fromDate).isAfter(toDate)) toDate = moment(toDate).add(1, 'y');
			// Adjust year if FROM is after TODAY
			if (moment(fromDate).isAfter()) {
				fromDate = moment(fromDate).subtract(1, 'y');
				toDate = moment(toDate).subtract(1, 'y');
			}
			// IN date range = ACTIVE
			if (moment().isBetween(fromDate, toDate, null, '[]')) {
				activeServiceTypes.push(serviceTypes[i])
			}
		}
	}
	return activeServiceTypes;
}

function utilCalcFamilyCounts(){
	// age TODO Move this to correct Function
	for (var i = 0; i < client.dependents.length; i++) {
		utilCalcDependentAge(i)
	}
	if (client.family == undefined) client.family = {}
	// dependents age & family counts
	let fam = {totalAdults:1, totalChildren:0, totalOtherDependents:0, totalSize:1}
	for (let i = 0; i < client.dependents.length; i++) {
		client.dependents[i].age = moment().diff(client.dependents[i].dob, "years")
		if (client.dependents[i].relationship == "Spouse" && client.dependents[i].isActive == "Active") {
			++fam.totalAdults
			++fam.totalSize
		}
		if (client.dependents[i].relationship == "Other Dependent" && client.dependents[i].age >= 18 && client.dependents[i].isActive == "Active") {
			++fam.totalOtherDependents
			++fam.totalAdults
			++fam.totalSize
		}
		if (client.dependents[i].relationship == "Other Dependent" && client.dependents[i].age < 18 && client.dependents[i].isActive == "Active") {
			++fam.totalOtherDependents
			++fam.totalChildren
			++fam.totalSize
		}
		if (client.dependents[i].relationship == "Child" && client.dependents[i].isActive == "Active") {
			++fam.totalChildren
			++fam.totalSize
		}
	}
	client.family.totalAdults = fam.totalAdults
	client.family.totalChildren = fam.totalChildren
	client.family.totalOtherDependents = fam.totalOtherDependents
	client.family.totalSize = fam.totalSize
	uiShowFamilyCounts(fam.totalAdults, fam.totalChildren, fam.totalOtherDependents, fam.totalSize)
}

// function utilCalcLastIdCheckDays() {
// 	// get Id Checked Date from client object & calculate number of days
// 	// let familyIdCheckedDate = moment(client.familyIdCheckedDate, dbDate)
// 	let lastIdCheck = moment().diff(client.familyIdCheckedDate, 'days')
// 	return lastIdCheck
// }

function utilCalcLastServedDays() {
	// get Last Served Date from client object & calculate number of days
	let initialize = [{isUSDA:"USDA", days:"10000"}, {isUSDA:"NonUSDA", days:"10000"}]
	if (client.lastServed[0] == undefined) return initialize
	let lastServedFood = client.lastServed.filter(function( obj ) {
		return obj.serviceCategory == "Food"
	})
	let lastServed = {daysUSDA:"", daysNonUSDA:""}
	for (var i = 0; i < lastServedFood.length; i++) {
		if (lastServedFood[i].isUSDA != "Emergency") {
			let lastServedDay = moment(lastServedFood[i].serviceDateTime).startOf('day')
			if (lastServedFood[i].isUSDA == "USDA") {
				lastServed.daysUSDA = moment().diff(lastServedDay, 'days')
			} else {
				lastServed.daysNonUSDA = moment().diff(lastServedDay, 'days')
			}
		}
	}

console.log(lastServed)

	// If lastVist is not numeric then set to 10,000 days
	// if (!$.isNumeric(lastServed)) lastServed = 10000
	return lastServed
}

function utilCalcTargetServices(activeServiceTypes) {
	if (!utilValidateArguments(arguments.callee.name, arguments, 1)) return
	let targets = [];
	// build list of client target items for each Active Service Type
	for (let i = 0; i < activeServiceTypes.length; i++) {
		// make list of specific targets.... for each type.
		targets[i] = {}
		// target homeless
		if (activeServiceTypes[i].target.homeless !== "Unselected") targets[i].homeless = activeServiceTypes[i].target.homeless;
		// target families with children, singles, couples
		if (activeServiceTypes[i].target.family == "Single Individual") {
			targets[i].family_totalSize = 1;
		} else if (activeServiceTypes[i].target.family == "Couple") {
			targets[i].family_totalSize = 2;
			targets[i].family_totalChildren = 0;
		} else if (activeServiceTypes[i].target.family == "With Children") {
			targets[i].family_totalChildren = "Greater Than 0";
			// TODO Target children
		}
		// target gender male/female
		if (activeServiceTypes[i].target.gender !== "Unselected") targets[i].gender = activeServiceTypes[i].target.gender;
		// target children
		if (activeServiceTypes[i].target.child == "YES") {
			targets[i].family_totalChildren = "Greater Than 0";
			// TODO Target children's ages
			// if ((activeServiceTypes[i].target.childMinAge > 0) || (activeServiceTypes[i].target.childMaxAge > 0)) {
			// 	targets[i].childMinAge = activeServiceTypes[i].target.childMinAge;
			// }
			// if (activeServiceTypes[i].target.childMaxAge > 0) {
			// 	targets[i].childMaxAge = activeServiceTypes[i].target.childMaxAge;
			// }
			// if (activeServiceTypes[i].target.childMinGrade > 0) {
			// 	targets[i].childMinGrade = activeServiceTypes[i].target.childMinGrade;
			// }
			// if (activeServiceTypes[i].target.childMaxGrade > 0) {
			// 	targets[i].childMaxGrade = activeServiceTypes[i].target.childMaxGrade;
			// }
		} else if (activeServiceTypes[i].target.child == "NO") {
			targets[i].family.totalChildren = 0;
		}
	}
//	console.log("Target Attributes: " + JSON.stringify(targets));
	return targets;
}

function utilChangeWordCase(str){
	str = str.replace(/[^\s]+/g, function(word) {
	  return word.replace(/^./, function(first) {
	    return first.toUpperCase();
	  });
	});
	return str
}

function utilFormToJSON(form){
	let vals = {}
	console.log($(form))
	let formElements = $(form)
	for (let i = 0; i < formElements.length; i++) {
		let key = formElements[i].id
		let formVal = formElements[i].value
		let valType = formElements[i].type
		if (formVal.length < 1) {
			if (valType == 'hidden') {
				if (key === 'createdDateTime'||key === 'updatedDateTime') formVal = utilNow()
				if (key === 'lastSeenDate') formVal = '*EMPTY*'
			} else if (valType == 'text'||valType == 'date'||valType == 'datetime-local') {
console.log(key)
				formVal = '*EMPTY*'
			} else if (valType == 'number') {
console.log(key + ' : ' + formVal + ' : '+ valType)
				formVal = '-123'
			}
		}
		if (key.includes(".")) {
			let split = key.split(".")
			let obj = split[0]
			if (typeof vals[obj] == 'undefined') {
				vals[obj] = {}
			}
			vals[obj][split[1]] = formVal
		} else {
			vals[key] = formVal
		}
	}
	vals.updatedDateTime = utilNow();
	return vals
}

function utilKeyToLabel(x){
	let data = {
											 age: "Age",
									clientId: "ID #",
								 givenName: "Given Name",
								familyName: "Family Name",
								       dob: "DOB",
										street: "Street Address",
							relationship: "Relationship",
										gender: "Gender",
								  isActive: "Status",
							 serviceName: "Name",
				serviceDescription: "Description",
				   createdDateTime: "Profile Created",
					 updatedDateTime: "Profile Update",
				     firstSeenDate: "First Seen",
				    	lastSeenDate: "Last Served",
       familyIdCheckedDate: "Last ID Check"
	}
	let y = data[x]
	if (y==undefined){return x} else {return y}
}

function utilNow() {
	return moment().format(dateTime)
}

function utilRemoveDupClients(clients) {
	let ids=[], temp=[], undupClients = []
	for (let i = 0; i < clients.length; i++) ids.push(clients[i].clientId)
	for (let i = 0; i < ids.length; i++) {
		if (temp.indexOf(ids[i])<0) {
			undupClients.push(clients[i])
			temp.push(ids[i])
		}
	}
	return undupClients
}

function utilCalcClientAge(){
	let dob = $("#dob.clientForm").val()
	let age = moment().diff(dob, 'years')
	if (Number(age)){
		$("#clientAge").val(age)
		client.age = age
	}
}

function utilCalcDependentAge(index){
	let dob = document.getElementById("dob["+index+"]")
	let age = document.getElementById("age["+index+"]")
	if (dob != null && age != null){
		let newAge = moment().diff(dob.value, "years")
		age.value = newAge
		if (client.dependents[index] != undefined) {
			client.dependents.age = newAge
		}
	}
}

function utilSetCurrentClient(index){
	client = clientData[index]
	utilCalcFamilyCounts() // calculate fields counts and ages
	emergencyFood = false // **** TODO what is this for?
	uiShowHistory()

	uiUpdateCurrentClient(index)
}

function utilSetCurrentServiceType(index){
	serviceType = serviceTypes[index]
	uiOutlineTableRow('serviceTypesTable', index+1)
	uiSetAdminHeader(serviceType.serviceName)
	uiShowServiceTypeForm()
	navGotoTab("aTab2")
}

function utilToday() {
	return moment().format(date)
}

function utilUpdateClientsData(){
	let row = null
	let data = utilFormToJSON('.clientForm')
	$.each(data, function(key,value){
		client[key] = value
	});
	for (var i = 0; i < clientData.length; i++) {
		if (client.clientId == clientData[i].clientId){
			row = i+1
			$.each(client, function(key,value){
				clientData[i][key] = value
			});
		}
	}
	return row
}

function utilValidateArguments(func, arguments, count){
	if (arguments.length != count){
		utilBeep()
		console.log(func + " ARGUMENT COUNT ERROR")
		return false
	}
	for (var i = 0; i < arguments.length; i++) {
		if (arguments[i] == undefined || arguments[i] == 'undefined') {
			utilBeep()
			let location = i + 1
			console.log(func + " ARGUMENT " + location + " UNDEFINED")
			return false
		}
	}
	return true
}

function utilValidateNonUSDAFood(index, activeServiceTypes, lastServed) {
	if (!utilValidateArguments(arguments.callee.name, arguments, 3)) return

console.log(lastServed)

	let intervalUSDA = "10000"
	let intervalNonUSDA = "10000"
	for (var i = 0; i < lastServed.length; i++) {
		if (lastServed[i].isUSDA = "USDA") {
			intervalUSDA = lastServed[i].days
		} else if (lastServed[i].isUSDA = "NonUSDA") {
			intervalNonUSDA = lastServed[i].days
		}
	}
	// find USDA in activeServiceTypes
	let nonUSDAService = activeServiceTypes.filter(function( obj ) {
		return obj.isUSDA == "NonUSDA"
	})

console.log(intervalNonUSDA)

	if (nonUSDAService.length > 0) {
		if (intervalNonUSDA < nonUSDAService[0].serviceInterval) {
			return true // USDA is NOT valid so show NonUSDA
		}
	}
	return false
}

function utilValidateServiceInterval(activeServiceType, activeServiceTypes, lastServed){
	if (!utilValidateArguments(arguments.callee.name, arguments, 3)) return
	// empty lastServed array - bump out Non-USDA & Emergency Food buttons
	if (client.lastServed.length == 0) {
		if ((activeServiceType.serviceCategory == "Food" && activeServiceType.serviceButtons == "Primary" && activeServiceType.isUSDA == "NonUSDA")||(activeServiceType.serviceCategory == "Food" && activeServiceType.serviceButtons == "Primary" && activeServiceType.isUSDA == "Emergency")) {
			return false;
		} else {return true}
	}
	// return true
	// let inLastServed = ""
	// if (activeServiceType.serviceCategory == "Food" && activeServiceType.serviceButtons == "Primary" && activeServiceType.isUSDA == "NonUSDA") {
	// 	if (!utilValidateUSDAFood(activeServiceType, activeServiceTypes)) return false
  //
	// } else if (activeServiceType.serviceCategory == "Food" && activeServiceType.serviceButtons == "Primary" && activeServiceType.isUSDA == "Emergency") {
	// 	// TODO address Emergency serviceType
	// 	let validUSDA = (utilValidateUSDAFood(activeServiceType, activeServiceTypes))
	// 	let validNonUSDA = (utilValidateNonUSDAFood(activeServiceType, activeServiceTypes))
  //
	// } else if (activeServiceType.serviceButtons == "Administration") {
	// 	// TODO address ID/POA Check serviceType
  //
	// } else {

//console.log(JSON.stringify(activeServiceType))

let lowestDateServed = lastServed.daysUSDA
if (lastServed.daysNonUSDA < lowestDateServed) lowestDateServed = lastServed.daysNonUSDA

console.log(">>> "+activeServiceType.serviceName +"<<<")
	if (activeServiceType.serviceButtons == "Primary") {
console.log("PRIMARY")
		if (activeServiceType.serviceCategory == "Food") {
console.log("FOOD")
			if (activeServiceType.isUSDA == "USDA") {
console.log("USDA")
				if (lastServed.daysUSDA < activeServiceType.serviceInterval) {
					console.log("FALSE")
					return false
				}
			} else if (activeServiceType.isUSDA == "NonUSDA") {
				if (lastServed.daysNonUSDA < activeServiceType.serviceInterval) {
					console.log("FALSE")
					return false
				}
			} else if (activeServiceType.isUSDA == "Emergency") {
console.log(lastServed.daysUSDA < activeServiceType.serviceInterval)
console.log(lastServed.daysNonUSDA < activeServiceType.serviceInterval)
console.log((lastServed.daysUSDA < activeServiceType.serviceInterval && lastServed.daysNonUSDA < activeServiceType.serviceInterval))

				if ((lastServed.daysUSDA < activeServiceType.serviceInterval && lastServed.daysNonUSDA < activeServiceType.serviceInterval)) {
					console.log("FALSE")
					return false
				}
			}
		} else if (activeServiceType.serviceCategory == "Clothes") {
console.log("CLOTHING")

console.log(lowestDateServed + " < " + activeServiceType.serviceInterval)

			if (lowestDateServed < activeServiceType.serviceInterval) {
				console.log("FALSE")
				return false;
			}
		} else if (activeServiceType.serviceCategory == "Administration") {
console.log("ADMINISTRATION")
			inLastServed = client.lastServed.filter(function( obj ) {
				return obj.serviceCategory == "Administration"
			})
			if (inLastServed.length > 0) {
				let lastServedDate = moment(inLastServed[0].serviceDateTime).startOf('day')
				if (moment().startOf('day').diff(lastServedDate, 'days') < activeServiceType.serviceInterval) {
					console.log("FALSE")
					return false
				}
			}
		}
	} else {
console.log("SECONDARY")




console.log(lowestDateServed + " < " + activeServiceType.serviceInterval)

		if (lowestDateServed < activeServiceType.serviceInterval) {
			console.log("FALSE")
			return false;
		}
	}
	return true
}

function utilValidateUSDAFood(index, activeServiceTypes, lastServed) {
	if (!utilValidateArguments(arguments.callee.name, arguments, 3)) return
	let intervalUSDA = "10000"
	for (var i = 0; i < lastServed.length; i++) {
		if (lastServed[i].isUSDA = "USDA") {
			intervalUSDA = lastServed[i].days
		}
	}
	// find USDA in activeServiceTypes
	let usdaService = activeServiceTypes.filter(function( obj ) {
		return obj.isUSDA == "USDA"
	})
	if (usdaService.length > 0) {
		if (intervalUSDA < usdaService[0].serviceInterval) {
			return false // USDA is NOT
		}
	}
	return false
}

// **********************************************************************************************************
// UNUSED OR NEED WORK FUNCTIONS
// **********************************************************************************************************

function isLoggedIn(){
	if (authorization.idToken == undefined) {
		return false
	} else {
		return true
	}
}

function newClientNote(){
	// TODO
}

function addClientNotes(id){
	arr = dbGetClientNotes(id)
	addOldNotes(arr)
}

function addOldNotes(arr){
	for (let i = 0; i < arr.length; i++){
    	let obj = arr[i];
    	uiShowNote(obj.noteText, obj.createdDateTime)
    }
}

function newNote(text,text2){
	uiShowNote(text,text2)
	dbPostNote(text)
}
