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
let MAX_ID_DIGITS = 5
const uiDate = 'MM/DD/YYYY'
const uiDateTime = 'MM/DD/YYYY H:mma'
const uiDateTimeShort = 'MM/DD/YY H:mma'
const longDate = "MMMM Do, YYYY  |  LT"
const date = 'YYYY-MM-DD'
const dateTime = 'YYYY-MM-DDTHH:mm'
const seniorAge = 60 // TODO set in Admin/Settings
let clientData = null // current client search results
// let clientNotes = []
let client = {} // current client
let serviceType = null
let emergencyFood = false
let currentNavTab = "clients"
let hasImportantNote = ""

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
let NavGuard = (function NavGuard() {
  let self = this;
  self.addRandomHash = function() {
    // This will harmlessly change the url hash to "#random",
    // which will trigger onhashchange when they hit the back button
    if ($.isEmptyObject(location.hash)) {
      var random_hash = '#ng-' + new Date().getTime().toString(36);

      // Push "#random" onto the history, making it the most recent "page"
      history.pushState({navGuard: true}, '', random_hash)
    }
  };

  self.enableGuard = function() {
    var msg = 'NOTICE FROM NAVGUARD: Are you sure you want to navigate away from this screen? You may lose unsaved changes.';

    self.addRandomHash();

    $(window).off('hashchange.ng').on('hashchange.ng', function(event) {
      if ($.isEmptyObject(location.hash)) {
        var result = confirm(msg);
        if (result) {
          //Go back to where they were trying to go
          //Only go back if there is something to go back to
          if (window.history.length > 2) {
            window.history.back();
          }
        } else {
          // Put the hash back in; rinse and repeat
          window.history.forward();
        }
      }
    });

  //While we are at it, also throw in the traditional beforeunload listener to guard against accidantal window closures
  $(window).off('beforeunload.ng').on('beforeunload.ng', function(event) {
    return msg;
  });

    //If navigating within app without pjax, don't show beforeunload warning
    $('a').not('a,a:not([href]),[href^="#"],[href^="javascript"]').mousedown(function() {
      $(window).off('beforeunload.ng');
    });
  };

  __construct = function(that) {
    console.log("constructor called for NavGuard");
  }(this);

  return {
    destory: function() {
      $(window).off('hashchange.ng');
      $(window).off('beforeunload.ng');
    },
    init: function() {
      var history_api = typeof history.pushState !== 'undefined';
      if (history_api) {
        self.enableGuard();
      }
    }
  }
})();

NavGuard.init();

uiFillDate()
uiShowHideLogin('show')
navGotoTab("tab1")
$("#noteEditForm").hide()

document.onkeydown = function(e) {
	if ($("#searchField").is(":focus")&&e.keyCode==13) {event.preventDefault(); dbSearchClients()}
};

// control the "save button" behaviour
$(document.body).on('change','.clientForm',function(){uiSaveButton('client', 'Save')})
$(document.body).on('change','.serviceTypeForm',function(){uiSaveButton('serviceType', 'Save')})
$(document).ready(function(){
	uiShowServicesDateTime()
  setInterval(uiShowServicesDateTime, 10000)
});

// **********************************************************************************************************
// ********************************************** NAV FUNCTIONS *********************************************
// **********************************************************************************************************
function navSwitch(link){
	if (!utilValidateArguments(arguments.callee.name, arguments, 1)) return
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
	if (!utilValidateArguments(arguments.callee.name, arguments, 1)) return
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
	if (!utilValidateArguments(arguments.callee.name, arguments, 1)) return
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
	const headerLabels = ["Served", "Service", "isUSDA", "Homeless", "# Items", "# Adults", "# Children", "# Individuals", "# Seniors", "Serviced By"]
	$("#historyBottom").html("")
	for (var i = 0; i < headerLabels.length; i++) {
		$("#historyBottom").append("<div class='historyHeader'>" + headerLabels[i] + "</div>")
	}
	$("#historyBottom").append("<div class='historyLoadButton solidButton' onClick='dbLoadServiceHistory()'>Load History</div>")
}

function uiBuildHistoryTop(){
	console.log("IN Build His Top")
  //data = dbGetServicesNotes(client.clientId)
  columns = ["createdDateTime","updatedDateTime","firstSeenDate", "lastServedFoodDateTime", "familyIdCheckedDate"]
	utilSetLastServedFood()
	let historyArray = []
	let historyFields = {}
	historyFields.createdDateTime = client.createdDateTime
	historyFields.updatedDateTime = client.updatedDateTime
	historyFields.firstSeenDate = client.firstSeenDate
	historyFields.lastServedFoodDateTime = client.lastServedFoodDateTime
	historyFields.familyIdCheckedDate = client.familyIdCheckedDate
	historyArray.push(historyFields)

console.log(client.lastServedFoodDateTime)

//console.log(JSON.stringify(clientArray))

//console.log(JSON.stringify(clientArray[0].lastServed))

	// if ((clientArray[0].lastServed[0] != undefined)) {
	// 	if ((clientArray[0].lastServed[0].serviceDateTime == undefined)) {
	// 		clientArray[0].lastServedDateTime = ""
	// 	} else {
	// 		clientArray[0].lastServedDateTime = clientArray[0].lastServed[0].serviceDateTime
	// 	}
	// } else {
	// 	clientArray[0].lastServedDateTime = ""
	// }
	uiGenSelectHTMLTable('#historyTop',historyArray,columns,'historyTable')
}

function uiGenerateErrorBubble(errId, errText, input){
	if (!utilValidateArguments(arguments.callee.name, arguments, 3)) return
	// let parent = $(input).parent()
	let position = $(input).position()

console.log(position)

	let width = $(input).width()
	let left = (position.left)

console.log(left)

	let top = (position.top)

console.log(top)

	jQuery('<div/>', {
		class: "errorBubble",
     id: errId,
     text: errText,
	}).appendTo('.clientFormDiv');

	$("#"+ errId).css({top: "216px"})
	$("#"+ errId).css({left: left})

console.log($("#"+ errId).position())
}

function uiOutlineTableRow(table, row){
	if (!utilValidateArguments(arguments.callee.name, arguments, 2)) return
	$('#' + table + ' tr:eq('+ row + ')').css('outline', 'var(--blue) 1px dashed').siblings().css('outline', 'none')
}

function uiResetNotesTab(){
	hasImportantNote = ""
	$("#tabLable6").css("color", "#bbb")
	$("#noteTextArea").val("")
	$("#noteIsImportant").prop("checked", false)
}

function uiShowExistingNotes(){
	$('.notes').html("")
	// TODO this sort does not seem to be working - verify and fix
	client.notes.sort(function(x, y){
    return moment(x.createdDateTime).isBefore(y.createdDateTime)
	})
	let important = ""
	for (let i = 0; i < client.notes.length; i++){
		important = ""
    let obj = client.notes[i];
		if (obj.isImportant == "true" || obj.isImportant == true) {
			important = "IMPORTANT"
			hasImportantNote = "true"
		}
		// TODO need to provide link at TR level if the current user == the user who created the note
    uiShowNote(moment(obj.createdDateTime).format(uiDateTimeShort), obj.noteText, obj.noteByUserName, important)
  }
	if (hasImportantNote == "true") {
		$("#tabLable6").css("color", "var(--red)")
	}
}

function uiToggleNoteForm(todo, id){
	if (!utilValidateArguments(arguments.callee.name, arguments, 2)) return
	if (id.length > 1) {
		// TODO check if note has been saved if it's an existing note.
	}
	if (todo == "show"){
		$("#newNoteButton").hide()
		$("#noteEditForm").show()
	} else {
		$("#newNoteButton").show()
		$("#noteEditForm").hide()
		$("#noteTextArea").val("")
		$("#noteIsImportant").prop("checked", false)
	}
}

function uiToggleButtonColor(action, serviceTypeId, serviceButtons){
	if (!utilValidateArguments(arguments.callee.name, arguments, 3)) return
	if (action == "gray") {
		$("#btn-"+serviceTypeId).css({'color': 'var(--grey-green', 'border-color': 'var(--grey-green'}) //addClass("buttonGrayOut")
		if (serviceButtons == "Primary") $("#image-"+serviceTypeId).addClass("imageGrayOut")
	} else {
		$("#btn-"+serviceTypeId).removeClass("buttonGrayOut")
		if (serviceButtons == "Primary") $("#image-"+serviceTypeId).removeClass("imageGrayOut")
	}
}

function uiUpdateCurrentClient(index) {
	if (!utilValidateArguments(arguments.callee.name, arguments, 1)) return
	uiOutlineTableRow('clientTable', index + 1)
	let clientNumber = "<div class='clientNumber'>" + client.clientId + "</div>"
	let clientName = "<div class='clientName'>" + client.givenName + ' ' + client.familyName + "</div>"
	uiSetClientsHeader(clientNumber + clientName)
	uiShowServicesButtons()
	uiShowClientEdit(false)
	navGotoTab("tab2")
}

function uiUpdateAdminHeader() {
	$("#adminTitle").html($("#serviceName").val())
}

function uiResetDependentsTable() {
	// TODO write reset code
}

function uiSaveButton(form, action){
	if (!utilValidateArguments(arguments.callee.name, arguments, 2)) return
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

function uiShowFamilyCounts(totalAdults, totalChildren, totalOtherDependents, totalSeniors, totalSize){
	if (!utilValidateArguments(arguments.callee.name, arguments, 5)) return
	if (document.getElementById("family.totalAdults") != null){
		document.getElementById("family.totalAdults").value = totalAdults
		document.getElementById("family.totalChildren").value = totalChildren
		document.getElementById("family.totalOtherDependents").value = totalOtherDependents
		document.getElementById("family.totalSeniors").value = totalSeniors
		document.getElementById("family.totalSize").value = totalSize
	}
}

function uiShowHideError(todo, title, message){
	if (!utilValidateArguments(arguments.callee.name, arguments, 3)) return
	if (todo === 'show'){
		$('#errorOverlay').show().css('display', 'flex')
	} else {
		$('#errorOverlay').hide()
		$('#errorTitle').val('')
		$('#errorMessage').val('')
	}
}

function uiShowHideLogin(todo){
	if (!utilValidateArguments(arguments.callee.name, arguments, 1)) return
	if (todo === 'show'){
		$('#loginOverlay').show().css('display', 'flex')
	} else {
		$('#loginOverlay').hide()
		$('#loginEmail').val('')
		$('#loginPassword').val('')
	}
}

function uiShowHidePassword(){
	if ($('#loginPassword').attr('type') == 'password') {
    $('#loginPassword').attr('type', 'text');
	} else {
    $('#loginPassword').attr('type', 'password');
	}
}

function uiShowHistory(){
	//TODO disabled for testing
	uiBuildHistoryTop()
	// uiBuildHistoryBottom()
}

function uiShowHistoryData(clientHistory){
	if (!utilValidateArguments(arguments.callee.name, arguments, 1)) return
	uiBuildHistoryBottom()
	$(".historyLoadButton").hide()
	const rowFields = ["servicedDateTime", "serviceName", "isUSDA", "homeless", "itemsServed", "totalAdultsServed", "totalChildrenServed", "totalIndividualsServed", "totalSeniorsServed", "servicedByUserName"]
	for (var i = 0; i < clientHistory.length; i++) {
		let rowClass = "", newRow = ""
		if (!Number.isInteger(i / 2)) {
			rowClass = " class='historyDarkRow'"
		}
		for (var f = 0; f < rowFields.length; f++) {
			if (rowFields[f] == "servicedDateTime") {
				let serviceDateTime =  moment(clientHistory[i][rowFields[f]]).format(uiDateTimeShort)
				newRow += "<div" + rowClass + ">" + serviceDateTime + "</div>"
			} else {
				newRow += "<div" + rowClass + ">" + clientHistory[i][rowFields[f]] + "</div>"
			}
		}
		$("#historyBottom").append(newRow)
	}
}

let uiShowLastServed = function() {
	let nextService = ""
	if (client.clientId != undefined){
		let visitHeader = "FIRST SERVICE VISIT";
		if (client.lastServed[0] != undefined) {
			let lastServed = utilCalcLastServedDays()
			if (lastServed.lowestDays != 10000) {
				if (lastServed.lowestDays == 0) {
					visitHeader = 'LAST SERVED TODAY'
				} else {
					let servedDate = moment().subtract(lastServed.lowestDays, "days");
					let displayLastServed = moment(servedDate).fromNow() //lastServedFood[0].serviceDateTime
					visitHeader = 'LAST SERVED ' + displayLastServed.toUpperCase()
					let nonUSDAServiceInterval = utilGetFoodInterval("NonUSDA")
					if (lastServed.lowestDays < nonUSDAServiceInterval){
						let nextServiceDays = (nonUSDAServiceInterval - lastServed.lowestDays)
						if (nextServiceDays == 1) {
							nextService = "<br>" + "Next service is tomorrow!"
						} else {
							let nextServiceDate = moment().add(nextServiceDays, "days")
							nextService = "<br>" + "Next service " + moment(nextServiceDate).format("dddd, MMMM Do") + "!"
						}
					}
				}
			}
		}
		$('#serviceLastVisit').html(visitHeader + nextService)
	}
}

function uiShowPrimaryServiceButtons(btnPrimary, lastVisit, activeServiceTypes) {
	if (!utilValidateArguments(arguments.callee.name, arguments, 3)) return
		let primaryButtons = ""
		for (let i=0; i<btnPrimary.length; i++){
			let x = btnPrimary[i]
			let btnClass = "btnPrimary"
			if ((activeServiceTypes[x].serviceCategory == "Administration") || (activeServiceTypes[x].isUSDA == "Emergency")) btnClass = "btnAlert"
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
		// TODO separate
		$('#receiptHeader').html(moment().format(longDate)+"<br>"+client.givenName+" "+client.familyName)
	}
}

function uiShowUserEdit(){
	$('#userFormContainer').html(uiGetTemplate('#userForm'))
}

function uiShowClientEdit(isEdit){
	if (!utilValidateArguments(arguments.callee.name, arguments, 1)) return
	uiDisplayNotes("Client Notes")
	$('#clientFormContainer').html(uiGetTemplate('#clientForm'))
	uiPopulateForm(client, 'clientForm')
	if (isEdit){
		uiToggleClientViewEdit('edit')
	} else {
		uiToggleClientViewEdit('view')
	}
	uiShowDependents(isEdit)
	uiShowExistingNotes()
	// dbLoadNotes(client.clientId)
}

function uiShowDependents(isEdit){
	if (!utilValidateArguments(arguments.callee.name, arguments, 1)) return
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

function uiShowNote(dateTime, text, user, important){
	if (!utilValidateArguments(arguments.callee.name, arguments, 4)) return
	let clickableRow = ""
	let noteId = 1 // TODO need to keep orginal note index for recall/edit
	if (important == "IMPORTANT") {
		clickableRow = ' class=\"notesRow\" onClick=\"uiToggleNoteForm(\'show\',\'' + noteId + '\')\"'
	}
	$('.notes').append('<tr' + clickableRow + '><td class="notesData">'+dateTime+'</td><td class="notesData">'+text+'</td><td class="notesData">'+user+'</td><td class="notesDataImportant">'+important+'</td></tr>')
}

function uiShowNewClientForm(){
	client = ""
	$("#clientsTitle").html("New Client")
	$('#clientFormContainer').html(uiGetTemplate('#clientForm'))
	uiToggleClientViewEdit("edit")
	$('#createdDateTime.clientForm').val(utilNow())
	$('#updatedDateTime.clientForm').val(utilNow())
	$('#firstSeenDate.clientForm').val(utilToday())
	$('#familyIdCheckedDate.clientForm').val(utilToday())
	$('#homeless.clientForm').val('false')
	$('#city.clientForm').val('San Jose')
	$('#state.clientForm').val('CA')
	navGotoTab("tab3")
}

function uiShowSecondaryServiceButtons(activeServiceTypes){
	if (!utilValidateArguments(arguments.callee.name, arguments, 1)) return
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
	// return if client object is empty
	if ($.isEmptyObject(client)) return

//	let lastIdCheck = utilCalcLastIdCheckDays()
// TODO IF lastidcheck is current service then may not need idCheck field

	let lastServed = utilCalcLastServedDays() // Returns number of days since for USDA & NonUSDA
	let activeServiceTypes = utilCalcActiveServiceTypes() // checks active date ranges of each serviceTypes
	let targetServices = utilCalcTargetServices(activeServiceTypes); // changes setting to specific variables matching client
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
	uiToggleIsUSDA()
}

function uiPopulateForm(data, form){
	if (!utilValidateArguments(arguments.callee.name, arguments, 2)) return
	$.each(data, function(key,value){

//console.log(key + " : " + value)

		if (typeof(data[key])=='object') {
			let obj = data[key]
			$.each(obj, function(key2,value2){
				let el = '.inputBox[id="'+key+'.'+key2+'"].'+form
				if($(el).is("select")) {
					el = el + ' option[value="'+ value2 +'"]'
					$(el).prop('selected', true);
				} else {
					$(el).val(value2)

					//console.log("ASSIGN : " + value2)
				}
			});
		} else {
			let el = '[id="'+key+'"].'+form
			if($(el).is("select")) {
				el = el + ' option[value="'+ value +'"]'
				$(el).prop('selected', true);
			} else {
				$(el).val(value)

				//console.log("WAS : " + $(el).val())
				//console.log("ASSIGN : " + value)

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
	if (!utilValidateArguments(arguments.callee.name, arguments, 1)) return
	$("#clientsTitle").html(title)
}

function uiSetServiceTypeHeader(){
	$("#adminTitle").html($('#serviceName').val())
}

function uiSetAdminHeader(title){
	if (!utilValidateArguments(arguments.callee.name, arguments, 1)) return
	$("#adminTitle").html(title)
}

function uiShowServiceTypes(){
	uiGenSelectHTMLTable('#serviceTypesContainer',serviceTypes,["serviceName","serviceDescription","isActive"],'serviceTypesTable')
}

function uiGenSelectHTML(val,options,col,id){
	if (!utilValidateArguments(arguments.callee.name, arguments, 4)) return
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
	console.log("IN TABLE GEN " + tableID)
	if (!utilValidateArguments(arguments.callee.name, arguments, 4)) return
	//if (data == undefined) return
	// TODO FIX ONE OF the calls to this function -- value two is "undefined"

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
    	} else if (col[j]=="dob"||col[j]=="firstSeenDate"||col[j]=="familyIdCheckedDate"||col[j]=="lastServedDateTime"){
				tabCell.className = "historyTopText"
        tabCell.innerHTML = moment(data[i][col[j]]).format('MMM DD, YYYY')
			} else if (col[j]=="lastServedFoodDateTime"){
				tabCell.className = "historyTopText"

console.log("IN LAST SERVED DISPLAY")

				//let lastServed = utilCalcLastServedDays()
				let displayLastServed = "Never Served"
				if (client.lastServedFoodDateTime != "1900-01-01") {
					displayLastServed = moment(client.lastServedFoodDateTime).format('MMM DD, YYYY | h:mm a')
				}
				//
				// if (lastServed.lowestDays != 10000) {
				// 	let servedDate = moment().subtract(lastServed.lowestDays, "days");
				// 	let displayLastServed = moment(servedDate).format('MMM DD, YYYY')
				// }
				tabCell.innerHTML = displayLastServed
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
	if (!utilValidateArguments(arguments.callee.name, arguments, 1)) return
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
	if (!utilValidateArguments(arguments.callee.name, arguments, 1)) return
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

function uiToggleIsUSDA() {

console.log("ToggleUSDA")

	if ($("#serviceCategory").val() == "Food"){
		$('.USDADiv').show('slow')
	} else {
		$("#isUSDA").val("NA")
		$('.USDADiv').hide('slow')
	}

}

function uiGetTemplate(template){
	if (!utilValidateArguments(arguments.callee.name, arguments, 1)) return
	let imp = document.querySelector('link[rel="import"]');
	let temp = imp.import.querySelector(template);
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
	if (!utilValidateArguments(arguments.callee.name, arguments, 1)) return
	//setMainSideDiv()
	const tableStr = '<table class="notes"></table>'
	$('#notesContainer').html(tableStr)
	// var headerRow = '<tr style="height:50px;padding:10px;"><td><h4 class="siteHeading">'+pageName+'</h4>'
	// headerRow+='<h5 class="siteHeading">'+moment().format(uiDate)+'</h5></td></tr>'
	const headerRow = '<tr><td class="notesHeader">Created</td><td class="notesHeader">Note</td><td class="notesHeader">Created By</td><td class="notesHeader">Important</td></tr>'
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
function dbGetData(uUrl){
	//console.log("IN GET")
	if (!utilValidateArguments(arguments.callee.name, arguments, 1)) return
	cogCheckSession()
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
			utilErrorHandler(message, status, error, "aws")
			console.log(message + ", " + status + ", " + error)
			alert(error);
			if (message.readyState == 0) {
				console.log("Error of some kind!")
			}
		}
	});
	//console.log(ans)
	return ans
}

function dbGetNewClientID(){
	lastIdJson = dbGetData(aws+"/clients/lastid")
	newId = lastIdJson.lastId
	let notEmpty = true
	while (notEmpty) {
		result = dbGetData(aws+"/clients/exists/" + newId)
		if (result.count == 0) {
			notEmpty = false
		} else {
			newId++
		}
	}
	request = {}
	newId = newId.toString()
	request['lastId']=newId
	dbPostData(aws+"/clients/lastid",JSON.stringify(request))
	return newId
}

function dbGetServicesTypes(){
	return dbGetData(aws+"/servicetypes").serviceTypes
}

function dbLoadServiceHistory(){
	let clientHistory = dbGetData(aws+"/clients/services/"+client.clientId).services
	uiShowHistoryData(clientHistory)
}

function dbPostData(uUrl,dataU){
	if (!utilValidateArguments(arguments.callee.name, arguments, 2)) return
	cogCheckSession()
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
			//	console.log(message.__type)
				if (typeof message.message !== 'undefined') {
					ans = message.message
					utilBeep()

				} else if (message.__type != undefined) {
					ans = message.__type

					console.log("ERROR")

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
						// TODO REMOVE BELOW FOR UPLOAD ONLY
						// TODO DO WE NEED THE LINE BELOW
						// let clientTableRow = utilUpdateClientsData()

						uiGenSelectHTMLTable('#searchContainer', clientData,["clientId","givenName","familyName","dob","street"],'clientTable')
						if (clientData.length == 1) clientTableRow = 1
						uiOutlineTableRow('clientTable', clientTableRow)
						uiSetClientsHeader('#'+client.clientId + ' | ' + client.givenName + ' ' + client.familyName)
						uiSaveButton('client', 'SAVED!!')
					}
				}
		},
		error: function(json){
	    	console.log(json)
				ans = json
				if (uUrl.includes('/servicetypes')) {
					uiSaveButton('serviceType', 'ERROR!!')
				} else if (uUrl.includes('/clients')) {
					uiSaveButton('client', 'ERROR!!')
				}
		}
	});
	return ans
}

function uiResetClientForm(){
	// TODO Make sure Cancel button (resetClientForm) clears form & does some kind of reset.
	// maybe need to keep previous client id when starting new client form
console.log("CLEAR CLIENT FORM")

	if (client = "") {

	} else {
		let index = clientData.filter(function( obj ) {
			return obj.clientId == client.clientId
		})
		uiPopulateForm(client, 'clientForm')
		//uiUpdateCurrentClient(index)
	}

	// $("#clientFormContainer").html("")
}

function dbSaveLastServed(serviceTypeId, serviceCategory, itemsServed, isUSDA){
	if (!utilValidateArguments(arguments.callee.name, arguments, 4)) return
	let serviceDateTime = moment().format(dateTime)
	let newRecord = {serviceTypeId, serviceDateTime, serviceCategory, itemsServed, isUSDA}
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
	} else {
		console.log("Failed to Save")
	}
}

function dbSaveService(serviceTypeId, serviceCategory, serviceButtons){
	if (!utilValidateArguments(arguments.callee.name, arguments, 3)) return
	let itemsServed = ""
	let serviceType = {}
	if (serviceButtons == "Primary"){
		serviceType = utilGetServiceTypeByID(serviceTypeId)
		itemsServed = serviceType.numberItems
		if (serviceType.itemsPer == "Person") itemsServed = itemsServed * client.family.totalSize
		dbSaveLastServed(serviceTypeId, serviceCategory, itemsServed, serviceType.isUSDA)
		// TODO move to FUNCTION
		$("#receiptBody").append("<p><strong>"+serviceType.serviceName+"</strong><br><strong>Category:</strong> "+serviceCategory+"<br><strong>Is USDA:</strong> "+serviceType.isUSDA+"</p>")
	}
	dbPostService(serviceType, itemsServed)
}

function dbPostService(serviceType, itemsServed){
	if (!utilValidateArguments(arguments.callee.name, arguments, 2)) return
	// TODO Create table by clientID and add new services to top of array
	// TODO add senior cutoff age to the Settings (now configure)
	// TODO add Zipcode to the Settings (now configure) - make client for zipcode a pull-down with values
	let emergencyFood = "NO"
	if (serviceType.isUSDA == "Emergency") emergencyFood = "YES"

	let serviceRecord = {
							serviceId: cuid(),
			 servicedDateTime: moment().format(dateTime),
			 	 clientServedId: client.clientId,
		 servicedByUserName: session.user.username,
			    serviceTypeId: serviceType.serviceTypeId,
					  serviceName: serviceType.serviceName,
				serviceCategory: serviceType.serviceCategory,
				 serviceButtons: serviceType.serviceButtons,
				         isUSDA: serviceType.isUSDA,
				    itemsServed: itemsServed,
				       homeless: client.homeless,
				  emergencyFood: emergencyFood,
		  totalAdultsServed: client.family.totalAdults,
		totalChildrenServed: client.family.totalChildren,
		 totalSeniorsServed: client.family.totalSeniors,
 totalIndividualsServed: client.family.totalSize,
					fulfillment: {
						        pending: false,
									 dateTime: moment().format(dateTime),
							voucherNumber: "XXXXX",
						     byUserName: session.user.username,
						      itemCount: itemsServed
					}
	}

	console.log(session.user)

	// {
	// 	"serviceId": {"S": "$inputRoot.serviceId"},
	// 		"servicedDateTime": {"S": "$inputRoot.servicedDateTime"},
	// 		"clientServedId": {"S": "$inputRoot.clientServedId"},
	// 		"servicedByUserId": {"S": "$inputRoot.servicedByUserId"},
	// 		"servicedByUserName" : {"S": "$inputRoot.servicedByUserName"},
	// 		"serviceTypeId" : {"S": "$inputRoot.serviceTypeId"},
	// 		"serviceName" : {"S": "$inputRoot.serviceName"},
	// 		"serviceCategory" : {"S": "$inputRoot.serviceCategory"},
	// 		"serviceButtons" : {"S": "$inputRoot.serviceButtons"},
	// 		"isUSA" : {"S": "$inputRoot.isUSA"},
	// 		"itemsServed" : {"N": "$inputRoot.itemsServed"},
	// 		"homeless" : {"S": "$inputRoot.homeless"},
	// 		"emergencyFood" : {"S": "$inputRoot.emergencyFood"},
	// 		"total" : {
	// 				"M": {
	// 						"adultsServed": {"N": "$inputRoot.total.adultsServed"},
	// 						"childrenServed": {"N": "$inputRoot.total.childrenServed"},
	// 						"individualsServed": {"N": "$inputRoot.total.individualsServed"},
	// 						"seniorsServed": {"N": "$inputRoot.total.seniorsServed"}
	// 				}
	// 		},
	// 		"fulfillment" : {
	// 				"M": {
	// 						"pending": {"BOOL": "$inputRoot.fulfillment.pending"},
	// 						"dateTime": {"S": "$inputRoot.fulfillment.dateTime"},
	// 						"voucherNumber": {"N": "$inputRoot.fulfillment.voucherNumber"},
	// 						"byUserId": {"S": "$inputRoot.fulfillment.byUserId"},
	// 						"byUserName": {"S": "$inputRoot.fulfillment.byUserName"},
	// 						"itemCount": {"N": "$inputRoot.fulfillment.itemCount"}
	// 				}
	// 		}

	let data = serviceRecord
	data = JSON.stringify(data)

console.log(data)

	let URL = aws+"/clients/services"
	result = dbPostData(URL,data)
	if (result == null) {
		utilBloop() // TODO move bloop to successful POST ()
		console.log("SUCCESS: " + result)
	}
}

function dbSaveNote(){
	// TODO replace hardcoded values with real user variables
	utilValidateForm(".noteForm")
	let tmp = {}
	tmp.noteText = $("#noteTextArea").val().toString()
	tmp.createdDateTime = moment().format(dateTime)
	tmp.updatedDateTime = moment().format(dateTime)
	tmp.noteByUserName = session.user.username
	let isImportant = false
	if ($("#noteIsImportant").is(":checked")) isImportant = true
	tmp.isImportant = isImportant
console.log(JSON.stringify(tmp))
	client.notes.push(tmp)
console.log(JSON.stringify(client.notes))
// TODO SAVE CLIENT ... NEED TO USE UPDATE TO ONLY UPDATE SOME FIELDS
	data = client
	let URL = aws+"/clients/"
	result = dbPostData(URL,JSON.stringify(data))
	if (result == null) {
		utilCalcFamilyCounts()
		utilCalcClientAge("db")
		uiToggleDependentsViewEdit("view")
		uiToggleNoteForm("hide", "")
		uiShowExistingNotes()
	}

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
		data.notes = []
	} else {
		data = utilFormToJSON('.clientForm')

console.log(JSON.stringify(data.dependents))
console.log(JSON.stringify(client.dependents))

		if (client.dependents == undefined) client.dependents = []
		if (client.lastServed == undefined) client.lastServed = []
		data.dependents = client.dependents
		data.lastServed = client.lastServed
		for (var i = 0; i < data.dependents.length; i++) {
			delete data.dependents[i].age
		}
		if (data.lastServed == undefined||data.lastServed == "") {
			data.lastServed = []
		}
		if (data.notes == undefined||data.notes == "") {
			data.notes = []
		}
	}
console.log(data)
console.log(JSON.stringify(data))
	uiSaveButton('client', 'Saving...')
	let URL = aws+"/clients/"
	result = dbPostData(URL,JSON.stringify(data))
	if (result == null) {
		utilCalcClientAge("db")
		utilCalcFamilyCounts()
		uiToggleClientViewEdit("view")
	}
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
		utilCalcClientAge("db")
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
	const regex = /[-/.]/g
 	const slashCount = (a.match(regex) || []).length
	if (slashCount == 2){
		a = utilCleanUpDate(a)
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
	 	// TODO clear current client
  } else {
	 	let columns = ["clientId","givenName","familyName","dob","street"]
	 	uiGenSelectHTMLTable('#searchContainer', clientData, columns,'clientTable')
		uiResetNotesTab()
		if (clientData.length == 1){
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

function cogCheckSession() {
	cognitoUser.getSession(function(err, session) {
		if (err) {
				alert(err);
				return;
		}
//	console.log('session validity: ' + session.isValid());
	})
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
	let username = $('#loginEmail').val(),
			password = $('#loginPassword').val(),
			authData = {
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
			console.log("COGNITO ERROR")
			console.log('|'+err+'|');
			utilBeep()
			if (err == 'Error: Incorrect username or password.') {
				$("#loginError").html("Incorrect username or password")
			} else if (err == 'UserNotFoundException: User does not exist.') {
				$("#loginError").html("Username does not exist.")
			} else if (err == 'NotAuthorizedException: Incorrect username or password.') {
				$("#loginError").html("Incorrect username or password.")
			} else if (err == 'PasswordResetRequiredException: Password reset required for the user') {
				$("#loginError").html("New Password is required.")
			} else if (err == 'InvalidParameterException: Missing required parameter USERNAME')
			$("#loginError").html("Username is required.")
    },
		newPasswordRequired: function(userAttributes, requiredAttributes) {
				// User was signed up by an admin and must provide new
				// password and required attributes, if any, to complete
				// authentication.
console.log(requiredAttributes)


console.log("needs new password - change the form")
let newPassword = ""

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
// 	userPool.signUp('', '', attributeList, null, function(err, result){
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
		 Username : '', // your username here
		 Password : '', // your password here
 	};

	let userData = {
		 Username : '', // your username here
		 Password : '', // your password here
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
	let serviceType = utilGetServiceTypeByID(serviceTypeId)

	// let itemsServed = "4"
	// TODO Need real numberItems
	// let totalServed = client.family.totalSize
	// TODO Need items per [family][person] in Service Types

	dbSaveService(serviceTypeId, serviceCategory, serviceButtons);
	uiShowLastServed()
	// uiShowNote(serviceTypeId, "")
	uiToggleButtonColor("gray", serviceTypeId, serviceButtons)
	// TODO Create ability to UNDO the adding of a service.
	// TODO Create tally of added services on the screen [the print button will be added there]
}

function utilGetServiceTypeByID(id){
	if (!utilValidateArguments(arguments.callee.name, arguments, 1)) return
	let serviceTypeArr = serviceTypes.filter(function( obj ) {
		return obj.serviceTypeId == serviceTypeId
	})
	return serviceTypeArr[0]
}

function utilGetFoodInterval(isUSDA){
	if (!utilValidateArguments(arguments.callee.name, arguments, 1)) return
	for (var i = 0; i < serviceTypes.length; i++) {
		if ((serviceTypes[i].serviceButtons == "Primary") && (serviceTypes[i].serviceCategory == "Food") && (serviceTypes[i].isUSDA == isUSDA)){
			return serviceTypes[i].serviceInterval
		}
	}
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
		let display = true;
		// check for not a valid service based on interval between services
		if (!utilValidateServiceInterval(activeServiceTypes[i], activeServiceTypes, lastServed)) continue;
		// loop through each property in each activeServiceType
		for (let prop in targetServices[i]) {
			if (targetServices[i][prop] != client[prop]) {
				display = false
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
	if (client.dependents == undefined) client.dependents = []
	for (var i = 0; i < client.dependents.length; i++) {
		utilCalcDependentAge(i)
	}
	if (client.family == undefined) client.family = {}
	// dependents age & family counts
	let fam = {totalAdults:1, totalChildren:0, totalOtherDependents:0, totalSeniors:0, totalSize:1}
	if (client.age >= seniorAge) ++fam.totalSeniors
	for (let i = 0; i < client.dependents.length; i++) {
		client.dependents[i].age = moment().diff(client.dependents[i].dob, "years")
		if (client.dependents[i].relationship == "Spouse" && client.dependents[i].isActive == "Active") {
			++fam.totalAdults
			++fam.totalSize
			if (client.dependents[i].age >= seniorAge) ++fam.totalSeniors
		}
		if (client.dependents[i].relationship == "Other Dependent" && client.dependents[i].age >= 18 && client.dependents[i].isActive == "Active") {
			++fam.totalOtherDependents
			++fam.totalAdults
			++fam.totalSize
			if (client.dependents[i].age >= seniorAge) ++fam.totalSeniors
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
	client.family.totalSeniors = fam.totalSeniors
	client.family.totalSize = fam.totalSize
	uiShowFamilyCounts(fam.totalAdults, fam.totalChildren, fam.totalOtherDependents, fam.totalSeniors, fam.totalSize)
}

// function utilCalcLastIdCheckDays() {
// 	// get Id Checked Date from client object & calculate number of days
// 	// let familyIdCheckedDate = moment(client.familyIdCheckedDate, dbDate)
// 	let lastIdCheck = moment().diff(client.familyIdCheckedDate, 'days')
// 	return lastIdCheck
// }

function utilSetLastServedFood(){
	console.log("IN set last saved food")
	// TODO too much duplicated code with utilCalcLastServedDays()
	let lastServedFoodDateTime = "1900-01-01"
	if (client.lastServed[0] == undefined) return lastServedFoodDateTime
	let lastServedFood = client.lastServed.filter(function( obj ) {
		return obj.serviceCategory == "Food"
	})

console.log(lastServedFood)

	for (var i = 0; i < lastServedFood.length; i++) {
		if (lastServedFood[i].isUSDA != "Emergency") {
			if (moment(lastServedFood[i].serviceDateTime).isAfter(lastServedFoodDateTime)){
				lastServedFoodDateTime = lastServedFood[i].serviceDateTime
			}
		}
	}
	client.lastServedFoodDateTime = lastServedFoodDateTime
}

function utilCalcLastServedDays() {
	// get Last Served Date from client object & calculate number of days
	let lastServed = {daysUSDA:"10000", daysNonUSDA:"10000", lowestDays:"10000"}
	if (client.lastServed[0] == undefined) return lastServed
	let lastServedFood = client.lastServed.filter(function( obj ) {
		return obj.serviceCategory == "Food"
	})
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
	lastServed.lowestDays = lastServed.daysUSDA
	if (lastServed.daysNonUSDA < lastServed.daysUSDA) lastServed.lowestDays = lastServed.daysNonUSDA
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
	if (!utilValidateArguments(arguments.callee.name, arguments, 1)) return
	str = str.replace(/[^\s]+/g, function(word) {
	  return word.replace(/^./, function(first) {
	    return first.toUpperCase();
	  });
	});
	return str
}

function utilCleanUpDate(a) {
	a = a.replace("-", "/")
	a = a.replace(".", "/")
	let dateArr = []
	let temp = a
	// let year = ""
	for (var i = 0; i < 2; i++) {
		let slash = temp.indexOf("/")
		dateArr[i] = temp.slice(0, slash)
		if (dateArr[i].length == 1) dateArr[i] = "0" + dateArr[i]
		temp =  temp.slice(slash + 1)
	}
	yearLength = temp.length
	if (yearLength == 1) {
		dateArr[2] = "200" + temp
	} else if (yearLength == 2) {
		if (temp <= moment().format("YY")) {
			dateArr[2] = "20" + temp
		} else {
			dateArr[2] = "19" + temp
		}
	} else {
		dateArr[2] = temp
	}
	const date = dateArr[0] +"/"+ dateArr[1] +"/"+ dateArr[2]
	return date
}

function utilErrorHandler(errMessage, status, error, type) {
	if (!utilValidateArguments(arguments.callee.name, arguments, 4)) return
	return

// TODO manage AWS & CODE Errors

	if (type == "aws") {
		// if (message.indexOf("XMLHttpRequest")
		cogLogoutUser()
		const title = "Login Expired"
		const message =  "Login again to continue."
		utilBeep()
		uiShowHideError("show", title, message)
		cogLoginUser
	} else if (type == "code" ) {
		if (error == "argument count") {
			const title = errMessage
			const message =  status
			utilBeep()
			uiShowHideError("show", title, message)
		}
	} else if (type == "cognito") {



	}
		//utilBeep()
	 	//uiShowHideError("show")
}

function utilFormToJSON(form){
	if (!utilValidateArguments(arguments.callee.name, arguments, 1)) return

	uiGenerateErrorBubble("errorGivenName", "Field cannot be empty!", "#givenName.clientForm")


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
				// if (key === 'lastSeenDate') formVal = '*EMPTY*'
			} else if (valType == 'text'||valType == 'date'||valType == 'datetime-local') {
console.log(key)
				formVal = '*EMPTY*'
			} else if (valType == 'number') {
console.log(key + ' : ' + formVal + ' : '+ valType)
				formVal = '0'
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
	if (!utilValidateArguments(arguments.callee.name, arguments, 1)) return
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
					 updatedDateTime: "Profile Updated",
				     firstSeenDate: "First Seen",
				    	lastSeenDate: "Last Served",
       familyIdCheckedDate: "Last ID Check",
	  lastServedFoodDateTime: "Last Served"
	}
	let y = data[x]
	if (y==undefined){return x} else {return y}
}

function utilNow() {
	return moment().format(dateTime)
}

function utilRemoveDupClients(clients) {
	if (!utilValidateArguments(arguments.callee.name, arguments, 1)) return
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

function utilCalcClientAge(source){
	if (!utilValidateArguments(arguments.callee.name, arguments, 1)) return
	let dob = ""
	if (source == "form") {
		dob = $("#dob.clientForm").val()
	} else {
		dob = client.dob
	}
	let age = moment().diff(dob, 'years')
	if (Number(age)){
		$("#clientAge").val(age)
		client.age = age
	}
}

function utilCalcDependentAge(index){
	if (!utilValidateArguments(arguments.callee.name, arguments, 1)) return
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
	if (!utilValidateArguments(arguments.callee.name, arguments, 1)) return
	client = clientData[index]
	utilCalcClientAge("db")
	utilCalcFamilyCounts() // calculate fields counts and ages
	// TODO workaround for Pacific Islander Ethnicity
	// integrate solution into import
	console.log(client.ethnicGroup)
	if (client.ethnicGroup == "Asian/Pac Islander") {
		client.ethnicGroup = "Asian/Pacific Islander"
	}

	// emergencyFood = false // **** TODO what is this for?
	uiShowHistory()
	// TODO need to show notes
	uiUpdateCurrentClient(index)
}

function utilSetCurrentServiceType(index){
	if (!utilValidateArguments(arguments.callee.name, arguments, 1)) return
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
	// calculate what row a result is on the results table
	let row = null
	let data = utilFormToJSON('.clientForm')
	$.each(data, function(key,value){
		client[key] = value
	});

console.log(data.length)

	for (var i = 0; i < data.length; i++) {
		if (client.clientId == data[i].clientId){
			row = i+1
			$.each(client, function(key,value){
				data[i][key] = value
			});
		}
	}

console.log(row)

	return row
}

function utilValidateArguments(func, arguments, count){
	if (arguments.length != count){
		console.log(func + " ARGUMENT COUNT ERROR")
		const message = "Error in " + func + " Function"
		const status = "Argument count error."
		const error = "argument count"
		utilErrorHandler(message, status, error,"code")
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

function utilValidateForm(form){
	data = utilFormToJSON(form)
}

function utilCalculateFoodInterval(isUSDA, activeServiceTypes) {
	if (!utilValidateArguments(arguments.callee.name, arguments, 2)) return
	let foodServiceInterval = ""
	for (var i = 0; i < activeServiceTypes.length; i++) {
		if (activeServiceTypes[i].serviceCategory == "Food" && activeServiceTypes[i].serviceButtons == "Primary" && activeServiceTypes[i].isUSDA == isUSDA) {
			foodServiceInterval = activeServiceTypes[i].serviceInterval
		}
	}
	return foodServiceInterval
}

function utilValidateServiceInterval(activeServiceType, activeServiceTypes, lastServed){
	if (!utilValidateArguments(arguments.callee.name, arguments, 3)) return
	// empty lastServed array - bump out Non-USDA & Emergency Food buttons
	if (client.lastServed.length == 0 || lastServed.lowestDays == 10000) {
		if ((activeServiceType.serviceCategory == "Food" && activeServiceType.serviceButtons == "Primary" && activeServiceType.isUSDA == "NonUSDA")||(activeServiceType.serviceCategory == "Food" && activeServiceType.serviceButtons == "Primary" && activeServiceType.isUSDA == "Emergency")) {
			return false;
		} else {return true}
	}
	if (activeServiceType.serviceButtons == "Primary") {
		if (activeServiceType.serviceCategory == "Food") {
			if (activeServiceType.isUSDA == "USDA") {
				if (lastServed.daysUSDA < activeServiceType.serviceInterval) {
					console.log("FALSE")
					return false
				}
			} else if (activeServiceType.isUSDA == "NonUSDA") {
				let USDAServiceInterval = utilCalculateFoodInterval("USDA", activeServiceTypes)
				if (lastServed.daysUSDA >= USDAServiceInterval) {
					return false
				} else if (lastServed.daysNonUSDA >= activeServiceType.serviceInterval) {
					return false
				}
			} else if (activeServiceType.isUSDA == "Emergency") {
				let USDAServiceInterval = utilCalculateFoodInterval("USDA", activeServiceTypes)
				if (lastServed.daysUSDA >= USDAServiceInterval) {
					return false
				}
				let nonUSDAServiceInterval = utilCalculateFoodInterval("NonUSDA", activeServiceTypes)
				if (lastServed.daysNonUSDA <= nonUSDAServiceInterval) {
					 console.log("FALSE")
					 return false
				}
 			}
		} else if (activeServiceType.serviceCategory == "Clothes") {
			if (lastServed.lowestDays < activeServiceType.serviceInterval) {
				console.log("FALSE")
				return false;
			}
		} else if (activeServiceType.serviceCategory == "Administration") {
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
		if (lastServed.lowestDays < activeServiceType.serviceInterval) {
			return false;
		}
	}
	return true
};

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







// function newNote(text,text2){
// 	if (!utilValidateArguments(arguments.callee.name, arguments, 2)) return
// 	uiShowNote(text,text2)
// 	dbSaveNote(text)
// }
