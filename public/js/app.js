/// SMUM CHECKIN APP
// This project is thanks to contributions of people like Kush Jain.
// FUNCTION naming covention Prefix:
// -->   ui....  interact with User Interface [HTML]
// -->   nav...  provide Nav Section and Tab navigation
// -->   util..  provide general utility
// -->   db....  interact with AWS DynamoDB service
// -->   date..  interact with dates and calendar
// -->   cog...  interact with AWS Cognito service
// Function naming syntax [prefix][action][subject]

// **********************************************************************************************************
// *********************************************** GLOBAL VARS **********************************************
// **********************************************************************************************************
// TODO add number of Dependents to Dependents tab ie. Dependents(5) ... do not show () if 0
// TODO add number of Notes to Notes tab ie. Note(3) ... do not show () if 0
// TODO confirm that lastIdCheck is being updated when that service is clicked.

const ver = '?v=1.0.5'
$('#versionNum').html(ver.split('=')[1]) // display version number on top right
const aws = "https://hjfje6icwa.execute-api.us-west-2.amazonaws.com/dev"
const MAX_ID_DIGITS = 5
const uiDate = 'MM/DD/YYYY'
const uiDateTime = 'MM/DD/YYYY H:mma'
const uiDateTimeShort = 'MM/DD/YY H:mma'
const longDate = "MMMM Do, YYYY  |  LT"
const date = 'YYYY-MM-DD'
const dateTime = 'YYYY-MM-DDTHH:mm'
let settings = {}
// 	settings.serviceZip: [95110, 95112, 95117, 95125, 95126, 95128, 95131, 95132, 95134, 95192] // reference only
let rowNum = 1
let clientData = null // current client search results
let servicesRendered = [] // tally of services as they are clicked
let client = {} // current client
let editFlag = {}
uiClearCurrentClient()
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
let closedEvent = {
	id : "closed",
	title: "Closed",
	start: "",
	allDay: true,
	editable: false,
	backgroundColor: "red"
}

// TODO build some selects in forms from data in settings (ie. Categories)

// uiFillDate() Moved to REACT
uiShowHideLogin('show')
// navGotoTab("tab1") Moved to REACT
$("#noteEditForm").hide()
$("#atabLable7").hide()
uiShowDailyReportHeader(moment().format(date), 'today', "TODAY")

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
	switch (link) {
		case "clients":
			navGotoSec("nav1")
			navGotoTab("tab1")
			uiShowServicesButtons()
			break
		// case "newClient":
		// 	navGotoSec("nav2")
		// 	addClient()
		// 	break
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
		// case "logInOut":
		// 	navGotoSec("nav5")
	}
};

function navGotoSec(nav){
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
		}
	$("#"+currentNavTab).show()
};

function navGotoTab(tab){
	let useAttr = document.getElementById(tab);
	useAttr.setAttribute('checked', true);
	useAttr['checked'] = true;
};

// **********************************************************************************************************
// ********************************************* STATE FUNCTIONS ********************************************
// **********************************************************************************************************

function stateCheckPendingEdit() {
	let tab = ''
	let section = ''
	if (editFlag.client) {
		section = 'Client'
		tab = "tab3"
	} else if (editFlag.dependents) {
		section = 'Dependents'
		tab = "tab4"
	} else if (editFlag.notes) {
		section = 'Note'
		tab = "tab6"
	}
	if (section !== '') {
		title = section + " Not Saved!"
		message =  "Save or Cancel the " + section + " form first."
		uiShowHideError("show", title, message, 'beep')
		navGotoTab(tab)
		return true
	}
	return false
};

// **********************************************************************************************************
// *********************************************** UI FUNCTIONS *********************************************
// **********************************************************************************************************

function uiAddBadge(type, item){
	const badge = "<div id='" + type.toLowerCase() + item + "' class='listBadge'>" + item + "<div class='listBadgeX' onclick=\"uiRemoveListItem('" + type + "', '" + item + "')\"" + ">X</div></div>"
	$("#service" + type + "Display").append(badge)
};

function uiAddListItem(type){
	// adds a category to the list of Categories - called by Form Button
	const item = $("#service" + type + "Input").val()
	let itemList = $("#service" + type).val()

	// TODO validate if item is a Zipcode or a valid category name

	if (itemList == ""){
		itemList = "[]"
	}
	itemList = JSON.parse(itemList)
	if (itemList.includes(item)) {
		let message = '\"' + item + '\"' + ' is already in the list.'
		uiShowHideError('show', 'Duplicate Value', message, 'beep')
	} else {
		itemList.push(item)
		uiAddBadge(type, item)
		$("#service" + type).val(JSON.stringify(itemList))
	}
	$("#service" + type + "Input").val("")
};

function uiAddNewDependentsRow(){
	const nextRow = $('#dependentsTable tr').length - 1
	let dependentRow = "<tr>"
	dependentRow+="<td><input id='givenName["+nextRow+"]' class='inputBox inputForTable dependentsForm'></td>"
	dependentRow+="<td><input id='familyName["+nextRow+"]' class='inputBox inputForTable dependentsForm'></td>"
	dependentRow+="<td><select id='relationship["+nextRow+"]' class='inputBox inputForTable dependentsForm'><option value='Child'>Child</option><option value='Spouse'>Spouse</option><option value='Other'>Other</option></select></td>"
	dependentRow+="<td><select id='gender["+nextRow+"]' class='inputBox inputForTable dependentsForm'><option value='Male'>Male</option><option value='Female'>Female</option></select></td>"
	dependentRow+="<td><input id='dob["+nextRow+"]' class='inputBox inputForTable dependentsForm' onchange='utilCalcDependentAge("+ parseInt(nextRow) + ")' type='date'></td>"
	dependentRow+="<td class='dependentsViewOnly'><input id='age["+nextRow+"]' class='inputBox inputForTable dependentsForm' style='width:50px'></td>"
	dependentRow+="<td><select id='grade["+nextRow+"]' class='inputBox inputForTable dependentsForm'><option value='NA'>NA</option><option value='Pre-K'>Pre-K</option><option value='K'>K</option><option value='1st'>1st</option><option value='2nd'>2nd</option><option value='3rd'>3rd</option><option value='4th'>4th</option><option value='5th'>5th</option><option value='6th'>6th</option><option value='7th'>7th</option><option value='8th'>8th</option><option value='9th'>9th</option><option value='10th'>10th</option><option value='11th'>11th</option><option value='12th'>12th</option></select></td>"
	dependentRow+="<td><select id='isActive["+nextRow+"]' class='inputBox inputForTable dependentsForm'><option value='Active'>Active</option><option value='Inactive'>Inactive</option></select></td>"
	dependentRow+="</tr>"
	$('#dependentsTable').append(dependentRow)
	uiToggleDependentsViewEdit('edit');
};

function uiAddListOfVoucherServiceTypes(voucherServiceTypes){
	$.each(voucherServiceTypes, function (i, item) {
		$('#reportVoucherCount').append($('<option>', {
				value: item.serviceTypeId,
				text : item.serviceName
		}));
		$('#reportVoucherDistro').append($('<option>', {
				value: item.serviceTypeId,
				text : item.serviceName
		}));
	});

};

function uiBuildHistoryBottom(reactDiv){
	const headerLabels = ["Served", "Service", "Client", "Homeless", "# Items", "# Adults", "# Children", "# Individuals", "# Seniors", "Serviced By"]
	$(reactDiv).html("") // changed for React migration #historyBottom"
	for (var i = 0; i < headerLabels.length; i++) {
		$(reactDiv).append("<div class='historyHeader'>" + headerLabels[i] + "</div>") // changed for React migration #historyBottom"
	}
	//$("#historyBottom").append("<div class='historyLoadButton solidButton' onClick='dbLoadServiceHistory()'>Load History</div>")
};

function uiBuildHistoryTop(reactDiv){ // Changed for port to REACT: original function did not have an atttribute
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
	uiGenSelectHTMLTable(reactDiv, historyArray, columns,'historyTable')
	// Changed for port to REACT: orginal target div was '#historyTop' instead of 'reactDiv'
};

function uiClearAllErrorBubbles(){
	$('.errorBubble').remove()
	$('.errorField').removeClass("errorField")
};

function uiClearCurrentClient(){
	let blank = ""// "<div class='bannerDiv'><span class='bannerText'>SEARCH FOR CLIENT</span></div>"
	$("#searchContainer").html(blank)
	$("#clientFormContainer").html(blank)
		$("#clientLeftSlider").hide()
		$("#clientRightSlider").hide()
	// $("#servicePrimaryButtons").html(blank)
	// 	$("#serviceDateTime").html("")
	// 	$("#serviceLastVisit").html("")
	// 	$("#serviceSecondaryButtons").html("")
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

function uiShowNotes(reactDiv, pageName){ /**Displays notes table for a given page**/
	//setMainSideDiv()
	const tableStr = '<table class="notes"></table>'
	$(reactDiv).html(tableStr)
	const headerRow = '<tr><td class="notesHeader">Created</td><td class="notesHeader">Note</td><td class="notesHeader">Created By</td><td class="notesHeader">Important</td></tr>'
	$('.notes').append(headerRow)
	$("#noteEditForm").hide()
};

function uiShowEditHistoryPopup(serviceId, rowNum){
	if ($("#editPopup.rowNum"+rowNum).length > 0) return
	// clear old popup just in case
	$("#editPopup").remove()
	$(".greyout").removeClass('greyout')
	// add new highligh and popup
	$(".rowNum" + rowNum).addClass('greyout')
	let popup = "<div id='editPopup' class='historyPopup rowNum" + rowNum + "'>&#8679; &nbsp; &nbsp; <span class='historyEditLink' onclick='uiEditHistory(\"edit\", \"" + serviceId + "\", \""+ rowNum +"\")'>EDIT</span> &nbsp; &nbsp; <span class='historyEditLink' onclick='uiEditHistory(\"delete\", \"" + serviceId + "\", \""+ rowNum +"\")'>DELETE</span> &nbsp; &nbsp; <span class='historyEditLink' onclick='uiEditHistory(\"cancel\", \"" + serviceId + "\", \""+ rowNum +"\")'>CANCEL</span> &nbsp; &nbsp; &#8679;</div>"
	$(".rowNum" + rowNum).last().after(popup)
};

function uiEditHistory(todo, serviceId, rowNum){
	if (todo == "cancel"){
		$("#editPopup").remove()
		$(".greyout").removeClass('greyout')
		if ($(".historyEditField").length > 0){
			let temp = ""
			for (var i = 0; i < 9; i++) {
				temp = $("#histEditHidden" + i).val()
				$(".rowNum" + rowNum + ":eq("+ i +")").html(temp)
			}
		}
	} else if (todo == "delete") {
		utilBeep()
		let popup = "<div id='editPopup' class='historyPopup'>&#8680; &nbsp; &nbsp; <span style='color:white'>ARE YOU SURE?</span> &nbsp; &nbsp; <span class='historyEditLink' onclick='uiEditHistory(\"confirmedDelete\", \"" + serviceId + "\", \""+ rowNum +"\")'>YES</span> &nbsp; &nbsp; <span class='historyEditLink' onclick='uiEditHistory(\"cancel\", \"" + serviceId + "\", \""+ rowNum +"\")'>CANCEL</span> &nbsp; &nbsp; &#8678;</div>"
		$("#editPopup").html(popup)
	} else if (todo == "confirmedDelete") {
		const service = utilRemoveService(serviceId)
		if (service != ""){
			const result = utilUpdateLastServed()
			if (result == "failed") return
		} else {
			console.log("Saving delete failed.")
			return
		}
		$(".rowNum" + rowNum).hide("slow")
		uiEditHistory("cancel", serviceId, rowNum)
	} else if (todo == "edit") {
		let temp = ""
		for (var i = 0; i < 9; i++) {
			temp = $(".rowNum" + rowNum + ":eq(" + i + ")").html()
			// datetime
			if (i == 0) {
				temp = moment(temp, uiDateTime).format(dateTime)
				$(".rowNum" + rowNum + ":eq(" + i + ")").html("<input id='histEditHidden" + i + "' type='hidden' value='" + temp + "'><input id='histEdit" + i + "' class='historyEditField' type='datetime-local' value='" + temp + "'>")
			}
			// selects
			if (i > 0 && i < 4){
				let selectOptions
				if (i == 1) {
					selectOptions =  serviceTypes
						.filter(obj => obj.serviceButtons == "Primary")
						.map(obj => obj.serviceName)
				}
				if (i == 2){
					selectOptions =  ["Client", "NonClient", "Inactive"]
				}
				if (i == 3){
					selectOptions =  ["NO", "YES"]
				}
				let html = "<input id='histEditHidden" + i + "' type='hidden' value='" + temp + "'><select id='histEdit" + i + "' class='historyEditField'>"
				for (var b = 0; b < selectOptions.length; b++) {
					let selected = "selected='selected'"
					let isSelected = ""
					if (temp == selectOptions[b]) {isSelected = selected}
					html = html + "<option value='" + selectOptions[b] + "' " + isSelected + ">" + selectOptions[b] + "</option>"
				}
				$(".rowNum" + rowNum + ":eq(" + i + ")").html(html + "</select>")
			}
			// text fields
			if (i > 3){
				$(".rowNum" + rowNum + ":eq(" + i + ")").html("<input id='histEditHidden" + i + "' type='hidden' value='" + temp + "'><input id='histEdit" + i + "' class='historyEditFieldSmall' type='text' value='" + temp + "'>")
			}
		}
		let popup = "&#8679; &nbsp; &nbsp; <span style='color:white'>EDIT FIELDS ABOVE</span> &nbsp; &nbsp; <span class='historyEditLink' onclick='uiEditHistory(\"save\", \"" + serviceId + "\", \""+ rowNum +"\")'>SAVE</span> &nbsp; &nbsp; <span class='historyEditLink' onclick='uiEditHistory(\"cancel\", \"" + serviceId + "\", \""+ rowNum +"\")'>CANCEL</span> &nbsp; &nbsp; &#8679;"
		$("#editPopup").html(popup)
		// Save edited service record
	} else if (todo == "save") {
		let service = utilUpdateService(serviceId)
		if (service != ""){
			let lastServed = utilUpdateLastServed(service)
			if (lastServed == "failed") {
				console.log("Saving client / lastServed failed.")
				return
			} else {
				for (var i = 0; i < 9; i++) {
					let temp = 	$("#histEdit" + i).val()
					if (i == 0){temp = moment(temp).format(uiDateTimeShort)}
					$(".rowNum" + rowNum + ":eq(" + i + ")").html(temp)
				}
				uiEditHistory("cancel", serviceId, rowNum)
			}
		} else {
			console.log("Updating service failed.")
		}
	}
}

function uiGenerateErrorBubble(errText, id, classes){
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
jQuery('<div/>', {
	class: "errorBubbleContainer",
	 id: "errContainer-" + id
}).appendTo(parent);

	jQuery('<div/>', {
		class: "errorBubble",
     id: "err-" + id,
     text: errText,
		 click: function(){
			 $('[id="err-' + id + '"]').remove()
			 $('[id="' + id + '"]').removeClass("errorField")
		 }
	}).appendTo('[id="errContainer-' + id + '"]');
	// TODO make this variable to form parent
	// TODO make field ID exact by using formClass
	let errElem = $('[id="errContainer-' + id + '"]')
	errElem.position({
  	my: "center bottom-7", // push up 7 pixels
  	at: "center top",
  	// of: '[id="' + id + '"][class="'+ classes +'"]',
		of: '[id="' + id + '"]' + formClass,
		collision: "none"
	});
	$('[id="' + id + '"]' + formClass).addClass("errorField")
};

function utilParseHiddenArray(id){
	let arr = $("#"+id).val();
	if (arr == "[]"){
		return [];
	}
	return JSON.parse(arr);
};

function uiInitFullCalendar(){
	$(function() {
		$('#calendar').fullCalendar({
			height: 380,
			aspectRatio: 1.5,
			contentHeight: 380,
			fixedWeekCount: false,
			dayRender: function (date, cell) {
				let dateRules = {
					closedEveryDays: utilParseHiddenArray("closedEveryDays"),
					closedEveryDaysWeek: utilParseHiddenArray("closedEveryDaysWeek"),
				 	closedDays: utilParseHiddenArray("closedDays"),
				 	openDays: utilParseHiddenArray("openDays")
				}
				if (dateIsClosed(dateRules, date)) {
					utilAddClosedEvent(date.format());
				}
			},
			dayClick: function(clickDate, jsEvent, view) {
				let opt = dateParse(clickDate.format());
				$("#selectedDate").val(clickDate.format('YYYY-MM-DD')) // store day selected in hidden field
				// display popup menu
				// TODO need to know if currently Closed or Open
				let todo = "Closure/Opening"
				$('#calendarPopupHeader').html('Select ' + todo + ' for:')
				$('#selectDayLable').html(clickDate.format('MMM DD, YYYY') + ' only!')
				$('#selectEveryDayLable').html('Every ' + utilDayOfWeekAsString(opt.dayOfWeek) + ' of the year!')
				$('#selectEveryDayWeekLable').html('Every ' + utilGetOrdinal(opt.weekInMonth) + ' ' + utilDayOfWeekAsString(opt.dayOfWeek) + ' of the year!')
				$('#calendarPopup').show('slow');
			}
		})
	});
};

function uiOutlineTableRow(table, row){
	$('#' + table + ' tr:eq('+ row + ')').css('outline', 'var(--blue) 1px dashed').siblings().css('outline', 'none')
};

function uiRemoveListItem(type, item){
	// remove item from zipcode or Category list settings
	$("#" + type.toLowerCase() + item).hide("slow") // to animate hide
	$("#" + type.toLowerCase() + item).remove() // to remove conflict of double ID
	// remove from the hidden form field
	let itemList = $("#service" + type).val()
	itemList = JSON.parse(itemList)
	const index = itemList.indexOf(item)
 	if (index > -1) {itemList.splice(index, 1)}
	$("#service" + type).val(JSON.stringify(itemList))
};

function uiResetChangePasswordForm(){
	$(".passwordForm").val("")
};

// removed UI toggle form validation form (ported UI to react)


function uiResetSettingsForm(){

	//TODO Build clear rest form

};

function uiResetNotesTab(){
	hasImportantNote = ""
	$("#tabLable6").css("color", "#bbb")
	$("#noteTextArea").val("")
	$("#noteIsImportant").prop("checked", false)
};

function uiResetUserForm() {
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

function uiShowCurrentClientButtons(){
	$("#clientLeftSlider").show()
	$("#clientRightSlider").show()
	$("#newNoteButton").show()
	$("#dependentdLeftSlider").show()
	$("#dependentdRightSlider").show()
	$("#newNoteButton").show()
};

function uiShowExistingNotes(state){
	$('.notes').html("")
	client.notes.sort((a, b) => moment.utc(b.createdDateTime).diff(moment.utc(a.createdDateTime)))
	let important = "", hasImportantNote = false, topNote = ""
	for (let i = 0; i < client.notes.length; i++){
		important = ""
    let obj = client.notes[i];
		if (obj.isImportant == "true" || obj.isImportant == true) {
			important = "IMPORTANT"
			hasImportantNote = true
			if (topNote == "") {
				topNote = obj
			}
		}
		// TODO need to provide link at TR level if the current user == the user who created the note
    uiShowNote(i, moment(obj.createdDateTime).format(uiDateTimeShort), obj.noteText, obj.noteByUserName, important)
  }
	// has important note highlight tab and show msgOverlay
	if (hasImportantNote) {
		$("#tabLable6").css("color", "var(--red)")
		if (state == "loading"){
			uiShowHideClientMessage("show")
		}
		$("#clientMessageBody").html("<span style='font-size: 12px; float: right'>" + moment(topNote.createdDateTime).format(longDate) + "</span><br><br><span style='font-weight: bold'>" + topNote.noteText  + "</span><br><br><span style='float:right; font-size: 12px'>By: " + topNote.noteByUserName + "</span>")
	}
};

function uiShowHideClientMessage(todo){
	if (todo === 'show'){
		$('#msgOverlay').show().css('display', 'flex')
	} else {
		$('#msgOverlay').hide()
	}
};

function uiToggleButtonColor(action, serviceTypeId, serviceButtons){
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

function uiUpdateCurrentClient(index) {
	uiOutlineTableRow('clientTable', index + 1)
	uiShowCurrentClientButtons()
	// uiSetClientsHeader("numberAndName") MOVED TO REACT
	uiShowServicesButtons()
	uiShowClientEdit(false)
	navGotoTab("tab2")
};

function uiUpdateAdminHeader() {
	$("#adminTitle").html($("#serviceName").val())
};

function uiUpdateButton(btn, set) {
	if (set == 'Gen') {
		btn.value = 'Generating...';
		btn.style.backgroundColor = 'red';
	} else {
		btn.value = 'Run';
		btn.style.backgroundColor = 'var(--blue)';
	}
};

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
};

function uiSetMenusForUser(){
	// TODO remove TechAmin from dropdown for admins that are not Tech
	if (currentUser.isActive == "Active") {
		if (currentUser.userRole == "Admin"){
			$("#atabLable7").hide()
		} else if (currentUser.userRole == "TechAdmin"){
			$("#atabLable7").show()
		} else if (currentUser.userRole == "Volunteer" || currentUser.userRole == "Staff") {
			$("#atabLable7").hide()
		}
	}
};

function uiShowFamilyCounts(totalAdults, totalChildren, totalOtherDependents, totalSeniors, totalSize){
	if (document.getElementById("family.totalAdults") != null){
		document.getElementById("family.totalAdults").value = totalAdults
		document.getElementById("family.totalChildren").value = totalChildren
		document.getElementById("family.totalOtherDependents").value = totalOtherDependents
		document.getElementById("family.totalSeniors").value = totalSeniors
		document.getElementById("family.totalSize").value = totalSize
	}
};

function uiShowHideError(todo, title, message, sound){
	if (sound == 'beep') { utilBeep() }
	if (todo == 'show'){
		$('#errorOverlay').show().css('display', 'flex')
		$('#errorTitle').html(title)
		$('#errorMessage').html(message)
	} else {
		$('#errorOverlay').hide()
		$('#errorTitle').html('')
		$('#errorMessage').html('')
	}
};

function uiShowHideReport(todo){
	if (todo == 'show'){
		$('#printOverlay').show().css('display', 'flex')
	} else {
		$('#printOverlay').hide()
	}
};

function uiShowHideLogin(todo){
	// need this for now until whole app is ported to React
	// allows for the logout button to work once logged in
	if (todo === 'show'){
		$('#loginOverlay').show().css('display', 'flex')
		$('#loginUserName').focus()
	} else {
		$('.loginDiv').show()
		$('#loginOverlay').hide()
		$("#loginError").html('')
	}
};

// removed UI show hide password (ported to react)

function uiShowHistory(){
	uiBuildHistoryTop()
	uiBuildHistoryBottom()
};

function uiShowHistoryData(reactDiv, clientHistory){
	// uiBuildHistoryBottom() hidden beacuse of REACT migration
	// $(".historyLoadButton").hide()
	const rowFields = ["servicedDateTime", "serviceName", "clientStatus", "homeless", "itemsServed", "totalAdultsServed", "totalChildrenServed", "totalIndividualsServed", "totalSeniorsServed", "servicedByUserName"]
	for (var i = 0; i < clientHistory.length; i++) {
		let rowClass = "", newRow = ""
		if (!Number.isInteger(i / 2)) {
			rowClass = " historyDarkRow"
		}
		for (var f = 0; f < rowFields.length; f++) {
			if (rowFields[f] == "servicedDateTime") {
				let serviceDateTime =  moment(clientHistory[i][rowFields[f]]).format(uiDateTimeShort)
				if (currentUser.userRole == "Admin" || currentUser.userRole == "TechAdmin"){
					newRow += "<div class='rowNum" + i + " historyRow editable" + rowClass + "' onclick='uiShowEditHistoryPopup(\""+clientHistory[i].serviceId+"\", \""+ i +"\")'>" + serviceDateTime + "</div>"
				} else {
					newRow += "<div class='rowNum" + i + " historyRow" + rowClass + "'>" + serviceDateTime + "</div>"
				}
			} else {
				if (currentUser.userRole == "Admin" || currentUser.userRole == "TechAdmin"){
					newRow += "<div class='rowNum" + i + " historyRow editable" + rowClass + "' onclick='uiShowEditHistoryPopup(\""+clientHistory[i].serviceId+"\", \""+ i +"\")'>" + clientHistory[i][rowFields[f]] + "</div>"
				} else {
					newRow += "<div class='rowNum" + i + " historyRow" + rowClass + "'>" + clientHistory[i][rowFields[f]] + "</div>"
				}
			}
		}
		$(reactDiv).append(newRow) // changed for REACT migration from "#historyBottom"
	}
	// show higlighting on hovering
	$(".historyRow").hover(
	  function() {
			let num = this.classList.item(0)
	    $("."+num).addClass("highlight");
	  }, function() {
			let num = this.classList.item(0)
			$("."+num).removeClass("highlight");
	  }
	);
};

// *** MOVED TO REACT ***
// let uiShowLastServed = function() {
// 	let nextService = ""
// 	if (client.clientId != undefined){
// 		let visitHeader = "FIRST SERVICE VISIT";
// 		if (client.lastServed[0] != undefined) {
// 			let lastServed = utilCalcLastServedDays()
// 			if (lastServed.lowestDays != 10000) {
// 				if (lastServed.lowestDays == 0) {
// 					visitHeader = 'LAST SERVED TODAY'
// 				} else {
// 					let servedDate = moment().subtract(lastServed.lowestDays, "days");
// 					let displayLastServed = moment(servedDate).fromNow() //lastServedFood[0].serviceDateTime
// 					visitHeader = 'LAST SERVED ' + displayLastServed.toUpperCase()
// 					let nonUSDAServiceInterval = utilGetFoodInterval("NonUSDA")
// 					if (lastServed.lowestDays < nonUSDAServiceInterval){
// 						let nextServiceDays = (nonUSDAServiceInterval - lastServed.lowestDays)
// 						if (nextServiceDays == 1) {
// 							nextService = "<br>" + "Next service is tomorrow!"
// 						} else {
// 							let nextServiceDate = moment().add(nextServiceDays, "days")
// 							nextService = "<br>" + "Next service " + moment(nextServiceDate).format("dddd, MMMM Do") + "!"
// 						}
// 					}
// 				}
// 			}
// 		}
// 		$('#serviceLastVisit').html(visitHeader + nextService)
// 	}
// };

// Added primaryReactDiv as part of REACT migration
function uiShowPrimaryServiceButtons(primaryReactDiv, btnPrimary, lastVisit, activeServiceTypes) {
	let primaryButtons = ""
	if (btnPrimary == "-1") { // dependents grades requirement
		let btnClass = "btnAlert"
		primaryButtons += '<div class=\"' + btnClass + '\" id=\"btn-NeedGrade\">DEPENDENTS NEED GRADE UPDATED</div>';
	} else {
		for (let i=0; i<btnPrimary.length; i++){
			let x = btnPrimary[i]
			let btnClass = "btnPrimary"
			if ((activeServiceTypes[x].serviceCategory == "Administration") || (activeServiceTypes[x].isUSDA == "Emergency")) btnClass = "btnAlert"
			let attribs = "\'" + activeServiceTypes[x].serviceTypeId + "\', \'" + activeServiceTypes[x].serviceCategory + "\', \'" + activeServiceTypes[x].serviceButtons + "\'";
			let image = "<img id=\'image-" + activeServiceTypes[x].serviceTypeId + "\' src='public/images/PrimaryButton" + activeServiceTypes[x].serviceCategory + ".png" + ver + "'>";
			primaryButtons += '<div class=\"' + btnClass + '\" id=\"btn-'+ activeServiceTypes[x].serviceTypeId +'\" onclick=\"clickAddService('+ attribs +')\">' + activeServiceTypes[x].serviceName + "<br>" + image + "</div>";
		}
	}
	// replaced servicePrimaryButtons with primaryReactDiv
	$(primaryReactDiv).html(primaryButtons)

};

function uiShowReports(){
	$('#reportsFormContainer').html(uiGetTemplate('#reportsForm'))
	$('#reportsDailyDate').val(moment().format(date))
	$('#reportsMonthlyMonth').val(moment().format('YYYY-MM'))
	$('#reportsAnnualYear').val(moment().format('YYYY'))
	uiAddListOfVoucherServiceTypes(utilGetListOfVoucherServiceTypes())
	$('#reportVoucherDistroYear').val(moment().format('YYYY'))
	$('#reportVoucherCountYear').val(moment().format('YYYY'))
};

function uiRefreshReport(targetDiv){
	let title = 'TODAY'
	// temp fix during REACT migration - will need to be fixed for Admin/Reports
	// if (targetDiv == 'report') {
	// 	title = 'DAILY'
	// }
	uiShowDailyReportHeader(moment().format(dateTime), targetDiv, title)
	uiShowDailyReportRows(moment().format(date), targetDiv)
};

function uiShowDailyReportHeader(reportDate, targetDiv, name){
	const headerInfo = {
		 targetDiv: targetDiv,
		      name: name + ' REPORT',
		  category: 'FOOD PANTRY',
		reportDate: reportDate,
		   refresh: false,
		     print: true
	}
	// removed for REACT migration will need to be fixed for Admin Reports
	//if (targetDiv == 'today') { headerInfo.refresh = true }
	headerInfo.refresh = true // hard coded for REACT migration
	uiLoadReportHeader(headerInfo)
	uiSetPrintBodyTemplate('#dailyReportHeader', targetDiv)
};

function uiShowDailyReportRows(dayDate, targetDiv){
	targetDivId = '#' + targetDiv + 'BodyDiv'
	servicesRendered = dbGetDaysServices(dayDate)
	let servicesFood = servicesRendered
		.filter(item => item.serviceValid == 'true')
		.filter(item => item.serviceCategory == "Food_Pantry")
		.sort((a, b) => moment.utc(a.servicedDateTime).diff(moment.utc(b.servicedDateTime)))
	let servicesUSDA = servicesFood.filter(item => item.isUSDA == "USDA" || item.isUSDA == "Emergency")
	let servicesNonUSDA = servicesFood.filter(item => item.isUSDA == "NonUSDA")
	$(targetDivId).append('<div id="' + targetDiv + 'USDAGrid" class="todayReportRowBox" style="grid-row: 5"><div class="todaySectionHeader">USDA</div></div>')
	$(targetDivId).append('<div id="' + targetDiv + 'NonUSDAGrid" class="todayReportRowBox" style="grid-row: 6"><div class="todaySectionHeader">NonUSDA</div></div>')
	let totals = []
	totals.push(uiBuildTodayRows(servicesUSDA, "#" + targetDiv + "USDAGrid"))
	totals.push(uiBuildTodayRows(servicesNonUSDA, "#" + targetDiv + "NonUSDAGrid"))
	grandTotals = {hh:0, ind:0, ch:0, ad:0, sen:0, hf:0, hi:0, nf:0, ni:0}
	for (let key in grandTotals) {
		grandTotals[key] =  totals[0][key] + totals[1][key]
	}
	$(targetDivId).append('<div id="' + targetDiv + 'grandTotalGrid" class="todayReportRowBox" style="grid-row: 7"></div>')
	uiShowTodayTotals(grandTotals, "#" + targetDiv + "grandTotalGrid")
};

function uiLoadReportHeader(headerInfo){
	const targetPrefix = '#' + headerInfo.targetDiv
	const template = uiGetTemplate(targetPrefix + 'Header')
	$(targetPrefix + 'BodyDiv').html(template)
	$(targetPrefix + 'Name').html(headerInfo.name)
	uiSetReportHeaderDate(headerInfo.targetDate, headerInfo.targetDiv)
	$(targetPrefix + 'HeaderLeft').html(headerInfo.category)
	let report = 'REPORT '
	if (headerInfo.refresh) {report += '<i onClick="uiRefreshReport(\'' + headerInfo.targetDiv + '\')" class="fa fa-refresh" aria-hidden="true"></i>'}
	if (headerInfo.print) {report += ' <i onClick="utilPrintReport()" class="fa fa-print" aria-hidden="true"></i>'}
	$(targetPrefix + 'HeaderRight').html(report)
};

function uiSetReportHeaderDate(reportDate, targetDiv) {
	if (reportDate == '') {
		reportDate = moment().format(longDate)
	} else if (moment(reportDate).format(date) == moment().format(date)) {
		reportDate = moment().format(longDate)
	} else {
		reportDate = moment(reportDate).format("MMMM Do, YYYY")
	}
	$('#' + targetDiv + 'Dates').html(reportDate)
}

function uiShowFamiliesReportHeader(reportType) {
	let headerInfo = {
		 targetDiv: 'report',
	      	name: 'FAMILIES WITH CHILDREN',
		  category: 'FAMILIES',
		reportDate: '',
		   refresh: false,
	     	 print: true
	}
	let template = "#reportFamiliesChildrenHeader"
	if (reportType == "Homeless") {
		headerInfo.name = "HOMELESS FAMILIES"
		template = "#reportFamiliesHomelessHeader"
	}
	uiLoadReportHeader(headerInfo)
	uiSetPrintBodyTemplate(template, headerInfo.targetDiv)
};

function uiSetPrintBodyTemplate(template, targetDiv){
	$('#' + targetDiv + 'BodyDiv').append(uiGetTemplate(template))
};

function uiShowFamiliesReportRows(reportType) {
	const grid = "#familiesGridInner"
	$("#reportBodyDiv").append('<div id="familiesGrid" class="familiesRowContainer"></div>')
	for (var i = 1; i < 4600; i++) {
		let c = dbGetData(aws+"/clients/" + i)
		if (c.count > 0) {
			c = c.clients
		} else {
			continue
		}
		let lastVisit = c[0].lastServed.sort((a, b) => moment.utc(b.serviceDateTime).diff(moment.utc(a.serviceDateTime)))
		if (lastVisit.length > 0) {
			lastVisit = moment(lastVisit[0].serviceDateTime).format(uiDate)
		} else {
			lastVisit = " "
		}
		if (c.length == 1 && moment().diff(lastVisit, "days") < 365) {
			const d = c[0].dependents
			let childRows = []
			$.each(d, function(index,item){
				const childAge = moment().diff(item.dob, "years")
				if ( childAge < 18) {
					let childRow = {
						name: item.givenName + " " + item.familyName,
						age: childAge,
						gender: item.gender,
						grade: item.grade
					}
					childRows.push(childRow)
				}
			})
			if (d.length > 0 && childRows.length > 0) {
				$("#familiesGrid").append('<div id="familiesGridInner" class="familiesRowBox"></div>')
				$(grid).append('<div class="monthItem secondary" style="grid-row: span ' + (childRows.length + 1) + '; font-weight: bold;">' + i +'</div>')
				$(grid).append('<div class="monthItem secondary" style="font-weight: bold; text-align: left; padding-left: 12px">' + c[0].givenName + ' ' + c[0].familyName + '</div>')
				$(grid).append('<div class="monthItem secondary" style="font-weight: bold;">' + c[0].telephone +'</div>')
				$(grid).append('<div class="monthItem secondary" style="font-weight: bold;">' + c[0].zipcode +'</div>')
				$(grid).append('<div class="monthItem secondary" style="font-weight: bold;">' + lastVisit +'</div>')
				for (var x = 0; x < childRows.length; x++) {
					$(grid).append('<div class="monthItem" style="text-align: left; padding-left: 12px">' + childRows[x].name +'</div>')
					$(grid).append('<div class="monthItem">' + childRows[x].age +'</div>')
					$(grid).append('<div class="monthItem">' + childRows[x].gender +'</div>')
					$(grid).append('<div class="monthItem">' + childRows[x].grade +'</div>')
				}
			}
		}
	}
};

function uiShowVoucherReportHeader(year, reportType, targetType, serviceType){
	const headerInfo = {
		 targetDiv: 'report',
		      name: serviceType.serviceName + ' ' + reportType,
		  category: serviceType.serviceCategory.replace(/_/g,' '),
		reportDate: '',
		   refresh: false,
		     print: true
	}
	uiLoadReportHeader(headerInfo)
	if (reportType == 'Distro') { targetType = '' }
	const template = '#reportVoucher' + targetType + reportType + 'Header'
	uiSetPrintBodyTemplate(template, headerInfo.targetDiv)
};
function uiShowAnnualReportHeader(year, reportType){
	let headerInfo = {
		 targetDiv: 'report',
		      name: 'ANNUAL REPORT',
		  category: 'FOOD PANTRY',
		reportDate: '',
		   refresh: false,
		     print: true
	}
	let template = '#annualFoodReportHeader'
	uiLoadReportHeader(headerInfo)
	uiSetPrintBodyTemplate(template, headerInfo.targetDiv)
};

function uiShowMonthlyReportHeader(monthYear, reportType){
	let headerInfo = {
		 targetDiv: 'report',
		      name: 'MONTHLY REPORT',
		  category: 'FOOD PANTRY',
		reportDate: '',
		   refresh: false,
		     print: true
	}
	let template = '#foodBodyHeader'
	if (reportType == 'ALL') {
		headerInfo.category = 'ALL SERVICES'
		template = '#allServicesBodyHeader'
	}
	uiLoadReportHeader(headerInfo)
	uiSetPrintBodyTemplate(template, headerInfo.targetDiv)
};

function utilPrintReport(){
	//let path = window.location.href + "css/reports.css"     // Returns full URL
	$("#reportBodyDiv").printMe({ "path": ["css/print-v4.css"] });
};

function uiShowVoucherReportRows(year, reportType, targetType, serviceType){
	let count = []
	let fulfillmentService = utilGetFulfillmentServiceByID(serviceType.serviceTypeId)[0]
	if (fulfillmentService == undefined) {
		let message = 'No Matching Fulfillment Service Exists! <br> Add or Assign a Fulfillment Service.'
		uiShowHideError('show', 'Missing Fulfillment Service', message, 'beep')
		return 'failed'
	}
	let servicesVouchers = dbGetServicesByIdAndYear(serviceType.serviceTypeId, year)

console.log(servicesVouchers.length)

	if (servicesVouchers.length < 1) {
		let message = 'No service Records were found!'
		uiShowHideError('show', 'No Services', message, 'beep')
		return 'failed'
	}
	let servicesFulfillment = []
	if (reportType == "Distro") { 				// Distro Report
		servicesVouchers = servicesVouchers
			.sort(function(a, b){
				let nameA= a.clientFamilyName.toLowerCase() + a.clientGivenName.toLowerCase()
				let nameB= b.clientFamilyName.toLowerCase() + b.clientGivenName.toLowerCase()
				if (nameA < nameB) return -1
				if (nameA > nameB) return 1
			  return 0; //default return value (no sorting)
			})
		uiBuildVoucherDistroRows(servicesVouchers, targetType)
	} else { // Count Report
		servicesFulfillment = dbGetServicesByIdAndYear(fulfillmentService.serviceTypeId, year)
		// Count Grade Report
		if (targetType == 'Grades') {
			count = [
			 	{grp: "K", b: 0, g: 0, bd: 0, gd: 0},
				{grp: "1-2", b: 0, g: 0, bd: 0, gd: 0},
				{grp: "3-5", b: 0, g: 0, bd: 0, gd: 0},
				{grp: "6-8", b: 0, g: 0,  bd: 0, gd: 0},
				{grp: "9", b: 0, g: 0,  bd: 0, gd: 0},
				{grp: "10-12", b: 0, g: 0, bd: 0, gd: 0},
				{grp: "ALL GROUPS", b: 0, g: 0, bd: 0, gd: 0}
			]
			$.each(servicesVouchers, function(i, service){
				const c = dbGetData(aws+"/clients/" + service.clientServedId).clients
				const d = c[0].dependents.filter( obj => obj.isActive == "Active")
				$.each(d, function(di, dependent){
					const gradeGroup = utilCalcGradeGrouping(dependent)
					if (gradeGroup == "Unable to Calculate Grade Level") {
						return
					}
					const gradeGroups = ["K", "1-2", "3-5", "6-8", "9", "10-12"]
					let gg = gradeGroups.findIndex(i => i == gradeGroup)
					let gender = "g"
					if (dependent.gender == "Male") {gender = "b"}
					count[gg][gender]++ // add one to count
					count[6][gender]++ // add one to count
					let fulfillment = servicesFulfillment // filter out other clients
								.filter(item => item.clientServedId == service.clientServedId)
					if (fulfillment.length > 0) {
						let deliv = gender + "d"
						count[gg][deliv]++ // add one to count
						count[6][deliv]++
					}
				})
			})
		} else if (targetType == 'Ages') {
			// Count Grade Report
			count = [
			 	{grp: "0-1", b: 0, g: 0, bd: 0, gd: 0},
				{grp: "2-3", b: 0, g: 0, bd: 0, gd: 0},
				{grp: "4-6", b: 0, g: 0, bd: 0, gd: 0},
				{grp: "7-8", b: 0, g: 0,  bd: 0, gd: 0},
				{grp: "9-10", b: 0, g: 0,  bd: 0, gd: 0},
				{grp: "11-12", b: 0, g: 0, bd: 0, gd: 0},
				{grp: "13-17", b: 0, g: 0, bd: 0, gd: 0},
				{grp: "ALL GROUPS", b: 0, g: 0, bd: 0, gd: 0}
			]
			$.each(servicesVouchers, function(i, service){
				const c = dbGetData(aws+"/clients/" + service.clientServedId).clients
				let d = c[0].dependents.filter( obj => obj.isActive == "Active")
				d = utilCalcDependentsAges(d)
				$.each(d, function(di, dependent){
					const ageGroup = utilCalcAgeGrouping(dependent)
					if (ageGroup == "Unable to Calculate Age Level") {
						return
					}
					const ageGroups = ["0-1", "2-3", "4-6", "7-8", "9-10", "11-12", "13-17"]
					let grp = ageGroups.findIndex(i => i == ageGroup)
					let gender = "g"
					if (dependent.gender == "Male") {gender = "b"}
					count[grp][gender]++ // add one to count
					count[7][gender]++ // add one to count
					let fulfillment = servicesFulfillment // filter out other clients
								.filter(item => item.clientServedId == service.clientServedId)
					if (fulfillment.length > 0) {
						let deliv = gender + "d"
						count[grp][deliv]++ // add one to count
						count[7][deliv]++
					}
				})
			})
		} else {
			// Count No dependents targeted Report
			count = [{ r: 0, d: 0 }] // registered/delivered
			$.each(servicesVouchers, function(i, service){
				count[0].r ++ // add one to count
				let fulfillment = servicesFulfillment // filter out other clients
				 			.filter(item => item.clientServedId == service.clientServedId)
			 	if (fulfillment.length > 0) {
					count[0].d ++ // add one to count
			 	}
			})
		}
		uiBuildVoucherCountRows(count, targetType)
	}
};

function utilUpdateClientGlobals() {
	client = window.client
	clientData = window.clientData
	servicesRendered = window.servicesRendered
}

function utilGetServicesInMonth(monthYear){
	const currentMonth = moment().format("YYYY-MM")
	let daysInMonth = moment(monthYear, "YYYY-MM").daysInMonth()
	if (monthYear == currentMonth) daysInMonth = moment().format("D")
	let servicesRendered = []
	daysInMonth = parseInt(daysInMonth) + 1
	for (var i = 1; i < daysInMonth; i++) {
		let day = String(i)
		if (day.length == 1) day = "0" + day
		let dayDate = monthYear + "-" + day
		dayOfServices = dbGetDaysServices(dayDate)
		servicesRendered = servicesRendered.concat(dayOfServices)

	}
	return servicesRendered
}
function utilCalcUSDANonUSDAServices(servicesRendered){
	let servicesFood = servicesRendered
		.filter(item => item.serviceCategory == "Food_Pantry")
		.sort((a, b) => parseInt(a.servicedDay) - parseInt(b.servicedDay))
	let dayUSDA = ""
	let servicesUSDA = servicesFood
		.filter(item => item.isUSDA == "USDA" || item.isUSDA == "Emergency")
	let servicesNonUSDA = servicesFood
		.filter(item => item.isUSDA == "NonUSDA")
	return {
		"USDA":servicesUSDA,
		"Non_USDA":servicesNonUSDA
	}
}
function utilBuildUniqueTotalCountsObject(){
	let uniqueTotalCounts = {
		uTotalUnique: "",
		nTotalUnique: "",
		gTotalUnique: ""
	}
	for (let key in uniqueTotalCounts){
		uniqueTotalCounts[key] = {ids:[],hh:0, ind:0, ch:0, ad:0, sen:0, hf:0, hi:0, nf:0, ni:0}
	}
	return uniqueTotalCounts
}
function utilCalcAnnualFoodReport(year){
	console.log(year)
	let duplicateMonthCounts = []
	let uniqueQuarterCounts = []
	for (let quarter = 0; quarter<4; quarter++){
		let uniqueTotalCounts = utilBuildUniqueTotalCountsObject()
		for (let i = (quarter*3)+1; i < (quarter*3)+4; i++){
			let month = i.toString()
			if (month.length == 1){
				month = "0"+month
			}
			let monthYear = year+"-"+month
			while ($.active){
				//do nothing
			}
			const currentMonth = moment().format("YYYY-MM")
			const momentMonth = moment(monthYear).format("YYYY-MM")
			if (momentMonth > currentMonth){
				break
			}
			servicesRendered =  utilGetServicesInMonth(monthYear)
			servicesRendered = servicesRendered
				.filter(item => item.serviceValid == 'true')
			services = utilCalcUSDANonUSDAServices(servicesRendered)
			servicesUSDA = services["USDA"]
			servicesNonUSDA = services["Non_USDA"]
			servicesUSDA = utilCalcMonthlyRows(servicesUSDA, uniqueTotalCounts, "uTotalUnique")
			servicesNonUSDA = utilCalcMonthlyRows(servicesNonUSDA, uniqueTotalCounts, "nTotalUnique")
			let total = utilGetMonthlyTotalCounts(servicesUSDA, servicesNonUSDA, monthYear)
			console.log("MONTHLY TOTAL")
			console.log(total)
			console.log("UNIQUE TOTAL")
			console.log(uniqueTotalCounts)
			duplicateMonthCounts.push(total)
		}
		uniqueQuarterCounts.push(uniqueTotalCounts)
	}
	return {
		"byQuarter":uniqueQuarterCounts,
		"byMonth":duplicateMonthCounts
	}
}
function uiShowMonthlyReportRows(monthYear, reportType, uniqueTotalCounts){
	let servicesRendered = utilGetServicesInMonth(monthYear)
	servicesRendered = servicesRendered
		.filter(item => item.serviceValid == 'true')
	// Food Report
	if (reportType == "FOOD") {
		services = utilCalcUSDANonUSDAServices(servicesRendered)
		servicesUSDA = services["USDA"]
		servicesNonUSDA = services["Non_USDA"]
		servicesUSDA = utilCalcMonthlyRows(servicesUSDA, uniqueTotalCounts, "uTotalUnique")
		servicesNonUSDA = utilCalcMonthlyRows(servicesNonUSDA, uniqueTotalCounts, "nTotalUnique")
		uiBuildFoodMonthRows(servicesUSDA, servicesNonUSDA, monthYear, uniqueTotalCounts)
	} else {
		// Other Services Report
		servicesRendered = servicesRendered
			.sort(function(a, b){
				const catA = a.serviceCategory.toLowerCase()
				const catB = b.serviceCategory.toLowerCase()
				if (catA == catB) {
					const servA = a.serviceName.toLowerCase()
					const servB = b.serviceName.toLowerCase()
					if (servA < servB) return -1
					if (servA > servB) return 1
					return 0; //default return value (no sorting)
				} else {
					if (catA < catB) return -1
					if (catA > catB) return 1
				}
			})
		uiBuildAllServicesMonthRows(servicesRendered)
	}
};

function utilCalcMonthlyRows(services, uniqueTotalCounts, countType){
	let tempS = []
	$.each(services, function(i, item){
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
			item.totalHouseholdsServed = 1
			tempS[index].totalHouseholdsServed = parseInt(tempS[index].totalHouseholdsServed) + 1
			tempS[index].totalIndividualsServed = parseInt(tempS[index].totalIndividualsServed) + parseInt(item.totalIndividualsServed)
			tempS[index].totalChildrenServed = parseInt(tempS[index].totalChildrenServed) + parseInt(item.totalChildrenServed)
			tempS[index].totalAdultsServed = parseInt(tempS[index].totalAdultsServed) + parseInt(item.totalAdultsServed)
			tempS[index].totalSeniorsServed = parseInt(tempS[index].totalSeniorsServed) + parseInt(item.totalSeniorsServed)
			item.totalHomelessInd = 0
			item.totalHomelessFamily = 0
			if (item.homeless == "YES") {
				if (item.totalIndividualsServed == 1) {
					item.totalHomelessInd = 1
					tempS[index].totalHomelessInd = parseInt(tempS[index].totalHomelessInd) + 1
				} else {
					item.totalHomelessFamily = 1
					tempS[index].totalHomelessFamily = parseInt(tempS[index].totalHomelessFamily) + 1
				}
			}
			item.totalNonClientInd = 0
			item.totalNonClientFamily = 0
			if (item.clientStatus != "Client") {
				if (item.totalIndividualsServed == 1) {
					item.totalNonClientInd = 1
					tempS[index].totalNonClientInd = parseInt(tempS[index].totalNonClientInd) + 1
				} else {
					item.totalNonClientFamily = 1
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
			//console.log(uniqueTotalCounts)
			//console.log(tempS)
		}
		const clientId = item['clientServedId']
		const keyFull = {
			 hh:'totalHouseholdsServed',
			ind:'totalIndividualsServed',
			 ch:'totalChildrenServed',
			 ad:'totalAdultsServed',
			sen:'totalSeniorsServed',
			 hf:'totalHomelessFamily',
			 hi:'totalHomelessInd',
			 nf:'totalNonClientFamily',
			 ni:'totalNonClientInd'
		 }
		 const isInClientType = !uniqueTotalCounts[countType]['ids'].includes(clientId)
		 const isInGlobal = !uniqueTotalCounts["gTotalUnique"]['ids'].includes(clientId)
		 for (let key in keyFull) {
				keyFullName = keyFull[key]
				totalValue = parseInt(item[keyFullName])
				if (isInClientType){
					uniqueTotalCounts[countType][key] += totalValue
				}
				if (isInGlobal){
					uniqueTotalCounts["gTotalUnique"][key] += totalValue
				}
		}
		utilAddClientIfUnique(uniqueTotalCounts, countType, clientId)
		utilAddClientIfUnique(uniqueTotalCounts, "gTotalUnique", clientId)
	})
	return tempS
};

function uiBuildTodayRows(services, grid) {
	let serviceTotal = {hh:0, ind:0, ch:0, ad:0, sen:0, hf:0, hi:0, nf:0, ni:0}
	$.each(services, function(i,item){
		serviceTotal.hh++
		serviceTotal.ind = serviceTotal.ind + parseInt(item.totalIndividualsServed)
		serviceTotal.ch = serviceTotal.ch + parseInt(item.totalChildrenServed)
		serviceTotal.ad = serviceTotal.ad + parseInt(item.totalAdultsServed)
		serviceTotal.sen = serviceTotal.sen + parseInt(item.totalSeniorsServed)
		$(grid).append('<div class="todayItem">' + item.clientServedId + '</div>')
		$(grid).append('<div class="todayItemLeft">'+item.clientGivenName+'</div>')
		$(grid).append('<div class="todayItemLeft">'+item.clientFamilyName+'</div>')
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
				serviceTotal.hi = serviceTotal.hi + parseInt(item.totalIndividualsServed)
				$(grid).append('<div class="todayItem">1</div>')
				$(grid).append('<div class="todayItem">'+item.totalIndividualsServed+'</div>')
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
				serviceTotal.ni = serviceTotal.ni + parseInt(item.totalIndividualsServed)
				$(grid).append('<div class="todayItem">1</div>')
				$(grid).append('<div class="todayItem">'+item.totalIndividualsServed+'</div>')
			}
		}
	})
	uiShowTodayTotals(serviceTotal, grid)
	return serviceTotal
};

function uiBuildVoucherCountRows(count, targetType) {
	let total = 0
	const grid = '#voucherGrid'
	$("#reportBodyDiv").append('<div id="voucherGrid" class="voucherRowBox voucherCount" style="grid-row: 5"></div>')
	for (let c = 0; c < count.length; c++) {
		let itemCount = 0
		const row = count[c]
		let style = ""
		if (c == count.length -1) {
			style = ' style="border-top: 1px solid var(--green);"'
		}
		if (targetType == 'Grades' || targetType == 'Ages') {
			$(grid).append('<div class="gradeGroup"' + style + '>' + row.grp +'</div>')
			$(grid).append('<div class="monthItem secondary"' + style + '>Boys</div>')
			$(grid).append('<div class="monthItem secondary"' + style + '>' + row.b +'</div>')
			$(grid).append('<div class="monthItem secondary"' + style + '>' + row.bd +'</div>')
			$(grid).append('<div class="monthItem">Girls</div>')
			$(grid).append('<div class="monthItem">' + row.g +'</div>')
			$(grid).append('<div class="monthItem">' + row.gd +'</div>')
		} else {
			const noshow = row.r - row.d
			const percDelivery = Math.round(100 * row.d / row.r)
			$(grid).append('<div class="monthItem secondary"' + style + '>' + row.r + '</div>')
			$(grid).append('<div class="monthItem secondary"' + style + '>' + row.d + '</div>')
			$(grid).append('<div class="monthItem secondary"' + style + '>' + noshow  + '</div>')
			$(grid).append('<div class="monthItem secondary"' + style + '>' + percDelivery + '%</div>')
		}
	}

	if (targetType == 'Grades' || targetType == 'Ages') {
		let total = count[6].b + count[6].g
		let deliv = count[6].bd + count[6].gd
		if (targetType == 'Ages') {
			total = count[7].b + count[7].g
			deliv = count[7].bd + count[7].gd
		}
		$(grid).append('<div class="monthItem grandTotal">GRAND TOTAL</div>')
		$(grid).append('<div class="monthItem grandTotal">BOYS & GIRLS</div>')
		$(grid).append('<div class="monthItem grandTotal">' + total +'</div>')
		$(grid).append('<div class="monthItem grandTotal">' + deliv +'</div>')
		$(grid).append('<div class="blankRow4">&nbsp;</div>')
	}
};

function uiBuildVoucherDistroRows(servicesVouchers, targetType) {
	let total = 0
	const grid = "#voucherGrid"
	$("#reportBodyDiv").append('<div id="voucherGrid" class="voucherRowBox voucherDistro" style="grid-row: 5"></div>')
	for (let r = 0; r < servicesVouchers.length; r++) {
		let itemCount = 0
		const sv = servicesVouchers[r]
		if (targetType == 'Grades' || targetType == 'Ages') {
			const c = dbGetData(aws+"/clients/" + sv.clientServedId).clients
			let d = c[0].dependents.filter( obj => obj.isActive == "Active")
			// need to calculate ages off all Active dependents first
			if (targetType == 'Ages') d = utilCalcDependentsAges(d)
			$.each(d, function(di, dependent){
				if (targetType == 'Grades') {
					const gradeGroup = utilCalcGradeGrouping(dependent)
					if (gradeGroup == "Unable to Calculate Grade Level") {
						return
					} else {
						itemCount += 1
					}
				} else if (targetType == 'Ages') {
					const ageGroup = utilCalcAgeGrouping(dependent)
					if (ageGroup == "Unable to Calculate Age Level") {
						return
					} else {
						itemCount += 1
					}
				}
			})
			console.log("Families")
		} else {
			itemCount = 1
			console.log("Individuals")
		}
		total = total + itemCount
		$(grid).append('<div class="monthItem">' + sv.clientServedId +'</div>')
		$(grid).append('<div class="monthItem" style="text-align: left; padding-left: 12px;"><b>' + sv.clientFamilyName + "</b>, " + sv.clientGivenName + '</div>')
		$(grid).append('<div class="monthItem"></div>')
		$(grid).append('<div class="monthItem">' + itemCount +'</div>')
	}
	$(grid).append('<div class="monthItem grandTotal">Total</div>')
	$(grid).append('<div class="monthItem grandTotal">' + servicesVouchers.length + '</div>')
	$(grid).append('<div class="monthItem grandTotal">&nbsp;</div>')
	$(grid).append('<div class="monthItem grandTotal">' + total + '</div>')
	$(grid).append('<div class="blankRow4">&nbsp;</div>')
};

function uiBuildAllServicesMonthRows(services) {
	let category = "", service = "", counts = {}, grid = "#allServicesGrid", last = services.length - 1
	$("#reportBodyDiv").append('<div id="allServicesGrid" class="allServicesRowBox" style="grid-row: 4"></div>')
	for (let i = 1; i < services.length; i++) {
		if (category != services[i].serviceCategory) {
			if (service != "") {
				$(grid).append('<div class="monthItem"></div><div class="servHeader">' + service + '</div>')
				$(grid).append('<div class="monthItem">' + counts.hh + '</div>')
				$(grid).append('<div class="monthItem">' + counts.ind + '</div>')
				$(grid).append('<div class="monthItem">' + counts.itm + '</div>')
			}
			category = services[i].serviceCategory
			service = services[i].serviceName
			counts = {hh: 1, ind: parseInt(services[i].totalIndividualsServed), itm: parseInt(services[i].itemsServed)}
			$(grid).append('<div class="catHeader">'+ category.toUpperCase().replace("_", " ").replace("_", " ") + '</div>') // double replace to deal with terms that have two underscores
		} else {
			if (service != services[i].serviceName || last == i){
				$(grid).append('<div class="monthItem"></div><div class="servHeader">' + service + '</div>')
				$(grid).append('<div class="monthItem">' + counts.hh + '</div>')
				$(grid).append('<div class="monthItem">' + counts.ind + '</div>')
				$(grid).append('<div class="monthItem">' + counts.itm + '</div>')
				service = services[i].serviceName
				counts = {hh: 1, ind: parseInt(services[i].totalIndividualsServed), itm: parseInt(services[i].itemsServed)}
			} else {
				counts.hh++
				counts.ind = counts.ind + parseInt(services[i].totalIndividualsServed)
				counts.itm = counts.itm + parseInt(services[i].itemsServed)
			}
		}
	}
	$(grid).append('<div class="catHeader">&nbsp;</div>')
	$(grid).append('<div class="monthItem">&nbsp;</div><div class="monthItem"></div><div class="monthItem"></div><div class="monthItem"></div><div class="monthItem"></div>')
};
function utilAddClientIfUnique(uniqueTotalCounts, countType, clientId){
  if (!uniqueTotalCounts[countType]['ids'].includes(clientId)) uniqueTotalCounts[countType]['ids'].push(clientId)
}
function uiBuildTotalRow(grid, totals, total, name){
  $(grid).append('<div class="monthTotal">'+name+'</div>')
	for (let key in totals[total]) {
    if (!(key === "ids")) $(grid).append('<div class="monthTotal">'+ totals[total][key] +'</div>')
	}
}
function uiBuildAnnualRow(grid, totals, name){
  $(grid).append('<div class="monthTotal">'+name+'</div>')
	$(grid).append('<div class="monthTotal">'+ totals['uTotal']['hh'] +'</div>')
	$(grid).append('<div class="monthTotal">'+ totals['nTotal']['hh'] +'</div>')
	$(grid).append('<div class="monthTotal">'+ totals['gTotal']['hh'] +'</div>')
	$(grid).append('<div class="monthTotal">'+ totals['uTotal']['ind'] +'</div>')
	$(grid).append('<div class="monthTotal">'+ totals['nTotal']['ind'] +'</div>')
	$(grid).append('<div class="monthTotal">'+ totals['gTotal']['ind'] +'</div>')
	$(grid).append('<div class="monthTotal">'+ totals['uTotal']['ch'] +'</div>')
	$(grid).append('<div class="monthTotal">'+ totals['nTotal']['ch'] +'</div>')
	$(grid).append('<div class="monthTotal">'+ totals['gTotal']['ch'] +'</div>')
}
function utilGetMonthlyTotalCounts(u,n,monthYear){
	let numDays = moment(monthYear, "YYYY-MM").endOf("month").format("DD")
	numDays = parseInt(numDays) + 1
  let totals = {
    uTotalServices: "",
    nTotalServices: "",
    gTotalServices: ""
  }
  for (let key in totals){
    totals[key] = {ids:[],hh:0, ind:0, ch:0, ad:0, sen:0, hf:0, hi:0, nf:0, ni:0}
  }
	let yearMonth = u[0].servicedDay.substring(0,6)
	let gridRow = 0
	for (let d = 1; d < numDays; d++) {
		let servicedDay = String(d)
		if (servicedDay.length < 2) servicedDay = "0"+servicedDay
		servicedDay = yearMonth + servicedDay
		let hasUSDA = false, hasNonUSDA = false
		let servicedDate = moment(servicedDay, "YYYYMMDD").format("MM/DD/YYYY")
		let uDay = u.filter(function(item) {return item.servicedDay == servicedDay})
		let nDay = n.filter(function(item) {return item.servicedDay == servicedDay})
		if ((uDay.length == 1)||(nDay.length == 1)){
			gridRow = 4 + d
			let dTotal = {hh:0, ind:0, ch:0, ad:0, sen:0, hf:0, hi:0, nf:0, ni:0}
			const keyFull = {
				 hh:'totalHouseholdsServed',
				ind:'totalIndividualsServed',
				 ch:'totalChildrenServed',
				 ad:'totalAdultsServed',
				sen:'totalSeniorsServed',
				 hf:'totalHomelessFamily',
				 hi:'totalHomelessInd',
				 nf:'totalNonClientFamily',
				 ni:'totalNonClientInd'}
			// show day USDA
			if (uDay.length == 1) {
				// calculate day USDA totals
        let clientId = parseInt(uDay[0]['clientServedId'])
				console.log(uDay)
				for (let key in keyFull) {
					keyFullName = keyFull[key]
					dTotal[key] = parseInt(uDay[0][keyFullName])
					totals['uTotalServices'][key] += dTotal[key]
					totals['gTotalServices'][key] += dTotal[key]
				}
			}
			if (nDay.length == 1) {
				// calculate day NonUSDA totals
        let clientId = parseInt(nDay[0]['clientServedId'])
        for (let key in dTotal) {
					keyFullName = keyFull[key]

					totals['nTotalServices'][key] += parseInt(nDay[0][keyFullName])
					totals['gTotalServices'][key] += parseInt(nDay[0][keyFullName])

				}
			}
		}
	}
	return totals
}
function uiBuildFoodMonthRows(u, n, monthYear, uniqueTotalCounts) {
	let numDays = moment(monthYear, "YYYY-MM").endOf("month").format("DD")
	numDays = parseInt(numDays) + 1
  let totals = {
    uTotalServices: "",
    nTotalServices: "",
    gTotalServices: ""
  }
  for (let key in totals){
    totals[key] = {ids:[],hh:0, ind:0, ch:0, ad:0, sen:0, hf:0, hi:0, nf:0, ni:0}
  }
	let yearMonth = u[0].servicedDay.substring(0,6)
	let gridRow = 0
	for (let d = 1; d < numDays; d++) {
		let servicedDay = String(d)
		if (servicedDay.length < 2) servicedDay = "0"+servicedDay
		servicedDay = yearMonth + servicedDay
		let hasUSDA = false, hasNonUSDA = false
		let servicedDate = moment(servicedDay, "YYYYMMDD").format("MM/DD/YYYY")
		let uDay = u.filter(function(item) {return item.servicedDay == servicedDay})
		let nDay = n.filter(function(item) {return item.servicedDay == servicedDay})
		let grid = "#monthlyGrid" + d
		if ((uDay.length == 1)||(nDay.length == 1)){
			gridRow = 4 + d
			$("#reportBodyDiv").append('<div id="monthlyGrid'+ d +'" class="foodRowBox" style="grid-row: '+ gridRow +'"></div>')
			let dTotal = {hh:0, ind:0, ch:0, ad:0, sen:0, hf:0, hi:0, nf:0, ni:0}
			const keyFull = {
				 hh:'totalHouseholdsServed',
				ind:'totalIndividualsServed',
				 ch:'totalChildrenServed',
				 ad:'totalAdultsServed',
				sen:'totalSeniorsServed',
				 hf:'totalHomelessFamily',
				 hi:'totalHomelessInd',
				 nf:'totalNonClientFamily',
				 ni:'totalNonClientInd'}
			// show day USDA
			if (uDay.length == 1) {
				// calculate day USDA totals
				$(grid).append('<div class="monthItem">USDA</div>')
        let clientId = parseInt(uDay[0]['clientServedId'])
				console.log(uDay)
				for (let key in keyFull) {
					keyFullName = keyFull[key]
					dTotal[key] = parseInt(uDay[0][keyFullName])
					totals['uTotalServices'][key] += dTotal[key]
					$(grid).append('<div class="monthItem">'+ dTotal[key] +'</div>')
				}
			}
			$(grid).append('<div class="monthItem">NonUSDA</div>')
			if (nDay.length == 1) {
				// calculate day NonUSDA totals
        let clientId = parseInt(nDay[0]['clientServedId'])
        for (let key in dTotal) {
					keyFullName = keyFull[key]

					totals['nTotalServices'][key] += parseInt(nDay[0][keyFullName])
					// calculate Day total
					dTotal[key] += parseInt(nDay[0][keyFullName])
					// show day nonUSDA totals
					$(grid).append('<div class="monthItem">'+ nDay[0][keyFullName] +'</div>')
				}
			} else {
				for (let key in dTotal) {
					$(grid).append('<div class="monthItem">0</div>')
				}
			}
			// show day totals & add grandTotals
			$(grid).append('<div class="monthTotal">'+servicedDate+'</div>')
			for (let key in dTotal) {
				$(grid).append('<div class="monthTotal">'+ dTotal[key] +'</div>')
				totals['gTotalServices'][key] += dTotal[key]
			}
		}
	}
	gridRow = gridRow + 1
	$("#reportBodyDiv").append('<div id="monthlyGridTotal" class="foodRowBox" style="grid-row: '+ gridRow +'; height: 140px; grid-template-rows: 35px 35px 35px 35px;"></div>')
	grid = "#monthlyGridTotal"
  $(grid).append('<div class="todaySectionHeader" style="grid-column: span 10;">All Client Services</div>')
	uiBuildTotalRow(grid, totals, 'uTotalServices','USDA')
  uiBuildTotalRow(grid, totals, 'nTotalServices','NonUSDA')
  uiBuildTotalRow(grid, totals, 'gTotalServices','TOTAL')
  gridRow = gridRow + 1
  $("#reportBodyDiv").append('<div id="monthlyGridTotal2" class="foodRowBox" style="grid-row: '+ gridRow +'; height:140px; grid-template-rows: 35px 35px 35px 35px;"></div>')
  grid = "#monthlyGridTotal2"
  $(grid).append('<div class="todaySectionHeader" style="grid-column: span 10;">Unique Clients Served</div>')
	uiBuildTotalRow(grid, uniqueTotalCounts, 'uTotalUnique','USDA')
  uiBuildTotalRow(grid, uniqueTotalCounts, 'nTotalUnique','NonUSDA')
  uiBuildTotalRow(grid, uniqueTotalCounts, 'gTotalUnique','TOTAL')
};

function uiShowTodayTotals(serviceTotal, grid) {
	let label = "USDA TOTALS"
	if (grid.includes("NonUSDAGrid")) label = "NonUSDA TOTALS"
	if (grid == "#todaygrandTotalGrid") label = "TODAY'S GRAND TOTALS"
	if (grid == "#reportgrandTotalGrid") label = "DAY'S GRAND TOTALS"
	$(grid).append('<div class="todayTotalLable">'+label+'</div>')
	for (let key in serviceTotal) {
		$(grid).append('<div class="todayTotalItem">'+ serviceTotal[key] +'</div>')
	}
};

// created this function to call directly from REACT durring transition
function uiShowServicesDateTimeREACT(reactDiv) {
	if (client.clientId != undefined){
		$(reactDiv).html(moment().format(longDate))
	}
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

function uiShowClientEdit(reactDiv, isEdit){
	// removed for REACT uiShowNotes("Client Notes")
	// replaced 'clientFormContainer' with reactDiv for migration
	$(reactDiv).html(uiGetTemplate('#clientForm'))
	$('#clientSaveButton.newOnly').remove()
	uiPopulateForm(client, 'clientForm')
	if (isEdit){
		uiToggleClientViewEdit('edit')
	} else {
		uiToggleClientViewEdit('view')
	}
	uiShowDependents(isEdit)
	// uiShowExistingNotes("loading")
	// dbLoadNotes(client.clientId)
};

function uiShowDependents(isEdit){
	if (client.dependents!=null){
		client.dependents = client.dependents.sort(function(a, b){
		 			let nameA= a.givenName.toLowerCase() + a.familyName.toLowerCase()
					let nameB= b.givenName.toLowerCase() + b.familyName.toLowerCase()
		 			if (nameA < nameB) return -1
		 			if (nameA > nameB) return 1
		 		return 0; //default return value (no sorting)
				})
		uiGenSelectHTMLTable('#dependentsFormContainer',client.dependents,["givenName","familyName",'relationship','gender', "dob","age", "grade","isActive"],'dependentsTable')
	}
};

function uiShowNewServiceTypeForm(){
	$('#serviceTypeFormContainer').html(uiGetTemplate('#serviceTypeForm'))
	$('#serviceTypeId').val(cuid())
	navGotoTab("aTab2")
	// TODO from does not seem to be getting updated by the following functions
	uiPopulateServiceCategories()
	uiPopulateTargetServiceSelect()
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

function uiShowNote(index, dateTime, text, user, important){
	let clickableRow = ""
	// if (session.user.username == user) {
	// 	clickableRow = "class=\'notesRow\' onClick=\'clickToggleNoteForm(\"show\"," + index + ")\'"
	// }
	$('.notes').append('<tr><td class="notesData">'+dateTime+'</td><td class="notesData">'+text+'</td><td class="notesData">'+user+'</td><td class="notesDataImportant">'+important+'</td><td class="notesData"><i class="fa fa-times-circle" onClick="utilDeleteNote(' + index +')"></i></td></tr>')
}

function uiShowNewClientForm(){
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
};

function uiShowSecondaryServiceButtons(secondaryReactDiv, btnSecondary, lastServed, activeServiceTypes){
	if (emergencyFood) return
	$('#serviceSecondaryButtons').html("")
	for (let i=0; i < btnSecondary.length; i++){
		let x = btnSecondary[i];
		let attribs = "\'" + activeServiceTypes[x].serviceTypeId + "\', \'" + activeServiceTypes[x].serviceCategory + "\', \'" + activeServiceTypes[x].serviceButtons + "\'"
		let service = '<div id="btn-' + activeServiceTypes[x].serviceTypeId +'\" class="btnSecondary" onclick=\"clickAddService('+ attribs +')\">' + activeServiceTypes[x].serviceName + "</div>"
		// replaced 'serviceSecondaryButtons' with serviceSecondaryButtons for REACT migration
		$(secondaryReactDiv).append(service)
	}
	// let service = '<div class="btnSecondary" id="btn-test" onclick="clickPrintTestSingle()">Printer Test</div>';
	// $('#serviceSecondaryButtons').append(service);
	// service = '<div class="btnSecondary" id="btn-test" onclick="clickPrintTestBatch()">Printer Test (batch)</div>';
	// $('#serviceSecondaryButtons').append(service);
};

function uiPopulateBadges(){
	for (var i = 0; i < settings.serviceZip.length; i++) {
		uiAddBadge('Zip',settings.serviceZip[i])
	}
	for (var i = 0; i < settings.serviceCat.length; i++) {
		uiAddBadge('Cat',settings.serviceCat[i])
	}
};

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
		uiToggleFulfillFields()
	} else if (form === 'clientForm'){
		$('#clientAge').val(client.age) // readonly unsaved value
		uiToggleClientAddress()
	} else if (form === 'userForm'){
		// TODO HIDE ADMIN Fields
	}
	return
};

function uiPopulateServiceCategories(){
	let items = settings.serviceCat
	$.each(items, function (i, item) {
    $('#serviceCategory').append($('<option>', {
        value: item.replace(/ /g, '_'),
        text : item
    }));
	});
};

function uiPopulateTargetServiceSelect(){
	voucherServices = serviceTypes
		.filter(item => item.fulfillment.type == "Voucher")
	let el = '.inputBox[id="target.service"].serviceTypeForm'
	$.each(voucherServices, function (i, item) {
    $(el).append($('<option>', {
      value: item.serviceTypeId,
      text : item.serviceName
    }))
	})
};

function uiRemoveFormErrorBubbles(form) {
	$('[id^="err-"]').remove()
	$('.' + form).removeClass("errorField")
};

// function uiSetClientsHeader(title){
// 	if (title == "numberAndName") {
// 		let clientNumber = "<div class='clientNumber'>" + client.clientId + "</div>"
// 		let clientName = "<div class='clientName'>" + client.givenName + ' ' + client.familyName + "</div>"
// 		$("#clientsTitle").html(clientNumber + clientName)
// 	} else if (title == "newClient") {
// 		let clientNumber = "<div class='clientNumber'>" + $('#clientId.clientForm').val() + "</div>"
// 		let clientName = "<div class='clientName'>" + $('#givenName.clientForm').val() + ' ' + $('#familyName.clientForm').val() + "</div>"
// 		$("#clientsTitle").html(clientNumber + clientName)
// 	} else {
// 		$("#clientsTitle").html(title)
// 	}
// };

function uiSetServiceTypeHeader(){
	$("#adminTitle").html($('#serviceName').val())
};

function uiSetAdminHeader(title){
	$("#adminTitle").html(title)
};

// Added primaryReactDiv and secondaryReactDiv as part of REACT migration
function uiShowServicesButtons(ReactDiv, buttonsCalled){ // TODO DELETE AFTER SERVICE PAGE IS REACTED
	if ($.isEmptyObject(client)) return
	// uiShowServicesDateTime() //*** MOVED TO REACT ***
	// uiShowLastServed()       //*** MOVED TO REACT ***
	const lastServed = utilCalcLastServedDays() // Returns number of days since for USDA, NonUSDA, lowest & BackToSchool
	const activeServiceTypes = utilCalcActiveServiceTypes() // reduces serviceTypes list for which today is NOT active date range
	const targetServices = utilCalcTargetServices(activeServiceTypes); // list of target properties for each serviceType
	const btnPrimary = utilCalcActiveServicesButtons("primary", activeServiceTypes, targetServices, lastServed);
	const btnSecondary = utilCalcActiveServicesButtons("secondary", activeServiceTypes, targetServices, lastServed);
	if (buttonsCalled === 'primary') {
		uiShowPrimaryServiceButtons(ReactDiv, btnPrimary, lastServed, activeServiceTypes)
	} else {
		uiShowSecondaryServiceButtons(ReactDiv, btnSecondary, lastServed, activeServiceTypes)
	}
};

function uiShowServiceTypeForm(){
	$('#serviceTypeFormContainer').html(uiGetTemplate('#serviceTypeForm'))
	uiPopulateTargetServiceSelect()
	uiPopulateServiceCategories()
	uiPopulateForm(serviceType, 'serviceTypeForm')
	uiToggleIsUSDA()
};

function uiShowServiceTypes(){
	uiGenSelectHTMLTable('#serviceTypesContainer',serviceTypes,["serviceName","serviceCategory","serviceDescription","isActive"],'serviceTypesTable')
};

function uiShowUsers(){
	uiGenSelectHTMLTable('#userListContainer', users, ["userName","givenName","familyName", "userRole", "isValid"],'usersTable')
};

function uiShowSettings(){
	$('#settingsFormContainer').html(uiGetTemplate('#settingsForm'))
	uiPopulateForm(settings, 'settingsForm') // assigns settings values to form fields
	// these are objects that need to be handled seperately
	$('#serviceZip').val(JSON.stringify(settings.serviceZip))
	$('#serviceCat').val(JSON.stringify(settings.serviceCat))
	$('#closedDays').val(JSON.stringify(settings.closedDays))
	$('#closedEveryDays').val(JSON.stringify(settings.closedEveryDays))
	$('#closedEveryDaysWeek').val(JSON.stringify(settings.closedEveryDaysWeek))
	$('#openDays').val(JSON.stringify(settings.openDays))
	uiPopulateBadges()
	uiInitFullCalendar()
};

function utilSelectDay(selected){
	let clickDate = moment($("#selectedDate").val()).format('YYYY-MM-DD')
	let opt = dateParse(clickDate)
	let hasEvents = $('#calendar').fullCalendar( 'clientEvents', "closed"+clickDate ).length>0
	let openDays = utilParseHiddenArray('openDays')
	let openIndex = openDays.indexOf(clickDate)
	if (selected == 'dayOfYear'){
		let arr = utilParseHiddenArray('closedDays')
		let index = arr.indexOf(clickDate)
		if (hasEvents && index != -1){
			arr.splice(index,1);
		}
		else if (hasEvents){
			openDays.push(clickDate)
		}
		else if (!hasEvents){
			arr.push(clickDate)
		}
		$('#closedDays').val(JSON.stringify(arr))
		// utilAddClosedEvent(clickDate)
	} else if (selected == 'dayOfWeek'){
		let arr = utilParseHiddenArray("closedEveryDays")
		let weekMonthArr = utilParseHiddenArray('closedEveryDaysWeek')
		let dayOfWeek = opt.dayOfWeek.toString()
		let index = arr.indexOf(dayOfWeek)
		if (hasEvents && index != -1){
			arr.splice(index,1);
		}
		else if (!hasEvents){
			for (let i = 0; i < weekMonthArr.length; i++){
				if (weekMonthArr[i][1]==dayOfWeek){
					weekMonthArr.splice(i,1)
					i--;
				}
			}
			arr.push(dayOfWeek)
		}
		$('#closedEveryDaysWeek').val(JSON.stringify(weekMonthArr))
		$('#closedEveryDays').val(JSON.stringify(arr))
		//TODO add all days to current month
	} else if (selected == 'day&WeekOfMonth'){
		let arr = utilParseHiddenArray('closedEveryDaysWeek')
		let pairArr = [opt.weekInMonth.toString(), opt.dayOfWeek.toString()]
		let index = isItemInArray(arr,pairArr)
		if (hasEvents && index != -1){
			arr.splice(index,1);
		}
		else if (!hasEvents){
			arr.push(pairArr)
		}
		$('#closedEveryDaysWeek').val(JSON.stringify(arr))
	}
	if (!hasEvents && openIndex!=-1){
		openDays.splice(openIndex,1)
	}
	$('#openDays').val(JSON.stringify(openDays))

	$('#calendar').fullCalendar('prev');
	$('#calendar').fullCalendar('next');

  $('#calendarPopup').hide('slow')
};

function isItemInArray(array, item) {
  for (var i = 0; i < array.length; i++) {
    // This if statement depends on the format of your array
    if (array[i][0] == item[0] && array[i][1] == item[1]) {
      return i;   // Found it
    }
  }
  return -1;   // Not found
};

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
};

function uiGenSelectHTMLTable(selector, data, col, tableID){
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
			tr.setAttribute("onclick", 'clickSetCurrentClient(' + i + ')')
		} else if (tableID == 'serviceTypesTable'){
			tr.setAttribute("onclick", 'clickSetCurrentServiceType(' + i + ')')
		} else if (tableID == 'usersTable'){
			tr.setAttribute("onclick", 'clickSetCurrentAdminUser(' + i + ')')
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
				} else if (col[j]=="grade"){
					tabCell.innerHTML =uiGenSelectHTML(data[i][col[j]],['NA', 'Pre-K', 'K','1st','2nd','3rd','4th','5th','6th','7th','8th','9th','10th','11th','12th'],"grade",depNum)
				} else{
					tabCell.innerHTML="<input id='"+col[j]+"["+depNum+"]' class='inputBox inputForTable dependentsForm' value='"+data[i][col[j]]+"'>";
				}
    	} else if (col[j]=="dob"||col[j]=="firstSeenDate"||col[j]=="familyIdCheckedDate"||col[j]=="lastServedDateTime"){
				tabCell.className = "historyTopText"
        tabCell.innerHTML = moment(data[i][col[j]]).format('MMM DD, YYYY')
			} else if (col[j]=="lastServedFoodDateTime"){
				tabCell.className = "historyTopText"
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

	if (tableID == 'dependentsTable') clickToggleDependentsViewEdit('view');
}

function uiToggleClientViewEdit(side){
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
	$(".profileOnly").hide()
	if (type == 'new') $('.newUserOnly').show()
	if (type == 'existing') $('.newUserOnly').hide()
};

function uiToggleDependentsViewEdit(side){
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
};

function uiToggleAgeGrade(){
	if ($('[id="target.child"]').val() == 'YES') {
		$('.childDiv').show('slow')
	} else {
		$('.childDiv').hide('slow')
	}
};

function uiToggleFulfillFields(){
	if ($('[id="fulfillment.type"]').val() == 'Voucher') {
		$('.fulfillDiv').show('slow')
	} else {
		$('.fulfillDiv').hide('slow')
	}
	if ($('[id="fulfillment.type"]').val() == 'Voucher_Fulfill') {
		$('.voucherFulfillDiv').show('slow')
	} else {
		$('.voucherFulfillDiv').hide('slow')
	}
};

function uiToggleClientAddress(){
	if ($('#homeless.clientForm').val() == 'NO') {
		$('.addressDiv').show('slow')
	} else {
		$('.addressDiv').hide('slow')
	}
};

function uiToggleIsUSDA() {
	if ($("#serviceCategory").val() == "Food_Pantry"){
		$('.USDADiv').show('slow')
	} else {
		$("#isUSDA").val("NA")
		$('.USDADiv').hide('slow')
	}
};

function uiGetTemplate(template){
	// Removed the HTML Import of templates.html and embeded the templates in
	// index.html 1/11/2019 - orginal codes is below
	//let imp = document.querySelector('link[rel="import"]');
	//let temp = imp.import.querySelector(template);

	const temp = document.querySelector(template);
	return document.importNode(temp.content, true);
};

function uiFillUserData(){
	$('#userTitle').html(currentUser.userName);
};

// function uiFillDate(){   // MOVED TO REACT
// 	$('.contentTitle').html(moment().format("dddd, MMM DD YYYY"));
// };

function uiResetServiceTypeForm(){
	uiPopulateForm(serviceType, 'serviceTypeForm')
};


// **********************************************************************************************************
// ************************************************ DB FUNCTIONS ********************************************
// **********************************************************************************************************

function dbGetAppSettings(){
	let temp = dbGetData(aws+"/settings")
	let fields = ["serviceZip", "serviceCat", "closedDays", "closedEveryDays", "closedEveryDaysWeek", "openDays"]
	for (var i = 0; i < fields.length; i++) {
		let x = fields[i]
		if (temp[x] == "*EMPTY*") {
			temp[x] = []
		} else {
			temp[x] = utilStringToArray(temp[x])
		}
	}
	return temp
};

function dbGetClientActiveServiceHistory(){
	let history = dbGetData(aws+"/clients/services/"+client.clientId).services
	return history.filter(item => item.serviceValid == "true")
};

function dbGetData(uUrl){
	cogCheckSession()
	let urlNew = uUrl;
	let ans = null;
// TODO /// move Ajax calls to [.done .fail . always syntax]
	$.ajax({
    type: "GET",
    url: urlNew,
		headers: {"Authorization": authorization.idToken},
    async: false,
    dataType: "json",
		contentType:'application/json',
    success: function(json){
			if (json!==undefined) {
				// console.log(urlNew)
			}
    	ans = json
		},
		statusCode: {
			401: function() {
console.log("Error: 401")
				cogLogoutUser()
				$(loginError).html("Sorry, your session has expired.")
				console.log("Unauthorized")
			},
			0: function() {
console.log("Error: 0")
				console.log("Status code: 0")
				cogLogoutUser()
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
		console.log("errorThrown", JSON.parse(errorThrown))

		// if (errorThrown.includes("DOMException: Failed to execute 'send' on 'XMLHttpRequest':")){
		// 	console.log("ACCESS ERROR") // force logon
		// }
	}).always(function (data, textStatus, jqXHR) {
    // TODO most likely remove .always
	})
// console.log(JSON.stringify(ans))
	return ans
};

function dbGetDaysServices(dayDate){
	dayDate = moment(dayDate).format("YYYYMMDD")
	return dbGetData(aws+"/clients/services/byday/"+dayDate).services
};

// TODO remove bymonth from API
// TODO update service record in API to not have month property

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
	result = dbPostData(aws+"/clients/lastid",JSON.stringify(request))
	console.log(result)
	if (result != "success") {
		utilBeep()
		console.log("Last client ID not Saved")
	}
	return newId
};

function dbGetService(serviceId){
	return dbGetData(aws+"/clients/services/byid/"+serviceId).services
};

function dbGetServiceTypes(){
	serviceTypes = dbGetData(aws+"/servicetypes").serviceTypes
		.sort(function(a, b){
			let nameA= a.serviceName.toLowerCase()
			let nameB= b.serviceName.toLowerCase()
			if (nameA < nameB) return -1
			if (nameA > nameB) return 1
		return 0; //default return value (no sorting)
	})
};

function dbGetServicesByIdAndYear(serviceTypeId, year) {
	// TODO // catch error from dbGetData
	return dbGetData(aws+"/clients/services/byservicetype/" + serviceTypeId).services
					.filter(item => item.serviceValid == 'true')
					.filter(item => moment(item.servicedDateTime).year() == year)
};

function dbGetUsers(){
	return dbGetData(aws+"/users").users
};

function dbLoadServiceHistory(reactDIV){
	let clientHistory = dbGetClientActiveServiceHistory()
	clientHistory = clientHistory
		.sort((a, b) => moment.utc(b.servicedDateTime).diff(moment.utc(a.servicedDateTime)))
	uiShowHistoryData(reactDIV, clientHistory)
};

function dbPostData(URL,data){
	const sessionStatus = cogCheckSession()
	if (authorization.idToken == 'undefined' || sessionStatus == "FAILED") {
		utilBeep()
		return
	}
	let ans = "failed";
	$.ajax({
    type: "POST",
    url: URL,
		headers: {"Authorization": authorization.idToken},
    async: false,
    dataType: "json",
    data: data,
    contentType:'application/json',
    success: function(message){
			if (typeof message.message !== 'undefined') {
				console.log(message.message)
				utilBeep()
			} else if (message.__type != undefined) {
				console.log(message.__type)
				console.log("ERROR")
				utilBeep()
				// TODO need proper error messaging
			} else {
				utilBloop()
				ans = "success"
				console.log("SUCCESS")
				if (URL.includes('/servicetypes')) {
					dbGetServiceTypes()
					uiShowServiceTypes()
					uiSetServiceTypeHeader()
					uiPopulateForm(serviceTypes, 'serviceTypes')
					uiSaveButton('serviceType', 'SAVED!!')
				}
			}
		},
		error: function(json){
				console.log("ERROR")
	    	console.log(json)
				// TODO move this to funtion and make sure all save buttons are covered
				if (URL.includes('/servicetypes')) {
					uiSaveButton('serviceType', 'ERROR!!')
				} else if (URL.includes('/clients')) {
					uiSaveButton('client', 'ERROR!!')
				} else if (URL.includes('/users')) {
					console.log("show error in button")
				}
		}
	})
	return ans
};

function dbSaveLastServed(serviceTypeId, serviceCategory, itemsServed, isUSDA){
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
	return dbSaveCurrentClient(client)
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
	let hasErrors = utilValidateForm("userForm", context)
	if (hasErrors) return
	// store user in Users Table
	let userData = utilFormToJSON(".userForm")
	userData.notes = []
	let URL = aws+"/users/"
	result = dbPostData(URL, JSON.stringify(userData))
	if (result == "success") {
		utilBloop() // TODO move bloop to successful POST ()
		currentUser = utilGetCurrentUser(currentUser.userName)
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

function utilBuildServiceRecord(serviceType, serviceId, servedCounts, serviceValid){
	// TODO add validation isActive(Client/NonClient) vs (Service Area Zipcodes)
	let emergencyFood = "NO",
			// servicedMonth = moment().format("YYYYMM"),
	 		servicedDay = moment().format("YYYYMMDD")
	if (serviceId == "") serviceId = cuid()
	if (serviceType.isUSDA == "Emergency") emergencyFood = "YES"
	// define fulfillment vars for non-vouchers
	let pending = false, fulfillmentDateTime = moment().format(dateTime)
	let byUserName = currentUser.userName
	let itemCount = servedCounts.itemsServed
	if (serviceType.fulfillment.type == "Voucher") {
		pending = true
		fulfillmentDateTime = "pending"
		byUserName = "pending"
		itemCount = "pending"
	}
	let serviceRecord = {
							serviceId: serviceId,
					 serviceValid: serviceValid,
			 servicedDateTime: moment().format(dateTime),
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
				    itemsServed: servedCounts.itemsServed,
				       homeless: client.homeless,
				  emergencyFood: emergencyFood,
		  totalAdultsServed: servedCounts.adults,
		totalChildrenServed: servedCounts.children,
		 totalSeniorsServed: servedCounts.seniors,
 totalIndividualsServed: servedCounts.individuals,
					  fulfillment: {
						        pending: pending,
									 dateTime: fulfillmentDateTime,
							voucherNumber: "XXXXX",
						     byUserName: byUserName,
						      itemCount: itemCount
					  }
	}
	// store for use during session
	if (serviceValid) {
		servicesRendered.push(serviceRecord)
	} else {
		const temp = servicesRendered.filter(item => item.serviceId !== serviceId)
		servicesRendered = temp
	}
	return serviceRecord
};

function dbSaveCurrentClient(data){
	uiSaveButton('client', 'Saving...')
	$("body").css("cursor", "progress")
	data = utilPadEmptyFields(data)
	const URL = aws+"/clients/"
	const result = dbPostData(URL,JSON.stringify(data))
	if (result == "success") {
	 if (client.clientId != undefined) {
	 	utilCalcClientAge("db")
			utilCalcClientFamilyCounts()
			uiToggleClientViewEdit("view")
		} else {
			clientId = $('#clientId.clientForm').val()
			$('#searchField').val(clientId)
			clickSearchClients(clientId)
		}
		if (clientData != null) {
			console.log("REDO CLIENT DATA")
			uiGenSelectHTMLTable('#searchContainer', clientData, ['clientId', 'givenName', 'familyName', 'dob', 'street'],'clientTable')

			console.log(clientData)

			if (clientData.length == 1) clientTableRow = 1
			uiOutlineTableRow('clientTable', clientTableRow)
			// uiSetClientsHeader("numberAndName") MOVED TO REACT
		}
	}
	$("body").css("cursor", "default");
	uiSaveButton('client', 'SAVED!!')
	return result
};

function dbSaveServiceRecord(service){
	const data = service // utilPadEmptyFields(service)
	const URL = aws+"/clients/services"
	return dbPostData(URL,JSON.stringify(data))
};

function dbSaveServiceTypeForm(context){
	uiClearAllErrorBubbles()
	// populate dates
	let fields = ["updatedDateTime", "createdDateTime"]
	for (var i = 0; i < fields.length; i++) {
		if ($("#" + fields[i] + ".serviceTypeForm").val() == "") {
			$("#" + fields[i] + ".serviceTypeForm").val(utilNow())
		}
	}
	if (utilValidateForm("serviceTypeForm", "serviceTypeForm")) return
	let data = utilFormToJSON('.serviceTypeForm')
	let URL = aws+"/servicetypes"
	uiSaveButton('serviceType', 'Saving...')
	dbPostData(URL,JSON.stringify(data))
};

function dbSaveSettingsForm(){
	let data = utilFormToJSON('.settingsForm') // array fields are strings
	let fields = ["serviceZip", "serviceCat", "closedDays", "closedEveryDays", "closedEveryDaysWeek", "openDays"]
	for (var i = 0; i < fields.length; i++) {
		let x = fields[i]
		if (data[x] != "" && data[x] != []) {
			data[x] = utilArrayToObject(JSON.parse(data[x]))
		} else {
			data[x] = "*EMPTY*"
		}
	}
	let URL = aws+'/settings'
	dbPostData(URL,JSON.stringify(data))
	settings = dbGetAppSettings()
};

function dbSearchClients(str, slashCount){
	clientData = []
	if (slashCount == 2){
		str = utilCleanUpDate(str)
		str = moment(str, uiDate).format(date)
		clientData = dbGetData(aws+"/clients/dob/"+str).clients
	} else if (!isNaN(str)&&str.length<MAX_ID_DIGITS){
		clientData = dbGetData(aws+"/clients/"+str).clients
	} else if (str.includes(" ")){
		str = utilChangeWordCase(str)
		let split = str.split(" ")
//*** TODO deal with more than two words ***
		let d1 = dbGetData(aws+"/clients/givenname/"+split[0]).clients
		let d2 = dbGetData(aws+"/clients/familyname/"+split[0]).clients
		let d3 = dbGetData(aws+"/clients/givenname/"+split[1]).clients
		let d4 = dbGetData(aws+"/clients/familyname/"+split[1]).clients
		clientData = utilRemoveDupClients(d1.concat(d2).concat(d3).concat(d4))
	} else if (clientData==null||clientData.length==0){
		str = utilChangeWordCase(str)
		let d2 = dbGetData(aws+"/clients/givenname/"+str).clients
		let d1 = dbGetData(aws+"/clients/familyname/"+str).clients
		if (d1.length>0&&d2.length<1){
			clientData = utilRemoveDupClients(d1.concat(d2))
		}	else if (d2.length>0){
			clientData = utilRemoveDupClients(d2.concat(d1))
		}
	}
	return clientData
};

// **********************************************************************************************************
// *********************************************** DATE FUNCTIONS *******************************************
// **********************************************************************************************************

function dateParse(dateString) {
	let momentDay = moment(dateString)
	let dayOfWeek = momentDay.day();
	let weekInMonth = momentDay.isoWeek() -
		momentDay.subtract(momentDay.date()-1, 'days').isoWeek() + 1;
	return {
		"dayOfWeek": dayOfWeek,
		"weekInMonth": weekInMonth,
		"formatted": dateString
	}
};

// TODO should switch to an implementation that follows RFC 5545
function dateIsClosed(dateRules, date) {
	let dateObj = dateParse(date.format('YYYY-MM-DD'));
	if (dateRules.openDays.indexOf(dateObj.formatted) >= 0) {
		return false;
	}
	for (i = 0; i < dateRules.closedEveryDays.length; i++) {
		if (dateObj.dayOfWeek == dateRules.closedEveryDays[i]) {
			return true;
		}
	}
	for (i = 0; i < dateRules.closedEveryDaysWeek.length; i++) {
		if (dateObj.weekInMonth == dateRules.closedEveryDaysWeek[i][0] &&
			dateObj.dayOfWeek == dateRules.closedEveryDaysWeek[i][1]) {
			return true;
		}
	}
	for (i = 0; i < dateRules.closedDays.length; i++) {
		if (dateObj.formatted == dateRules.closedDays[i]) {
			return true;
		}
	}
	return false;
};

function dateFindOpen(target, earliest) {
	let proposed = moment(target);
	// Start with target date and work backward to earliest
	while (proposed >= earliest) {
		if (dateIsClosed(settings, proposed)) {
			proposed.subtract(1, 'days');
		} else {
			return proposed;
		}
	}
	// Select the first open date after target
	proposed = moment(target).add(1, 'days');
	while (true) {
		if (dateIsClosed(settings, proposed)) {
			proposed.add(1, 'days');
		} else {
			return proposed;
		}
	}
};

// **********************************************************************************************************
// ********************************************** CLICK FUNCTIONS *******************************************
// **********************************************************************************************************


function clickAddService(serviceTypeId, serviceCategory, serviceButtons){
	let serviceType = utilGetServiceTypeByID(serviceTypeId)
	let serviceId = "" // new service
	let serviceValid = true
	// graydout button so undo service
	if ($("#btn-"+ serviceTypeId).hasClass("buttonGrayOut")) {
		const serviceItem = servicesRendered.filter(obj => obj.serviceTypeId == serviceTypeId)
		serviceValid = false
		serviceId = serviceItem[0].serviceId
	}
	// save service record
	const servedCounts = utilCalcServiceFamilyCounts(serviceTypeId)
	const serviceRecord = utilBuildServiceRecord(serviceType, serviceId, servedCounts, serviceValid)
	const result = dbSaveServiceRecord(serviceRecord)
	if (serviceType.serviceButtons == "Primary" && result == "success"){
		dbSaveLastServed(serviceTypeId, serviceType.serviceCategory, servedCounts.itemsServed, serviceType.isUSDA)
	}
	if (serviceId != "" && result == "success") {
		// ungrayout button
		uiToggleButtonColor("unGray", serviceTypeId, serviceButtons)
		if (serviceButtons == "Primary") {
			$("#image-"+serviceTypeId).removeClass("imageGrayOut")
		}
	} else if (serviceId == "" && result == "success") {
		if (serviceCategory == 'Food_Pantry') {
			// TODO Use function here
			let service = serviceTypes.filter(function( obj ) {
					return obj.serviceTypeId == serviceTypeId
				})[0]
			prnPrintFoodReceipt(service.isUSDA)
			if (client.isActive == 'Client') {
				prnPrintReminderReceipt()
			}
		} else if (serviceCategory == 'Clothes_Closet') {
			prnPrintClothesReceipt(serviceType)
		} else if (serviceCategory == 'Back_To_School' && serviceType.target.service == 'Unselected') { // ignore fulfillment
			const targetService = utilCalcTargetServices([serviceType])
			const dependents = utilCalcValidAgeGrade("grade",targetService[0])
			// TODO use function here
			let service = serviceTypes.filter(obj => obj.serviceTypeId == serviceTypeId)[0]
			prnPrintVoucherReceipt(serviceType, dependents, 'grade');
			prnPrintVoucherReceipt(serviceType, dependents, 'grade');
		} else if (serviceCategory == 'Thanksgiving' && serviceType.target.service == 'Unselected') { // ignore fulfillment
			const targetService = utilCalcTargetServices([serviceType])
			// TODO use function here
			let service = serviceTypes.filter(obj => obj.serviceTypeId == serviceTypeId)[0]
			prnPrintVoucherReceipt(service)
			prnPrintVoucherReceipt(service)
		} else if (serviceCategory == 'Christmas' && serviceType.target.service == 'Unselected') { // ignore fulfillment
			const targetService = utilCalcTargetServices([serviceType])
			let service = serviceTypes.filter(obj => obj.serviceTypeId == serviceTypeId)[0]
			if (targetService[0].family_totalChildren == "Greater Than 0") {
				const dependents = utilCalcValidAgeGrade("age", targetService[0])
				prnPrintVoucherReceipt(serviceType, dependents, 'age');
				prnPrintVoucherReceipt(serviceType, dependents, 'age');
			} else {
				prnPrintVoucherReceipt(service);
				prnPrintVoucherReceipt(service);
			}
		}
		prnFlush();
		// uiShowLastServed() *** Moved to REACT ***
		uiToggleButtonColor("gray", serviceTypeId, serviceButtons)
	}
};

function clickGenerateDailyReport(btn, targetDiv){
	const dayDate = $('#reportsDailyDate').val()
	uiUpdateButton(btn, 'Gen') // 'Gen' or 'Run'
	setTimeout(function() {
		uiShowDailyReportHeader(dayDate, targetDiv, 'DAILY')
		uiShowDailyReportRows(dayDate, targetDiv)
		uiUpdateButton(btn, 'Run') // 'Gen' or 'Run'
		uiShowHideReport("show")
	}, 0)
};
function clickGenerateAnnualReport(btn){
	const year = $('#reportsAnnualYear').val()
	const reportType = $('#reportsAnnualType').val()
	const headerInfo = {
		 targetDiv: 'report',
		      name: 'FOOD PANTRY',
		  category: 'ANNUAL REPORT',
		reportDate: '',
		   refresh: false,
		     print: true
	}
	uiUpdateButton(btn, 'Gen') // 'Gen' or 'Run'
	setTimeout(function() {
		uiLoadReportHeader(headerInfo)
		uiShowAnnualReportHeader(year, reportType)
		uiShowAnnualReportRows(year, reportType)
		uiUpdateButton(btn, 'Run') // 'Gen' or 'Run'
		uiShowHideReport("show")
	}, 0)
}
function uiBuildQuarterTotal(total, quarter){
	console.log(total)
	console.log(quarter)
	let grid = "#annualGrid"+quarter
	$(grid).append('<div class="monthTotal">Q'+quarter+' UNIQUES</div>')
	$(grid).append('<div class="monthTotal">'+total['uTotalUnique']['hh']+'</div>')
	$(grid).append('<div class="monthTotal">'+total['nTotalUnique']['hh']+'</div>')
	$(grid).append('<div class="monthTotal">'+total['gTotalUnique']['hh']+'</div>')
	$(grid).append('<div class="monthTotal">'+total['uTotalUnique']['ind']+'</div>')
	$(grid).append('<div class="monthTotal">'+total['nTotalUnique']['ind']+'</div>')
	$(grid).append('<div class="monthTotal">'+total['gTotalUnique']['ind']+'</div>')
	$(grid).append('<div class="monthTotal">'+total['uTotalUnique']['ch']+'</div>')
	$(grid).append('<div class="monthTotal">'+total['nTotalUnique']['ch']+'</div>')
	$(grid).append('<div class="monthTotal">'+total['gTotalUnique']['ch']+'</div>')
}
function uiBuildReportTotalRow(total, month, quarter){
	let grid = "#annualGrid"+quarter
	$(grid).append('<div class="monthItem">'+month+'</div>')
	$(grid).append('<div class="monthItem">'+total['uTotalServices']['hh']+'</div>')
	$(grid).append('<div class="monthItem">'+total['nTotalServices']['hh']+'</div>')
	$(grid).append('<div class="monthItem">'+total['gTotalServices']['hh']+'</div>')
	$(grid).append('<div class="monthItem">'+total['uTotalServices']['ind']+'</div>')
	$(grid).append('<div class="monthItem">'+total['nTotalServices']['ind']+'</div>')
	$(grid).append('<div class="monthItem">'+total['gTotalServices']['ind']+'</div>')
	$(grid).append('<div class="monthItem">'+total['uTotalServices']['ch']+'</div>')
	$(grid).append('<div class="monthItem">'+total['nTotalServices']['ch']+'</div>')
	$(grid).append('<div class="monthItem">'+total['gTotalServices']['ch']+'</div>')
}
function uiShowAnnualReportRows(year, reportType){
	let data = utilCalcAnnualFoodReport(year)
  let monthlyTotals = data['byMonth']
	let quarterlyTotals = data['byQuarter']
	console.log(monthlyTotals)
	console.log(quarterlyTotals)
  let currentRow = 5
	let currentGrid = 0
	for (let i = 0; i < monthlyTotals.length; i++){
		if (i == 0 || i == 3 || i == 6 || i == 9){
			currentGrid += 1
			$("#reportBodyDiv").append('<div id="annualGrid'+currentGrid+'" class="quarterRowBox" style="grid-row: '+currentRow+'"></div>')
			currentRow += 1
		}
		uiBuildReportTotalRow(monthlyTotals[i],moment().month(i).format("MMM"),currentGrid)
		if (i == 2 || i == 5 || i == 8 || i == 11){
			uiBuildQuarterTotal(quarterlyTotals[currentGrid-1],currentGrid)
		}
	}
	if ((i+1)%3 != 0){
		uiBuildQuarterTotal(quarterlyTotals[currentGrid-1],currentGrid)
	}
	let servicesTotals = sumObjectsByKey(monthlyTotals,false,Math.ceil(monthlyTotals.length/3))
	let quarterlyUniqueTotals = sumObjectsByKey(quarterlyTotals,true,Math.ceil(monthlyTotals.length/3))
	console.log(servicesTotals)
	console.log(quarterlyUniqueTotals)
	$("#reportBodyDiv").append('<div id="totalAnnualReport" class="foodRowBox" style="grid-row: '+ currentRow +'" ></div>')
	let grid = "#totalAnnualReport"
	$(grid).append('<div class="todaySectionHeader" style="grid-column: span 10;">Aggregate Totals</div>')
	uiBuildAnnualRow(grid, servicesTotals,'Total Services')
	uiBuildAnnualRow(grid, quarterlyUniqueTotals,'AVG Uniques (QTR)')




}
function sumObjectsByKey(objs, isUnique, numQuarters) {
  let result = {
		"uTotal":{
			"hh":0,
			"ind":0,
			"ch":0
		},
		"nTotal":{
			"hh":0,
			"ind":0,
			"ch":0
		},
		"gTotal":{
			"hh":0,
			"ind":0,
			"ch":0
		}
	}
	let suffix = "Services"
	if (isUnique){
		suffix = "Unique"
	}
	console.log(objs)
	let types = ['nTotal','gTotal','uTotal']
	let fields = ['hh','ind','ch']
	for (let i = 0; i < objs.length; i++){
		for (let j = 0; j < types.length; j++){
			type = types[j]
			for (let k = 0; k < fields.length; k++){
				field = fields[k]
				if (isUnique){
					console.log(objs[i])
					console.log(suffix)
					console.log(objs[i][type+suffix])
					result[type][field] += (objs[i][type+suffix][field])/numQuarters
				}
				else{
					result[type][field] += objs[i][type+suffix][field]
				}
			}
		}
	}
	return result
}
function clickGenerateMonthlyReport(btn){
	const monthYear = $('#reportsMonthlyMonth').val()
	const reportType = $('#reportsMonthlyType').val()
	const headerInfo = {
		 targetDiv: 'report',
		      name: 'FOOD PANTRY',
		  category: 'MONTHLY REPORT',
		reportDate: '',
		   refresh: false,
		     print: true
	}
	if (reportType == 'ALL') headerInfo.name = 'ALL SERVICES'
	uiUpdateButton(btn, 'Gen') // 'Gen' or 'Run'
	setTimeout(function() {
		uiLoadReportHeader(headerInfo)
		uiShowMonthlyReportHeader(monthYear, reportType)
		let uniqueTotalCounts = utilBuildUniqueTotalCountsObject()
		uiShowMonthlyReportRows(monthYear, reportType, uniqueTotalCounts)
		console.log(uniqueTotalCounts)
		uiUpdateButton(btn, 'Run') // 'Gen' or 'Run'
		uiShowHideReport("show")
	}, 0)
};

function clickGenerateVoucherReport(btn, reportType){
	// reportType = "Count" or "Distro"
	const serviceTypeId = $('#reportVoucher' + reportType).val() // form pulldown
	const serviceType = utilGetServiceTypeByID(serviceTypeId)
	let targetType = ''
	if (serviceType.target.child == 'YES') {
		if (serviceType.target.childMaxGrade != "Unselected") {targetType = 'Grades'}
		if (serviceType.target.childMaxAge != "0") {targetType = 'Ages'}
	}
	const year = $('#reportVoucher' + reportType + 'Year').val()
	const buttonId = '#voucher' + reportType + 'ReportButton'
	// if (reportType == 'Count') buttonId = '#voucherCountReportButton'
	uiUpdateButton(btn, 'Gen') // 'Gen' or 'Run'
	setTimeout(function() {
		uiShowVoucherReportHeader(year, reportType, targetType, serviceType)
		let result = uiShowVoucherReportRows(year, reportType, targetType, serviceType)
		uiUpdateButton(btn, 'Run') // 'Gen' or 'Run'
		if (result != 'failed')
			uiShowHideReport("show")
	}, 0)
};

function clickResetClientForm(){
	editFlag.client = false
	if (client == {}) {
		uiShowNewClientForm()
	} else {
		uiPopulateForm(client, 'clientForm')
		uiRemoveFormErrorBubbles('clientForm')
		uiToggleClientViewEdit('view')
	}
};

function clickResetDependentsTable() {
	editFlag.dependents = false
	// clear changes in feilds
	uiGenSelectHTMLTable('#dependentsFormContainer',client.dependents,["givenName","familyName","relationship","gender","dob","age","grade","isActive"],'dependentsTable')
	clickToggleDependentsViewEdit('view') // set display to view
};

function clickSaveClientForm(context){
	uiClearAllErrorBubbles()
	const hasErrors = utilValidateForm("clientForm", context)
	if (hasErrors) return
	$("#updatedDateTime.clientForm").val(utilNow())
	let data = {}
	if (client.clientId == undefined) {
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
		if (data.lastServed == undefined || data.lastServed == "") {
			data.lastServed = []
		}
		if (data.notes == undefined || data.notes == "") {
			data.notes = []
		}
	}
	let result = dbSaveCurrentClient(data)
	if (result == 'success') editFlag.client = false
};

function clickSaveDependentsTable(){
	// TODO validate dependents and field level
	// TODO validate dependents and form level
	// TODO validate dependents age vs adult / child
	// TODO validate dependents grade vs age (< 18) age-range below grade?
	let dependents = [] // client.dependents
	data = utilFormToJSON('.dependentsForm')
	let numKey = Object.keys(data).length
	for (var i = 0; i < numKey; i++) {
		let key = Object.keys(data)[i]
		let keyName = key.slice(0, key.indexOf("["))
		let keyNum = key.slice(key.indexOf("[")+1,-1)
		// updatedDateTime & createdDateTime are not in form
		if (dependents[keyNum] == undefined) dependents[keyNum] = {updatedDateTime: utilNow()}
		if (client.dependents[keyNum] != undefined) {
			if (client.dependents[keyNum].createdDateTime != undefined) {
				dependents[keyNum].createdDateTime = client.dependents[keyNum].createdDateTime
			}
		} else {
			dependents[keyNum].createdDateTime = utilNow()
		}
		// add dependent record
		dependents[keyNum][keyName] = data[Object.keys(data)[i]]
		if (keyName == "grade") { // makes sure the gradeDateTime is updated
			if (client.dependents[keyNum] == undefined) { // new dependent
				if (dependents[keyNum][keyName] == "*EMPTY*") {
					dependents[keyNum][keyName] = moment().diff(dependents[keyNum]["age"], "years")
				}
				if (dependents[keyNum][keyName] == "NA") {
					dependents[keyNum].gradeDateTime = "NA"
				} else {
					dependents[keyNum].gradeDateTime = utilNow()
				}
			} else {
				if (dependents[keyNum][keyName] != client.dependents[keyNum][keyName]) {
					if (dependents[keyNum][keyName] == "NA") {
						dependents[keyNum].gradeDateTime = "NA"
					} else {
						dependents[keyNum].gradeDateTime = utilNow()
					}
				} else {
					dependents[keyNum].gradeDateTime = client.dependents[keyNum].gradeDateTime
				}
			}
		}
	}
	client.dependents = dependents
	const result = dbSaveCurrentClient(client)
	if (result == "success") {
		editFlag.dependents = false
		utilCalcClientFamilyCounts()
		utilCalcClientAge("db")
		uiToggleDependentsViewEdit("view")
	}
};

function clickSaveNote(){
	hasError = utilValidateField("noteTextArea", "noteForm")
	if (hasError) {
		utilBeep()
		return
	}
	editFlag.dependents = false
	let tmp = {}
	tmp.noteText = $("#noteTextArea").val().toString()
	tmp.createdDateTime = moment().format(dateTime)
	tmp.updatedDateTime = moment().format(dateTime)
	tmp.noteByUserName = currentUser.userName
	let isImportant = false
	if ($("#noteIsImportant").is(":checked")) isImportant = true
	tmp.isImportant = isImportant
	client.notes.push(tmp)
// TODO SAVE CLIENT ... NEED TO USE UPDATE TO ONLY UPDATE SOME FIELDS
	const result = dbSaveCurrentClient(client)
	if (result == "success") {
		utilCalcClientFamilyCounts()
		utilCalcClientAge("db")
		clickToggleDependentsViewEdit("view")
		clickToggleNoteForm("hide", "")
		uiShowExistingNotes("updating")
	}
};

// function clickSearchClients(str) {
// 	if (str === '') {
// 		utilBeep()
// 		return
// 	}
// 	if (stateCheckPendingEdit()) return
// 	if (currentNavTab !== "clients") navGotoSec("nav1")
// 	clientData = null
// 	const regex = /[/.]/g
// 	const slashCount = (str.match(regex) || []).length
// 	dbSearchClients(str, slashCount)
// 	uiShowHideClientMessage('hide')   // hide ClientMessage overlay in case it's open
// 	if (clientData==null||clientData.length==0){
// 		utilBeep()
// 		// uiSetClientsHeader("0 Clients Found") MOVED TO REACT
// 		client = {}
// 		servicesRendered = []
// 		uiClearCurrentClient()
// 	} else {
// 		let columns = ["clientId","givenName","familyName","dob","street"]
// 		uiGenSelectHTMLTable('#FoundClientsContainer', clientData, columns,'clientTable')
// 		uiResetNotesTab()
// 		if (clientData.length == 1){
// 			clickSetCurrentClient(0) // go straight to SERVICES
// 			navGotoTab("tab2")
// 		} else {
// 			// uiSetClientsHeader(clientData.length + ' Clients Found') MOVED TO REACT
// 			navGotoTab("tab1")
// 		}
// 	}
// };

function clickSetCurrentAdminUser(index){
	adminUser = users[index]
	uiOutlineTableRow('usersTable', index+1)
	uiSetAdminHeader(adminUser.userName)
	utilCalcUserAge("data")
	uiShowUserForm()
	uiToggleUserNewEdit("existing")
	navGotoTab("aTab5")
};

function clickSetCurrentClient(index){
	servicesRendered = []
	client = clientData[index]
	utilRemoveEmptyPlaceholders()
	utilCalcClientAge("db")
	utilCalcClientFamilyCounts() // calculate fields counts and ages
	uiShowHistory()
	uiUpdateCurrentClient(index)
	$('#receiptBody').html("")
};

function clickSetCurrentServiceType(index){
	serviceType = serviceTypes[index]
	uiOutlineTableRow('serviceTypesTable', index+1)
	uiSetAdminHeader(serviceType.serviceName)
	uiShowServiceTypeForm()
	navGotoTab("aTab2")
};

function clickShowNewClientForm(){
	uiShowNewClientForm()
};

function clickToggleClientViewEdit(side){
	// set flag for being in edit mode
	if (side == 'edit') editFlag.client = true
	uiToggleClientViewEdit(side)
};

function clickToggleDependentsViewEdit(side){
	// set flag for being in edit mode
	if (side == 'edit') editFlag.dependents = true
	uiToggleDependentsViewEdit(side)
};

function clickToggleNoteForm(todo, index){

	console.log("MadeIT!")
	if (todo == "show"){
		console.log("IN SHOW!")
		editFlag.notes = true
		$("#newNoteButton").hide()
		$("#noteEditForm").show()
		if (index !== ""){
			$("#noteTextArea").val(client.notes[index].noteText)
			if (client.notes[index].isImportant == "true") {
				$("#noteIsImportant").prop("checked", true)
			} else {
				$("#noteIsImportant").prop("checked", false)
			}
		}
	} else {

		console.log("IN HIDE!")
		// check for edit mode
		editFlag.notes = false
		$("#newNoteButton").show()
		$("#noteEditForm").hide()
		$("#noteTextArea").val("")
		$("#noteIsImportant").prop("checked", false)
	}
};

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
	// cognitoUser.getSession(function(err, session) {
	// 	if (err) {
	// 		cogLogoutUser()
	// 		$(loginError).html("Sorry, your session has expired.")
	// 		return "FAILED"
	// 	}
	// 	return session
	// })
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
					uiShowHideError("show", "Too many attemps!!", "Please try again later.", 'beep')
				} else if (err == "NotAuthorizedException: Incorrect username or password."){
					uiShowHideError("show", "Incorrect password", "Please enter your Existing Password again.<br>Make sure the <b>caps lock</b> is not on.", 'beep')
				} else {
					alert(err)
				 	return
				}
	    } else {
				uiResetChangePasswordForm()
				utilBloop()
				cogLogoutUser()
				$(loginError).html("Login with your New Password.")
				//TODO make utilLogout function takes message as input
			}
	  });
	} else {
		console.log("PASSWORDS DON'T MATCH")
		uiShowHideError("show", "Passwords don't match!!", "Please enter the new password correctly in both fields.", 'beep')
		// TODO show error
	}
};

// params for fields passed in via React and a callback function that react uses to set HTML (handleCogValue)
// same callback passed in all cognito functions

// function cogUserConfirm(validationCode, userName, handleCogValue){
// 	let userData = {
// 	 		Username: userName,
// 	 		Pool: userPool
// 		}
// 	let cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
// 	cognitoUser.confirmRegistration(validationCode, true, function(err, result) {
// 			if (err) {
// 				console.log("|"+err+"|")
// 				if (err == ""){
// 					handleCogValue({
// 						message: "You're confirmed! Please Login.",
// 					})
// 					return
// 				} else {
// 					alert(err);
// 					return;
// 				}
// 			}
// 			utilBloop()
// 			console.log('call result: ' + result);
// 			handleCogValue({
// 				message: "You're confirmed! Please Login.",
// 				appState: "login"
// 			})
// 	});
// }

// function cogResendValidationCode(userName, handleCogValue){
// 	let	userData = {
// 			Username: userName,
// 			Pool: userPool
// 		}
// 	let cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
// 	cognitoUser.resendConfirmationCode(function(err, result) {
// 		if (err) {
// 			alert(err);
// 			return;
// 		}
// 		handleCogValue({message: "New code has been sent."})
// 	});
// };

// function cogForgotPassword(userName, handleCogValue){
// 	if (userName == "") {
// 		handleCogValue({message: "Username is required above!"})
// 	}
// 	let userData = {
// 		Username: userName,
// 		Pool: userPool
// 	};
// 	let cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData)
// 	cognitoUser.forgotPassword({
//     onSuccess: function (result) {
//       console.log('call result: ' + JSON.stringify(result))
// 			console.log('sent to: ' + result.CodeDeliveryDetails.Destination)
// 			handleCogValue({message: "Validation Code sent to: " + result.CodeDeliveryDetails.Destination, appState:"newPassword"})
//     },
//     onFailure: function(err) {
// 			console.log("|"+err+"|")
// 			if (err == "LimitExceededException: Attempt limit exceeded, please try after some time."){
// 				handleCogValue({message: "Too many requests. Try again later!"})
// 			} else {
// 				alert(err)
// 				return
// 			}
//     }
//   });
// };

// function cogUserConfirmPassword(validationCode, newPassword, userName, handleCogValue) {
// 	let userData = {
// 			Username: userName, //username,
// 			Pool: userPool
// 		};
// 	let cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
// 	cognitoUser.confirmPassword(validationCode, newPassword, {
//     onSuccess: function (result) {
//       // console.log('call result: ' + JSON.stringify(result))
// 			// console.log('sent to: ' + result.CodeDeliveryDetails.Destination)
// 			// $("#loginError").html("Validation Code sent to: " + result.CodeDeliveryDetails.Destination)
// 			// uiLoginFormToggleValidation("newPassword")
// 			//console.log(callback.inputVerificationCode(data))
// 			utilBloop()
// 			handleCogValue({message: "New Password set! Please Login.", clearInputs: true, appState: "login"})
// 			console.log('call result: ' + result);
// 			return;
//     },
//     onFailure: function(err) {
// 			console.log("|"+err+"|")
// 			if (err == "LimitExceededException: Attempt limit exceeded, please try after some time."){
// 				handleCogValue({message: "Too many requests. Try again later!"})
// 				return;
// 			} else {
// 				alert(err)
// 				return
// 			}
//     }
// 	})
// };

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

// function cogLoginUser(username, password, handleCogValue) {
// 	let authData = {
//      		Username: username,
//      		Password: password
//   		};
//   let authDetails = new AWSCognito.CognitoIdentityServiceProvider.AuthenticationDetails(authData);
//   let userData = {
//      Username: username,
//      Pool: userPool
//   };
//   cognitoUser = new AWSCognito.CognitoIdentityServiceProvider.CognitoUser(userData);
//   cognitoUser.authenticateUser(authDetails, {
//     onSuccess: (result) => {
// 			authorization.accessToken = result.getAccessToken().getJwtToken()
// 			authorization.idToken = result.idToken.jwtToken
// 			currentUser = utilGetCurrentUser(cognitoUser.username)
// 			// logout if user is set to Inactive
// 			if (currentUser == null || currentUser.isActive == "Inactive") {
// 				cogLogoutUser()
// 				handleCogValue({message: "Sorry, your account is INACTIVE."})
// 			} else {
// 				handleCogValue(
// 					{newUser: {user: currentUser, auth: authorization, cogUser: cognitoUser},
// 					clearInputs: true})
// 				// utilLoginUserShowScreens(cognitoUser.username)
// 				utilInitSession(currentUser, cognitoUser);
// 			}
//     },
//     onFailure: (err) => {
// 			console.log("COGNITO ERROR")
// 			console.log('|'+err+'|');
// 			utilBeep()
// 			let message = undefined
// 			let appState = undefined
//
// 			if (err == 'Error: Incorrect username or password.') {
// 				message = "Incorrect username or password"
// 			} else if (err == 'UserNotFoundException: User does not exist.') {
// 				message = "Username does not exist."
// 			} else if (err == 'NotAuthorizedException: Incorrect username or password.') {
// 				message = "Incorrect username or password."
// 			} else if (err == 'UserNotConfirmedException: User is not confirmed.') {
// 				appState = "code"
// 				message = "Validation Code is required."
// 				// TODO change login flow to deal with confirmation
// 				// cogUserConfirm() //userName, verificationCode
// 			} else if (err == 'NotAuthorizedException: User cannot confirm because user status is not UNCONFIRMED.') {
// 				appState = "login"
// 				message = "No longer UNCONFIRMED"
// 			} else if (err == 'PasswordResetRequiredException: Password reset required for the user') {
// 				console.log("PasswordResetRequiredException")
// 				message = "New Password is required."
// 			} else if (err == 'InvalidParameterException: Missing required parameter USERNAME'){
// 			  message = "Username is required."
// 			}
// 			handleCogValue({
// 				message: message,
// 				appState: appState
// 			})
// 		}
// 	})
// };

// function cogGetUserAttributes(){
// 	cognitoUser.getUserAttributes(function(err, result) {
// 		if (err) {
// 				alert(err);
// 				return;
// 		}
// 		user.username = cognitoUser.username
// 		for (i = 0; i < result.length; i++) {
// 				user[result[i].getName()] = result[i].getValue()
// 		}
// 	})
// };

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
	})
};

// function cogLoginAdmin(){
// 	let authenticationData = {
// 		 Username : '',
// 		 Password : ''
//  	}
// 	let userData = {
// 		 Username : '',
// 		 Password : '' // your password here
//  	}
//   let authenticationDetails = new AWSCognito.CognitoIdentityServiceProvider.AuthenticationDetails(authenticationData)
//   let cognitoUser = new AWSCognito.CognitoIdentityServiceProvider.CognitoUser(userData);
//   cognitoUser.authenticateUser(authenticationDetails, {
// 		onSuccess: function (result) {
// 			console.log('access token + ' + result.getAccessToken().getJwtToken());
// 		},
// 		onFailure: function(err) {
// 			alert(err);
// 		},
// 		mfaRequired: function(codeDeliveryDetails) {
// 			let verificationCode = prompt('Please input verification code' ,'');
// 			cognitoUser.sendMFACode(verificationCode, this);
// 		}
//  })
// };

// **********************************************************************************************************
// *********************************************** UTIL FUNCTIONS *******************************************
// **********************************************************************************************************

function utilAddClosedEvent(dateString){ //when the green or yellow button is pushed, change a specific date's color.
	closedEvent.id = "closed"+dateString;
	closedEvent.start = dateString;
 	let dayEvents = $('#calendar').fullCalendar( 'clientEvents', closedEvent.id )
 	if (dayEvents.length==0){
	 	$('#calendar').fullCalendar( 'renderEvent', closedEvent, false)
 	}
};

function utilArrayToObject(arr){
	return arr.reduce(function(acc, cur, i) {
		if (Array.isArray(cur)) {
			acc[i] = utilArrayToObject(cur)
		} else {
			acc[i] = cur
		}
		return acc
	}, {});
};

function utilGetHistoryLastService(serviceHistory, serviceType){
	return serviceHistory.filter(item => moment(item.servicedDateTime).year() == moment().year()) // current year service
	.filter(item => item.serviceTypeId == serviceType.serviceTypeId)
};

function utilGetVoucherTargetService(serviceHistory, serviceType){
	return serviceHistory.filter(item => moment(item.servicedDateTime).year() == moment().year()) // current year service
	.filter(item => item.serviceTypeId == serviceType.target.service)
};

function utilCalcVoucherServiceSignup(serviceType){
	return dbGetClientActiveServiceHistory()
		.filter(item => moment(item.servicedDateTime).year() == moment().year()) // current year service
		.filter(item => item.serviceTypeId == serviceType.target.service)
};

function utilCalcServiceFamilyCounts(serviceTypeId){
	const serviceType = utilGetServiceTypeByID(serviceTypeId)
	let servedCounts = {
		adults: String(client.family.totalAdults),
		children: String(client.family.totalChildren),
		individuals: String(client.family.totalSize),
		seniors: String(client.family.totalSeniors),
		itemsServed: String(serviceType.numberItems)
	}
	let targetService = utilCalcTargetServices([serviceType])
	console.log(serviceType)
	console.log(serviceType.fulfillment);
	if (serviceType.itemsPer == "Person") {
		servedCounts.itemsServed = String(servedCounts.itemsServed * client.family.totalSize)
		if (serviceType.fulfillment.type =="Voucher"){
			if (serviceType.target.service == "Unselected" && serviceType.serviceCategory == "Back_To_School") {
				servedCounts = {
					adults: 0,
					children: 0,
					individuals: 0,
					seniors: 0,
					itemsServed: 0,
				}
			} else {
				let numChildren = 0;
				if (targetService[0].dependents_ageMax !== undefined){
					numChildren = utilCalcValidAgeGrade("age", targetService[0]).length
				}
				if (targetService[0].dependents_gradeMax !== undefined){
					numChildren = Math.abs(numChildren - utilCalcValidAgeGrade("grade", targetService[0]).length)
				}

				servedCounts = {
					adults: 0,
					children: numChildren,
					individuals: numChildren,
					seniors: 0,
					itemsServed: serviceType.numberItems * numChildren,
				}
			}
		}
	}
	return servedCounts
};

function utilCognitoPhoneFormat(telephone){
	const cogFormat= /^\+[1][0-9]{10}$/g // possible future use
	const cleanTel = telephone.replace(/[.( )-]/g, '')
	return cleanTel
};

function utilGetFulfillmentServiceByID(serviceTypeId) {
	return serviceTypes.filter(function( obj ) {
		return obj.target.service == serviceTypeId
	})
};

function utilGetFoodInterval(isUSDA){
	for (var i = 0; i < serviceTypes.length; i++) {
		if ((serviceTypes[i].serviceButtons == "Primary") && (serviceTypes[i].serviceCategory == "Food_Pantry") && (serviceTypes[i].isUSDA == isUSDA)){
			return serviceTypes[i].serviceInterval
		}
	}
};

function utilGetListOfVoucherServiceTypes() {
	return vouchers = serviceTypes.filter(function( obj ) {
		return obj.fulfillment.type == "Voucher"
	})
};

function utilGetServiceTypeByID(serviceTypeId){
	let serviceTypeArr = serviceTypes.filter(function( obj ) {
		return obj.serviceTypeId == serviceTypeId
	})
	return serviceTypeArr[0]
};

function utilBeep(){
	if (settings.sounds == "YES"){
		console.log("BAD BEEP")
    let beep  = new Audio("public/sounds/beep.wav")
		beep.volume = .1
		beep.loop = false
		beep.play()
	}
};

function utilBloop(){
	if (settings.sounds == "YES"){
		let bloop  = new Audio("public/sounds/bloop.wav")
		bloop.volume= .1
		bloop.loop = false
		bloop.play()
	}
};

function utilCalcActiveServicesButtons(buttons, activeServiceTypes, targetServices, lastServed) { // TODO DELETE AFTER SERVICES PAGE IS REACTED
	btnPrimary = [];
	btnSecondary = [];
  let validDependents = []
	for (let i = 0; i < activeServiceTypes.length; i++) {
		let display = true;
		// check for not a valid service based on interval between services
		if (!utilValidateServiceInterval(activeServiceTypes[i], activeServiceTypes, lastServed)) continue;
		// loop through each property in each targetServices
		for (let prop in targetServices[i]) {
			if (prop=="family_totalChildren") {
				// TODO move to grade and age target detection to helper function
				if (targetServices[i]['dependents_gradeMin'] != "Unselected" && targetServices[i]['dependents_gradeMax']!="Unselected"){
					validDependents = utilCalcValidAgeGrade("grade",targetServices[i])
				}
				//TODO change service types to store non age entries as -1
				if (targetServices[i]['dependents_ageMax'] > 0){
					validDependents = utilCalcValidAgeGrade("age",targetServices[i])
				}
				if (validDependents.length == 0){
					display = false
				}
			}
			if (prop == "service") { // targeting a voucher fulfill service
				let servicesVouchers = utilCalcVoucherServiceSignup(activeServiceTypes[i])
				if (servicesVouchers.length !== 1) {
					display = false
				}
			} else if (targetServices[i][prop] != client[prop]
					&& prop.includes("family")==false
					&& prop.includes("dependents")==false) {
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
	// used to prompt service if a dependent child's grade is not set
	if (client.dependents.length > 0) {
		for (var i = 0; i < client.dependents.length; i++) {
			if (client.dependents[i].age < 18 && (client.dependents[i].grade == undefined || client.dependents[i].grade == "")) {
				btnPrimary = "-1"
				btnSecondary = ""
			}
		}
	}
	if (buttons == "primary") return btnPrimary
	if (buttons == "secondary") return btnSecondary
};

function utilCalcActiveServiceTypes(){ // TODO DELETE AFTER SERVICES PAGE IS REACTED
	// build Active Service Types array of Service Types which cover today's date
	let activeServiceTypes = []
	for (let i=0; i<serviceTypes.length; i++){
		if (serviceTypes[i].isActive == "Active"){
			// FROM
			let fromDateString = []
			fromDateString.push(moment().year())
			fromDateString.push(Number(serviceTypes[i].available.dateFromMonth))
			fromDateString.push(Number(serviceTypes[i].available.dateFromDay))
			let fromDate = moment(fromDateString).startOf('day')
			// TO
			let toDateString = []
			toDateString.push(moment().year())
			toDateString.push(Number(serviceTypes[i].available.dateToMonth))
			toDateString.push(Number(serviceTypes[i].available.dateToDay))
			let toDate = moment(toDateString).endOf('day')
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
	return activeServiceTypes
};

function utilCalcAgeGrouping(dependent){
	let age = dependent.age
	if (age >= 0 && age <= 1 ){
		return "0-1"
	}
	else if  (age >= 2 && age <= 3){
		return "2-3"
	}
	else if (age >= 4 && age <= 6){
		return "4-6"
	}
	else if (age >= 7 && age <= 8){
		return "7-8"
	}
	else if (age >= 9 && age <= 10){
		return "9-10"
	}
	else if (age >= 11 && age <= 12){
		return "11-12"
	}
	else if (age >= 13 && age <= 17){
		return "13-17"
	}
	else {
		return "Unable to Calculate Age Level"
	}
};


// MOVED TO REACT
function utilCalcClientFamilyCounts(){
	// age TODO Move this to other Function
	if (client.dependents == undefined) client.dependents = []
	for (var i = 0; i < client.dependents.length; i++) {
		utilCalcDependentAge(i)
	}
	if (client.family == undefined) client.family = {}
	// dependents age & family counts
	let fam = {totalAdults:0, totalChildren:0, totalOtherDependents:0, totalSeniors:0, totalSize:0}
	// client individual --- clients must be 18 or older
	++fam.totalSize
	if (client.age >= settings.seniorAge) {
		++fam.totalSeniors
	} else {
		++fam.totalAdults
	}
	// client dependents
	for (let i = 0; i < client.dependents.length; i++) {
		client.dependents[i].age = moment().diff(client.dependents[i].dob, "years")
		if (client.dependents[i].isActive == "Active") {
			if (client.dependents[i].age >= settings.seniorAge) {
				++fam.totalSeniors
			} else if (client.dependents[i].age < 18) {
				++fam.totalChildren
			} else {
				++fam.totalAdults
			}
			if (client.dependents[i].relationship == "Other") {
				++fam.totalOtherDependents
			}
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

// Removed because of errors with 12 graders - now only assumes grade entered to be next year's grade
// function utilCalcCurrentGrade(numericGrade,date){
// 	const today = moment();
// 	let dateEntered = moment(date);
// 	const wasSecondSemester = (dateEntered.dayOfYear()<125);
// 	const wasFirstSemester = !wasSecondSemester;
//   if (wasSecondSemester){
// 		dateEntered = moment().year(dateEntered.subtract(1,'year').year()).month('07').date('01');
// 	}
// 	else {
// 		dateEntered = moment().year(dateEntered.year()).month('07').date('01');
// 	}
// 	let years = today.diff(dateEntered,'year');
// 	let currentGrade = numericGrade+years;
// 	return currentGrade;
// };

function utilCalcGradeGrouping(dependent){
	let currentGrade = utilGradeToNumber(dependent.grade)
	if (currentGrade==0){
		return "K"
	}
	else if  (currentGrade>=1 && currentGrade<=2){
		return "1-2"
	}
	else if (currentGrade>=3&&currentGrade<=5){
		return "3-5"
	}
	else if (currentGrade>=6&&currentGrade<=8){
		return "6-8"
	}
	else if (currentGrade==9){
		return "9"
	}
	else if (currentGrade>=10 && currentGrade<=12){
		return "10-12"
	}
	else{
		return "Unable to Calculate Grade Level"
	}
};

// function utilCalcLastIdCheckDays() {
// 	// get Id Checked Date from client object & calculate number of days
// 	// let familyIdCheckedDate = moment(client.familyIdCheckedDate, dbDate)
// 	let lastIdCheck = moment().diff(client.familyIdCheckedDate, 'days')
// 	return lastIdCheck
// }

function utilCalcValidAgeGrade(gradeOrAge,targetService){
	display = false;
	let dependents = []
	for (let j = 0; j < client.dependents.length; j++) {
		if (gradeOrAge=="grade" &&
		!(client.dependents[j].grade == undefined || client.dependents[j].grade == "") && client.dependents[j].isActive=="Active"){
			let currentGrade = utilGradeToNumber(client.dependents[j].grade)
			if (currentGrade>=utilGradeToNumber(targetService['dependents_gradeMin'])
			&& currentGrade<=utilGradeToNumber(targetService['dependents_gradeMax'])){
				dependents.push(client.dependents[j])
			}
		}
		if (gradeOrAge == "age" && client.dependents[j].isActive == "Active"){
			let age = client.dependents[j].age
			if (age >= targetService['dependents_ageMin']
			&& age <= targetService['dependents_ageMax']){
				dependents.push(client.dependents[j])
			}
		}
  }
	return dependents
};

function utilGenerateFamiliesReport(){
	const reportType = $('#reportFamilyType').val()
	$('#msgBox').html('Generating report...')
	setTimeout(function() {
		uiShowFamiliesReportHeader(reportType)
		uiShowFamiliesReportRows(reportType)
		$('#msgBox').html('')
		uiShowHideReport("show")
	}, 0)
};

function utilGenerateMonthlyReport(){
	const monthYear = $('#reportsMonthlyMonth').val()
	const reportType = $('#reportsMonthlyType').val()
	const headerInfo = {
		 targetDiv: 'report',
		      name: 'FOOD PANTRY',
		  category: 'MONTHLY REPORT',
		reportDate: '',
		   refresh: false,
		     print: true
	}
	if (reportType == 'ALL') { headerInfo.name = 'ALL SERVICES' }
	$('#msgBox').html('Generating report...')
	setTimeout(function() {
		uiLoadReportHeader(headerInfo)
		uiShowMonthlyReportHeader(monthYear, reportType)
		uiShowMonthlyReportRows(monthYear, reportType)
		$('#msgBox').html('')
		uiShowHideReport("show")
	}, 0);
};

function utilGradeToNumber(grade){
	if (grade=="Pre-K") return -1
	if (grade == "K") return 0
	return parseInt(grade);
};

function utilInitAuth(auth) {
	authorization = auth;
}

function utilInitSession(user, cogUser) {
	currentUser = user;
	cognitoUser = cogUser;
	utilLoginUserShowScreens();
}

function utilLoginUserShowScreens() {
	uiShowHideLogin('hide')
	navGotoSec('nav1')
	// cogGetUserAttributes()
	dbGetServiceTypes()
	uiSetMenusForUser()
	settings = dbGetAppSettings()
	prnConnect()
}

function utilPadEmptyFields(data){
	$.each(data, function(key,value){
		if (key == "dependents") {
			for (var i = 0; i < value.length; i++) {
				if (value[i].grade == "") {data[key][i].grade = "*EMPTY*"}
				if (value[i].gradeDateTime == "") {data[key][i].gradeDateTime = "*EMPTY*"}
			}
		}
		if (value === "" || (key == "zipSuffix" && value === 0)) {
			if (key != "notes" && key != "dependents" && key != "fulfillment" && key != "serviceValid") {
				data[key] = "*EMPTY*"
			}
		}
	})
	return data
};

function utilRemoveEmptyPlaceholders(){
	// TODO make this operate on other forms / data
	$.each(client, function(key,value){
		if (key == "dependents") {
			for (var i = 0; i < value.length; i++) {
				if (value[i].grade == "*EMPTY*") {client[key][i].grade = ""}
				if (value[i].gradeDateTime == "*EMPTY*") {client[key][i].gradeDateTime = ""}
			}
		}
		if (value == "*EMPTY*" || (key == "zipSuffix" && value == 0)) {
			client[key] = ""
		}
	})
};

function utilRemoveService(serviceId){
	let service = dbGetService(serviceId)[0]
	service.serviceValid = false
	const result = dbSaveServiceRecord(service)
	if (result == "success") {return service}
	return
};

function utilStringToArray(str){
	let arr = []
	if (str != "{}") {
		str = str.replace(/=/g, '":"').replace(/\{/g, '{"').replace(/\}/g, '"}').replace(/, /g, '", "')
		// split the string if there are nested faux objects
		stringArr = str.split(/\"\{|\}\"/g)
		let newStr = ""
		if (stringArr.length > 1) {
			for (var i = 0; i < stringArr.length; i++) {
				if (i == 0 || i == stringArr.length -1) {
					newStr = newStr + stringArr[i]
				} else {
					if (stringArr[i].indexOf(",") != 0) {
						let subArrObj = JSON.parse("{" + stringArr[i] + "}")
						let subArr = []
						for (var key in subArrObj) {
					    if (subArrObj.hasOwnProperty(key)) {
					      subArr.push(subArrObj[key])
					    }
						}
						arr.push(subArr)
					}
				}
			}
		} else {
			obj = JSON.parse(str)
			for (var key in obj) {
		    if (obj.hasOwnProperty(key)) {
		      arr.push(obj[key])
		    }
			}
		}
	}
	return arr
};

function utilUpdateService(serviceId){
	let service = dbGetService(serviceId)
	// to handle duplicate ID's -- old data (code should no longer create duplicates)
	service = service
		.filter(item => item.serviceValid == "true")
		.sort((a, b) => moment.utc(b.updatedDateTime).diff(moment.utc(a.updatedDateTime)))
	//disable duplicate ID's that are active
	if (service.length > 1) {
		for (var i = 1; i < service.length; i++) {
			utilRemoveService(service[i].serviceId)
		}
	}
	// get values from UI
	const servicedDateTime = $("#histEdit0").val()
	const serviceName = $("#histEdit1").val()
	const clientStatus = $("#histEdit2").val()
	const homeless = $("#histEdit3").val()
	if (servicedDateTime == ""){
		utilBeep()
		return
	}
	service = service[0]
	let serviceType = serviceTypes.filter(item => item.serviceName == serviceName)[0]
	service.serviceTypeId = serviceType.serviceTypeId
	service.servicedDateTime = servicedDateTime
	service.serviceCategory = serviceType.serviceCategory
	service.serviceName = serviceName
	service.isUSDA = serviceType.isUSDA
	service.homeless = homeless
	service.servicedDay = moment(servicedDateTime).format("YYYYMMDD")
	//service.servicedMonth = moment(servicedDateTime).format("YYYYMM")
	if (service.clientFamilyName == "") {service.clientFamilyName = client.familyName}
	if (service.clientGivenName == "") {service.clientGivenName = client.givenName}
	if (service.clientZipcode == "") {service.clientZipcode = client.zipcode}
	service.updatedDateTime = utilNow()
	service.itemsServed = $("#histEdit4").val()
	service.totalAdultsServed = $("#histEdit5").val()
	service.totalChildrenServed = $("#histEdit6").val()
	service.totalIndividualsServed = $("#histEdit7").val()
	service.totalSeniorsServed = $("#histEdit8").val()
	service.servicedByUserName = currentUser.userName
	// make new service ID so ID is unique
	service.serviceId = cuid()
	let noEmpties = true
	$.each(service, function(key,value){
		if (service[key] == "") {noEmpties = false}
	})
	// TODO add error handling for history edits
	if (!noEmpties) return
	const data = JSON.stringify(service)
	const URL = aws+"/clients/services"
	result = dbPostData(URL,data)
	if (result == "success") {
		// disable old service record
		utilRemoveService(serviceId)
		return service
	}
	return
};

function utilUpdateLastServed(){
	// get the service history
	const history = dbGetClientActiveServiceHistory()
	let h = history
		.filter(item => item.serviceButtons == "Primary")
		.sort((a, b) => moment.utc(b.servicedDateTime).diff(moment.utc(a.servicedDateTime)))
	let topHist = []
	for (var a = 0; a < h.length; a++) {
		if (topHist.findIndex(item => item.serviceTypeId == h[a].serviceTypeId) < 0) {
			let lsItem = {serviceTypeId: h[a].serviceTypeId, serviceDateTime: h[a].servicedDateTime, serviceCategory: h[a].serviceCategory, isUSDA: h[a].isUSDA}
			topHist.push(lsItem)
		}
	}
	client.lastServed = topHist
	return dbSaveCurrentClient(client)
};

function utilSetLastServedFood(){
	// TODO too much duplicated code with utilCalcLastServedDays()
	let lastServedFoodDateTime = "1900-01-01"
	if (client.lastServed[0] == undefined) return lastServedFoodDateTime
	let lastServedFood = client.lastServed.filter(function( obj ) {
		return obj.serviceCategory == "Food_Pantry"
	})
	for (var i = 0; i < lastServedFood.length; i++) {
		if (lastServedFood[i].isUSDA != "Emergency") {
			if (moment(lastServedFood[i].serviceDateTime).isAfter(lastServedFoodDateTime)){
				lastServedFoodDateTime = lastServedFood[i].serviceDateTime
			}
		}
	}
	client.lastServedFoodDateTime = lastServedFoodDateTime
};

function utilCalcLastServedDays() {   // TODO DELETE AFTER SERVICE PAGE IS REACTED
	// get Last Served Date from client object & calculate number of days
	let lastServed = {daysUSDA:10000, daysNonUSDA:10000, lowestDays:10000, backToSchool:10000}
	if (client.lastServed[0] == undefined) return lastServed
	let lastServedFood = client.lastServed.filter(obj => obj.serviceCategory == "Food_Pantry")

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
	let lastServedBackToSchool = client.lastServed.filter(obj => obj.serviceCategory == "Back_To_School")
	if (lastServedBackToSchool.length > 0) {
		lastServed.backToSchool = moment(lastServedBackToSchool[0].serviceDateTime).startOf('day')
	}
	return lastServed
};

function utilCalcTargetServices(activeServiceTypes) { // TODO DELETE AFTER MOVING ALL UTILS TO REACT
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
			targets[i].family_totalChildren = "0";
		}
		// target gender male/female
		if (activeServiceTypes[i].target.gender !== "Unselected") targets[i].gender = activeServiceTypes[i].target.gender;
		// target children
		if (activeServiceTypes[i].target.child == "YES") {
			targets[i].family_totalChildren = "Greater Than 0"
			// target age
			if (activeServiceTypes[i].target.childMaxAge > 0) {
				targets[i].dependents_ageMin = activeServiceTypes[i].target.childMinAge
				targets[i].dependents_ageMax = activeServiceTypes[i].target.childMaxAge
			}
			//target grade
			if (activeServiceTypes[i].target.childMinGrade !== "Unselected") {
				targets[i].dependents_gradeMin = activeServiceTypes[i].target.childMinGrade;
			}
			if (activeServiceTypes[i].target.childMaxGrade !== "Unselected") {
				targets[i].dependents_gradeMax = activeServiceTypes[i].target.childMaxGrade;
			}
		} else if (activeServiceTypes[i].target.child == "NO"){
			targets[i].family_totalChildren = "0";
		}
		// target Voucher Service
		if (activeServiceTypes[i].target.service !== "Unselected") {
			targets[i].service = activeServiceTypes[i].target.service; //set target to Voucher service ID
		}
	}
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
};

// Replaced by REACT
// function utilDeleteNote(index){
// 	let notes = client.notes
// 	let tempNotes = notes
// 	notes.splice(index, 1)
// 	client.notes = notes
// 	const result = dbSaveCurrentClient(client)
// 	if (result == "success") {
// 		uiShowExistingNotes("refresh")
// 	} else {
// 		client.notes = tempNotes
// 	}
// }

function utilErrorHandler(errMessage, status, error, type) {

	return

// TODO manage AWS & CODE Errors

	// if (type == "aws") {
	// 	// if (message.indexOf("XMLHttpRequest")
	// 	cogLogoutUser()
	// 	const title = "Login Expired"
	// 	const message =  "Login again to continue."
	// 	uiShowHideError("show", title, message, 'beep')
	// 	cogLoginUser
	// } else if (type == "code" ) {
	// 	if (error == "argument count") {
	// 		const title = errMessage
	// 		const message =  status
	// 		uiShowHideError("show", title, message, 'beep')
	// 	}
	// } else if (type == "cognito") {
	//
	//
	//
	// }
	// 	utilBeep()
	//  	uiShowHideError("show")
}

function utilFormToJSON(form){
	let vals = {}
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
				formVal = '*EMPTY*'
			} else if (valType == 'number') {
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
};

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
										 grade: "Grade",
								  isActive: "Status",
							 serviceName: "Name",
				serviceDescription: "Description",
					 serviceCategory: "Category",
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
	let ids=[], temp=[], undupClients = []
	for (let i = 0; i < clients.length; i++) ids.push(clients[i].clientId)
	for (let i = 0; i < ids.length; i++) {
		if (temp.indexOf(ids[i])<0) {
			undupClients.push(clients[i])
			temp.push(ids[i])
		}
	}
	return undupClients
};

function utilCalcClientAge(source){
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
};

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
};

function utilCalcDependentsAges(dependents){
	$.each(dependents, function(i, dependent){
		if (dependent.dob != null){
			dependents[i].age = moment().diff(dependent.dob, "years")
		}
	})
	return dependents
};

function utilCalcFoodInterval(isUSDA, activeServiceTypes) {
	let foodServiceInterval = ""
	for (var i = 0; i < activeServiceTypes.length; i++) {
		if (activeServiceTypes[i].serviceCategory == "Food_Pantry" && activeServiceTypes[i].serviceButtons == "Primary" && activeServiceTypes[i].isUSDA == isUSDA) {
			foodServiceInterval = activeServiceTypes[i].serviceInterval
		}
	}
	return foodServiceInterval
};

function utilCalcUserAge(source){
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

function utilDayOfWeekAsString(dayIndex) {
  return ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][dayIndex]
};

function utilGetOrdinal(n) {
  var s=["th","st","nd","rd"],
  v=n%100;
  return n+(s[(v-20)%10]||s[v]||s[0])
};

function utilPadTrimString(str, length) {
	if (length > str.length) { // pad
		return str.padEnd(length)
	} else if (length < str.length) { // trim
		return str.substring(0, length)
	} else {
		return str
	}
};

function utilGetCurrentUser(username) {
	users = dbGetUsers()
	userList = users.filter(obj => obj.userName == username)
	if (userList.length == 1)
		return userList[0]
	else
		return null
}

function utilToday() {
	return moment().format(date)
};

function utilValidateField(id, classes){
	let hasError = false
	let formClass = ""
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
	let rules = utilValidateConfig(formClass, ruleId)
	let lookupList = []
	for (var i = 0; i < rules.length; i++) {
		let rule = rules[i]
		let ruleType = $.type(rules[i])
		if (ruleType === "object") {
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
		switch (rule) {
			case "required":
				if (value == "" || value == " " || value == undefined) {
					hasError = true
					uiGenerateErrorBubble("Cannot be blank!", id, classes)
				}
				break
			case "date":
				if (hasError == false) {
					if (value != "" && value != " " && value != undefined) {
						if (!moment(value).isValid()){
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
				if (id == "zipcode"){
					const clientStatus = $("#isActive").val()
					if (clientStatus == "NonClient") break
				}
				if (hasError == false) {
					let found = false
					for (var i = 0; i < lookupList.length; i++) {
						if (lookupList[i] == value) {
							found = true
						}
					}
					if (found == false) {
						hasError = true
						if (id == "zipcode"){
							uiGenerateErrorBubble("Not in service area!", id, classes)
						} else {
							uiGenerateErrorBubble("Not valid entry!", id, classes)
						}

					}
				}
				break
			case "matching":
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
					if (value.length < 2) {
						hasError = true
						uiGenerateErrorBubble("Must be longer than one letter!", id, classes)
					}
				}
				// /^[\w.\-]+$/
				if (hasError == false) {
					let specialChars = /[^-éáó úñ\w]/g // /\W/g  //not word or underscore
					if (value.match(specialChars)) {
						hasError = true
						uiGenerateErrorBubble("Special characters are not allowed!", id, classes)
					}
				}
				// if (hasError == false) {
				// 	if (value.match(/\d/g)) {
				// 		hasError = true
				// 		uiGenerateErrorBubble("Numbers are not allowed!", id, classes)
				// 	}
				// }
				break
			}
		}
	if (!hasError){
	 	$('[id="err-' + id + '"]').remove()
	 	$('[id="' + id + '"]').removeClass("errorField")
	}
	return hasError
};

function utilValidateForm(form, context){
	let formElements = $("."+form)
	let hasErrors = false
	for (let i = 0; i < formElements.length; i++) {
		let id = formElements[i].id,
				valType = formElements[i].type,
				classes = formElements[i].class,
				hasError = false
		if (form == "userForm" && context != "userProfile" && (id != "password" && id != "userName")) {
			hasError = utilValidateField(id,form+" "+"inputBox")
		}
		if (form == "clientForm") {
			if (context == "newClient"){
				if (id != "clientId") {
					hasError = utilValidateField(id, form +" "+ "inputBox")
				}
			} else {
				hasError = utilValidateField(id,form+" "+"inputBox")
			}
		}
		if (form == "serviceTypeForm") {
			hasError = utilValidateField(id, form + " " + "inputBox")
		}
		if (hasError) {
			hasErrors = true
		}
	}
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
				 						  zipcode: [ 'required', 'zipcode', {lookup: settings.serviceZip} ],
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
						 target_service: [ 'required' ],
				 target_childMinAge: [ 'integer' ], // TODO required if terget child is "YES"
			 	 target_childMaxAge: [ 'integer' ], // TODO required if terget child is "YES"
			 target_childMinGrade: [ {lookup: ["Unselected","Pre-K","K","1","2","3","4","5","6","7","8","9","10","11","12"]}  ], // TODO required if target child is "YES"
			 target_childMaxGrade: [ {lookup: ["Unselected","Pre-K","K","1","2","3","4","5","6","7","8","9","10","11","12"]}  ], // TODO required if target child is "YES"
			     fulfillment_type: [ 'required', {lookup: ["Fulfill", "Notify", "Voucher", "Voucher_Fulfill"]} ],
   fulfillment_fromDateTime: [ 'date' ],
	   fulfillment_toDateTime: [ 'date' ]
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

function utilSortDependentsByAge(dependents){
	return dependents.sort((a,b) => a.age-b.age)
};

function utilSortDependentsByGrade(dependents){
  return dependents.sort((a,b) => utilGradeToNumber(a.grade) - utilGradeToNumber(b.grade))
};

function utilValidateServiceInterval(activeServiceType, activeServiceTypes, lastServed){
	if (activeServiceType.serviceButtons == "Primary") {
		const serviceCategory = activeServiceType.serviceCategory
		let serviceHistory
		if (serviceCategory == "Food_Pantry") {
			let nonUSDAServiceInterval = utilCalcFoodInterval("NonUSDA", activeServiceTypes)
			let USDAServiceInterval = utilCalcFoodInterval("USDA", activeServiceTypes)
			if (lastServed.daysUSDA >= USDAServiceInterval) {
				if (activeServiceType.isUSDA == "USDA") return true
				return false
			}
			if (lastServed.lowestDays >= nonUSDAServiceInterval) {
				if (activeServiceType.isUSDA == "NonUSDA") return true
				return false
			}
			if (lastServed.lowestDays < nonUSDAServiceInterval) {
				if (activeServiceType.isUSDA == "Emergency") return true
				return false
			}
		}
		if (serviceCategory == "Clothes_Closet") {
			if (lastServed.lowestDays < activeServiceType.serviceInterval) return false
		}
		// validate that a voucher was already registered for
		if (activeServiceType.fulfillment.type == "Voucher_Fulfill") {
			serviceHistory = dbGetClientActiveServiceHistory()
			//const voucherHistory = utilCalcVoucherServiceSignup(activeServiceType)
			const voucherHistory = utilGetVoucherTargetService(serviceHistory, activeServiceType)
			let voucherDays = 10000
			if (voucherHistory.length == 1) {
				voucherDays = moment().diff(voucherHistory[0].servicedDateTime, 'days')
			}
			if (activeServiceType.target.service == "Unselected") {
				if (voucherDays < activeServiceType.serviceInterval) {
					return false
				}
		  } else {
				if (voucherDays == 10000) {
			  	return false
				}
			}
		}
		//TODO: this is a workaround due to last served not tracking id. Need last served to track by service id.
		if (activeServiceType.fulfillment.type == "Voucher"){
			let service = dbGetServicesByIdAndYear(activeServiceType.serviceTypeId, moment().year())
				.filter(obj => obj.clientServedId == client.clientId)
			if (service.length == 0){
				return true;
			}
			else {
				return false;
			}
		}
		let inLastServed = client.lastServed.filter(obj => obj.serviceCategory == serviceCategory)
		if (inLastServed.length > 0) {
			// if a voucher fulfill service then need to chech against Voucher service
			if (activeServiceType.fulfillment.type == "Voucher_Fulfill") {
				// get voucher service
				const voucherHistory = utilGetHistoryLastService(serviceHistory, activeServiceType)
				if (voucherHistory.length > 0) {
					return false;
				}
			} else {
				inLastServed = inLastServed[0].serviceDateTime
			}
		} else if (serviceCategory == "Administration") {
			inLastServed = client.familyIdCheckedDate
		} else {
			inLastServed = "2000-01-01"
		}
		const lastServedDate = moment(inLastServed).startOf('day')
		if (moment().startOf('day').diff(lastServedDate, 'days') < activeServiceType.serviceInterval) return false
	} else {
		// secondary buttons
		if (lastServed.lowestDays < activeServiceType.serviceInterval) return false
	}
	// default: show button
	return true
};

// **********************************************************************************************************
//     PRN PRINTER FUNCTIONS
// **********************************************************************************************************
// global printer vars
let ePosDev = new epson.ePOSDevice();
let img = document.getElementById('smum');
let printer = null;

function prnConnect() {
	prnDrawCanvas('smum');
 	ePosDev.connect(settings.printerIP, '8008', prnCallback_connect);
};

function prnCallback_connect(resultConnect){
 	var deviceId = 'local_printer';
 	var options = {'crypto' : false, 'buffer' : false};
 	if ((resultConnect == 'OK') || (resultConnect == 'SSL_CONNECT_OK')) {
	 	//Retrieves the Printer object
	 	ePosDev.createDevice(deviceId, ePosDev.DEVICE_TYPE_PRINTER, options, prnCallback_createDevice);
 	}	else {
	 	//Displays error messages
	 	console.log("Error in callback_connect");
 }
};

function prnGetWindow() {
	let win = window.open('', 'Receipt Printer', 'width=550,height=1000');
	win.document.title = 'Receipt Printer';
	return win;
}

function prnCallback_createDevice(deviceObj, errorCode){
 	if (deviceObj === null) {
		//Displays an error message if the system fails to retrieve the Printer object
	 	console.log("error in callback_createDevice 1");
	 	return;
 	}
 	printer = deviceObj;
 	//Registers the print complete event
 	printer.onreceive = function(response){
	 	if (response.success) {
		 	console.log("success in callback_createDevice");
	 	} else {
			console.log("error in callback_createDevice 1");
	 	}
 	}
};

function prnDrawCanvas(name) {
	let canvas = document.getElementById(name);
	let img = document.getElementById(name + 'img');
	// img.setAttribute('crossOrigin', 'Anonymous');
	canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
}

function prnStartReceipt() {
	let logo = document.getElementById('smum');
	if (printer) {
		printer.addTextAlign(printer.ALIGN_CENTER);
		printer.addTextSmooth(true);
		printer.addImage(logo.getContext('2d'), 0, 0, logo.width, logo.height,
			printer.COLOR_1, printer.MODE_GRAY16);
	} else {
		let prnWindow = prnGetWindow();
		prnWindow.document.writeln('<p align="center">');
		let logo_id = 'logo' + Math.floor(Math.random() * 10000);
		let w = Math.floor(logo.width * 2 / 3);
		let h = Math.floor(logo.height * 2 / 3);
		prnWindow.document.writeln('<canvas id="' + logo_id + '" width="' + w +
			'" height="' + h + '"></canvas>');
		let ctx = prnWindow.document.getElementById(logo_id).getContext('2d');
		ctx.drawImage(logo, 0, 0, w, h);
	}
	prnFeed(1);
	prnTextLine('778 S. Almaden Avenue');
	prnTextLine('San Jose, CA 95110');
	prnTextLine('(408) 292-3314');
}

function prnAlign(align) {
	if (printer) {
		if (align == 'left')
			printer.addTextAlign(printer.ALIGN_LEFT);
		else if (align == 'center')
			printer.addTextAlign(printer.ALIGN_CENTER);
	}
	else {
		let prnWindow = prnGetWindow();
		prnWindow.document.writeln('</p><p align="' + align + '">')
	}
}

function prnTextLine(str, width, height, attrs) {
	if (width == null)
		width = 1;
	if (height == null)
		height = 1;
	let inverse = attrs && attrs.indexOf('inverse') >= 0;
	if (printer) {
		printer.addTextSize(width, height);
		if (inverse)
			printer.addTextStyle(true,false,false,printer.COLOR_1);
		printer.addText(str + '\n');
		if (inverse)
			printer.addTextStyle(false,false,false,printer.COLOR_1);
	} else {
		let prnWindow = prnGetWindow();
		let style = "font-family:monospace;";
		if (height > 1)
			style += 'font-size:' + height*100 + '%;';
		if (inverse)
			style += 'color:white;background-color:black;';
		prnWindow.document.writeln('<span style="' + style + '">' +
			str.replace(/ /g, '&nbsp;') + '<br/></span>')
	}
}

function prnFeed(n) {
	if (printer) {
		printer.addTextSize(1, 1);
  	printer.addFeedLine(n);
	} else {
		let prnWindow = prnGetWindow();
		for (let i = 0; i < n; i++) {
			prnWindow.document.writeln('<br/>');
		}
	}
}

function prnEndReceipt() {
	if (printer) {
		printer.addFeedLine(2);
		printer.addCut(printer.CUT_FEED);
	} else {
		let prnWindow = prnGetWindow();
		prnWindow.document.writeln('</p><br/><br/><hr/>');
	}
}

function prnFlush() {
	if (printer)
		printer.send();
}

function prnServiceHeader(title) {
	prnFeed(2);
	prnTextLine('* ' + title + ' *', 1, 2);
	prnTextLine(moment().format("MMMM Do, YYYY LT"));
	prnFeed(1);
	prnTextLine(client.givenName + ' ' + client.familyName, 2, 2);
	prnFeed(1);
	prnTextLine(' ' + client.clientId + ' ', 2, 1, ['inverse']);
}

function prnPickupTimes(fromDateTime, toDateTime) {
	prnTextLine('**************************************')
	prnTextLine('PRESENT THIS FOR PICKUP')
	prnTextLine('HAY QUE PRESENTAR PARA RECLAMAR')
	prnTextLine(' ' + moment(fromDateTime).format("MMMM Do, YYYY")+ ' ', 2, 2, ['inverse']);
	prnFeed(1);
	prnTextLine(' ' + moment(fromDateTime).format("h:mm a") + ' - ' +
		moment(toDateTime).format("h:mm a") + ' ', 1, 1, ['inverse']);
	prnTextLine('**************************************');
}

function prnPrintClothesReceipt(serviceType) {
	const numArticles = client.family.totalSize * serviceType.numberItems;
	const timeLimit = 15; // TODO get from service properties

	prnStartReceipt();
	prnServiceHeader('CLOTHES CLOSET PROGRAM');
	prnFeed(1);
	prnTextLine('CHILDREN | NIÑOS\t\t' + client.family.totalChildren);
	prnTextLine('ADULTS | ADULTOS\t\t' +
		(client.family.totalAdults + client.family.totalSeniors));
	prnFeed(1);
	prnTextLine('LIMIT OF ' + serviceType.numberItems + ' ITEMS PER PERSON');
	prnTextLine('LIMITE ' + serviceType.numberItems + ' ARTÍCULOS POR PERSONA');
	prnFeed(1);
	prnTextLine('TOTAL ITEMS | ARTÍCULOS');
	prnTextLine('**************************************')
	prnTextLine(' ' + numArticles + ' ', 2, 2, ['inverse']);
	prnTextLine('**************************************');
  prnFeed(1);
	prnTextLine('MAXIMUM TIME ' + timeLimit + ' MINUTES');
	prnTextLine('TIEMPO MÁXIMO ' + timeLimit + ' MINUTOS');
  prnFeed(2);
	prnTextLine('TIME IN___________   TIME OUT___________');
	prnEndReceipt();
}

function prnPrintFoodReceipt(isUSDA) {
	prnStartReceipt();
	prnServiceHeader('EMERGENCY FOOD PANTRY PROGRAM');
	prnTextLine('(' + client.zipcode +	')');
	prnFeed(1);
	prnTextLine('CHILDREN | NIÑOS\t\t' + client.family.totalChildren);
	prnTextLine('ADULTS | ADULTOS\t\t' +
		(client.family.totalAdults + client.family.totalSeniors));
	prnTextLine('FAMILY | FAMILIA:\t\t' + client.family.totalSize);
	prnFeed(1);
	prnTextLine('**************************************')
	prnTextLine(' ' + isUSDA + ' ', 2, 2, ['inverse']);
	prnTextLine('**************************************');
	prnEndReceipt();
}

function prnPrintVoucherReceipt(serviceType, dependents, grouping) {
	let serviceName = serviceType.serviceName;
	prnStartReceipt();
	prnServiceHeader(serviceName.toUpperCase());
	prnFeed(1);
	if (dependents) {
		let sortingFn, groupingFn;
		prnAlign('left');
	  if (grouping == 'age') {
			sortingFn = utilSortDependentsByAge;
			groupingFn = utilCalcAgeGrouping;
			prnTextLine('CHILDREN / NIÑOS        GENDER   AGE');
		} else if (grouping = 'grade') {
			sortingFn = utilSortDependentsByGrade;
			groupingFn = utilCalcGradeGrouping;
			prnTextLine('CHILDREN / NIÑOS        GENDER   GRADE');
		}
		prnFeed(1);
		for (let dep of sortingFn(dependents)) {
			let childName = utilPadTrimString(dep.givenName.toUpperCase() +
				' ' + dep.familyName.toUpperCase(), 24);
			let gender =  utilPadTrimString(dep.gender.toUpperCase(), 9);
			let group = utilPadTrimString(groupingFn(dep), 5);
			prnTextLine(childName + gender + group);
		}
		prnFeed(1);
	}
	prnAlign('center');
	prnPickupTimes(serviceType.fulfillment.fromDateTime,
		serviceType.fulfillment.toDateTime);
  prnEndReceipt();
}

function prnPrintReminderReceipt() {
	// Determine next visit date
	let targetDate = moment().add(14, 'days');
	let earliestDate = moment().add(7, 'days');
	let nextVisit = dateFindOpen(targetDate, earliestDate);
	prnStartReceipt();
	prnServiceHeader('NEXT VISIT REMINDER');
	prnFeed(1);
  prnTextLine('NEXT VISIT | PRÓXIMA VISITA');
  prnTextLine('**************************************')
  prnTextLine(' ' + nextVisit.format("MMMM Do, YYYY") + ' ', 1, 2, ['inverse']);
  prnTextLine('**************************************');
  prnEndReceipt();
}

// Printer testing
receiptIndex = 0;
const receiptTypes = 6;

function clickPrintTestSingle() {
	prnTestReceipt(receiptIndex);
	prnFlush();
	receiptIndex = (receiptIndex + 1) % receiptTypes;
}

function clickPrintTestBatch() {
	for (let i=0; i < receiptTypes; i++)
		prnTestReceipt(i);
	prnFlush();
}

function prnTestReceipt(receiptType) {
	let service;
	switch(receiptType) {
		case 0:
			service = serviceTypes.filter(obj => obj.serviceName == 'Clothes')[0];
			prnPrintClothesReceipt(service);
			break;
		case 1:
			prnPrintFoodReceipt('USDA');
			break;
		case 2:
			prnPrintReminderReceipt();
			break;
		case 3:
			service = serviceTypes.filter(obj => obj.serviceName == 'Thanksgiving Turkey')[0];
			prnPrintVoucherReceipt(service);
			break;
		case 4:
			service = serviceTypes.filter(obj => obj.serviceName == 'Christmas Toy')[0];
			prnPrintVoucherReceipt(service, client.dependents, 'age');
			break;
		case 5:
			service = serviceTypes.filter(obj => obj.serviceName == 'First Step')[0];
			prnPrintVoucherReceipt(service, client.dependents, 'grade');
			break;
	}
}
