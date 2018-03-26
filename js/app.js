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
// TODO cleanup History sort
// TODO add number of Dependents to Dependents tab ie. Dependents(5) ... do not show () if 0
// TODO add number of Notes to Notes tab ie. Note(3) ... do not show () if 0
// TODO have loading of history happen when history tab is clicked
// TODO confirm that lastIdCheck is being updated when that service is clicked.

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
let servicesRendered = [] // tally of services as they are clicked
let client = {} // current client
uiClearCurrentClient()
let user = {} // authenticated
let currentUser = {}
let users = [] // all users
let adminUser = {}
let serviceType = null
let emergencyFood = false
let currentNavTab = "clients"
let hasImportantNote = ""
// cognito config
let CognitoUserPool = AmazonCognitoIdentity.CognitoUserPool;
let poolData = {
		UserPoolId : 'us-west-2_AufYE4o3x', // Your user pool id here
		ClientId : '7j3jhm5a3pkc67m52bf7tv10au' // Your client id here
};
let userPool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(poolData);
let session = {}
let cognitoUser = {}
let authorization = {}

// TODO build some selects in forms from data in settings (ie. Categories)

uiFillDate()
uiShowHideLogin('show')
navGotoTab("tab1")
$("#noteEditForm").hide()
$("#nav3").hide()
$("#atabLable7").hide()
uiShowDailyReportHeader(moment().format(date), '#todayBodyDiv', "DAILY")
document.onkeydown = function(e) {
	if ($("#searchField").is(":focus")&&e.keyCode==13) {event.preventDefault(); dbSearchClients()}
};

// control the "save button" behaviour
$(document.body).on('change','.clientForm',function(){uiSaveButton('client', 'Save')})
$(document.body).on('change','.serviceTypeForm',function(){uiSaveButton('serviceType', 'Save')})
// do error checking
$(document.body).on('focusout','.clientForm',function(){utilValidateField($(this).attr("id"), $(this).attr("class"))})
$(document.body).on('focusout','.userForm',function(){utilValidateField($(this).attr("id"), $(this).attr("class"))})
$(document.body).on('focusout','.serviceTypeForm',function(){utilValidateField($(this).attr("id"), $(this).attr("class"))})
$(document.body).on('focusout','.passwordForm',function(){utilValidateField($(this).attr("id"), $(this).attr("class"))})

$(document).ready(function(){
	uiShowServicesDateTime()
  setInterval(uiShowServicesDateTime, 10000)
})

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
			uiShowUsers()
			uiShowSettings()
			uiShowReports()
			break
		case "user":
			navGotoSec("nav4")
			navGotoTab("uTab1")
			uiShowProfileForm()
			uiShowChangePasswordForm()
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
		case "nav1": // CLIENTS
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

// *** UI A ***
function uiAddNewDependentsRow(){
	let nextRow = '00';
	if (client.dependents!=null){
		nextRow = client.dependents.length;
		// if (nextRow < 10) nextRow = "0" + nextRow
	}
	let dependentRow = "<tr>"
	dependentRow+="<td><input id='givenName["+nextRow+"]' class='inputBox inputForTable dependentsForm'></td>"
	dependentRow+="<td><input id='familyName["+nextRow+"]' class='inputBox inputForTable dependentsForm'></td>"
	dependentRow+="<td><select id='relationship["+nextRow+"]' class='inputBox inputForTable dependentsForm'><option value='Child'>Child</option><option value='Spouse'>Spouse</option><option value='Other'>Other</option></select></td>"
	dependentRow+="<td><select id='gender["+nextRow+"]' class='inputBox inputForTable dependentsForm'><option value='Male'>Male</option><option value='Female'>Female</option></select></td>"
	dependentRow+="<td><input id='dob["+nextRow+"]' class='inputBox inputForTable dependentsForm' onchange='utilCalcDependentAge("+ parseInt(nextRow)+")' type='date'></td>"
	dependentRow+="<td class='dependentsViewOnly'><input id='age["+nextRow+"]' class='inputBox inputForTable dependentsForm' style='width:50px'></td><td>"
	dependentRow+="<select id='isActive["+nextRow+"]' class='inputBox inputForTable dependentsForm'><option value='Active'>Active</option><option value='Inactive'>Inactive</option></select></td>"
	dependentRow+="</tr>"
	$('#dependentsTable').append(dependentRow)
	uiToggleDependentsViewEdit('edit');
};

function uiAddNoteButtonRow(){
	var buttonRow = '<div class="row"><a data-toggle="modal" data-target="#myModal" class="btn-nav addNoteButton">'
	buttonRow+='+Note</a></div></table>'
	$('#notesContainer').append(buttonRow)
}

// *** UI B ***
function uiBuildHistoryBottom(){
	const headerLabels = ["Served", "Service", "isUSDA", "Homeless", "# Items", "# Adults", "# Children", "# Individuals", "# Seniors", "Serviced By"]
	$("#historyBottom").html("")
	for (var i = 0; i < headerLabels.length; i++) {
		$("#historyBottom").append("<div class='historyHeader'>" + headerLabels[i] + "</div>")
	}
	$("#historyBottom").append("<div class='historyLoadButton solidButton' onClick='dbLoadServiceHistory()'>Load History</div>")
};

function uiBuildHistoryTop(){
//console.log("IN Build His Top")
  //data = dbGetServicesNotes(client.clientId)
  columns = ["createdDateTime", "updatedDateTime", "firstSeenDate", "lastServedFoodDateTime", "familyIdCheckedDate"]
	utilSetLastServedFood()
	let historyArray = []
	let historyFields = {}
	historyFields.createdDateTime = client.createdDateTime
	historyFields.updatedDateTime = client.updatedDateTime
	historyFields.firstSeenDate = client.firstSeenDate
	historyFields.lastServedFoodDateTime = client.lastServedFoodDateTime
	historyFields.familyIdCheckedDate = client.familyIdCheckedDate
	historyArray.push(historyFields)
//console.log(client.lastServedFoodDateTime)
//console.log(historyArray)
//console.log(JSON.stringify(clientArray))
//console.log(JSON.stringify(clientArray[0].lastServed))
	uiGenSelectHTMLTable('#historyTop', historyArray, columns,'historyTable')
}

// *** UI C ***
function uiClearAllErrorBubbles(){
	$('.errorBubble').remove()
	$('.errorField').removeClass("errorField")
};

// *** UI D ***
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

// *** UI G ***
function uiGenerateErrorBubble(errText, id, classes){
	if (!utilValidateArguments(arguments.callee.name, arguments, 3)) return
// console.log(errText, " ", id)
	$('[id="err-' + id + '"]').remove()
	$('[id="' + id + '"]').removeClass("errorField")
	let parent = ".clientFormDiv"
	let formClass = ".clientForm"
	if (classes.indexOf("userForm") > -1){
		parent = ".userFormDiv"
		formClass = ".userForm"
	} else if (classes.indexOf("serviceTypeForm") > -1){
		parent = ".serviceTypeFormDiv"
		formClass = ".serviceTypeForm"
	} else if (classes.indexOf("passwordForm") > -1){
		parent = ".changePasswordFormDiv"
		formClass = ".passwordForm"
	} else if (classes.indexOf("noteForm") > -1){
		parent = "#noteEditForm"
		formClass = ".noteForm"
	}
//console.log(errText, id, parent, formClass)
jQuery('<div/>', {
	class: "errorBubbleContainer",
	 id: "errContainer-" + id
}).appendTo(parent);

	jQuery('<div/>', {
		class: "errorBubble",
     id: "err-" + id,
     text: errText,
		 click: function(){
// console.log("HIDE")
			 $('[id="err-' + id + '"]').remove()
			 $('[id="' + id + '"]').removeClass("errorField")
		 }
	}).appendTo('[id="errContainer-' + id + '"]');
	// TODO make this variable to form parent
	// TODO make field ID exact by using formClass
	let errElem = $('[id="errContainer-' + id + '"]')
// console.log(errElem)
// console.log(classes)
	errElem.position({
  	my: "center bottom-7", // push up 7 pixels
  	at: "center top",
  	// of: '[id="' + id + '"][class="'+ classes +'"]',
		of: '[id="' + id + '"]' + formClass,
		collision: "none"
	});
	$('[id="' + id + '"]' + formClass).addClass("errorField")
};
// *** UI L ***
function uiLoginFormToggleValidation(todo){
	if (!utilValidateArguments(arguments.callee.name, arguments, 1)) return
	console.log("REDO LOGIN TO SHOW VALIDATION FIELD")
	// TODO add validation Code to form
	if (todo == "code") {
		$('.loginDiv').hide()
		$('.codeDiv').show("slow")
	} else if (todo == "newPassword") {
		$('.loginDiv').hide()
		$('.codeDiv').hide()
		$('.newPasswordDiv').show("slow")
	} else {
		$('.codeDiv').hide()
		$('.newPasswordDiv').hide()
		$('.loginDiv').show("slow")
	}
};

// *** UI O ***
function uiOutlineTableRow(table, row){
	if (!utilValidateArguments(arguments.callee.name, arguments, 2)) return
	$('#' + table + ' tr:eq('+ row + ')').css('outline', 'var(--blue) 1px dashed').siblings().css('outline', 'none')
};

// *** UI R ***
function uiResetDependentsTable() {
	// TODO write reset code
};

function uiResetChangePasswordForm(){
	$(".passwordForm").val("")
};

function uiResetNotesTab(){
	hasImportantNote = ""
	$("#tabLable6").css("color", "#bbb")
	$("#noteTextArea").val("")
	$("#noteIsImportant").prop("checked", false)
};

function uiResetUserForm () {
	if ($("#userSaveAdmin").css("display") != "none"){
		let view = "new"
		if ($("#userPasswordDiv").css("display") == "none") {
			view = "existing"
			uiShowUserForm()
		} else {
			uiShowNewUserForm()
		}
		uiToggleUserNewEdit(view)
	} else {
		uiShowProfileForm()
	}
};

// *** UI S ***
function uiShowCurrentClientButtons(){
	$("#clientLeftSlider").show()
	$("#clientRightSlider").show()
	$("#newNoteButton").show()
	$("#dependentdLeftSlider").show()
	$("#dependentdRightSlider").show()
	$("#newNoteButton").show()
};

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
};

// *** UI T ***
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
};

function uiToggleButtonColor(action, serviceTypeId, serviceButtons){
	if (!utilValidateArguments(arguments.callee.name, arguments, 3)) return
	if (action == "gray") {
		//$("#btn-"+serviceTypeId).css({'color': 'var(--grey-green)', 'border-color': 'var(--grey-green)'})
		// TODO This should be cleaner.... for some reason the classes where not working (maybe make colors a secondar class and remove and add)
		$("#btn-"+serviceTypeId).addClass("buttonGrayOut")
		$("#btn-"+serviceTypeId).css("border-color", "var(--grey-green)")
		$("#btn-"+serviceTypeId).css("color", "var(--grey-green)")
		if (serviceButtons == "Primary") $("#image-"+serviceTypeId).addClass("imageGrayOut")
	} else {
		$("#btn-"+serviceTypeId).removeClass("buttonGrayOut")
		if (serviceButtons == "Primary") {
			if (serviceTypeId == "cjd3tc95v00003i8ex6gltfjl" || serviceTypeId == "cjcryvin100003i8dv6e72m6j") {
				$("#btn-"+serviceTypeId).css("border-color", "var(--red)")
				$("#btn-"+serviceTypeId).css("color", "var(--red)")
			} else {
				$("#btn-"+serviceTypeId).css("border-color", "var(--brown)")
				$("#btn-"+serviceTypeId).css("color", "var(--brown)")
			}
		} else {
			$("#btn-"+serviceTypeId).css("border-color", "var(--blue)")
			$("#btn-"+serviceTypeId).css("color", "var(--blue)")
		}
		if (serviceButtons == "Primary") $("#image-"+serviceTypeId).removeClass("imageGrayOut")
	}
};
// *** UI U ***
function uiUpdateCurrentClient(index) {
	if (!utilValidateArguments(arguments.callee.name, arguments, 1)) return
	uiOutlineTableRow('clientTable', index + 1)
	uiShowCurrentClientButtons()
	uiSetClientsHeader("numberAndName")
	uiShowServicesButtons()
	uiShowClientEdit(false)
	navGotoTab("tab2")
};

function uiUpdateAdminHeader() {
	$("#adminTitle").html($("#serviceName").val())
};



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
};

function uiSetMenusForUser(){
	// TODO remove TechAmin from dropdown for admins that are not Tech
	if (currentUser.isActive == "Active") {
		console.log(currentUser.userRole)
		if (currentUser.userRole == "Admin"){
			$("#nav3").show()
			$("#atabLable7").hide()
		} else if (currentUser.userRole == "TechAdmin"){
			$("#nav3").show()
			$("#atabLable7").show()
		} else if (currentUser.userRole == "Volunteer" || currentUser.userRole == "Staff") {
			$("#nav3").hide()
			$("#atabLable7").hide()
		}
	}
};

function uiShowFamilyCounts(totalAdults, totalChildren, totalOtherDependents, totalSeniors, totalSize){
	if (!utilValidateArguments(arguments.callee.name, arguments, 5)) return
	if (document.getElementById("family.totalAdults") != null){
		document.getElementById("family.totalAdults").value = totalAdults
		document.getElementById("family.totalChildren").value = totalChildren
		document.getElementById("family.totalOtherDependents").value = totalOtherDependents
		document.getElementById("family.totalSeniors").value = totalSeniors
		document.getElementById("family.totalSize").value = totalSize
	}
};

function uiShowHideError(todo, title, message){
	if (!utilValidateArguments(arguments.callee.name, arguments, 3)) return
//	alert("IN MESSAGE!!!")
	if (todo == 'show'){
//alert("IN SHOW MESSAGE!!!")

		$('#errorOverlay').show().css('display', 'flex')
		$('#errorTitle').html(title)
		$('#errorMessage').html(message)
	} else {
		$('#errorOverlay').hide()
		$('#errorTitle').html('')
		$('#errorMessage').html('')
	}
};

function uiShowHidePrint(todo){
	if (todo == 'show'){
		console.log($('#printOverlay'))
		$('#printOverlay').show().css('display', 'flex')
		console.log($('#printOverlay').children())
		console.log($("#printBodyDiv"))
	} else {
		$('#printOverlay').hide()
	}
};

function uiShowHideLogin(todo){
	if (!utilValidateArguments(arguments.callee.name, arguments, 1)) return
	if (todo === 'show'){
		$('#loginOverlay').show().css('display', 'flex')
		$('.codeDiv').hide()
		$('.newPasswordDiv').hide()
		$('#loginUserName').focus()
	} else {
		$('.loginDiv').show()
		$('#loginOverlay').hide()
		$('#loginUserName').val('')
		$('#loginPassword').val('')
		$('#loginCode').val('')
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
	uiBuildHistoryBottom()
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
};

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
};

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
};

function uiShowReports(){
	$('#reportsFormContainer').html(uiGetTemplate('#reportsForm'))
	$('#reportsDailyDate').val(moment().format(date))
	$('#reportsWeeklyStartDate').val(moment().startOf('week').format(date))
	$('#reportsWeeklyEndDate').val(moment().endOf('week').format(date))
	$('#reportsMonthyMonth').val(moment().format('YYYY-MM'))
	// TODO populate the date fields to reflect current period/last completed period
};

function uiRefreshDailyReport(){
	console.log("made it to report")
	uiShowDailyReportHeader(moment().format(date), '#printBodyDiv', "DAILY")
	uiShowDailyReportRows(moment().format(date), '#printBodyDiv')
};

function uiRefreshTodayReport(){
	uiShowDailyReportHeader(moment().format(date), '#todayBodyDiv', "TODAY")
	uiShowDailyReportRows(moment().format(date), '#todayBodyDiv')
};

function uiShowDailyReportHeader(dayDate, form, title){
	$(form).html(uiGetTemplate('#reportHeader'))
	if (form == "#todayBodyDiv") {
		$("#printBodyDiv").html("")
		$('#headerRight').html('REPORT <i id="todayReportRefreshButton" onClick="uiRefreshTodayReport()" class="fa fa-refresh" aria-hidden="true"></i>')
	} else {
		$("#todayBodyDiv").html("")
		$('#headerRight').html('REPORT <i id="todayReportRefreshButton" onClick="uiRefreshDailyReport()" class="fa fa-refresh" aria-hidden="true"></i>')
	}
	$('#reportDates').html(moment(dayDate).format(longDate))
	$('#headerLeft').html(title)
	$(form).append(uiGetTemplate('#dailyReportHeader'))
};

function uiShowDailyReportRows(dayDate, form){
	servicesRendered = dbGetDaysServices(dayDate)
	let servicesFood = servicesRendered
		.filter(function(item) {return item.serviceValid})
		.filter(function(item) {return item.serviceCategory == "Food_Pantry"})
	let servicesUSDA = servicesFood
		.filter(function(item) {
			return item.isUSDA == "USDA"
		})
	let servicesNonUSDA = servicesFood
		.filter(function(item) {
			return item.isUSDA == "NonUSDA"
		})
	$(form).append('<div id="USDAGrid" class="todayReportRowBox" style="grid-row: 5"><div class="todaySectionHeader">USDA</div></div>')
	$(form).append('<div id="NonUSDAGrid" class="todayReportRowBox" style="grid-row: 6"><div class="todaySectionHeader">NonUSDA</div></div>')
	let totals = []
	totals.push(uiBuildTodayRows(servicesUSDA, "#USDAGrid"))
	totals.push(uiBuildTodayRows(servicesNonUSDA, "#NonUSDAGrid"))
	grandTotals = {hh:0, ind:0, ch:0, ad:0, sen:0, hf:0, hi:0, nf:0, ni:0}
	grandTotals.hh =  totals[0].hh + totals[1].hh
	grandTotals.ind =  totals[0].ind + totals[1].ind
	grandTotals.ch =  totals[0].ch + totals[1].ch
	grandTotals.ad =  totals[0].ad + totals[1].ad
	grandTotals.sen =  totals[0].sen + totals[1].sen
	grandTotals.hf =  totals[0].hf + totals[1].hf
	grandTotals.hi =  totals[0].hi + totals[1].hi
	grandTotals.nf =  totals[0].nf + totals[1].nf
	grandTotals.ni =  totals[0].ni + totals[1].ni
	$(form).append('<div id="grandTotalGrid" class="todayReportRowBox" style="grid-row: 7"></div>')
	uiShowTodayTotals(grandTotals, "#grandTotalGrid")
};

function uiShowMonthlyReportHeader(monthYear){
	$("#printBodyDiv").html(uiGetTemplate('#reportHeader'))
	$("#todayBodyDiv").html("")
	$('#reportDates').html(moment(monthYear).format("MMMM YYYY"))
	$('#headerLeft').html("MONTHLY")
	$("#printBodyDiv").append(uiGetTemplate('#reportBodyHeader'))
	$('#headerRight').html('REPORT <i id="printReport" onClick="utilPrintReport()" class="fa fa-print" aria-hidden="true"></i>')
};

function utilPrintReport(){
	//let path = window.location.href + "css/reports.css"     // Returns full URL
	$("#printBodyDiv").printMe({ "path": ["css/print.css"] });
}


function uiShowMonthlyReportRows(monthYear){
console.log("IN MONTHLY REPORT FUNCTION")
	servicesRendered = dbGetMonthServices(monthYear)
	let servicesFood = servicesRendered
		.filter(function(item) {return item.serviceValid})
		.filter(function(item) {return item.serviceCategory == "Food_Pantry"})
	let dayUSDA = ""
	let servicesUSDA = servicesFood
		.filter(function(item) {return item.isUSDA == "USDA"})
		.sort(function(a, b){
			return parseInt(a.servicedDay) - parseInt(b.servicedDay)
		})
	let servicesNonUSDA = servicesFood
		.filter(function(item) {return item.isUSDA == "NonUSDA"})
		.sort(function(a, b){
			return parseInt(a.servicedDay) - parseInt(b.servicedDay)
		})
	servicesUSDA = utilCalculateMonthlyRows(servicesUSDA)
	servicesNonUSDA = utilCalculateMonthlyRows(servicesNonUSDA)
	//$("#printBodyDiv").append('<div id="NonUSDAGrid" class="todayReportRowBox" style="grid-row: 6"><div class="todaySectionHeader">NonUSDA</div></div>')
	uiBuildMonthRows(servicesUSDA, servicesNonUSDA, monthYear)
};

function utilCalculateMonthlyRows(services){
	console.log("INCALCROWS")
	let tempS = []
	$.each(services, function(i, item){

console.log(i)

		let index = -1; // default value, in case no element is found
		if (tempS.length > 0) {
		  tempS.some(function (serv, x){
		    if (serv.servicedDay == item.servicedDay) {
		      index = x
		      return true
		    }
		  })
		}
		if (index > -1)	 {
			tempS[index].totalHouseholdsServed = parseInt(tempS[index].totalHouseholdsServed) + 1
			tempS[index].totalIndividualsServed = parseInt(tempS[index].totalIndividualsServed) + parseInt(item.totalIndividualsServed)
			tempS[index].totalChildrenServed = parseInt(tempS[index].totalChildrenServed) + parseInt(item.totalChildrenServed)
			tempS[index].totalAdultsServed = parseInt(tempS[index].totalAdultsServed) + parseInt(item.totalAdultsServed)
			tempS[index].totalSeniorsServed = parseInt(tempS[index].totalSeniorsServed) + parseInt(item.totalSeniorsServed)
			if (item.homeless == "YES") {
				if (item.totalIndividualsServed == 1) {
					tempS[index].totalHomelessInd = parseInt(tempS[index].totalHomelessInd) + 1
				} else {
					tempS[index].totalHomelessFamily = parseInt(tempS[index].totalHomelessFamily) + 1
				}
			}
			if (item.clientStatus != "Client") {
				if (item.totalIndividualsServed == 1) {
					tempS[index].totalNonClientInd = parseInt(tempS[index].totalNonClientInd) + 1
				} else {
					tempS[index].totalNonClientFamily = parseInt(tempS[index].totalNonClientFamily) + 1
				}
			}
		} else {
			item.totalHouseholdsServed = 1
			if (item.homeless == "YES") {
				if (item.totalIndividualsServed == 1) {
					item.totalHomelessInd = 1
					item.totalHomelessFamily = 0
				} else {
					item.totalHomelessFamily = 1
					item.totalHomelessInd = 0
				}
			} else {
				item.totalHomelessFamily = 0
				item.totalHomelessInd = 0
			}
			if (item.clientStatus == "Client") {
				item.totalNonClientFamily = 0
				item.totalNonClientInd = 0
			} else {
				if (item.totalIndividualsServed == 1) {
					item.totalNonClientFamily = 0
					item.totalNonClientInd = 1
				} else {
					item.totalNonClientFamily = 1
					item.totalNonClientInd = 0
				}
			}
			tempS.push(item)
		}
	})
	console.log("DONECALCROWS")
	return tempS
};

function uiBuildTodayRows(services, grid) {
	let serviceTotal = {hh:0, ind:0, ch:0, ad:0, sen:0, hf:0, hi:0, nf:0, ni:0}
	$.each(services, function(i,item){
		console.log(item.clientServedId)
		serviceTotal.hh++
		serviceTotal.ind = serviceTotal.ind + parseInt(item.totalIndividualsServed)
		serviceTotal.ch = serviceTotal.ch + parseInt(item.totalChildrenServed)
		serviceTotal.ad = serviceTotal.ad + parseInt(item.totalAdultsServed)
		serviceTotal.sen = serviceTotal.sen + parseInt(item.totalSeniorsServed)
		$(grid).append('<div class="todayItem">'+item.clientServedId+'</div>')
		$(grid).append('<div class="todayItem">'+item.clientGivenName+'</div>')
		$(grid).append('<div class="todayItem">'+item.clientFamilyName+'</div>')
		$(grid).append('<div class="todayItem">'+item.clientZipcode+'</div>')
		$(grid).append('<div class="todayItem">1</div>')
		$(grid).append('<div class="todayItem">'+item.totalIndividualsServed+'</div>')
		$(grid).append('<div class="todayItem">'+item.totalChildrenServed+'</div>')
		$(grid).append('<div class="todayItem">'+item.totalAdultsServed+'</div>')
		$(grid).append('<div class="todayItem">'+item.totalSeniorsServed+'</div>')
		if (item.homeless == "YES") {
			if (item.totalIndividualsServed == 1) {
				serviceTotal.hi = serviceTotal.hi + 1
				$(grid).append('<div class="todayItem">-</div>')
				$(grid).append('<div class="todayItem">1</div>')
			} else {
				serviceTotal.hf = serviceTotal.hf + 1
				$(grid).append('<div class="todayItem">1</div>')
				$(grid).append('<div class="todayItem">-</div>')
			}
		} else {
			$(grid).append('<div class="todayItem">-</div>')
			$(grid).append('<div class="todayItem">-</div>')
		}
		if (item.clientStatus == "Client") {
			$(grid).append('<div class="todayItem">-</div>')
			$(grid).append('<div class="todayItem">-</div>')
		} else {
			if (item.totalIndividualsServed == 1) {
				serviceTotal.ni = serviceTotal.ni + 1
				$(grid).append('<div class="todayItem">-</div>')
				$(grid).append('<div class="todayItem">1</div>')
			} else {
				serviceTotal.nf = serviceTotal.nf + 1
				$(grid).append('<div class="todayItem">1</div>')
				$(grid).append('<div class="todayItem">-</div>')
			}
		}
	})
	uiShowTodayTotals(serviceTotal, grid)
	return serviceTotal
};

function uiBuildMonthRows(u, n, monthYear) {
console.log("INBUILDROWS")
	let numDays = moment(monthYear, "YYYY-MM").endOf("month").format("DD")
	numDays = parseInt(numDays) + 1
console.log(numDays)
	let uTotal = {hh:0, ind:0, ch:0, ad:0, sen:0, hf:0, hi:0, nf:0, ni:0}
	let nTotal = {hh:0, ind:0, ch:0, ad:0, sen:0, hf:0, hi:0, nf:0, ni:0}
	let gTotal = {hh:0, ind:0, ch:0, ad:0, sen:0, hf:0, hi:0, nf:0, ni:0}
	let yearMonth = u[0].servicedMonth
	let gridRow = 0
	for (let d = 1; d < numDays; d++) {
		let servicedDay = String(d)
		console.log(servicedDay)
		console.log(servicedDay.length)
		if (servicedDay.length < 2){
			console.log("padding day number")
			servicedDay = "0"+servicedDay
		}
		servicedDay = yearMonth + servicedDay
console.log(servicedDay)

		let hasUSDA = false, hasNonUSDA = false
		let servicedDate = moment(servicedDay, "YYYYMMDD").format("MM/DD/YYYY")
		let uDay = u.filter(function(item) {return item.servicedDay == servicedDay})
		let nDay = n.filter(function(item) {return item.servicedDay == servicedDay})
		let grid = "#monthlyGrid" + d
		if ((uDay.length == 1)||(nDay.length == 1)){
			gridRow = 4 + d
			$("#printBodyDiv").append('<div id="monthlyGrid'+ d +'" class="reportRowBox" style="grid-row: '+ gridRow +'"></div>')
			let dTotal = {hh:0, ind:0, ch:0, ad:0, sen:0, hf:0, hi:0, nf:0, ni:0}
			// show day USDA
			if (uDay.length == 1) {
				uTotal.hh = uTotal.hh + parseInt(uDay[0].totalHouseholdsServed)
				uTotal.ind = uTotal.ind + parseInt(uDay[0].totalIndividualsServed)
				uTotal.ch = uTotal.ch + parseInt(uDay[0].totalChildrenServed)
				uTotal.ad = uTotal.ad + parseInt(uDay[0].totalAdultsServed)
				uTotal.sen = uTotal.sen + parseInt(uDay[0].totalSeniorsServed)
				uTotal.hf = uTotal.hf + parseInt(uDay[0].totalHomelessFamily)
				uTotal.hi = uTotal.hi + parseInt(uDay[0].totalHomelessInd)
				uTotal.nf = uTotal.nf + parseInt(uDay[0].totalNonClientFamily)
				uTotal.ni = uTotal.ni + parseInt(uDay[0].totalNonClientInd)
				// Day total
				dTotal.hh = parseInt(uDay[0].totalHouseholdsServed)
				dTotal.ind = parseInt(uDay[0].totalIndividualsServed)
				dTotal.ch = parseInt(uDay[0].totalChildrenServed)
				dTotal.ad = parseInt(uDay[0].totalAdultsServed)
				dTotal.sen = parseInt(uDay[0].totalSeniorsServed)
				dTotal.hf = parseInt(uDay[0].totalHomelessFamily)
				dTotal.hi = parseInt(uDay[0].totalHomelessInd)
				dTotal.nf = parseInt(uDay[0].totalNonClientFamily)
				dTotal.ni = parseInt(uDay[0].totalNonClientInd)
			}
			$(grid).append('<div class="monthItem">USDA</div>')
			$(grid).append('<div class="monthItem">'+ dTotal.hh +'</div>')
			$(grid).append('<div class="monthItem">'+ dTotal.ind +'</div>')
			$(grid).append('<div class="monthItem">'+ dTotal.ch +'</div>')
			$(grid).append('<div class="monthItem">'+ dTotal.ad +'</div>')
			$(grid).append('<div class="monthItem">'+ dTotal.sen +'</div>')
			$(grid).append('<div class="monthItem">'+ dTotal.hf +'</div>')
			$(grid).append('<div class="monthItem">'+ dTotal.hi +'</div>')
			$(grid).append('<div class="monthItem">'+ dTotal.nf +'</div>')
			$(grid).append('<div class="monthItem">'+ dTotal.ni +'</div>')
			if (nDay.length == 1) {
				// calculate day NonUSDA totals
				nTotal.hh = nTotal.hh + parseInt(nDay[0].totalHouseholdsServed)
				nTotal.ind = nTotal.ind + parseInt(nDay[0].totalIndividualsServed)
				nTotal.ch = nTotal.ch + parseInt(nDay[0].totalChildrenServed)
				nTotal.ad = nTotal.ad + parseInt(nDay[0].totalAdultsServed)
				nTotal.sen = nTotal.sen + parseInt(nDay[0].totalSeniorsServed)
				nTotal.hf = nTotal.hf + parseInt(nDay[0].totalHomelessFamily)
				nTotal.hi = nTotal.hi + parseInt(nDay[0].totalHomelessInd)
				nTotal.nf = nTotal.nf + parseInt(nDay[0].totalNonClientFamily)
				nTotal.ni = nTotal.ni + parseInt(nDay[0].totalNonClientInd)
				// calculate Day total
				dTotal.hh = dTotal.hh + parseInt(nDay[0].totalHouseholdsServed)
				dTotal.ind = dTotal.ind + parseInt(nDay[0].totalIndividualsServed)
				dTotal.ch = dTotal.ch + parseInt(nDay[0].totalChildrenServed)
				dTotal.ad = dTotal.ad + parseInt(nDay[0].totalAdultsServed)
				dTotal.sen = dTotal.sen + parseInt(nDay[0].totalSeniorsServed)
				dTotal.hf = dTotal.hf + parseInt(nDay[0].totalHomelessFamily)
				dTotal.hi = dTotal.hi + parseInt(nDay[0].totalHomelessInd)
				dTotal.nf = dTotal.nf + parseInt(nDay[0].totalNonClientFamily)
				dTotal.ni = dTotal.ni + parseInt(nDay[0].totalNonClientInd)
				$(grid).append('<div class="monthItem">NonUSDA</div>')
				$(grid).append('<div class="monthItem">'+nDay[0].totalHouseholdsServed+'</div>')
				$(grid).append('<div class="monthItem">'+nDay[0].totalIndividualsServed+'</div>')
				$(grid).append('<div class="monthItem">'+nDay[0].totalChildrenServed+'</div>')
				$(grid).append('<div class="monthItem">'+nDay[0].totalAdultsServed+'</div>')
				$(grid).append('<div class="monthItem">'+nDay[0].totalSeniorsServed+'</div>')
				$(grid).append('<div class="monthItem">'+nDay[0].totalHomelessFamily+'</div>')
				$(grid).append('<div class="monthItem">'+nDay[0].totalHomelessInd+'</div>')
				$(grid).append('<div class="monthItem">'+nDay[0].totalNonClientFamily+'</div>')
				$(grid).append('<div class="monthItem">'+nDay[0].totalNonClientInd+'</div>')
			} else {
				$(grid).append('<div class="monthItem">NonUSDA</div>')
				$(grid).append('<div class="monthItem">0</div>')
				$(grid).append('<div class="monthItem">0</div>')
				$(grid).append('<div class="monthItem">0</div>')
				$(grid).append('<div class="monthItem">0</div>')
				$(grid).append('<div class="monthItem">0</div>')
				$(grid).append('<div class="monthItem">0</div>')
				$(grid).append('<div class="monthItem">0</div>')
				$(grid).append('<div class="monthItem">0</div>')
				$(grid).append('<div class="monthItem">0</div>')
			}
			// show day totals
			$(grid).append('<div class="monthTotal">'+servicedDate+'</div>')
			$(grid).append('<div class="monthTotal">'+ dTotal.hh +'</div>')
			$(grid).append('<div class="monthTotal">'+ dTotal.ind +'</div>')
			$(grid).append('<div class="monthTotal">'+ dTotal.ch +'</div>')
			$(grid).append('<div class="monthTotal">'+ dTotal.ad +'</div>')
			$(grid).append('<div class="monthTotal">'+ dTotal.sen +'</div>')
			$(grid).append('<div class="monthTotal">'+ dTotal.hf +'</div>')
			$(grid).append('<div class="monthTotal">'+ dTotal.hi +'</div>')
			$(grid).append('<div class="monthTotal">'+ dTotal.nf +'</div>')
			$(grid).append('<div class="monthTotal">'+ dTotal.ni +'</div>')
			gTotal.hh = gTotal.hh + dTotal.hh
			gTotal.ind = gTotal.ind + dTotal.ind
			gTotal.ch = gTotal.ch + dTotal.ch
			gTotal.ad = gTotal.ad + dTotal.ad
			gTotal.sen = gTotal.sen + dTotal.sen
			gTotal.hf = gTotal.hf + dTotal.hf
			gTotal.hi = gTotal.hi + dTotal.hi
			gTotal.nf = gTotal.nf + dTotal.nf
			gTotal.ni = gTotal.ni + dTotal.ni
		}
	}
	gridRow = gridRow + 1
	$("#printBodyDiv").append('<div id="monthlyGridTotal" class="reportRowBox" style="grid-row: '+ gridRow +'"></div>')
	grid = "#monthlyGridTotal"
	$(grid).append('<div class="monthTotal">USDA</div>')
	$(grid).append('<div class="monthTotal">'+ uTotal.hh +'</div>')
	$(grid).append('<div class="monthTotal">'+ uTotal.ind +'</div>')
	$(grid).append('<div class="monthTotal">'+ uTotal.ch +'</div>')
	$(grid).append('<div class="monthTotal">'+ uTotal.ad +'</div>')
	$(grid).append('<div class="monthTotal">'+ uTotal.sen +'</div>')
	$(grid).append('<div class="monthTotal">'+ uTotal.hf +'</div>')
	$(grid).append('<div class="monthTotal">'+ uTotal.hi +'</div>')
	$(grid).append('<div class="monthTotal">'+ uTotal.nf +'</div>')
	$(grid).append('<div class="monthTotal">'+ uTotal.ni +'</div>')
	$(grid).append('<div class="monthTotal">NonUSDA</div>')
	$(grid).append('<div class="monthTotal">'+ nTotal.hh +'</div>')
	$(grid).append('<div class="monthTotal">'+ nTotal.ind +'</div>')
	$(grid).append('<div class="monthTotal">'+ nTotal.ch +'</div>')
	$(grid).append('<div class="monthTotal">'+ nTotal.ad +'</div>')
	$(grid).append('<div class="monthTotal">'+ nTotal.sen +'</div>')
	$(grid).append('<div class="monthTotal">'+ nTotal.hf +'</div>')
	$(grid).append('<div class="monthTotal">'+ nTotal.hi +'</div>')
	$(grid).append('<div class="monthTotal">'+ nTotal.nf +'</div>')
	$(grid).append('<div class="monthTotal">'+ nTotal.ni +'</div>')
	$(grid).append('<div class="monthTotal">TOTAL</div>')
	$(grid).append('<div class="monthTotal">'+ gTotal.hh +'</div>')
	$(grid).append('<div class="monthTotal">'+ gTotal.ind +'</div>')
	$(grid).append('<div class="monthTotal">'+ gTotal.ch +'</div>')
	$(grid).append('<div class="monthTotal">'+ gTotal.ad +'</div>')
	$(grid).append('<div class="monthTotal">'+ gTotal.sen +'</div>')
	$(grid).append('<div class="monthTotal">'+ gTotal.hf +'</div>')
	$(grid).append('<div class="monthTotal">'+ gTotal.hi +'</div>')
	$(grid).append('<div class="monthTotal">'+ gTotal.nf +'</div>')
	$(grid).append('<div class="monthTotal">'+ gTotal.ni +'</div>')
	// if (item.homeless == "YES") {
	// 	if (item.totalIndividualsServed == 1) {
	// 		serviceTotal.hi = serviceTotal.hi + 1
	// 		$(grid).append('<div class="todayItem">-</div>')
	// 		$(grid).append('<div class="todayItem">1</div>')
	// 	} else {
	// 		serviceTotal.hf = serviceTotal.hf + 1
	// 		$(grid).append('<div class="todayItem">1</div>')
	// 		$(grid).append('<div class="todayItem">-</div>')
	// 	}
	// } else {
	// 	$(grid).append('<div class="todayItem">-</div>')
	// 	$(grid).append('<div class="todayItem">-</div>')
	// }
	// if (item.clientStatus == "Client") {
	// 	$(grid).append('<div class="todayItem">-</div>')
	// 	$(grid).append('<div class="todayItem">-</div>')
	// } else {
	// 	if (item.totalIndividualsServed == 1) {
	// 		serviceTotal.ni = serviceTotal.ni + 1
	// 		$(grid).append('<div class="todayItem">-</div>')
	// 		$(grid).append('<div class="todayItem">1</div>')
	// 	} else {
	// 		serviceTotal.nf = serviceTotal.nf + 1
	// 		$(grid).append('<div class="todayItem">1</div>')
	// 		$(grid).append('<div class="todayItem">-</div>')
	// 	}
	// }
//	uiShowTodayTotals(serviceTotal, grid)
//	return serviceTotal
};

function uiShowTodayTotals(serviceTotal, grid){
	let lable = "USDA TOTALS"
	if (grid == "#NonUSDAGrid") lable = "NonUSDA TOTALS"
	if (grid == "#grandTotalGrid") lable = "TODAY'S GRAND TOTALS"
	$(grid).append('<div class="todayTotalLable">'+lable+'</div>')
	$(grid).append('<div class="todayTotalItem">'+ serviceTotal.hh +'</div>')
	$(grid).append('<div class="todayTotalItem">'+ serviceTotal.ind +'</div>')
	$(grid).append('<div class="todayTotalItem">'+ serviceTotal.ch +'</div>')
	$(grid).append('<div class="todayTotalItem">'+ serviceTotal.ad +'</div>')
	$(grid).append('<div class="todayTotalItem">'+ serviceTotal.sen +'</div>')
	$(grid).append('<div class="todayTotalItem">'+ serviceTotal.hf +'</div>')
	$(grid).append('<div class="todayTotalItem">'+ serviceTotal.hi +'</div>')
	$(grid).append('<div class="todayTotalItem">'+ serviceTotal.nf +'</div>')
	$(grid).append('<div class="todayTotalItem">'+ serviceTotal.ni +'</div>')
};

let uiShowServicesDateTime = function() {
	if (client.clientId != undefined){
		$('#serviceDateTime').html(moment().format(longDate))
		// TODO separate out from this function
		$('#receiptHeader').html(moment().format(longDate)+"<br>(<b>"+client.clientId + "</b>) " + client.givenName+" "+client.familyName)
	}
};

function uiShowUserEdit(){
	$('#profileFormContainer').html("") // remove user form in user profile
	$('#userFormContainer').html(uiGetTemplate('#userForm'))
	$('.profileOnly').hide()
};

function uiShowProfileForm(){
	$('#userFormContainer').html("") // remove user form in Admin
	$('#profileFormContainer').html(uiGetTemplate('#userForm'))
	$('.adminOnly').hide()
	uiPopulateForm(currentUser, 'userForm')
};

function uiShowChangePasswordForm(){
	$('#userPasswordFormContainer').html(uiGetTemplate('#changePasswordForm'))
};

function uiShowClientEdit(isEdit){
	if (!utilValidateArguments(arguments.callee.name, arguments, 1)) return
	uiDisplayNotes("Client Notes")
	$('#clientFormContainer').html(uiGetTemplate('#clientForm'))
	$('#clientSaveButton.newOnly').remove()
	uiPopulateForm(client, 'clientForm')
	if (isEdit){
		uiToggleClientViewEdit('edit')
	} else {
		uiToggleClientViewEdit('view')
	}
	uiShowDependents(isEdit)
	uiShowExistingNotes()
	// dbLoadNotes(client.clientId)
};

function uiShowDependents(isEdit){
	if (!utilValidateArguments(arguments.callee.name, arguments, 1)) return
	if (client.dependents!=null){
		uiGenSelectHTMLTable('#dependentsFormContainer',client.dependents,["givenName","familyName",'relationship','gender',"dob","age","isActive"],'dependentsTable')
	}
	// if (isEdit){
	// 	let plusButton = '<a href="#" onclick="uiAddTableRow()" style="font-size:18px;width:150px;margin-bottom:8px;margin-top:10px;display: inline-block;" class="btn btn-block btn-primary btn-success">+</a>'
	// 	$('#dependents').append('<div class="formEntry">'+plusButton+'</div>')
	// }
};

function uiShowNewServiceTypeForm(){
	$('#serviceTypeFormContainer').html(uiGetTemplate('#serviceTypeForm'))
	$('#serviceTypeId').val(cuid())
	navGotoTab("aTab2")
};

function uiShowNewUserForm(){
	$('#userFormContainer').html(uiGetTemplate('#userForm'))
	uiToggleUserNewEdit("new")
	$('.profileOnly').hide()
	navGotoTab("aTab5")
};

function uiShowUserForm(){
	$('#userFormContainer').html(uiGetTemplate('#userForm'))
	uiPopulateForm(adminUser, 'userForm')
};

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
	client = {}
	servicesRendered = []
	uiClearCurrentClient()
	$("#clientsTitle").html("New Client")
	$('#clientFormContainer').html(uiGetTemplate('#clientForm'))
	$('#clientSaveButton.existingOnly').remove()
	$('#clientLeftSlider').show()
	$('#clientRightSlider').show()
	uiToggleClientViewEdit("edit")
	$('#createdDateTime.clientForm').val(utilNow())
	$('#updatedDateTime.clientForm').val(utilNow())
	$('#firstSeenDate.clientForm').val(utilToday())
	$('#familyIdCheckedDate.clientForm').val(utilToday())
	$('#homeless.clientForm').val('NO')
	$('#city.clientForm').val('San Jose')
	$('#state.clientForm').val('CA')
	$("[id='financials.income']").val(0)
	$("[id='financials.govtAssistance']").val(0)
	$("[id='financials.foodStamps']").val(0)
	$("[id='financials.rent']").val(0)
	$("[id='family.totalAdults']").val(0)
	$("[id='family.totalChildren']").val(0)
	$("[id='family.totalOtherDependents']").val(0)
	$("[id='family.totalSeniors']").val(0)
	$("[id='family.totalSize']").val(0)
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
console.log(lastServed)
	let activeServiceTypes = utilCalcActiveServiceTypes() // checks active date ranges of each serviceTypes
	let targetServices = utilCalcTargetServices(activeServiceTypes); // changes setting to specific variables matching client
console.log(targetServices)
	let btnPrimary = utilCalcActiveServicesButtons("primary", activeServiceTypes, targetServices, lastServed);
console.log(btnPrimary)
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
//console.log("IN POPULATE")
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

					//console.log("ASSIGN : " + value2)
				}
			});
		} else {
			let el = '[id="'+key+'"].'+form
			if($(el).is("select")) {
				el = el + ' option[value="'+ value +'"]'
				$(el).prop('selected', true);
			} else {
				// console.log("UPDATE TEXT FEILD " + key +":"+value)
				// console.log($(el).attr("value"))
				//$(el).attr("value", value)
				$(el).val(value)
				// console.log($(el).attr("value"))
				// console.log($(el).val())

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
	} else if (form === 'userForm'){
		// TODO HIDE ADMIN Fields
	}
	return
};

function uiRemoveFormErrorBubbles(form) {
	$('[id^="err-"]').remove()
	$('.' + form).removeClass("errorField")
};

function uiSetClientsHeader(title){
	if (!utilValidateArguments(arguments.callee.name, arguments, 1)) return
//console.log(title)
	if (title == "numberAndName") {
		let clientNumber = "<div class='clientNumber'>" + client.clientId + "</div>"
		let clientName = "<div class='clientName'>" + client.givenName + ' ' + client.familyName + "</div>"
		$("#clientsTitle").html(clientNumber + clientName)
	} else if (title == "newClient") {
		let clientNumber = "<div class='clientNumber'>" + $('#clientId.clientForm').val() + "</div>"
		let clientName = "<div class='clientName'>" + $('#givenName.clientForm').val() + ' ' + $('#familyName.clientForm').val() + "</div>"
		$("#clientsTitle").html(clientNumber + clientName)
	} else {
		$("#clientsTitle").html(title)
	}
};

function uiSetServiceTypeHeader(){
	$("#adminTitle").html($('#serviceName').val())
};

function uiSetAdminHeader(title){
	if (!utilValidateArguments(arguments.callee.name, arguments, 1)) return
	$("#adminTitle").html(title)
};

function uiShowServiceTypes(){
	uiGenSelectHTMLTable('#serviceTypesContainer',serviceTypes,["serviceName","serviceDescription","isActive"],'serviceTypesTable')
}

function uiShowUsers(){
	uiGenSelectHTMLTable('#userListContainer', users, ["userName","givenName","familyName", "userRole", "isValid"],'usersTable')
}

function uiShowSettings(){
	$('#settingsFormContainer').html(uiGetTemplate('#settingsForm'))
	// TODO build Table, API, object for settings
	// uiPopulateForm(globalSettings, 'settingsForm')
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

function uiGenSelectHTMLTable(selector, data, col, tableID){
//console.log("IN TABLE GEN " + tableID)
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
		} else if (tableID == 'usersTable'){
			tr.setAttribute("onclick", 'utilSetCurrentAdminUser(' + i + ')')
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
					tabCell.innerHTML =uiGenSelectHTML(data[i][col[j]],['Child','Spouse','Other'],"relationship",depNum)
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
//console.log("IN LAST SERVED DISPLAY")
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

function uiToggleUserNewEdit(type){
	if (!utilValidateArguments(arguments.callee.name, arguments, 1)) return

console.log("IN TOGGLE FIELDS")
console.log(type)

	$(".profileOnly").hide()
	if (type == 'new') $('.newUserOnly').show()
	if (type == 'existing') $('.newUserOnly').hide()
};

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

	if ($("#serviceCategory").val() == "Food_Pantry"){
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



// **********************************************************************************************************
// ************************************************ DB FUNCTIONS ********************************************
// **********************************************************************************************************
function dbDeleteData(uUrl){
	if (!utilValidateArguments(arguments.callee.name, arguments, 1)) return

console.log(uUrl)

let ans = null

	$.ajax({
    type: "DELETE",
    url: uUrl,
		headers: {"Authorization": authorization.idToken},
    async: false,
    // dataType: "json",
		// contentType:'application/json',
    success: function(json){
console.log("SUCCESSFUL DELETE")
			if (json!==undefined) {
				// console.log(json.count)
				// console.log(urlNew)
			}
    	ans = json
		},
		statusCode: {
			401: function() {

console.log("Error: 401")

				cogLogoutUser()
				$('#nav5').html('Login')
				$('#nav4').html('')
				$(loginError).html("Sorry, your session has expired.")
				console.log("Unauthorized")
			},
			0: function() {
console.log("Error: 0")
				console.log("Status code: 0")
				cogLogoutUser()
				$('#nav5').html('Login')
				$('#nav4').html('')
				$(loginError).html("Sorry, your session has expired.")
				console.log("Unauthorized")
			}
		},
		error: function(jqXHR, status, error){


		}
	}).done(function(data, textStatus, jqXHR) {

console.log("DELETE DONE")
		//console.log(data)
  }).fail(function (jqXHR, textStatus, errorThrown) {
    console.log("status", jqXHR.status)
		if (jqXHR.status == 0) {

		}
		console.log("errorThrown", errorThrown)
		// if (errorThrown.includes("DOMException: Failed to execute 'send' on 'XMLHttpRequest':")){
		// 	console.log("ACCESS ERROR") // force logon
		// }
	}).always(function (data, textStatus, jqXHR) {
    // TODO most likely remove .always
	})
	//console.log(ans)
	return ans

};

function dbGetData(uUrl){
	//console.log("IN GET")
	if (!utilValidateArguments(arguments.callee.name, arguments, 1)) return
	cogCheckSession()
	let urlNew = uUrl;
	let ans = null;
// console.log('idToken + ' + authorization.idToken)
//console.log(urlNew)
// TODO /// move Ajax calls to [.done .fail . always syntax]
	$.ajax({
    type: "GET",
    url: urlNew,
		headers: {"Authorization": authorization.idToken},
    async: false,
    dataType: "json",
		contentType:'application/json',
    success: function(json){
//console.log("SUCCESS")
			if (json!==undefined) {
				// console.log(json.count)
				// console.log(urlNew)
			}
    	ans = json
		},
		statusCode: {
			401: function() {

console.log("Error: 401")

				cogLogoutUser()
				$('#nav5').html('Login')
				$('#nav4').html('')
				$(loginError).html("Sorry, your session has expired.")
				console.log("Unauthorized")
			},
			0: function() {
console.log("Error: 0")
				console.log("Status code: 0")
				cogLogoutUser()
				$('#nav5').html('Login')
				$('#nav4').html('')
				$(loginError).html("Sorry, your session has expired.")
				console.log("Unauthorized")
			}
		},
		error: function(jqXHR, status, error){
			// utilErrorHandler(message, status, error, "aws")
			// console.log(jqXHR)
			console.log(jqXHR.status)
			// console.log(jqXHR + ", " + status + ", " + error)
			// // alert(error);
			// // TODO try to capture the error 401 - ????
			// // TODO add same error handling to dbPostData
			//
			// console.log(typeof error)
			//
			// // if (error.indexOf("NetworkError: Failed to execute 'send' on 'XMLHttpRequest'") > -1) {
			// 	cogLogoutUser()
			// 	$('#nav5').html('Login')
			// 	$('#nav4').html('')
			// 	$(loginError).html("Sorry, your session has expired.")
			// //}

			// if (message.readyState == 0) {
			// 	console.log("Error of some kind!")
			// }
		}
	}).done(function(data, textStatus, jqXHR) {
    //console.log("DONE")
		//console.log(data)
  }).fail(function (jqXHR, textStatus, errorThrown) {
    console.log("status", jqXHR.status)
		if (jqXHR.status == 0) {

		}
		console.log("errorThrown", errorThrown)
		// if (errorThrown.includes("DOMException: Failed to execute 'send' on 'XMLHttpRequest':")){
		// 	console.log("ACCESS ERROR") // force logon
		// }
	}).always(function (data, textStatus, jqXHR) {
    // TODO most likely remove .always
	})
	//console.log(ans)
	return ans
};

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
	// setTimeout(function(){
	// 	uiShowHideError("hide", "", "")
	// }, 2000);

	request = {}
	newId = newId.toString()
	request['lastId']=newId
	dbPostData(aws+"/clients/lastid",JSON.stringify(request))
	return newId
}

function dbGetServicesTypes(){
	return dbGetData(aws+"/servicetypes").serviceTypes
};

function dbGetDaysServices(dayDate){
	dayDate = moment(dayDate).format("YYYYMMDD")
	return dbGetData(aws+"/clients/services/byday/"+dayDate).services
};

function dbGetMonthServices(dayMonth){
	dayMonth = moment(dayMonth).format("YYYYMM")
	return dbGetData(aws+"/clients/services/bymonth/"+dayMonth).services
};

function dbGetUsers(){
	return dbGetData(aws+"/users").users
};

function dbLoadServiceHistory(){
	let clientHistory = dbGetData(aws+"/clients/services/"+client.clientId).services
	uiShowHistoryData(clientHistory)
}

function dbPostData(uUrl,dataU){
	if (!utilValidateArguments(arguments.callee.name, arguments, 2)) return
//console.log("IN POST DATA")
	cogCheckSession()
	if (authorization.idToken == 'undefined') {
		utilBeep()
		consol.log("need to log in")
		return
	}
//console.log("PAST SessionCheck")
//console.log(JSON.stringify(dataU))
	let urlNew = uUrl;
//console.log(urlNew)
	let uData = dataU;
	let ans = null;
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
					// ***** TODO need proper error messaging
				} else {
					if (uUrl.includes('/servicetypes')) {
						serviceTypes = dbGetServicesTypes()
						uiShowServiceTypes()
						uiSetServiceTypeHeader()
						uiPopulateForm(serviceTypes, 'serviceTypes')
						uiSaveButton('serviceType', 'SAVED!!')
					} else if (uUrl.includes('/clients')) {
						// TODO REMOVE BELOW FOR UPLOAD ONLY
						// TODO DO WE NEED THE LINE BELOW
						// let clientTableRow = utilUpdateClientsData()
						if (clientData != null) {
							uiGenSelectHTMLTable('#searchContainer', clientData, ['clientId', 'givenName', 'familyName', 'dob', 'street'],'clientTable')
							if (clientData.length == 1) clientTableRow = 1
							uiOutlineTableRow('clientTable', clientTableRow)
							uiSetClientsHeader("numberAndName")
						}
						uiSaveButton('client', 'SAVED!!')
					}
				}
		},
		error: function(json){
				console.log("ERROR")
	    	console.log(json)
				ans = json
				if (uUrl.includes('/servicetypes')) {
					uiSaveButton('serviceType', 'ERROR!!')
				} else if (uUrl.includes('/clients')) {
					uiSaveButton('client', 'ERROR!!')
				} else if (uUrl.includes('/users')) {
					console.log("show error in button")
				}
		}
	});
	return ans
}

function uiResetClientForm(){

// console.log("CLEAR CLIENT FORM")
console.log(client)

	if (client == {}) {
		// TODO get this to blank out a new client form
		uiShowNewClientForm()
	} else {
		// let index = clientData.filter(function( obj ) {
		// 	return obj.clientId == client.clientId
		// })
		uiPopulateForm(client, 'clientForm')
		console.log("BEFORE TOGGLE VIEW")
		uiRemoveFormErrorBubbles('clientForm')
		uiToggleClientViewEdit('view')
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
	}
	if (notPushed) newLastServed.push(newRecord)
	client.lastServed = newLastServed
	let data = utilPadEmptyFields(client)
	data = JSON.stringify(data)
//console.log(data)
	let URL = aws+"/clients/"
	result = dbPostData(URL,data)
	if (result == null) {
		utilBloop() // TODO move bloop to successful POST ()
		console.log(result)
	} else {
		console.log("Failed to Save")
	}
}

function dbSaveService(serviceTypeId, serviceId, serviceValid){
	if (!utilValidateArguments(arguments.callee.name, arguments, 3)) return
	let serviceType = {}
	serviceType = utilGetServiceTypeByID(serviceTypeId)
	let numItems = serviceType.numberItems
	if (serviceType.itemsPer == "Person") {
		itemsServed = numItems * client.family.totalSize
	} else {
		itemsServed = numItems
	}
	if (serviceType.serviceButtons == "Primary"){
		dbSaveLastServed(serviceTypeId, serviceType.serviceCategory, itemsServed, serviceType.isUSDA)
	}
	dbPostService(serviceType, itemsServed, serviceId, serviceValid)
	utilAddServiceToReceipt()
};

function dbSaveUser(context){
	// TODO Add uiResetUserForm functionality
	// update dates if they are empty before validation
	// TODO move below to function
	let fields = ["updatedDateTime", "createdDateTime"]
	for (var i = 0; i < fields.length; i++) {
		if ($("#" + fields[i] + ".userForm").val() == "") {
			$("#" + fields[i] + ".userForm").val(utilNow())
		}
	}

console.log("IN SAVE USER")

console.log("BEFORE FORM VALIDATION")
	let hasErrors = utilValidateForm("userForm", context)

console.log(hasErrors)

	if (hasErrors) return


	// store user in Users Table
	let userData = utilFormToJSON(".userForm")
	userData.notes = []
	let URL = aws+"/users/"
	result = dbPostData(URL, JSON.stringify(userData))
	if (result == null) {
		utilBloop() // TODO move bloop to successful POST ()
		// TODO add sounds settings in Admin Settings (ON / OFF)
		users = dbGetUsers()
		utilSetCurrentUser()
		uiShowUsers()
		userData.telephone = utilCognitoPhoneFormat(userData.telephone)
		// check to see if new user or existing
		if (userData.password == "") {
			// existing user
			cogUpdateAttributes(userData.email, userData.telephone) // update phone and email
			// TODO Find user in Users and update adminUser
		} else {
			// new user - signup for Cognito User Account
			cogUserSignUp(userData.userName, userData.password, userData.email, userData.telephone)
			// TODO message "USER MUST VALIDATE EMAIL"
		}
	} else {
		utilBeep()
		console.log("Failed to Save User")
	}
};

function dbPostService(serviceType, itemsServed, serviceId, serviceValid){
	if (!utilValidateArguments(arguments.callee.name, arguments, 4)) return
	// TODO add senior cutoff age to the Settings
	// TODO add Service area Zipcodes to the Settings
	// TODO add validation isActive(Client/NonClient) vs (Service Area Zipcodes)

	let emergencyFood = "NO",
			servicedMonth = moment().format("YYYYMM"),
	 		servicedDay = moment().format("YYYYMMDD")
	if (serviceId == "") serviceId = cuid()
	if (serviceType.isUSDA == "Emergency") emergencyFood = "YES"
	let serviceRecord = {
							serviceId: serviceId,
					 serviceValid: serviceValid,
			 servicedDateTime: moment().format(dateTime),
			 		servicedMonth: servicedMonth,
					  servicedDay: servicedDay,
			 	 clientServedId: client.clientId,
				   clientStatus: client.isActive,
				clientGivenName: client.givenName,
			 clientFamilyName: client.familyName,
			    clientZipcode: client.zipcode,
		 servicedByUserName: currentUser.userName,
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
	// store for use durring session
	if (serviceValid) {
		servicesRendered.push(serviceRecord)
	} else {
		const temp = servicesRendered
			.filter(function(item) {
    	return item.serviceId !== serviceId
		})
		servicesRendered = temp
	}
	let data = serviceRecord
	data = JSON.stringify(data)

console.log(data)

	let URL = aws+"/clients/services"
	result = dbPostData(URL,data)
	if (result == null) {
		utilBloop() // TODO move bloop to successful POST ()
	}
}

function dbSaveNote(){
	hasError = utilValidateField("noteTextArea", "noteForm")
	if (hasError) {
		utilBeep()
		return
	}
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
	//data = client
	let data = utilPadEmptyFields(client)
	let URL = aws+"/clients/"
	result = dbPostData(URL,JSON.stringify(data))
	if (result == null) {
		utilCalcFamilyCounts()
		utilCalcClientAge("db")
		uiToggleDependentsViewEdit("view")
		uiToggleNoteForm("hide", "")
		uiShowExistingNotes()
	}
};

function dbSaveClientForm(context){
	uiClearAllErrorBubbles()
	let hasErrors = utilValidateForm("clientForm", context)
	if (hasErrors) return
	$("#updatedDateTime.clientForm").val(utilNow())
	let data = ""
	if (client.clientId == undefined) {
		$("body").css("cursor", "progress");
		let clientId = dbGetNewClientID()
		$("#clientId.clientForm").val(clientId)
		data = utilFormToJSON('.clientForm')
		data.dependents = []
		data.lastServed = []
		data.notes = []
	} else {
		data = utilFormToJSON('.clientForm')
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
	uiSaveButton('client', 'Saving...')
	let URL = aws+"/clients/"
	result = dbPostData(URL,JSON.stringify(data))
	$("body").css("cursor", "default");
	if (result == null && client.clientId != undefined) {
		utilCalcClientAge("db")
		utilCalcFamilyCounts()
		uiToggleClientViewEdit("view")
	} else if (result == null) {
		clientId = $('#clientId.clientForm').val()
		$('#searchField').val(clientId)
		dbSearchClients()
	}
}

function dbSaveDependentsTable(){
	// TODO validate dependents and field level
	// TODO validate dependents and form level
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
	data = client
console.log(data)
	data = utilPadEmptyFields(data)
console.log(data)
	let URL = aws+"/clients/"
	result = dbPostData(URL,JSON.stringify(data))
	if (result == null) {
		utilCalcFamilyCounts()
		utilCalcClientAge("db")
		uiToggleDependentsViewEdit("view")
	}
}

function dbSaveServiceTypeForm(context){
	uiClearAllErrorBubbles()
	// populate dates
	let fields = ["updatedDateTime", "createdDateTime"]
	for (var i = 0; i < fields.length; i++) {
		if ($("#" + fields[i] + ".serviceTypeForm").val() == "") {
			$("#" + fields[i] + ".serviceTypeForm").val(utilNow())
		}
	}
	let hasErrors = utilValidateForm("serviceTypeForm", "serviceTypeForm")

console.log("ServiceForm Val: ", hasErrors)

	if (hasErrors) return
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
		client = {}
		servicesRendered = []
		uiClearCurrentClient()
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
};

function cogCheckSession() {
	cognitoUser.getSession(function(err, session) {
		if (err) {
			console.log(err)
			cogLogoutUser()
			$('#nav5').html('Login')
			$('#nav4').html('')
			$(loginError).html("Sorry, your session has expired.")
			return
		}
		return session
	})
};

function cogUserChangePassword(){
	let hasErrors = utilValidateForm("passwordForm", "context")
	if (hasErrors) return
	let password = $("#existingPassword").val(),
			newPassword = $("#newPassword").val(),
			confirmPassword = $("#confirmPassword").val()
	if (newPassword == confirmPassword) {
		cognitoUser.changePassword(password, newPassword, function(err, result) {
	    if (err) {
				if (err == "LimitExceededException: Attempt limit exceeded, please try after some time.") {
					uiShowHideError("show", "Too many attemps!!", "Please try again later.")
				} else if (err == "NotAuthorizedException: Incorrect username or password."){
					uiShowHideError("show", "Incorrect password", "Please enter your Existing Password again.<br>Make sure the <b>caps lock</b> is not on.")
				} else {
					alert(err)
				 	return
				}
	    } else {
				uiResetChangePasswordForm()
				utilBloop()
				cogLogoutUser()
				$('#nav5').html('Login')
				$('#nav4').html('')
				$(loginError).html("Login with your New Password.")
				//TODO make utilLogout function takes message as input
			}
	  });
	} else {
		utilBeep()
		console.log(newPassword, confirmPassword)
		console.log("PASSWORDS DONT MATCH")
		uiShowHideError("show", "Passwords don't match!!", "Please enter the new password correctly in both fields.")
		// TODO show error
	}
}

function cogUserConfirm(){
	let validationCode = $('#loginCode').val(),
		userName = $('#loginUserName').val(),
		userData = {
	 		Username: userName,
	 		Pool: userPool
		}
	let cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
	cognitoUser.confirmRegistration(validationCode, true, function(err, result) {
			if (err) {
				console.log("|"+err+"|")
				if (err == ""){
					$("#loginError").html("Error Message!")
					return
				} else {
					alert(err);
					return;
				}
			}
			utilBloop()
			uiLoginFormToggleValidation("login")
			$("#loginError").html("You're confirmed! Please Login.")
			console.log('call result: ' + result);
	});
}

function cogResendValidationCode(){
	let userName = $('#loginUserName').val(),
		userData = {
			Username: userName,
			Pool: userPool
		}
	let cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
	cognitoUser.resendConfirmationCode(function(err, result) {
		if (err) {
			alert(err);
			return;
		}
		$("#loginError").html("New code has been sent.")
	});
}


function cogForgotPassword(){
console.log("IN FORGOT PASSWORD")
	let userName = $("#loginUserName").val()
	if (userName == "") {
		$("#loginError").html("Username is required above!")
		return
	}
	let userData = {
		Username: userName,
		Pool: userPool
	};
	let cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData)
	cognitoUser.forgotPassword({
    onSuccess: function (result) {
      console.log('call result: ' + JSON.stringify(result))
			console.log('sent to: ' + result.CodeDeliveryDetails.Destination)
			$("#loginError").html("Validation Code sent to: " + result.CodeDeliveryDetails.Destination)
			uiLoginFormToggleValidation("newPassword")
			//console.log(callback.inputVerificationCode(data))
    },
    onFailure: function(err) {
			console.log("|"+err+"|")
			if (err == "LimitExceededException: Attempt limit exceeded, please try after some time."){
				$("#loginError").html("Too many requests. Try again later!")
				return
			} else {
				alert(err)
				return
			}
    }
  });
};

function cogUserConfirmPassword() {
	console.log("IN CONFIRM PASSWORD")
	let validationCode = $('#loginCode').val(),
		newPassword = $('#loginNewPassword').val(),
		userName = $('#loginUserName').val(),
		userData = {
			Username: userName, //username,
			Pool: userPool
		};
	let cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
	cognitoUser.confirmPassword(validationCode, newPassword, {
    onSuccess: function (result) {
      // console.log('call result: ' + JSON.stringify(result))
			// console.log('sent to: ' + result.CodeDeliveryDetails.Destination)
			// $("#loginError").html("Validation Code sent to: " + result.CodeDeliveryDetails.Destination)
			// uiLoginFormToggleValidation("newPassword")
			//console.log(callback.inputVerificationCode(data))
			utilBloop()
			$("#loginPassword").val("")
			uiLoginFormToggleValidation("login")
			$("#loginError").html("New Password set! Please Login.")
			console.log('call result: ' + result);
    },
    onFailure: function(err) {
			console.log("|"+err+"|")
			if (err == "LimitExceededException: Attempt limit exceeded, please try after some time."){
				$("#loginError").html("Too many requests. Try again later!")
				return
			} else {
				alert(err)
				return
			}
    }
	})
};

function cogUpdateAttributes(email, telephone){
	let attributeList = [];
  let attribute = {
      Name : 'email',
      Value : email
  }
  attribute = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserAttribute(attribute)
	attributeList.push(attribute);
	attribute = {
			Name : 'phone_number',
			Value : telephone
	}
	attribute = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserAttribute(attribute)
  attributeList.push(attribute);

  cognitoUser.updateAttributes(attributeList, function(err, result) {
      if (err) {
          alert(err);
          return;
      }
      console.log('call result: ' + result);
  })
};

function cogLoginUser() {
	let username = $('#loginUserName').val(),
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
			session.user = cognitoUser
			user = cognitoUser
			authorization.accessToken = result.getAccessToken().getJwtToken()
			authorization.idToken = result.idToken.jwtToken
			utilLoginUserShowScreens()
			// logout if user is set to Inactive
			if (currentUser.isActive == "Inactive") {
				cogLogoutUser()
				$('#nav5').html('Login')
				$('#nav4').html('')
				$(loginError).html("Sorry, your account is INACTIVE.")
			}
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
			} else if (err == 'UserNotConfirmedException: User is not confirmed.') {
				uiLoginFormToggleValidation("code")
				$("#loginError").html("Validation Code is required.")
				// TODO change login flow to deal with confirmation
				// cogUserConfirm() //userName, verificationCode
			} else if (err == 'NotAuthorizedException: User cannot confirm because user status is not UNCONFIRMED.') {
				uiLoginFormToggleValidation("login")
				$("#loginError").html("No longer UNCONFIRMED")
			} else if (err == 'PasswordResetRequiredException: Password reset required for the user') {
				console.log("PasswordResetRequiredException")
				$("#loginError").html("New Password is required.")
			} else if (err == 'InvalidParameterException: Missing required parameter USERNAME')
			$("#loginError").html("Username is required.")
		}
	})
};

function cogGetUserAttributes(){
	cognitoUser.getUserAttributes(function(err, result) {
		if (err) {
				alert(err);
				return;
		}
		user.username = cognitoUser.username
		for (i = 0; i < result.length; i++) {
				user[result[i].getName()] = result[i].getValue()
		}
	})
};

function cogUserSignUp(userName, password, email, telephone){
	var attributeList = [];
	var dataEmail = {
			Name : 'email',
			Value : email
	}
	var dataPhoneNumber = {
			Name : 'phone_number',
			Value : telephone
	}
	var attributeEmail = new AmazonCognitoIdentity.CognitoUserAttribute(dataEmail);
	var attributePhoneNumber = new AmazonCognitoIdentity.CognitoUserAttribute(dataPhoneNumber);
	attributeList.push(attributeEmail);
	attributeList.push(attributePhoneNumber);
	userPool.signUp(userName, password, attributeList, null, function(err, result){
			if (err) {
				if (err == "UsernameExistsException: User already exists") {
					uiGenerateErrorBubble("User Username already exists!", "userName", "inputBox userForm")
					return
				} else {
					alert(err);
					return;
				}
			} else {
				utilBloop()
			}
			cognitoUser = result.user;
			console.log('user name is ' + cognitoUser.getUsername());
	})
};

function cogLoginAdmin(){
console.log("IN AUTHENTICATION")
	let authenticationData = {
		 Username : '',
		 Password : ''
 	}
	let userData = {
		 Username : '',
		 Password : '' // your password here
 	}
  let authenticationDetails = new AWSCognito.CognitoIdentityServiceProvider.AuthenticationDetails(authenticationData)
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
 })
};

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
	let serviceType = utilGetServiceTypeByID(serviceTypeId)
	if ($("#btn-"+ serviceTypeId).hasClass("buttonGrayOut")) {
		// TODO Create ability to UNDO the adding of a service.
		// TODO remove service from services rendered array
		const serviceItem = servicesRendered
			.filter(function( obj ) {
			return obj.serviceTypeId == serviceTypeId
		})
		console.log(serviceItem[0].serviceId)
		let serviceValid = false
		dbSaveService(serviceTypeId, serviceItem[0].serviceId, serviceValid)
		// TODO Need to revert old Last Served from current client ?????
		uiToggleButtonColor("unGray", serviceTypeId, serviceButtons)
		if (serviceButtons == "Primary") $("#image-"+serviceTypeId).removeClass("imageGrayOut")
	} else {
console.log("IN ADD SERVICE");
		let serviceValid = true
		dbSaveService(serviceTypeId, "", serviceValid)
		uiShowLastServed()
		uiToggleButtonColor("gray", serviceTypeId, serviceButtons)
	}
};

function utilAddServiceToReceipt(){
	$("#receiptBody").html("")
	for (var i = 0; i < servicesRendered.length; i++) {
		let header = "<p><strong>" + servicesRendered[i].serviceCategory + ":</strong> " + servicesRendered[i].serviceName + "<br>"
		let body = "<strong>Items Served:</strong> " + servicesRendered[i].itemsServed
		if (servicesRendered[i].serviceCategory == "Clothes_Closet") {
			body = body + "<br><strong>Adults Served:</strong> " + client.family.totalAdults + "<br><strong>Children Served:</strong>  " + client.family.totalChildren
		}
		if (servicesRendered[i].serviceCategory == "Food_Pantry") {
			body = body + "<br><strong>Family Size:</strong> " + client.family.totalSize
		}
		$("#receiptBody").append(header + body)
	}

};

function utilCognitoPhoneFormat(telephone){
	let cogFormat= /^\+[1][0-9]{10}$/g
	let cleanTel = telephone.replace(/[.( )-]/g, '')

console.log(cleanTel)

	return cleanTel
};

function utilGetServiceTypeByID(serviceTypeId){
	if (!utilValidateArguments(arguments.callee.name, arguments, 1)) return
	let serviceTypeArr = serviceTypes.filter(function( obj ) {
		return obj.serviceTypeId == serviceTypeId
	})
	return serviceTypeArr[0]
};

function utilGetFoodInterval(isUSDA){
	if (!utilValidateArguments(arguments.callee.name, arguments, 1)) return
	for (var i = 0; i < serviceTypes.length; i++) {
		if ((serviceTypes[i].serviceButtons == "Primary") && (serviceTypes[i].serviceCategory == "Food_Pantry") && (serviceTypes[i].isUSDA == isUSDA)){
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
				if (activeServiceTypes[i].serviceCategory == "Food_Pantry") {
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
		if (client.dependents[i].relationship == "Other" && client.dependents[i].age >= 18 && client.dependents[i].isActive == "Active") {
			++fam.totalOtherDependents
			++fam.totalAdults
			++fam.totalSize
			if (client.dependents[i].age >= seniorAge) ++fam.totalSeniors
		}
		if (client.dependents[i].relationship == "Other" && client.dependents[i].age < 18 && client.dependents[i].isActive == "Active") {
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
};

function uiClearCurrentClient(){
	let blank = "<div class='bannerDiv'><span class='bannerText'>SEARCH FOR CLIENT</span></div>"
	$("#searchContainer").html(blank)
	$("#clientFormContainer").html(blank)
		$("#clientLeftSlider").hide()
		$("#clientRightSlider").hide()
	$("#servicePrimaryButtons").html(blank)
		$("#serviceDateTime").html("")
		$("#serviceLastVisit").html("")
		$("#serviceSecondaryButtons").html("")
	$("#dependentsFormContainer").html(blank)
		$("#dependentdLeftSlider").hide()
		$("#dependentdRightSlider").hide()
		$(".dependentsEditOnly").hide()
	$("#historyTop").html(blank)
		$("#historyBottom").html("")
	$("#notesContainer").html(blank)
		$("#newNoteButton").hide()
		$("#noteEditForm").hide()
		$("#tabLable6").css("color", "#bbb")
};



// function utilCalcLastIdCheckDays() {
// 	// get Id Checked Date from client object & calculate number of days
// 	// let familyIdCheckedDate = moment(client.familyIdCheckedDate, dbDate)
// 	let lastIdCheck = moment().diff(client.familyIdCheckedDate, 'days')
// 	return lastIdCheck
// }

function utilGenerateDailyReport(){
	let dayDate = $('#reportsDailyDate').val()
	uiShowDailyReportHeader(dayDate, '#printBodyDiv', "DAILY")
	uiShowDailyReportRows(dayDate, '#printBodyDiv')

	// let reportTitle = "FOOD DISTRIBUTION"
	// if ($("#reportsDailyType").val() == "ALL") {
	// 	reportTitle = "SERVICE DISTRIBUTION"
	// }
	//$("#reportTitle").html(reportTitle)

	uiShowHidePrint("show")
};

function utilGenerateMonthlyReport(){
	console.log("Report Start")
	let monthYear = $('#reportsMonthyMonth').val()
	uiShowMonthlyReportHeader(monthYear)
	uiShowMonthlyReportRows(monthYear)
	uiShowHidePrint("show")
};

function utilLoginUserShowScreens(){
	$('#nav4').html('<i class="fa fa-user" aria-hidden="true"></i> ' + session.user.username)
	$('#nav5').html('Logout')
	uiShowHideLogin('hide')
	navGotoSec('nav1')
	cogGetUserAttributes()
	serviceTypes = dbGetServicesTypes()
	users = dbGetUsers()
	utilSetCurrentUser()
	uiSetMenusForUser()
};

function utilPadEmptyFields(data){
	$.each(data, function(key,value){
		if (value == "" || (key == "zipSuffix" && value == 0)) {
			data[key] = "*EMPTY*"
		}
	})
	return data
};

function utilRemoveEmptyPlaceholders(){
	// TODO make this operate on other forms / data
	$.each(client, function(key,value){
		if (value == "*EMPTY*" || (key == "zipSuffix" && value == 0)) {
			client[key] = ""
		}
	})
};

function utilSetLastServedFood(){
//console.log("IN set last saved food")
	// TODO too much duplicated code with utilCalcLastServedDays()
	let lastServedFoodDateTime = "1900-01-01"
	if (client.lastServed[0] == undefined) return lastServedFoodDateTime
	let lastServedFood = client.lastServed.filter(function( obj ) {
		return obj.serviceCategory == "Food_Pantry"
	})
//console.log(lastServedFood)
	for (var i = 0; i < lastServedFood.length; i++) {
		if (lastServedFood[i].isUSDA != "Emergency") {
			if (moment(lastServedFood[i].serviceDateTime).isAfter(lastServedFoodDateTime)){
				lastServedFoodDateTime = lastServedFood[i].serviceDateTime
			}
		}
	}
	client.lastServedFoodDateTime = lastServedFoodDateTime
};

function utilCalcLastServedDays() {
	// get Last Served Date from client object & calculate number of days
	let lastServed = {daysUSDA:"10000", daysNonUSDA:"10000", lowestDays:"10000"}
	if (client.lastServed[0] == undefined) return lastServed
	let lastServedFood = client.lastServed.filter(function( obj ) {
		return obj.serviceCategory == "Food_Pantry"
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
		utilBeep()
	 	uiShowHideError("show")
}

function utilFormToJSON(form){
	if (!utilValidateArguments(arguments.callee.name, arguments, 1)) return
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
			} else if (valType == 'text'||valType == 'date'||valType == 'datetime-local'||valType == 'email') {
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

function utilCalcUserAge(source){
	if (!utilValidateArguments(arguments.callee.name, arguments, 1)) return
	let dob = ""
	if (source == "form") {
		dob = $("#dob.userForm").val()
	} else {
		dob = adminUser.dob
	}
	let age = moment().diff(dob, 'years')
	if (Number(age)){
		$("#age.userForm").val(age)
		adminUser.age = age
	} else {
		$("#age.userForm").val("")
		adminUser.age = ""
	}
};

function utilSetCurrentClient(index){
	if (!utilValidateArguments(arguments.callee.name, arguments, 1)) return
	servicesRendered = []
	client = clientData[index]
	utilRemoveEmptyPlaceholders()
	utilCalcClientAge("db")
	utilCalcFamilyCounts() // calculate fields counts and ages
	// emergencyFood = false // **** TODO what is this for?
	uiShowHistory()
	uiUpdateCurrentClient(index)
	$('#receiptBody').html("") //clear reciept // TODO move to function
};

function utilSetCurrentServiceType(index){
	if (!utilValidateArguments(arguments.callee.name, arguments, 1)) return
	serviceType = serviceTypes[index]
	uiOutlineTableRow('serviceTypesTable', index+1)
	uiSetAdminHeader(serviceType.serviceName)
	uiShowServiceTypeForm()
	navGotoTab("aTab2")
}

function utilSetCurrentAdminUser(index){
	if (!utilValidateArguments(arguments.callee.name, arguments, 1)) return
	adminUser = users[index]
	uiOutlineTableRow('usersTable', index+1)
	uiSetAdminHeader(adminUser.userName)
	utilCalcUserAge("data")
	uiShowUserForm()
	uiToggleUserNewEdit("existing")
	navGotoTab("aTab5")
};

function utilSetCurrentUser(){
//console.log(users)
//console.log(user.username)
	let foundUser = users.filter(function( obj ) {
		return obj.userName == user.username
	})
	currentUser = foundUser[0]
};

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
//console.log(data.length)
	for (var i = 0; i < data.length; i++) {
		if (client.clientId == data[i].clientId){
			row = i+1
			$.each(client, function(key,value){
				data[i][key] = value
			});
		}
	}
//console.log(row)
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
};

function utilValidateField(id, classes){
	if (!utilValidateArguments(arguments.callee.name, arguments, 2)) return
//console.log("IN FIELD VAL")
	let hasError = false
	let formClass = ""
//console.log(classes)
	if (classes.indexOf("clientForm") > -1){
		formClass = "clientForm"
	} else if (classes.indexOf("userForm") > -1) {
		formClass = "userForm"
	} else if (classes.indexOf("serviceTypeForm") > -1) {
		formClass = "serviceTypeForm"
	} else if (classes.indexOf("passwordForm") > -1) {
		formClass = "passwordForm"
	} else if (classes.indexOf("noteForm") > -1) {
		formClass = "noteForm"
	}
	let ruleId = id.replace(".", "_")
//console.log(formClass, ruleId)
	let rules = utilValidateConfig(formClass, ruleId)
//console.log(rules)
	let lookupList = []
console.log(rules)
	for (var i = 0; i < rules.length; i++) {
		let rule = rules[i]
		let ruleType = $.type(rules[i])
//console.log(rule.lookup)
		if (ruleType === "object") {
// console.log(JSON.stringify(rule))
			if (rule.lookup !== undefined) {
				lookupList = rule.lookup
				rule = "lookup"
			}
			if (rule.matching !== undefined) {
				matchField = rule.matching
				rule = "matching"
			}
		}
		let value = $('[id="' + id + '"]').val()
//console.log(rule+":"+value)
		switch (rule) {
			case "required":
				if (value == "" || value == " " || value == undefined) {
					hasError = true
console.log("FAIL: required")
					uiGenerateErrorBubble("Cannot be blank!", id, classes)
				}
				break
			case "date":
				if (hasError == false) {
					if (value != "" && value != " " && value != undefined) {
						if (!moment(value).isValid()){
console.log("FAIL: date")
							hasError = true
							uiGenerateErrorBubble("Not a valid date!", id, classes)
						}
					}
				}
				break
			case "dateNowBefore":
				if (hasError == false) {
					if (value != "" && value != " " && value != undefined) {
						if (moment(value).isValid()){
							if (!moment().isAfter(value)) {
console.log("FAIL: dateNowBefore")
								hasError = true
								uiGenerateErrorBubble("Date must be before now!", id, classes)
							}
						}
					}
				}
				break
			case "dateAfterNow":
				if (hasError == false) {
					if (value != "" && value != " " && value != undefined) {
						if (moment(value).isValid()){
							if (!moment().isBefore(value)) {
console.log("FAIL: dateAfterNow")
								hasError = true
								uiGenerateErrorBubble("Date must be after now!", id, classes)
							}
						}
					}
				}
				break
			case "dateAfter2000":
				if (hasError == false) {
					if (value != "" && value != " " && value != undefined) {
						if (moment(value).isValid()){
							if (!moment(value).isAfter('1999-12-31')) {
console.log("FAIL: dateAfter2000")
								hasError = true
								uiGenerateErrorBubble("Date is not after 1999!", id, classes)
							}
						}
					}
				}
				break
			case "phoneNumber":
				if (hasError == false && value != "") {
					let phoneRegex = /(\+\d[-\s]?)(\d{3}[-\s]?){2}\d{4}/g
					if (!value.match(phoneRegex)) {
						hasError = true
						uiGenerateErrorBubble("Not a valid phone format!", id, classes)
					}
				}
				break
			case "email":
				if (hasError == false && value != "") {
					let emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/g
					if (!value.match(emailRegex)) {
						hasError = true
						uiGenerateErrorBubble("Not a valid email format!", id, classes)
					}
				}
				break
			case "zipcode":
				if (hasError == false) {
					if (!value.match(/^\d{5}/g)) {
						hasError = true
						uiGenerateErrorBubble("Not a valid zipcode!", id, classes)
					}
				}
				break
			case "zipsuffix":
				if (hasError == false && value != "") {
					if (!value.match(/^\d{4}/g)) {
						hasError = true
						uiGenerateErrorBubble("Not a valid zipcode!", id, classes)
					}
				}
				break
			case "username":
				let userArray = users.filter(function( obj ) {
					return obj.userName == $("#userName.userForm").val()
				})
				if (userArray.length == 1 && hasError == false){
					hasError = true
					uiGenerateErrorBubble("Not valid: User Name exists!", id, classes)
				}
				if (value.length > 8 && hasError == false) {
					hasError = true
					uiGenerateErrorBubble("Not valid: Maximum 8 characters!", id, classes)
				}
				break
			case "password":
				if (value.length < 8 && hasError == false) {
					hasError = true
					uiGenerateErrorBubble("Not valid: Minimum 8 characters!", id, classes)
				}
				// /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/g
				let pwRegexLowercase = /(?=.*[a-z])/g
				if (!value.match(pwRegexLowercase) && hasError == false) {
					hasError = true
					uiGenerateErrorBubble("Not valid: Minimum 1 lowercase letter!", id, classes)
				}
				let pwRegexUppercase = /(?=.*[A-Z])/g
				if (!value.match(pwRegexUppercase) && hasError == false) {
					hasError = true
					uiGenerateErrorBubble("Not valid: Minimum 1 uppercase letter!", id, classes)
				}
				let pwRegexNumber = /(?=.*[0-9])/g
				if (!value.match(pwRegexNumber) && hasError == false) {
					hasError = true
					uiGenerateErrorBubble("Not valid: Minimum 1 number!", id, classes)
				}
				let pwRegexSpecialChar = /[^\d\w]/g
				if (!value.match(pwRegexSpecialChar) && hasError == false) {
					hasError = true
					uiGenerateErrorBubble("Not valid: Minimum 1 special character!", id, classes)
				}
				break
			case "lookup":
				console.log("IN LOOKUP")
				if (hasError == false) {
					let found = false
					for (var i = 0; i < lookupList.length; i++) {
						console.log("|"+lookupList[i]+"|")
						console.log("|"+value+"|")
						if (lookupList[i] == value) {
							found = true
						}
					}
					if (found == false) {
console.log("FAIL: lookup")
						hasError = true
						uiGenerateErrorBubble("Not valid entry!", id, classes)
					}
				}
				break
			case "matching":
				console.log("IN MATCHING")
				if (hasError == false) {
					if ($("#" + matchField).val() != value ) {
						hasError = true
						uiGenerateErrorBubble("Passwords do not match!", id, classes)
					}
				}
				break
			case "integer":
				if (hasError == false) {
					if (value != ""){
						if (!Number.isInteger(Number(value))) {
							hasError = true
							uiGenerateErrorBubble("Entry must be a number!", id, classes)
						}
					}
				}
				break
			case "name":
				if (hasError == false) {
//console.log("CHECK NAME LENGTH")
					if (value.length < 2) {
						hasError = true
						uiGenerateErrorBubble("Must be longer than one letter!", id, classes)
					}
				}
				// /^[\w.\-]+$/
				if (hasError == false) {
//console.log("CHECK FOR NON ALPHA CHARS")
					let specialChars = /[^-éáó úñ\w]/g // /\W/g  //not word or underscore
					if (value.match(specialChars)) {
						hasError = true
						uiGenerateErrorBubble("Special characters are not allowed!", id, classes)
					}
				}
				if (hasError == false) {
					if (value.match(/\d/g)) {
						hasError = true
						uiGenerateErrorBubble("Numbers are not allowed!", id, classes)
					}
				}
				break
			}
	//	rules[i]
//console.log(hasError)
		}
	if (!hasError){
// console.log("WIPE ERROR")
	 	$('[id="err-' + id + '"]').remove()
	 	$('[id="' + id + '"]').removeClass("errorField")
	}
// console.log("FIELD ERR: ", hasError)
	return hasError
};

function utilValidateForm(form, context){
console.log("IN FORM VAL")
	let formElements = $("."+form)
console.log(formElements)
	let hasErrors = false
	for (let i = 0; i < formElements.length; i++) {

console.log(formElements[i].id)

		let id = formElements[i].id,
				valType = formElements[i].type,
				classes = formElements[i].class,
				hasError = false
		if (form == "userForm" && context != "userProfile" && (id != "password" && id != "userName")) {
			hasError = utilValidateField(id,form+" "+"inputBox")
		}

		console.log(form, context, id)



		if (form == "clientForm") {
			if (context == "newClient"){
				if (id != "clientId") {
					console.log("NEW CLIENT PASSED TEST")
					hasError = utilValidateField(id, form +" "+ "inputBox")
				}
			} else {
				console.log("EXIST CLIENT PASSED TEST")
				hasError = utilValidateField(id,form+" "+"inputBox")
			}
		}
		if (form == "serviceTypeForm") {
			hasError = utilValidateField(id, form + " " + "inputBox")
		}

		console.log("ERRORS: ", hasError)
		if (hasError) {
			hasErrors = true
		}
	}
	console.log("ERRORS: ", hasErrors)
	if (hasErrors == true) utilBeep()
	return hasErrors
};

function utilValidateConfig(form, id){
	let clientForm = {
										 clientId: [ 'required' ],
			  			createdDateTime: [ 'required' ],
						  updatedDateTime: [ 'required' ],
		            firstSeenDate: [ 'required', 'date', 'dateNowBefore', 'dateAfter2000' ],
		      familyIdCheckedDate: [ 'required', 'date', 'dateNowBefore', 'dateAfter2000' ],
		                 isActive: [ 'required', {lookup: ["Client", "NonClient", "Inactive"]} ],
		                givenName: [ 'required', 'name' ],
				 					 familyName: [ 'required', 'name' ],
				 								  dob: [ 'required', 'date', 'dateNowBefore' ],
													age: [ ],
				 					 		 gender: [ 'required', {lookup: ["Female", "Male"]} ],
				 				  ethnicGroup: [ 'required', {lookup: ["Afro-American", "Anglo-European", "Asian/Pacific Islander", "Filipino", "Latino", "Native American", "Other"]} ],
				 				 		 homeless: [ 'required', {lookup: ["YES", "NO"]} ],
				 						   street: [ 'required' ],
				 							   city: [ 'required', 'name'],
				 							  state: [ 'required',{lookup: ["AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL",
												"IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT",
												"NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI",
												"SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY", "GU", "PR", "VI"]} ],
				 						  zipcode: [ 'required', 'zipcode' ],
										zipSuffix: [ 'zipsuffix' ],
				 					  telephone: [ 'phoneNumber' ],
				 		  			 		email: [ 'email' ],
				    financials_income: [ 'required', 'integer' ],
		financials_govtAssistance: [ 'required', 'integer' ],
				financials_foodStamps: [ 'required', 'integer' ],
							financials_rent: [ 'required', 'integer' ],
					 family_totalAdults: [ 'required', 'integer' ],
				 family_totalChildren: [ 'required', 'integer' ],
				  family_totalSeniors: [ 'required', 'integer' ],
	family_totalOtherDependents: [ 'required', 'integer' ],
						 family_totalSize: [ 'required', 'integer' ]
	}
	let userForm = {
		createdDateTime: [ 'required' ],
		updatedDateTime: [ 'required' ],
           isActive: [],
          givenName: [ 'required', 'name' ],
		     familyName: [ 'required', 'name' ],
		  			    dob: [ 'required', 'date','dateNowBefore' ],
								age: [ ],
		 		     gender: [ 'required', {lookup: ["Female", "Male"]} ],
		       userName: [ 'username'],
		       password: [ 'password'],
	 		     userRole: [ 'required', {lookup: ["Admin", "TechAdmin", "Staff", "Volunteer"]} ],
			       street: [ 'required' ],
				       city: [ 'required', 'name', ],
				      state: [ 'required', {lookup: ["AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL",
										 	 "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT",
											 "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI",
											 "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY", "GU", "PR", "VI"]} ],
			       zipcode: [ 'required', 'zipcode' ],
		       zipSuffix: [ 'zipsuffix' ],
		       telephone: [ 'phoneNumber' ],
			 		     email: [ 'email' ]
	}
	let serviceTypeForm = {
							serviceTypeId: [ 'required' ],
						createdDateTime: [ 'required' ],
						updatedDateTime: [ 'required' ],
								serviceName: [ 'required', 'name' ],
						serviceCategory: [ 'required', {lookup: ["Administration", "Back_To_School", "Clothes_Closet", "Food_Pantry", "Hygiene_Supplies", "Household_Items", "Thanksgiving", "Christmas", "Vouchers", "Winter_Warming"]} ],
									 isActive: [],
				 serviceDescription: [ 'required' ],
				     serviceButtons: [ 'required', {lookup: ["Primary", "Secondary"]} ],
						    numberItems: [ 'required', 'integer' ],
								   itemsPer: [ 'required', {lookup: ["Family", "Person"]} ],
						serviceInterval: [ 'required', 'integer' ],
										 isUSDA: [ 'required', {lookup: ["NA", "USDA", "NonUSDA", "Emergency"]} ],
		available_dateFromMonth: [ 'required', {lookup: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"]} ],
			available_dateFromDay: [ 'required', 'integer' ], // TODO day available in month above
			available_dateToMonth: [ 'required', {lookup: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"]} ],
				available_dateToDay: [ 'required', 'integer' ], // TODO day available in month above
						target_homeless: [ 'required', {lookup: ["Unselected", "YES", "NO"]} ],
						  target_family: [ 'required', {lookup: ["Unselected", "Single_Individual", "Couple", "Family_with_Children"]} ],
						  target_gender: [ 'required', {lookup: ["Unselected", "Female", "Male"]} ],
						   target_child: [ 'required', {lookup: ["Unselected", "YES", "NO"]} ],
				 target_childMinAge: [ 'integer' ], // TODO required if terget child is "YES"
			 	 target_childMaxAge: [ 'integer' ], // TODO required if terget child is "YES"
			 target_childMinGrade: [ 'integer' ], // TODO required if terget child is "YES"
			 target_childMaxGrade: [ 'integer' ], // TODO required if terget child is "YES"
			     fulfillment_type: [ 'required', {lookup: ["Fulfill", "Notify", "Voucher"]} ],
   fulfillment_fromDateTime: [ 'date', 'dateAfterNow', 'dateAfterNow' ],
	   fulfillment_toDateTime: [ 'date', 'dateAfterNow', 'dateAfterNow' ]
	}
	let passwordForm = {
		existingPassword: [ 'password'],
				 newPassword: [ 'password'],
		 confirmPassword: [ 'password', {matching: ["newPassword"]} ]
	}
	let noteForm = {
			  noteTextArea: [ 'required' ],
		 noteIsImportant: []
	}
	if (form == "clientForm") return clientForm[id]
	if (form == "userForm") return userForm[id]
	if (form == "serviceTypeForm") return serviceTypeForm[id]
	if (form == "passwordForm") return passwordForm[id]
	if (form == "noteForm") return noteForm[id]
};

function utilCalculateFoodInterval(isUSDA, activeServiceTypes) {
	if (!utilValidateArguments(arguments.callee.name, arguments, 2)) return
	let foodServiceInterval = ""
	for (var i = 0; i < activeServiceTypes.length; i++) {
		if (activeServiceTypes[i].serviceCategory == "Food_Pantry" && activeServiceTypes[i].serviceButtons == "Primary" && activeServiceTypes[i].isUSDA == isUSDA) {
			foodServiceInterval = activeServiceTypes[i].serviceInterval
		}
	}
	return foodServiceInterval
};

function utilValidateServiceInterval(activeServiceType, activeServiceTypes, lastServed){
	if (!utilValidateArguments(arguments.callee.name, arguments, 3)) return
	// empty lastServed array - bump out Non-USDA & Emergency Food buttons
	if (client.lastServed.length == 0 || lastServed.lowestDays == 10000) {
// console.log("NO LAST SERVED")
		if ((activeServiceType.serviceCategory == "Food_Pantry"
			&& activeServiceType.serviceButtons == "Primary"
			&& activeServiceType.isUSDA == "NonUSDA")
			||(activeServiceType.serviceCategory == "Food_Pantry"
			&& activeServiceType.serviceButtons == "Primary"
			&& activeServiceType.isUSDA == "Emergency")) {
			return false;
		} else {return true}
	}
	if (activeServiceType.serviceButtons == "Primary") {
		if (activeServiceType.serviceCategory == "Food_Pantry") {
			let nonUSDAServiceInterval = utilCalculateFoodInterval("NonUSDA", activeServiceTypes)
			let USDAServiceInterval = utilCalculateFoodInterval("USDA", activeServiceTypes)
// console.log(activeServiceType.isUSDA)
// console.log(lastServed.lowestDays, "<", nonUSDAServiceInterval)
			if (lastServed.lowestDays < nonUSDAServiceInterval) {
// console.log(lastServed.daysUSDA, "<", USDAServiceInterval)
				if (activeServiceType.isUSDA == "Emergency") return true
				if (activeServiceType.isUSDA == "USDA") {
					return false
				} else if (activeServiceType.isUSDA == "NonUSDA") {
					return false
				} else if (activeServiceType.isUSDA == "Emergency") {
					return true
				}
			} else {
				if (activeServiceType.isUSDA == "Emergency") return false
				if (lastServed.daysUSDA >= USDAServiceInterval) {
					if (activeServiceType.isUSDA == "USDA") {
						return true
					} else if (activeServiceType.isUSDA == "NonUSDA") {
						return false
					}
				} else {
					if (activeServiceType.isUSDA == "Emergency") return false
					if (activeServiceType.isUSDA == "USDA") return false
					if (lastServed.daysNonUSDA >= activeServiceType.serviceInterval) {
						if (activeServiceType.isUSDA == "USDA") {
							return false
						} else if (activeServiceType.isUSDA == "NonUSDA") {
							return true
						}
					}
				}
			}
		} else if (activeServiceType.serviceCategory == "Clothes_Closet") {
			if (lastServed.lowestDays < activeServiceType.serviceInterval) {
//console.log("FALSE")
				return false;
			}
		} else if (activeServiceType.serviceCategory == "Administration") {
			inLastServed = client.lastServed.filter(function( obj ) {
				return obj.serviceCategory == "Administration"
			})
			if (inLastServed.length > 0) {
				let lastServedDate = moment(inLastServed[0].serviceDateTime).startOf('day')
				if (moment().startOf('day').diff(lastServedDate, 'days') < activeServiceType.serviceInterval) {
//console.log("FALSE")
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


function fixDepenedentRelationships(){
  for (var i = 3000; i < 5000; i++) {
    let clientData = dbGetData(aws+"/clients/"+i).clients
		if (clientData.length > 0) {
			clientData = clientData[0]
			let save = false
			if (clientData.dependents.length > 0) {
				//console.log(clientData)
		    for (var d = 0; d < clientData.dependents.length; d++) {
		      //if (clientData.dependents[d].relationship == "child") clientData.dependents[d].relationship = "Child"
		      //if (clientData.dependents[d].relationship == "spouse") clientData.dependents[d].relationship = "Spouse"
		      if (clientData.dependents[d].relationship == "other") {
						save = true
						clientData.dependents[d].relationship = "Other"
						console.log(clientData.dependents	[d].relationship)
					}
					if (clientData.dependents[d].relationship == "Other_Dependent") {
						save = true
						clientData.dependents[d].relationship = "Other"
						console.log(clientData.dependents	[d].relationship)
					}
		    }
				if (save == true) {
					let URL = aws+"/clients/"
					result = dbPostData(URL,JSON.stringify(clientData))
				}
			}
		}
  }
};
