fillDate()

gotoTab("tab1")

let api = "https://hjfje6icwa.execute-api.us-west-2.amazonaws.com/prod"
document.onkeydown = function(e) {
	if ($("#searchField").is(":focus")&&e.keyCode==13) {event.preventDefault(); clientSearchResults()}
}

$(document.body).on('change','.clientForm',function(){saveButton('client', 'Save')});
$(document.body).on('change','.serviceTypeForm',function(){saveButton('serviceType', 'Save')});

function saveButton(form, action){
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

console.log(action)
		action = action.toLowerCase()
		action = action.replace(/[#_!.*]/g, '')

console.log(action)

		$('#'+form+'SaveButton').addClass(action)
	}
}


function gotoNav(nav){
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
			fillUserData()
			displayUserEdit()
			currentNavTab = "userDiv"
			break
		case "nav5": // LOGINOUT
			// currentNavTab = "logInOut"
			if ($('#nav5').html() === 'Login'){
				showHideLogin('show')
			} else {
				logoutUser()
				$('#nav5').html('Login')
				$('#nav4').html('')
			}
		}
	$("#"+currentNavTab).show()
}


function navSwitch(link){
	switch (link) {
		case "clients":
			gotoNav("nav1")
			gotoTab("tab1")
			displayServicesView()
			break
		case "newClient":
			gotoNav("nav2")
			addClient()
			break
		case "admin":
			gotoNav("nav3")
			gotoTab("aTab1")
			showServiceTypes()
			 // admin() show service form
			break
		case "user":
			gotoNav("nav4")
			gotoTab("uTab1")
			// userProfile()
			break
		case "logInOut":
			gotoNav("nav5")

	}
}

function showServiceTypes(){
	// $('#serviceTypesContainer').html(getTemplate('#newServiceTypeButton'))
	// header
	buildSelectHTMLTable('#serviceTypesContainer',serviceTypes,["serviceName","serviceDescription","isActive"],'serviceTypesTable')
}

function newServiceTypeForm(){

}

function newClientNote(){

}


// $('#searchContainer').html(getTemplate('#newClientButton'))

let rowNum = 1
let MAX_ID_DIGITS = 4
let displayDate = 'MM/DD/YYY'
let longDate = "MMMM Do YYYY LT"
let dbDate = 'YYYY-MM-DD'
let dbDateTime = 'YYYY-MM-DDTHH:mm'
let clientData = null // current client search results
let clientNotes = []
let client = {} // current client
let serviceType = null
var isEmergency = false
let currentNavTab = "clients"

// cognito
let CognitoUserPool = AmazonCognitoIdentity.CognitoUserPool;

let  poolData = {
		UserPoolId : 'us-west-2_AufYE4o3x', // Your user pool id here
		ClientId : '7j3jhm5a3pkc67m52bf7tv10au' // Your client id here
};
let userPool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(poolData);


let session = {}
let cognitoUser = {}
let authorization = {}

showHideLogin('show')



// allEpochToDates(serviceTypes, "serviceTypes") TODO remove EPOCH DATES


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

function showHideLogin(todo){
	if (todo === 'show'){
		$('.loginOverlay').show().css('display', 'flex')
	} else {
		$('.loginOverlay').hide()
		$('#loginEmail').val('')
		$('#loginPassword').val('')
	}
}

// let userData = {
// 	 Username: 'jleal67',
// 	 Pool: userPool
// };
//
// cognitoUser = new AWSCognito.CognitoIdentityServiceProvider.CognitoUser(userData);

function showHidePassword(){
	console.log('in functoin')
	if ($('#loginPassword').attr('type') == 'password') {
    $('#loginPassword').attr('type', 'text');
	} else {
    $('#loginPassword').attr('type', 'password');
	}
}

function loginUser() {

console.log("IN LOGIN USER")

	let username = $('#loginEmail').val()
	let password = $('#loginPassword').val()
  let authData = {
     Username: username,
     Password: password
  };

console.log(authData)

  let authDetails = new AWSCognito.CognitoIdentityServiceProvider.AuthenticationDetails(authData);
  let userData = {
     Username: username,
     Pool: userPool
  };
  cognitoUser = new AWSCognito.CognitoIdentityServiceProvider.CognitoUser(userData);
  cognitoUser.authenticateUser(authDetails, {
    onSuccess: (result) => {
      session.user = cognitoUser;

console.log("logged in")

			authorization.accessToken = result.getAccessToken().getJwtToken()
			authorization.idToken = result.idToken.jwtToken
			$('#nav4').html('<i class="fa fa-user" aria-hidden="true"></i> ' + session.user.username)
			$('#nav5').html('Logout')
			showHideLogin('hide')
			gotoNav('nav1')
			userGetAttributes()
			serviceTypes = GETServices()
    },
    onFailure: (err) => {
			if (err === 'Error: Incorrect username or password.') {
				beep()
			} else if (err === 'UserNotFoundException: User does not exist.') {
				beep()
				beep()
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

function userGetAttributes(){

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

function logoutUser(){
	authorization = {}
	if (authorization.idToken == undefined) {
		cognitoUser.signOut();
		showHideLogin('show')
	}
}

function userChangePassword(){
	cognitoUser.changePassword('oldPassword', 'newPassword', function(err, result) {
    if (err) {
      alert(err);
      return;
    }
    console.log('call result: ' + result);
  });
}


function newPasswordRequired(){

console.log("in new password required")

}


function cognitoLogin(){

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
			var verificationCode = prompt('Please input verification code' ,'');
			cognitoUser.sendMFACode(verificationCode, this);
		}
 });
}

function cognitoListUsers(){



	// Set the region where your identity pool exists (us-east-1, eu-west-1)
	AWSCognito.config.region = 'us-west-2';

	// Configure the credentials provider to use your identity pool
	AWSCognito.config.credentials = new AWSCognito.CognitoIdentityCredentials({
	    IdentityPoolId: 'us-west-2:d6cc97a3-a582-4295-a901-4d312b92c47a',
	});

	// Make the call to obtain credentials
	AWSCognito.config.credentials.get(function(){

	    // Credentials will be available when this function is called.
	    var accessKeyId = AWSCognito.config.credentials.accessKeyId;
	    var secretAccessKey = AWSCognito.config.credentials.secretAccessKey;
	    var sessionToken = AWSCognito.config.credentials.sessionToken;

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

	var cognitoidentityserviceprovider = new AWSCognito.CognitoIdentityServiceProvider();
	cognitoidentityserviceprovider.listUsers(params, function(err, data) {
	  if (err) console.log(err, err.stack); // an error occurred
	  else     console.log(data);           // successful response
	});
}


// function buildClientEditAddition(){
// 	var editAdditionForm = [
// 		[
// 			[
// 			['label',["Financials"],[['style','margin-top:25px;margin-right:10px;']]]
// 			]
// 		],
// 		[
// 			[
// 			['label',['Food Stamps:'],[['class','firstRowP']]],
// 			['textinput',[''],[['value',client['financials']['foodStamps']],['id','foodStamps'],['style','width:100px']]]
// 			],
// 			[
// 			['label',['Income:'],[]],
// 			['textinput',[''],[['value',client['financials']['income']],['id','income'],['style','width:100px']]]
// 			],
// 			[
// 			['label',['Rent:'],[]],
// 			['textinput',[''],[['value',client['financials']['rent']],['id','rent'],['style','width:100px']]]
// 			],
// 			[
// 			['label',['Rent:'],[]],
// 			['textinput',[''],[['value',client['financials']['govtAssistance']],['id','govtAssistance'],['style','width:100px']]]
// 			]
// 		],
// 		[
// 			[
// 			['save',['submitEdit()'],[]],
// 			['cancel',['displayEditClient(true)'],[]],
// 			]
// 		]
// 	]
// 	var ans = buildForm(editAdditionForm,true)
// 	return ans;
// }

function populateForm(data, form){
	$.each(data, function(key,value){
		if (typeof(data[key])=='object') {
			let obj = data[key]
			$.each(obj, function(key2,value2){
				let el = '.inputBox[id="'+key+'.'+key2+'"].'+form

console.log(key+' : '+key2)
console.log($(el))


				if($(el).is("select")) {
					el = el + ' option[value="'+ value2 +'"]'
					$(el).prop('selected', true);
				} else {
					$(el).val(value2)
				}
			});
		} else {
			let el = '[id="'+key+'"].'+form

console.log(key)
console.log($(el))

			if($(el).is("select")) {
				el = el + ' option[value="'+ value +'"]'
				$(el).prop('selected', true);
			} else {
				$(el).val(value)
			}
				// $('input#'+key+'.'+form).val(value) // if input
				// $('select[id="'+key+'"] option[value="'+ value +'"].'+form).prop('selected', true); // if select
		}
	});

	if (form === 'serviceTypeForm') {
		toggleAgeGrade()
		toggleFulfillDates()
	} else if (form === 'clientForm'){
		$('#clientAge').val(client.age) // readonly unsaved value
		toggleClientAddress()
	}
	return
}


// function buildAddClientForm(id){
// 	var addForm = [
// 		[
// 			[
// 			['subheading',[id.toString()],[]]
// 			]
// 		],
// 		[
// 			[
// 			['heading',['Client Name'],[]]
// 			]
// 		],
// 		[
// 			[
// 			['textinput',[''],[['class','right'],['id','firstSeenDate'],['style','width:135px']]],
// 			['label',['Date First Seen'],[['class','right']]]
// 			]
// 		],
// 		[
// 			[
// 			['label',['Given Name'],[['class','firstRowP']]],
// 			['textinput',[''],[['id','givenName'],['style','width:150px']]]
// 			],
// 			[
// 			['label',['Family Name'],[]],
// 			['textinput',[''],[['id','familyName'],['style','width:150px']]]
// 			],
// 			[
// 			['label',['DOB'],[]],
// 			['textinput',[''],[['id','dob'],['style','width:100px']]]
// 			]
// 		],
// 		[
// 			[
// 			['label',['Homeless'],[['class','firstRowP']]],
// 			['dropdown',['true','false'],[['id','homeless'],['style','width:75px']]]
// 			]
// 		],
// 		[
// 			[
// 			['label',['Street'],[['class','firstRowP']]],
// 			['textinput',[''],[['id','street'],['style','width:300px']]]
// 			]
// 		],
// 		[
// 			[
// 			['label',['City'],[['class','firstRowP']]],
// 			['textinput',[''],[['id','city'],['style','width:250px']]]
// 			],
// 			[
// 			['label',['State'],[]],
// 			['textinput',[''],[['id','state'],['style','width:75px']]]
// 			],
// 			[
// 			['label',['Zipcode'],[]],
// 			['textinput',[''],[['id','zipcode'],['style','width:100px']]]
// 			]
// 		],
// 		[
// 			[
// 			['label',['Phone'],[['class','firstRowP']]],
// 			['textinput',[''],[['id','telephone'],['style','width:150px']]]
// 			],
// 			[
// 			['label',['Email'],[]],
// 			['textinput',[''],[['id','email'],['style','width:150px']]]
// 			]
// 		],
// 		[
// 			[
// 			['label',['Family ID'],[['class','firstRowP']]],
// 			['textinput',[''],[['id','familyIdCheckedDate'],['style','width:150px']]]
// 			],
// 			[
// 			['label',['Gender'],[]],
// 			['dropdown',['Male','Female'],[['id','gender'],['style','width:150px']]]
// 			],
// 			[
// 			['label',['Ethnic Group'],[]],
// 			['dropdown',['Afro-American','Anglo-European','Asian/Pacific Islander','Filipino','Latino','Native American','Other'],[['id','ethnicGroup'],['style','width:150px']]]
// 			]
// 		],
// 		[
// 			[
// 			['save',['submitAdd()'],[]],
// 			['cancel',['addClient()'],[]],
// 			]
// 		]
// 	]
// 	var ans = buildForm(addForm,true)
// 	return ans;
// }

function clear(){/**clears all fields**/
	// $('input').attr('readonly', false);
	// $(".date").hide();
	// $(".search").val('')
	// $('.main-div').html('')
	// $('.main-div').attr('style','')
	// $('.side-div').attr('style','')
	// $('.side-div').html('')
	// $('#noteText').val('')
}

function displayNotes(pageName){/**Displays notes table for a given page**/
	//setMainSideDiv()
	var tableStr = '<table class="notes"></table>'
	$('#notesContainer').html(tableStr)
	var headerRow = '<tr style="height:50px;padding:10px;"><td><h4 class="siteHeading">'+pageName+'</h4>'
	headerRow+='<h5 class="siteHeading">'+moment().format(displayDate)+'</h5></td></tr>'
	$('.notes').append(headerRow)
}

function addNoteButtonRow(){
	var buttonRow = '<div class="row"><a data-toggle="modal" data-target="#myModal" class="btn-nav addNoteButton">'
	buttonRow+='+Note</a></div></table>'
	$('#notesContainer').append(buttonRow)

}

function POST(uUrl,dataU){
	if (authorization.idToken == 'undefined') {
		beep()
		consol.log("need to log in")
		return
	}
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
					beep()
					// ***** TODO error message
				} else {
					if (uUrl.includes('/servicetypes')) {
						serviceTypes = GETServices()
						showServiceTypes()
						updateServiceHeader()
						populateForm(serviceType, 'serviceTypes')
						saveButton('serviceType', 'SAVED!!')
					} else if (uUrl.includes('/clients')) {
						let row = clientsUpdateData()
						buildSelectHTMLTable('#searchContainer',clientData,["clientId","givenName","familyName","dob","street"],'clientTable')
						outlineTableRow('clientTable', row)
						clientsHeader('#'+client.clientId + ' | ' + client.givenName + ' ' + client.familyName)
						saveButton('client', 'SAVED!!')
					}
				}
		},
		error: function(json){
	    	console.log(json)
				if (uUrl.includes('/servicetypes')) {
					saveButton('serviceType', 'ERROR!!')
				} else if (uUrl.includes('/clients')) {
					saveButton('client', 'ERROR!!')
				}
		}
	});
	return ans
}

function clientsUpdateData(){
	let row = null
	let data = formToJSON('.clientForm')
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

function isLoggedIn(){
	if (authorization.idToken == undefined) {

		return false
	} else {
		return true
	}
}


function GET(uUrl){
console.log("in get")

	var urlNew = uUrl;
	var ans = null;

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
					console.log(json.count)
					console.log(urlNew)
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

function submitAdd(){
	POSTNewClient()
	refreshHome()
}

function resetServiceTypeForm(){
	console.log('in reset')
	populateForm(serviceType, 'serviceTypeForm')
}


function submitEdit(){
	POSTEditClient()
	refreshHome()
}

function POSTNewClient(){
	var data = formToJSON()
	var URL = api+"/clients/"
	POST(URL,data)
}

function POSTEditClient(){
	var data = editToJSON()
	var URL = api+"/clients/"
	POST(URL,data)
}

function GETServices(){
	return GET(api+"/servicetypes").serviceTypes
}

function GETClient(id){
	return GET(api+"/clients/"+id).clients[0]
}

// function buildForm(l1,allBlue){
// 	var ans = ""
// 	for (var i=0;i<l1.length;i++){
// 		ans+='<div class="formRow">'
// 		for (var j=0;j<l1[i].length;j++){
// 			ans+='<div class="formEntry">'
// 			for (var k=0;k<l1[i][j].length;k++){
// 				var entry = l1[i][j][k]
// 				var type = entry[0]
// 				var vals = entry[1]
// 				var attr = entry[2]
// 				var tag = ''
// 				var saveCancel = false
// 				if (type=="heading"){
// 					tag ='<h3'
// 				}
// 				if (type=="subheading"){
// 					tag ='<h4'
// 				}
// 				if (type=="textinput"){
// 					tag ='<input'
// 				}
// 				if (type=="dropdown"){
// 					tag = '<select'
// 				}
// 				if (type=="label"){
// 					tag='<p'
// 				}
// 				if (type=="save"){
// 					ans+='<a class="btn-nav saveButton" onclick="'+vals[0]+'">Save</a>'
// 					saveCancel=true
// 				}
// 				if (type=="cancel"){
// 					ans+='<a class="btn-nav cancelButton" onclick="'+vals[0]+'">Cancel</a>'
// 					saveCancel=true
// 				}
// 				if (!saveCancel){
// 					ans += tag
// 					changed = false
// 					for (var l=0; l<attr.length;l++){
// 						if (attr[l][0]=="class" && allBlue){
// 							ans += " "+attr[l][0]+'="'+attr[l][1]+' blueInlineBold"'
// 							changed= true
// 						}
// 						else{
// 							ans += " "+attr[l][0]+'="'+attr[l][1]+'"'
// 						}
// 					}
// 					if (!changed){
// 						ans+= ' class="blueInline"'
// 					}
// 					ans += ">"
// 					for (var m=0;m<vals.length;m++){
// 						if (tag=="<select"){
// 							ans+='<option value="'+vals[m]+'">'+vals[m]+'</option>'
// 						}
// 						else{
// 							ans+=vals[m]
// 						}
// 					}
//
// 					if (tag!='<input'){
// 						ans+=tag.substring(0,1)+"/"+tag.substring(1)+">"
// 					}
// 				}
// 			}
// 		ans+="</div>"
//
// console.log(ans)
//
// 		}
// 		ans+="</div>"
// 	}
// 	console.log(ans)
// 	return ans
// }

function admin(){
	clear()
	rowNum = 1




	//********TO DO HEADER info *********

	/// LIST ALL SERVICE Types

	/// make tab for service type form


	$('#serviceTypeFormContainer').html(buildAdminForm())
	/**Line above displays the Services Types Form**/
}

function clientsHeader(title){
	$("#clientsTitle").html(title)
}

function adminHeader(title){
	$("#adminTitle").html(title)
}

function updateServiceHeader(){

	// **** TODO this is not working right

	$("#adminTitle").html($('#serviceName').val())
}

function updateClientAge(){
	let dob = $("#dob.clientForm").val()
	let age = moment().diff(dob, 'years')
	if (Number(age)){
		$("#clientAge").val(age)
		client.age = age
	}
}

function displayUserEdit(){

	$('#userFormContainer').html(getTemplate('#userForm'))

}

function displayEditClient(isEdit){

	rowNum = 1
	displayNotes("Client Notes")

	$('#clientFormContainer').html(getTemplate('#clientForm'))

	populateForm(client, 'clientForm')

	dependantsHeader = '<div style="margin-top:25px" id="dependents" class="formRow"><div class="formEntry"><p class="blueBold blueInline">Dependants</p></div></div>'
	//$('#content4').html(dependantsHeader)
	addClientNotes(client['clientId'])
	if (client.dependents!=null){
		buildSelectHTMLTable('#dependentsFormContainer',client.dependents,["givenName","familyName",'relationship','gender',"dob","isActive"],'dependentsTable')
	}

	if (isEdit){
		var plusButton = '<a href="#" onclick="addRow()" style="font-size:18px;width:150px;margin-bottom:8px;margin-top:10px;display: inline-block;" class="btn btn-block btn-primary btn-success">+</a>'
		$('#dependents').append('<div class="formEntry">'+plusButton+'</div>')
	}

	if (isEdit){
		toggleClientViewEdit('edit')
		//$('.main-div').append(buildClientEditAddition())
		// $('input').attr('readonly', false);
		// $('select').attr('disabled', false);
		// $('.blueInline').attr('readonly', false)
		// $('.blueInline').attr('disabled', false)
	}
	if (!isEdit){
		toggleClientViewEdit('view')


		// var historyEdit = '<div style="text-align:center;padding: 20px;" class="formRow"><a '+'onclick="history('+client['clientId']+','+"'.main-div'"+")"+'" href="#" style="display:inline-block" class="btn-nav">History</a>'
		// historyEdit+='<a onclick="displayEditClient(true)" style="display:inline-block" class="btn-nav">Edit</a></div></div>'
		// $('.main-div').append(historyEdit)
		//$('input').attr('readonly', true);
		// $('.blueInline').attr('readonly', true)
		// $('.blueInline').attr('disabled', true)
		// $('select').attr('disabled', true);
	}
}

function newServiceTypeForm(){
	$('#serviceTypeFormContainer').html(getTemplate('#serviceTypeForm'))
	$('#serviceTypeId').val(cuid())
	gotoTab("aTab2")
}

function newClientForm(){
	client = ""
	$('#clientFormContainer').html(getTemplate('#clientForm'))
	let today = moment().format(dbDate)

console.log(today)

	$('#createdDateTime.clientForm').val(today)
	$('#updatedDateTime.clientForm').val(today)
	$('#familyIdCheckedDate.clientForm').val(today)
	$('#firstSeenDate.clientForm').val(today)

	$('#homeless.clientForm').val('false')
	$('#city.clientForm').val('San Jose')
	$('#state.clientForm').val('CA')

console.log($('#familyIdCheckedDate.clientForm'))



// ***** TODO add default values dates, state, city etc.

	gotoTab("tab3")
}




function showServiceTypeForm(){
	$('#serviceTypeFormContainer').html(getTemplate('#serviceTypeForm'))
	populateForm(serviceType, 'serviceTypeForm')
}


function createDrop(dropId){
	drop = new Drop
  target: document.querySelector('.drop-target')
  content: 'Welcome to the future!'
  position: 'bottom left'
  openOn: 'click'
}

function GETServicesNotes(id){
	return GET(api+"/services/"+id).services
}

function GETClientNotes(id){
	var URL = api+"/clients/notes/"+id;
	arr = GET(URL).notes


	allEpochToDates(arr, "clientsNotes")

console.log(arr)

	return arr
}

function displayNote(text,text2){
	$('.notes').append('<tr><td class="data">'+text+'</td>'+'<td class="data">'+text2+'</td></tr>')
}

function POSTNote(text){
	var ans = {}
	ans['noteOnClientId'] = client['clientId']
	ans['noteText'] = text.toString()
	ans['createdDateTime']=Math.round((new Date()).getTime() / 1000).toString()
	ans['noteByUserId'] = '12f8176c38186cad1705a6f3af8b8c0ad0b23200'
	ans['noteByUserName']="Kush Jain"
	ans['clientNoteId'] = uuidv1().toString()
	console.log(JSON.stringify(ans))
	POST(api+"/clients/notes/",JSON.stringify(ans))
}
function addClientNotes(id){
	arr = GETClientNotes(id)
	addOldNotes(arr)
}

function addOldNotes(arr){
	for (var i = 0; i < arr.length; i++){
    	var obj = arr[i];
    	displayNote(obj.noteText, obj.createdDateTime)
    }
}

function newNote(text,text2){
	displayNote(text,text2)
	POSTNote(text)
}

function history(){
  //data = GETServicesNotes(client.clientId)
  columns = ["createdDateTime","updatedDateTime","firstSeenDate", "lastSeenDate", "familyIdCheckedDate"]
	let clientArray = []
	clientArray.push(client)
	buildSelectHTMLTable('#content5',clientArray,columns,'historyTable')
}

function outlineTableRow(table, row){
	$('#' + table + ' tr:eq('+ row + ')').css('outline', '2px solid').siblings().css('outline', 'none')
}


function clientSetCurrent(index){
	let row = index + 1
	outlineTableRow('clientTable', row)
	client = clientData[index]
	calculateFields("clients") // calculate fields counts and ages

console.log(client.age)


	clientsHeader('#' + client.clientId + ' | ' + client.givenName + ' ' + client.familyName)

	isEmergency = false // **** TODO what is this for?

	displayServicesView()
	displayEditClient(false)
	history()
}

function serviceTypesSetCurrent(index){
	serviceType = serviceTypes[index]
	outlineTableRow('serviceTypesTable', index+1)
	adminHeader(serviceType.serviceName)

	showServiceTypeForm()
	gotoTab("aTab2")
}


function addRow(){
	var dependantRow = "<tr><td><input class='givenName' style='width:100px'></td><td><input class='familyName' style='width:100px'></td><td><select class='relationship' style='width:100px'><option value='Spouse'>Spouse</option><option value='Child'>Child</option></select></td><td><select class='gender' style='width:100px'><option value='Male'>Male</option><option value='Female'>Female</option></select></td><td><input class='dob' style='width:100px'></td><td><select class='isActive' style='width:100px'><option value='true'>true</option><option value='false'>false</option></td>"
	$('#myTable').append(dependantRow)
}

// function getDate(add15){
// 			var today = new Date();
// 			if (add15==true){
// 				today.setDate(today.getDate() + 15);
// 			}
// 			var dd = today.getDate();
// 			var mm = today.getMonth()+1; //January is 0!
//
// 			var yyyy = today.getFullYear();
// 			if(dd<10){
// 			    dd='0'+dd;
// 			}
// 			if(mm<10){
// 			    mm='0'+mm;
// 			}
// 			var today = mm+'/'+dd+'/'+yyyy;
// 			return today;
// }

// function dateToEpoch(datestring){
//
// 	console.log(datestring)
//
// 	if (datestring.includes('/')){
// 		var parts = datestring.split("/")
// 	}
// 	else {
// 		var parts =  datestring.split("-")
// 	}
// 	return Date.UTC(parts[2], parts[0]-1, parts[1])/1000;
// }

function removeFiller(o){
	// if (Array.isArray(o)){
	// 	for (var i = 0; i < o.length; i++) {
	// 		o[i]
	// 		$.each(o[i], function(key,value){
	// 		// 				if (key2.indexOf("Date") > -1||key2=="dob") obj[key2] = epochToDate(value2)
	// 		// 			})
	// 	}
	//
	// } else {
	//
	// }
}

function allDatesToEpoch(o, x){
	if (x=="clients") {
		o.createdDateTime = dateToEpoch(o.createdDateTime)
		o.updatedDateTime = dateToEpoch(o.updatedDateTime)
		o.firstSeenDate = dateToEpoch(o.firstSeenDate)
		o.lastSeenDate = dateToEpoch(o.lastSeenDate)
		o.dob = dateToEpoch(o.dob)
		let dep = o.dependents
		for (var i = 0; i < dep.length; i++) {
			o.dependents[i].createdDateTime = dateToEpoch(o.dependents[i].createdDateTime)
			o.dependents[i].dob = dateToEpoch(o.dependents[i].dob)
		}
	} else if (x=="clientsNotes") {
		for (let i = 0; i < o.length; i++) {
			o[i].createdDateTime = dateToEpoch(o[i].createdDateTime)
		}
	} else if (x=="serviceTypes") {
		if (Array.isArray(o)) {
			for (let i = 0; i < o.length; i++) {
				if (o[i].createdDateTime !== '*EMPTY*') o[i].createdDateTime = dateToEpoch(o[i].createdDateTime)
				if (o[i].updatedDateTime !== '*EMPTY*') o[i].updatedDateTime = dateToEpoch(o[i].updatedDateTime)
				if (o[i].fulfillment.fromDateTime !== '*EMPTY*') o[i].fulfillment.fromDateTime = dateToEpoch(o[i].fulfillment.fromDateTime)
				if (o[i].fulfillment.toDateTime !== '*EMPTY*') o[i].fulfillment.toDateTime = dateToEpoch(o[i].fulfillment.toDateTime)
			}
		} else {
			if (o.createdDateTime !== '*EMPTY*') o.createdDateTime = dateToEpoch(o.createdDateTime)
			if (o.updatedDateTime !== '*EMPTY*') o.updatedDateTime = dateToEpoch(o.updatedDateTime)
			if (o.fulfillment.fromDateTime !== '*EMPTY*') o.fulfillment.fromDateTime = dateToEpoch(o.fulfillment.fromDateTime)
			if (o.fulfillment.toDateTime !== '*EMPTY*') o.fulfillment.toDateTime = dateToEpoch(o.fulfillment.toDateTime)
		}
	}
	return o
}

function allEpochToDates(o, x){
// 	if (x=="clients") {
// 		o.createdDateTime = epochToDate(o.createdDateTime)
// 		o.updatedDateTime = epochToDate(o.updatedDateTime)
// 		o.firstSeenDate = epochToDate(o.firstSeenDate)
// 		o.lastSeenDate = epochToDate(o.lastSeenDate)
// 		o.dob = epochToDate(o.dob)
// 		let dep = o.dependents
// 		for (var i = 0; i < dep.length; i++) {
// 			o.dependents[i].createdDateTime = epochToDate(o.dependents[i].createdDateTime)
// 			o.dependents[i].dob = epochToDate(o.dependents[i].dob)
// 		}
// 	} else if (x=="clientsNotes") {
// 		for (let i = 0; i < o.length; i++) {
// 			o[i].createdDateTime = epochToDate(o[i].createdDateTime)
// 		}
// 	} else if (x=="serviceTypes") {
//
// //console.log(JSON.stringify(o))
//
// 		if (Array.isArray(o)) {
//
// console.log('its an array')
//
// 			for (let i = 0; i < o.length; i++) {
// 				o[i].createdDateTime = epochToDate(o[i].createdDateTime)
// 				o[i].updatedDateTime = epochToDate(o[i].updatedDateTime)
// 				o[i].fulfillment.fromDateTime = epochToDate(o[i].fulfillment.fromDateTime)
// 				o[i].fulfillment.toDateTime = epochToDate(o[i].fulfillment.toDateTime)
// 			}
// 		} else {
//
// console.log('its an object')
//
// 			o.createdDateTime = epochToDate(o.createdDateTime)
// 			o.updatedDateTime = epochToDate(o.updatedDateTime)
// 			o.fulfillment.fromDateTime = epochToDate(o.fulfillment.fromDateTime)
// 			o.fulfillment.toDateTime = epochToDate(o.fulfillment.toDateTime)
// 		}
// 	}

}

// function epochToDate(epoch){
// 	var date = new Date(Number(epoch)*1000);
// 	var d = date.getUTCDate().toString(),           // getUTCDate() returns 1 - 31
//             m = (date.getUTCMonth() + 1).toString(),    // getUTCMonth() returns 0 - 11
//             y = date.getUTCFullYear().toString(),       // getUTCFullYear() returns a 4-digit year
//             formatted = '';
//     if (d.length === 1) {                           // pad to two digits if needed
//         d = '0' + d;
//     }
//     if (m.length === 1) {                           // pad to two digits if needed
//         m = '0' + m;
//     }
//     formatted = m + '/' + d + '/' + y;              // concatenate for output
//     return formatted;
// }

// function epochToDateObject(epoch){
// 	return new Date(Number(epoch)*1000)
// }

function saveServiceTypeForm(){
	let data = formToJSON('.serviceTypeForm')
	let URL = api+"/servicetypes"
	saveButton('serviceType', 'Saving...')
	POST(URL,JSON.stringify(data))
}

function saveClientForm(){
	let now = moment().format(dbDateTime)
	$("#updatedDateTime.clientForm").val(now)
	let data = ""
	if (client == "") {
		$("#clientId.clientForm").val(getNewClientID())
		data = formToJSON('.clientForm')
		data.dependents = []
		data.lastServed = []
	} else {
		data = formToJSON('.clientForm')
	}

console.log(data)
console.log(JSON.stringify(data))

	saveButton('client', 'Saving...')

	let URL = api+"/clients/"
	POST(URL,JSON.stringify(data))
}

function getNewClientID(){
	json = GET(api+"/clients/lastid")
	lastid = json['lastId']

//***** TODO confirm this works and put safeguards inplace

	request = {}
	newID = Number(lastid)+1
	newID = newID.toString()
	request['lastId']=newID
	POST(api+"/clients/lastid",JSON.stringify(request))
	return newID
}

function formToJSON(form){
	let now = moment().format(dbDateTime)
	let vals = {}
	console.log($(form))
	let formElements = $(form)
	for (var i = 0; i < formElements.length; i++) {
		let key = formElements[i].id
		let formVal = formElements[i].value
		let valType = formElements[i].type
		if (formVal.length < 1) {
			if (valType == 'hidden') {
				if (key === 'createdDateTime'||key === 'updatedDateTime') formVal = now
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
	vals.updatedDateTime = moment()

console.log(vals)

	return vals
}

function gatherVals(valsToCollect){
	item = {}
	for (var i=0;i<valsToCollect.length;i++){
		if (valsToCollect[i]=="dob"||valsToCollect[i]=="firstSeenDate"||valsToCollect[i]=="familyIdCheckedDate") {
			item[valsToCollect[i]] = dateToEpoch($("#"+valsToCollect[i]).val()).toString()
		}
		else{
			item[valsToCollect[i]] =  $("#"+valsToCollect[i]).val()
		}
	}
	return item
}

// function editToJSON() {
// 	var collect = ['givenName','familyName','isActive','gender','dob','firstSeenDate'
// 	,'familyIdCheckedDate','street','city','state','zipcode','telephone','email','homeless','ethnicGroup']
// 	item =  gatherVals(collect)
// 	item['clientId'] = client['clientId']
//
// 	var today = new Date();
// 	item['createdDateTime']= client['createdDateTime']
// 	item['updatedDateTime'] = Math.round((new Date()).getTime() / 1000).toString();
// 	item['lastSeenDate'] = client['lastSeenDate'];
// 	item['age'] = "0"
// 	item['family'] = {}
// 	item['family']['totalSize']="0"
// 	item['family']['totalAdults']="0"
// 	item['family']['totalChildren']="0"
// 	item['family']['totalOtherDependents']="0"
// 	item['financials'] = {}
// 	item['financials']['income']=$("#income").val()
// 	item['financials']['govtAssistance']=$("#govtAssistance").val()
// 	item['financials']['rent']=$("#rent").val()
// 	item['financials']['foodStamps']=$("#foodStamps").val()
// 	dependents = []
// 	givenNames = []
// 	familyNames = []
// 	relationships = []
// 	dobs = []
// 	genders = []
// 	isActives = []
// 	$('.givenName').each(function() {
//
//        givenNames.push( $(this).val() );
// 	})
// 	$('.familyName').each(function() {
//        familyNames.push( $(this).val() );
// 	})
// 	$('.relationship').each(function() {
//        relationships.push( $(this).val() );
// 	})
// 	$('.dob').each(function() {
// 		console.log($(this).val())
//        dobs.push( $(this).val() );
// 	})
// 	$('.gender').each(function() {
//        genders.push( $(this).val() );
// 	})
// 	$('.isActive').each(function() {
//        isActives.push( $(this).val() );
// 	})
//
// 	for (var i=0;i<givenNames.length;i++){
// 		var obj =  {}
// 		obj['createdDateTime'] = Math.round((new Date()).getTime() / 1000).toString();
// 		obj['givenName']  = givenNames[i]
// 		obj['familyName']  = familyNames[i]
// 		obj['relationship']  = relationships[i]
// 		obj['dob']  = dateToEpoch(dobs[i]).toString()
// 		obj['gender']  = genders[i]
// 		obj['isActive']  = isActives[i]
// 		if (relationships[i]=="Child"){
// 			obj['child'] = "false"
// 			obj['adult'] = "true"
// 		}
// 		else{
// 			obj['adult'] = "true"
// 			obj['child'] = "false"
// 		}
// 		obj['age'] = 0
// 		dependents.push(obj)
// 	}
// 	console.log(dependents)
// 	item['dependents'] =dependents
// 	item['lastServed'] = []
// 	console.log(JSON.stringify(item))
// 	return JSON.stringify(item)
// }

function displayServicesView(){
	// builds the Services tab
	// return if client object is empty
	if ($.isEmptyObject(client)) return
	let lastIdCheck = getLastIdCheckDays()
	let lastVisit = getlastVisitDays()
	let activeServiceTypes = getActiveServiceTypesArray()

// **************   how to save some effort  *****************

// store the lastServed on each serviceType at the client level
// this way I can keep track of the USDA etc.

// think of making ID/Proof of Address a serviceType ??????

// **************   how to save some effort  *****************

	let targets = getTargetsArray(activeServiceTypes);
	let btnPrimary = getActiveServicesBtnArray("primary", activeServiceTypes, targets);
	let btnSecondary = getActiveServicesBtnArray("secondary", activeServiceTypes, targets);

		// check each element in the client

		// target.homeless ********************

		// target.family *********************

		// target.gender *********************

		// target.child *********************
		// target.childMinAge
		// target.childMaxAge
		// target.childMinGrade
		// target.childMaxGrade

	// Interval ???


// 	rowNum = 1 // -- TODO what's this for?
//	let today = moment()

	// Start adding html to template
	let dateHeader = '<div class="serviceDateTime">' + moment().format(longDate) + '</div>';
	$('#serviceButtonContainer').html(dateHeader);


	// displayNotes("Today's Visit", moment().format(displayDate))
	//addClientNotes(client.clientId)

lastVisit = 14;

	let visitHeader = "FIRST SERVICE VISIT";
	if (lastVisit < 9999) visitHeader = 'LAST SERVED ' + lastVisit + ' DAYS AGO';
	$('#serviceButtonContainer').append('<div class="serviceLastVisit">' + visitHeader + '</div><div></div>');

  // for (let i = 0; i < client.lastServed.length; i++) {
  // 	let last
  // }
  if (client.lastServed.length > 0) {

	}



	if (lastVisit < 14) {
		$('#serviceButtonContainer').append('<div class="btnEmergency" onclick="addService('+"'USDA Food','Items: 1','food'"+')">EMERGENCY FOOD ONLY</div>');
	} else {

console.log("IN PRIMARY BUTTONS")

		let primaryButtons = "<div></div>" //'<div class="primaryButtonContainer"><div class="buttonCenteredContainer">';
		for (let i=0; i<btnPrimary.length; i++){
			let x = btnPrimary[i];
			let btnClass = "btnPrimary";
			if (activeServiceTypes[x].serviceCategory == "Administration") btnClass = "btnAdmin";
			let attribs = "\'" + activeServiceTypes[x].serviceTypeId + "\', \'" + activeServiceTypes[x].serviceCategory + "\', \'" + activeServiceTypes[x].isUSDA + "\'";
			let image = "<img src='images/PrimaryButton" + activeServiceTypes[x].serviceCategory + ".png'>";
			primaryButtons += '<div class=\"' + btnClass + '\" id=\"'+activeServiceTypes[x].serviceTypeId+'\" onclick=\"addService('+ attribs +')\">' + activeServiceTypes[x].serviceName + "<br>" + image + "</div>";
			// } else if (activeServiceTypes[x].serviceCategory == "Food") {
			// 	primaryButtons += '<div class="btnPrimary"><a id="'+activeServiceTypes[x].serviceTypeId+'" onclick="addService('+"'"+activeServiceTypes[x].serviceTypeId+"'"+', '+"'"+'Items: '+client.family.totalSize+"'"+', '+(i+100)+')">'+activeServiceTypes[x].serviceName+"<br><img src='images/PrimaryButtonFood.png'></a></div>"
			// } else if (activeServiceTypes[x].serviceCategory == "Clothes") {
			// 	primaryButtons += '<div class="btnPrimary"><a id="'+activeServiceTypes[x].serviceTypeId+'" onclick="addService('+"'"+activeServiceTypes[x].serviceTypeId+"'"+', '+"'"+'Items: '+client.family.totalSize+"'"+', '+(i+100)+')">'+activeServiceTypes[x].serviceName+"</a></div>"
			// }



console.log(primaryButtons);

		}
		// primaryButtons += "</div></div>"
		$('#serviceButtonContainer').append(primaryButtons)
	}


  //
	// let foodBtn = ""
  //
	// } else {
	// 		foodBtn =  '<div class="btnPrimary" onclick="addService('+"'USDA Food','Items: 1','food'"+')"><img src="images/food.png"  style="width:185px; height:182px"></div>'
	// }

	// Display ID Check button if it's been more than 180 days since last check
	let idBtn =  '<div class="serviceLastVisit span2"></div>'
	if (lastIdCheck > 180) {
		idBtn = '<div class="serviceLastVisit span2"><img src="images/checkId.png" style="width:157px; height:156px"></div>'
	}

	let clothesBtn = '<div class="serviceLastVisit"></div>'
	if (lastVisit >= 15) {
		clothesBtn = '<div class="serviceLastVisit"><img onclick="addService('+"'Clothes','Items: 5','clothes'"+')" src="images/clothes.png" style="width:185px; height:182px"></div>'
	}
	let footer = '<div class="buttonRow span6" id="row2"></div><div id="row2"></div></div>'

//<a data-toggle="modal" data-target="#myModal" class="btn-nav">Add Note</a>

	// if (today>idChecked){
		//$('.main-div').append(header+subHeader+foodBtn+idBtn+clothesBtn+footer);
		$('#serviceButtonContainer').append("<div></div>"+idBtn+clothesBtn+"<div></div>"+footer);
		gotoTab("tab2")
	// }
	// else {
	// 	$('.main-div').append(header+foodBtn+idBtn+clothesBtn+footer);
	//
	// }


	children = []
	if (client.dependents!=null){
		for (var j=0; j<client.dependents.length; j++){
			if (client.dependents[j]['relationship']=="Child"){
				children.push(client.dependents[j])
			}
		}
	}
	if (lastVisit >= 14) {
		for (let i=0; i<btnSecondary.length; i++){
			let x = btnSecondary[i];

console.log(x);

//		var standard = serviceTypes[i]['available']['dateFromMonth']<=moment().format('M')&& moment().format('M')<=serviceTypes[i]['available']['dateToMonth']

			let service = '<div class="btnSecondary"><a id="'+activeServiceTypes[x].serviceTypeId+'" onclick="addService('+"'"+activeServiceTypes[x].serviceTypeId+"'"+', '+"'"+'Items: '+client.family.totalSize+"'"+', '+(i+100)+')">'+activeServiceTypes[x].serviceName+"</a></div>"

// && serviceTypes[i]['target']['gender']==client['gender']


// 		$('.buttonRow').append(service)

	   	$('#serviceButtonContainer').append(service)


		// if (children.length==0||!serviceTypes[i]['target']['child']){
		// 	if (standard){
		// 		$('.buttonRow').append(service)
		// 	}
		// }
		// else{
		// 	for (var k=0; k<children.length; k++){
		// 		if (standard && serviceTypes[i]['target']['childMinAge']<children[k]['age'] && children[k]['age']<serviceTypes[i]['target']['childMaxAge']){
		// 		('.buttonRow').append(service)
    //
		// 		}
		// 	}
		// }
		}
	}
}

function getLastIdCheckDays() {
	// get Id Checked Date from client object & calculate number of days
	let familyIdCheckedDate = moment(client.familyIdCheckedDate, dbDate)
	let lastIdCheck = moment().diff(familyIdCheckedDate, 'days')
	return lastIdCheck
}

function getlastVisitDays() {
	// get Last Seen Date from client object & calculate number of days
	let lastSeenDate = moment(client.lastSeenDate, dbDate)
	let lastVisit = moment().diff(lastSeenDate, 'days')
	// If lastVist is not numeric then set to 10,000 days
	if (!$.isNumeric(lastVisit)) lastVisit = 10000;
}

function getActiveServiceTypesArray(){
	// build Active Service Types array of Service Types which cover today's date
	let activeServiceTypes = []
	for (var i=0; i<serviceTypes.length; i++){
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
//console.log("Active Types: " + JSON.stringify(activeServiceTypes));
	return activeServiceTypes;
}

function getTargetsArray(activeServiceTypes) {

// console.log("# Active Service Types: " + activeServiceTypes.length);


	// create array of targets
	let targets = [];
	// build list of client target items for each Active Service Type
	for (var i = 0; i < activeServiceTypes.length; i++) {

// console.log("Active Service " + i + ": " + activeServiceTypes[i].serviceName);

		// make list of specific target.... for each type.
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
		}

		// target gender male/female
		if (activeServiceTypes[i].target.gender !== "Unselected") targets[i].gender = activeServiceTypes[i].target.gender;

		// target children
		if (activeServiceTypes[i].target.child == "YES") {
			targets[i].family_totalChildren = "Greater Than 0";
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

function getActiveServicesBtnArray(array, activeServiceTypes, targets) {
	btnPrimary = [];
	btnSecondary = [];
	for (let i = 0; i < activeServiceTypes.length; i++) {
		// loop throught to find items to compare
		// presume that item will be displayed unless not valid
		let display = true;

console.log("VALIDATE " + i + ": " + activeServiceTypes[i].serviceName);

console.log(activeServiceTypes);

		// not a valid service based on interval between services
		if (validateServiceInterval(activeServiceTypes[i]) == 'false') continue;

console.log("Service: " + activeServiceTypes[i].serviceName);

		for (let prop in targets[i]) {




			// check service interval for service
			if (activeServiceTypes[i].serviceInterval > 0) {

console.log("HAS SERVICE INTERVAL");

			}

console.log("Prop: " + prop + " = " + targets[i][prop] + " Client: " + client[prop]);

			let tarProp = targets[i][prop]
			if (tarProp == true) tarProp = "true"
			if (tarProp == false) tarProp = "false"
			let cliProp = client[prop]
			if (cliProp == true) tarProp = "true"
			if (cliProp == false) tarProp = "false"

			if (tarProp == cliProp) {
				console.log("MATCH");

			} else {
				console.log("NO MATCH");
				display = false;
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
			console.log("Primary List: " + btnPrimary)
			console.log("Secondary List: " + btnSecondary)
		}
	}
	if (array == "primary") return btnPrimary
	if (array == "secondary") return btnSecondary
}

function validateServiceInterval(activeServiceType){
	// empty lastServed array
	if (client.lastServed.length == 0) {
		if ((activeServiceType.serviceCategory == "Food") && (activeServiceType.serviceButtons == "Primary") && (activeServiceType.isUSDA == "NonUSDA")) {
			return 'false';
		} else {return 'true'}
	}
	let neverServed = true;

	for (let i =0; i < client.lastServed.length; i++) {
		let lastServedDate = moment(client.lastServed[i].serviceDateTime).startOf('day');
		if (client.lastServed[i].serviceTypeId == activeServiceType.serviceTypeId) {
			neverServed = false;
			if (moment().startOf('day').diff(lastServedDate, 'days') < activeServiceType.serviceInterval) return 'false';

console.log("CHECK USDA");

			// if ((activeServiceType.serviceCategory == "Food") && (activeServiceType.serviceButtons == "Primary") && (activeServiceType.isUSDA == "NonUSDA")) {
			// 		if (moment().startOf('day').diff(lastServedDate, 'days') < 28) return 'false';
			// }
		}
	}
	if (neverServed) {

console.log("IN NEVER SERVED");
console.log(activeServiceType.serviceName);

		if ((activeServiceType.serviceCategory == "Food") && (activeServiceType.serviceButtons == "Primary") && (activeServiceType.isUSDA == "NonUSDA")) {
console.log(activeServiceType.serviceName);

			return 'false';
		}
	}
	return 'true';
}

function wordCase(str){
	str = str.replace(/[^\s]+/g, function(word) {
	  return word.replace(/^./, function(first) {
	    return first.toUpperCase();
	  });
	});
	return str
}

function addService(serviceTypeId, serviceCategory, isUSDA){

console.log("IN ADD SERVICE");

	saveServiceDate(moment("2018-01-11 09:00").format(dbDateTime), serviceTypeId, serviceCategory, isUSDA);



	displayNote(serviceTypeId)
	$("#"+serviceTypeId).hide()
}

function saveServiceDate(serviceDateTime, serviceTypeId, serviceCategory, isUSDA){

console.log(serviceDateTime)

console.log(client.lastServed);

	lastServedArray = client.lastServed;
	let record = {'serviceDateTime': serviceDateTime, 'serviceTypeId': serviceTypeId, 'serviceCategory': serviceCategory , 'isUSDA': isUSDA};
	lastServedArray.unshift(record);
	client.lastServed = lastServedArray;

	// SAVE TO DB TODO

console.log(client.lastServed);

}

function clientSearchResults(){
	a =  $('#searchField').val()
	$('#searchField').val('')
	if (a === '') {
		beep()
		return
	}
	if (currentNavTab !== "clients") gotoNav("nav1")
	clientData = null
	if (a.includes("/")){
		a = moment(a, displayDate).format(dbDate)
		clientData = GET(api+"/clients/dob/"+a).clients
	} else if (!isNaN(a)&&a.length<MAX_ID_DIGITS){
		clientData = GET(api+"/clients/"+a).clients
	} else if (a.includes(" ")){
		a = wordCase(a)
		let split = a.split(" ")

//*** TODO deal with more than two words ***

		let d1 = GET(api+"/clients/givenname/"+split[0]).clients
		let d2 = GET(api+"/clients/familyname/"+split[0]).clients
		let d3 = GET(api+"/clients/givenname/"+split[1]).clients
		let d4 = GET(api+"/clients/familyname/"+split[1]).clients
		clientData = removeDupClients(d1.concat(d2).concat(d3).concat(d4))
	} else if (clientData==null||clientData.length==0){
		a = wordCase(a)
		let d2 = GET(api+"/clients/givenname/"+a).clients
		let d1 = GET(api+"/clients/familyname/"+a).clients
		if (d1.length>0&&d2.length<1){
			clientData = removeDupClients(d1.concat(d2))
		}	else if (d2.length>0){
			clientData = removeDupClients(d2.concat(d1))
		}
	}
	if (clientData==null||clientData.length==0){
		beep()
		clientsHeader("0 Clients Found")
	} else {
		buildSelectHTMLTable('#searchContainer',clientData,["clientId","givenName","familyName","dob","street"],'clientTable')
		if (clientData.length === 1){
			clientSetCurrent(0) // go straight to client
		} else {
			clientsHeader(clientData.length + ' Clients Found')
			gotoTab("tab1")
		}
	}
}

function gotoTab(tab){
	let useAttr = document.getElementById(tab);
	useAttr.setAttribute('checked', true);
	useAttr['checked'] = true;
}

function genSelectHTML(values,col){
	ans = "<select style='width:100px'>"
	for (var i =0; i<values.length;i++){
		ans += "<option id='"+col+"' class='inputBox dependentsForm' value='"+values[i]+"'>"+values[i]+"</option>"
	}
	ans+="</select>"
	return ans
}

function buildSelectHTMLTable(selector,data,col,tableID){
  // CREATE DYNAMIC TABLE.
  let table = document.createElement("table");
  table.setAttribute("id", tableID)
  // CREATE HTML TABLE HEADER ROW USING THE EXTRACTED HEADERS ABOVE.
  let tr = table.insertRow(-1);                   // TABLE ROW.
  for (let i = 0; i < col.length; i++) {
    let th = document.createElement("th");      // TABLE HEADER.
    th.innerHTML = translate(col[i]);
    tr.appendChild(th);
  }
  // ADD JSON DATA TO THE TABLE AS ROWS.
  for (let i = 0; i < data.length; i++) {
    tr = table.insertRow(-1);
    if (tableID == 'clientTable'){
			tr.setAttribute("onclick", 'clientSetCurrent(' + i + ')')
		} else if (tableID == 'serviceTypesTable'){
			tr.setAttribute("onclick", 'serviceTypesSetCurrent(' + i + ')')
		}
    for (let j = 0; j < col.length; j++) {
    	let tabCell = tr.insertCell(-1);
      if (tableID == 'dependentsTable'){
    		if (col[j]=="dob" ){
					let a = data[i][col[j]].toString()
					tabCell.innerHTML = "<input id="+col[j]+" style='width:100px' class='inputBox dependentsForm' value='"+a+"'>"
				} else if (col[j]=="isActive"){
					tabCell.innerHTML = genSelectHTML([data[i][col[j]],'Active','Emergency','Inactive'],"isActive")
				} else if (col[j]=="relationship"){
					tabCell.innerHTML =genSelectHTML([data[i][col[j]],'Spouse','Child','Other Dependent'],"relationship")
				} else if (col[j]=="gender"){
					tabCell.innerHTML =genSelectHTML([data[i][col[j]],'Female','Male'],"gender")
				} else{
					tabCell.innerHTML="<input id='"+col[j]+"' style='width:100px' class='inputBox dependentsForm' value='"+data[i][col[j]]+"'>";
				}
    	} else if (col[j]=="dob"||col[j]=="firstSeenDate"||col[j]=="lastSeenDate"||col[j]=="familyIdCheckedDate"){
        tabCell.innerHTML = moment(data[i][col[j]]).format('MM/DD/YYYY')
			} else if (col[j]=="createdDateTime"||col[j]=="updatedDateTime"){
        tabCell.innerHTML = moment(data[i][col[j]]).format('MM/DD/YYYY, h:mm a')
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
}

function toggleClientViewEdit(side){
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

function toggleDependentsViewEdit(side){
	console.log(side)
	if (side == 'view') {
		$('#dependentdLeftSlider').addClass('sliderActive')
		$('#dependentdRightSlider').removeClass('sliderActive')
		$('input.dependentsForm').prop('readonly', true)
		$('select.dependentsForm').prop('disabled', true)
		$('select.dependentsForm').addClass('selectBox')
	} else {
		$('#dependentdLeftSlider').removeClass('sliderActive')
		$('#dependentdRightSlider').addClass('sliderActive')
		$('input.dependentsForm').prop('readonly', false)
		$('select.dependentsForm').prop('disabled', false)
		$('select.dependentsForm').removeClass('selectBox')
	}
}


function toggleAgeGrade(){
	if ($('[id="target.child"]').val() == 'YES') {
		$('.childDiv').show('slow')
	} else {
		$('.childDiv').hide('slow')
	}
}

function toggleFulfillDates(){
	if ($('[id="fulfillment.type"]').val() == 'Voucher') {
		$('.fulfillDiv').show('slow')
	} else {
		$('.fulfillDiv').hide('slow')
	}
}

function toggleClientAddress(){
	if ($('#homeless.clientForm').val() == 'NO') {
		$('.addressDiv').show('slow')
	} else {
		$('.addressDiv').hide('slow')
	}
}

function beep(){
	let sound = document.getElementById("beep")
	sound.volume= .1
	sound.loop = false
	sound.play()
};

function removeDupClients(a) {
	let ids=[], temp=[], b = []
	for (var i = 0; i < a.length; i++) ids.push(a[i].clientId)
	for (var i = 0; i < ids.length; i++) {
		if (temp.indexOf(ids[i])<0) {
			b.push(a[i])
			temp.push(ids[i])
		}
	}
	return b
}

function translate(x){
	let data = {
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
				    	lastSeenDate: "Last Seen",
       familyIdCheckedDate: "Last ID Check"
	}
	let y = data[x]
	if (y==undefined){return x} else {return y}
}

function getTemplate(t){
	let imp = document.querySelector('link[rel="import"]');
	let temp = imp.import.querySelector(t);
	let clone = document.importNode(temp.content, true);
	//document.querySelector('.main-div').appendChild(clone);
	return clone
}

function dateDiff(a,b,c) {
	let date1 = new Date(a)
	let date2 = new Date(b)
	let x = 0
	let timeDiff = Math.abs(date2.getTime() - date1.getTime())
	if (c == "days") x = Math.ceil(timeDiff / (1000 * 3600 * 24))
	if (c == "years") x = Math.floor(timeDiff/31557600000)
	return x
}

function calculateFields(x){
	// age
	updateClientAge()
	// dependents age & family counts
	let fam = {tA:1, tC:0, tO:0}
	for (var i = 0; i < client.dependents.length; i++) {
		client.dependents[i].age = today.diff(client.dependents[i].dob, "years")
		if (client.dependents[i].adult == "true" && client.dependents[i].relationship == "Spouse") ++fam.tA
		if (client.dependents[i].adult == "true" && client.dependents[i].relationship == "Other Dependent") ++fam.tO
		if (client.dependents[i].child == "true" && client.dependents[i].relationship == "Child") ++fam.tC
		if (client.dependents[i].child == "true" && client.dependents[i].relationship == "Other Dependent") ++fam.tO
	}
	client.family = {}
	client.family.totalAdults = fam.tA
	client.family.totalChildren = fam.tC
	client.family.totalOtherDependents = fam.tO
	client.family.totalSize = fam.tA + fam.tC + fam.tO
}

function fillUserData(){
	console.log(session)

	$('#userTitle').html(session.user.username);
}

function fillDate(){
	$('.contentTitle').html(moment().format("dddd, MMM DD YYYY"));
}
