// const dateTime = 'YYYY-MM-DDTHH:mm'
// const date = 'YYYY-MM-DD'
// const uiDate = 'MM/DD/YYYY'
// const uiDateTime = 'MM/DD/YYYY H:mma'
let givenNames = JSON.parse(localStorage.getItem("givenNames"))
if (givenNames === null) givenNames = []
let birthNames = getBirthNames("birthNames.json")
//let birthRecordFemaleNames = getBirthRecordNames("femaleNames.json")

// localStorage.setItem('birthRecordMaleNames', JSON.stringify(birthRecordMaleNames));
// localStorage.setItem('birthRecordFemaleNames', JSON.stringify(birthRecordFemaleNames));

console.log(givenNames.length)

let importClientData = JSON.parse(localStorage.getItem('smumCleanClients'))
console.log("# Clients: " + importClientData.length)
let importedClients = []
let dependentData =[]
let serviceData = []
let foodData = []
let usedClientIdArray =[]
let unusedClientIdArray =[]

console.log("foodSmall: " + foodSmall.length)

if (foodSmall == undefined) {
  setTimeout(function(){
    console.log("foodSmall: " + foodSmall.length)
  }, 10000);
}


function loadDependents(){
  $("#dependentsLoaded").html("Starting Load...")
  $.getJSON( "data/dependentsClean1.json", function( depData ) {
    $.each( depData, function( i, item ) {
        dependentData.push(item)
    })
  })
  setTimeout(function(){
      console.log(dependentData.length)
      $("#dependentsLoaded").html("["+ dependentData.length+"]")
  }, 1000);
}

function loadServices(){
  $.getJSON( "data/services_no_food.json", function( servData ) {
    $.each( servData, function( i, item ) {
        serviceData.push(item)
    })
  })
  setTimeout(function(){
      console.log(serviceData.length)
      $("#servicesCount").html("["+ serviceData.length+"]")
  }, 1000);
}

function removeEmptyClientRecords(){
  $("#cleanCount").html("Started Removing...")
  let clientCopy = [];
  $.getJSON( "data/clients.json", function( data ) {
    $.each( data, function( i, item ) {
      if (item.HouseholdID == "") {
        console.log("missing ID")
      } else {
        if (item.DOB != "") item.DOB = cleanDate(item.DOB)
        if (item["Ethnic Group"] == "Asian/Pac Islander") {
      		item["Ethnic Group"] = "Asian/Pacific Islander"
      	}
        if (item.City == "") item.City = "San Jose"
        if (typeof item.Street == "Number") item.Street = String(item.Street)

        // if (item.Street != "") {
        //   let street = item.Street.split('\u000b')
        //   item.Street = street.join("'")
        //   console.log(item.Street)
        // }
        if (item.Comments != "") {
          let comments = item.Comments.split('\"')
          item.Comments = comments.join("'")
          console.log(item.Comments)
        }
        clientCopy.push(item)
      }
    });
  });
  setTimeout(function(){
      console.log(clientCopy.length)
      $("#cleanCount").html("["+ clientCopy.length+"]")
      //saveJSON(JSON.stringify(clientCopy), "clientsClean.json" )
      localStorage.setItem('smumCleanClients', JSON.stringify(clientCopy));
  }, 6000);

  importClientData = clientCopy
}

function cleanDate(date){
  let yr = date.split('/')[2]
  if (yr.length==2) yr = (yr > 18) ? '19'+yr : '20'+yr
  date = date.split('/'); date[2] = yr; date.join('/')
  return date
}

function saveJSON(text, filename){
  let a = document.createElement('a');
  a.setAttribute('href', 'data:text/plain;charset=utf-u,'+encodeURIComponent(text));
  a.setAttribute('download', filename);
  a.click()
}


function importClients(start, end){
  $("#clientCount").html("Started Importing...")
  // $.getJSON( "data/clients.json", function( data ) {
  if (end == "end") end = importClientData.length -1
  $.each( importClientData, function( i, item ) {    // data.slice(start,end)
    //clientCopy.push( "<li id='" + key + "'>" + val + "</li>" );
    if (item.GivenName == "") {
      console.log("missing Given: " + item.HouseholdID)
      return true
    }
    if (item.FamilyName == "") {
      console.log("missing Family: " + item.HouseholdID)
      return true
    }

    let record = {}
    if (item.Status == "Client" || item.Status == "client") record.isActive = "Active"
    if (item.Status == "Active" || item.Status == "active") record.isActive = "Active"
    if (item.Status == "y" || item.Status == "Y") record.isActive = "Active"
    if (item.Status == "Emergency") record.isActive = item.Status
    if (item.Status == "Inactive") record.isActive = "Inactive"
    if (item.Status == "") record.isActive = "Inactive"

    record.createdDateTime = moment(item.DateCreation_d, uiDate).format(dateTime)
    record.updatedDateTime = moment().format(dateTime)
    record.clientId = String(item.HouseholdID)

//console.log("ID: "+ item.HouseholdID)

    record.familyName = item.FamilyName
    record.givenName = item.GivenName
    record.gender = getGender(item.GivenName)
    record.dob = moment(item.DOB, uiDate).format(date)
    // if (moment().isBefore(record.dob))
    if (item.Street == "") {
      record.street = "*EMPTY*"
    } else {
      record.street = String(item.Street)
    }
    record.city = item.City
    //TODO some states contain extra zipcode info not being imported
    record.state = "CA" // item.State
    if (item.ZIP == "") {
      record.zipcode = "*EMPTY*"
    } else {
      record.zipcode = String(item.ZIP)
    }
    if (item.ZIPSuffix != ""){
      record.zipSuffix = String(item.ZIPSuffix)
    } else {
      record.zipSuffix = "*EMPTY*"
    }
    if (item.Telephone == "") {
      record.telephone = "*EMPTY*"
    } else {
      record.telephone = "+1-" + item.AreaCode + "-" + item.Telephone
    }
    record.email = "*EMPTY*"
    record.firstSeenDate = moment(item.FirstSeen, uiDate).format(date)
    if (item["Ethnic Group"] == ""){
      record.ethnicGroup = "*EMPTY*"
    } else {
      record.ethnicGroup = item["Ethnic Group"]
    }
    if (item.Homeless == "" || item.Homeless == "No" || item.Homeless == "no" || item.Homeless == "NO") {
      record.homeless = "NO"
    }
    if (item.Homeless == "Yes" || item.Homeless == "YES" || item.Homeless == "yes") {
      record.homeless = "YES"
    }
    if (item.FamilyIDChecked == "") {
      record.familyIdCheckedDate = "2000-01-01"
    } else {
      record.familyIdCheckedDate = moment(item.FamilyIDChecked, uiDate).format(date)
    }
    record.financials = {}
    let fins = [item.Income, item.Rent, item["Govt Assistance"], item.FoodStamps]
    for (var i = 0; i < fins.length; i++) {
      if (fins[i] == "") {
        fins[i] = "0"
      } else if (typeof fins[i] == "string"){
//console.log("S: " + fins[i])
        fins[i] = fins[i].replace(/\$/g, '')
        fins[i] = fins[i].replace(".00", '')
        fins[i] = fins[i].replace(",", '')
        fins[i] = String(fins[i])

      } else if (typeof fins[i] == "number"){
// console.log("N: " + fins[i])
        fins[i] = String(fins[i])
      }
    }
    record.financials.income = fins[0]
    record.financials.rent = fins[1]
    record.financials.govtAssistance = fins[2]
    record.financials.foodStamps = fins[3]
    record.dependents = []
    record.lastServed =[]
    if (item.FamilyIDChecked != "") {
      let lastFamIDCheck = {}
      lastFamIDCheck.serviceDateTime = moment(item.FamilyIDChecked, uiDate).format(dateTime)
      lastFamIDCheck.isUSDA = "NA"
      lastFamIDCheck.serviceCategory = "Administration"
      lastFamIDCheck.serviceTypeId = "cjcryvin100003i8dv6e72m6j"
      record.lastServed.push(lastFamIDCheck)
    }
    record.notes = []
//    console.log(item.Comments)
    comments = item.Comments
    if (comments != "") {
      let notes = comments.split("\u000b")

//if (record.clientId == 21) console.log(notes)

//      console.log("NOTES: " + notes.length)

      for (var i = 0; i < notes.length; i++) {
        let notesTemp = {}
        // check for a date
        const matchingDate = /(?:\d{2}|\d{1})[-/](?:\d{2}|\d{1})[-/](?:\d{4}|\d{2})/g
        const matchAlfonso = /alfonso/i
        let note = notes[i]
        notesTemp.noteText = note


       	let dateArray = note.match(matchingDate)
        if (dateArray != null) {
          notesTemp.createdDateTime = moment(dateArray[0], uiDate).format(dateTime)
//console.log(note + ": \n" + notesTemp.createdDateTime)
        } else {
          notesTemp.createdDateTime = moment(item.DateCreation_d, uiDate).format(dateTime)
        }
        notesTemp.updatedDateTime = moment().format(dateTime)
        let alfonsoArray = note.match(matchAlfonso)
        if (alfonsoArray != null) {
          notesTemp.isImportant = true
          notesTemp.noteByUserName = "Alfonso"
        } else {
          notesTemp.isImportant = false
          notesTemp.noteByUserName = "Imported"
        }
        if (notesTemp != {}){
          record.notes.push(notesTemp)
        }
      }
    }

//    console.log(JSON.stringify(record.givenName + ":" + record.gender))

    importedClients.push(record)

  })
  setTimeout(function(){
      console.log(importedClients)
      $("#clientCount").html("["+ importedClients.length+"]")
  }, 1000);
}

// MISSING FROM CLIENT:
// 1) DOB
// 2) DateCreation_d [*not essential]
// 3) FamilyIdChecked
// 4) Homeless
// 5) Status
// 6) Income
// 7) Govt Assistance
// 8) Rent
// 9) FoodStamps

function importDependents(start,end){
  $("#dependentsImported").html("Starting Import...")
  let dependentsLoaded = 0
  $.each( importedClients, function( i, client ) { //importedClients.slice(start,end)
    let dependents = dependentData.filter(function( obj ) {
      return obj.HouseholdID == client.clientId
    })
// console.log("ID#: "+ client.clientId)

    let clientDependents = []
    for (var d = 0; d < dependents.length; d++) {

      let depRecord = {}
//      console.log(dependents[d].CreationDate_d)
      depRecord.createdDateTime = moment(dependents[d].CreationDate_d, "MM/DD/YY").format(dateTime)
      depRecord.updatedDateTime = moment().format(dateTime)
      depRecord.givenName = dependents[d].GivenName
      depRecord.familyName = dependents[d].FamilyName
      if (dependents[d].DOB != "" && dependents[d].DOB != "*EMPTY*") {
// console.log(dependents[d].HouseholdID + " | " + dependents[d].DOB)
        dependents[d].DOB = cleanDate(dependents[d].DOB)
        depRecord.dob = moment(dependents[d].DOB, uiDate).format(date)
      } else {
        depRecord.dob = "*EMPTY*"
      }
      if (dependents[d].Gender == "F") depRecord.gender = "Female"
      if (dependents[d].Gender == "M") depRecord.gender = "Male"
      if (dependents[d].Gender == "") depRecord.gender = getGender(dependents[d].GivenName)
      if (dependents[d].Gender == "*EMPTY*") depRecord.gender = getGender(dependents[d].GivenName)
      depRecord.relationship = dependents[d].DepRelationship
      depRecord.isActive = "Active"
      clientDependents.push(depRecord)
      dependentsLoaded++
//      console.log("Dependents Added")
    }
    client.dependents = clientDependents
  })
  setTimeout(function(){
    console.log(importedClients)
    $("#dependentsImported").html("["+ dependentsLoaded+"]")
  }, 10000);

}

function importFoodLastServed(start,end){
  let lastServedCount = 0
  $.each( importedClients, function( i, client ) { // importedClients.slice(start,end)
    let foods = foodSmall.filter(function( obj ) {
      return obj.HouseholdID == client.clientId
    })
// console.log("ID#: " + client.clientId)
    let latestUSDA = "1900-01-01"
    let latestNonUSDA = "1900-01-01"
    for (var f = 0; f < foods.length; f++) {
      if (foods[f].USDA == "USDA"){
        if (moment(foods[f].DateServed, "MM/DD/YYYY").isAfter(latestUSDA)) {
          latestUSDA = moment(foods[f].DateServed, "MM/DD/YYYY").format(dateTime)
        }
      } else {
        if (moment(foods[f].DateServed, "MM/DD/YYYY").isAfter(latestNonUSDA)) {
          latestNonUSDA = moment(foods[f].DateServed, "MM/DD/YYYY").format(dateTime)
        }
      }
    }
    if (latestUSDA != "1900/01/01") {
      let recordUSDA = {}
      recordUSDA.serviceDateTime = latestUSDA
      recordUSDA.isUSDA = "USDA"
      recordUSDA.serviceCategory = "Food"
      recordUSDA.serviceTypeId = "cj86davnj00013k7zi3715rf4"
      importedClients[i].lastServed.push(recordUSDA)
      lastServedCount++
    }
    if (latestNonUSDA != "1900/01/01") {
      let recordNonUSDA = {}
      recordNonUSDA.serviceDateTime = latestNonUSDA
      recordNonUSDA.isUSDA = "NonUSDA"
      recordNonUSDA.serviceCategory = "Food"
      recordNonUSDA.serviceTypeId = "c2e6fbfcd32adcfdyht56a14c166d0b304da3aa32"
      importedClients[i].lastServed.push(recordNonUSDA)
      lastServedCount++
    }
//    console.log("USDA: "+ latestUSDA)
//    console.log("NonUSDA: "+ latestNonUSDA)
//    console.log(importedClients[i].lastServed)
  })
  setTimeout(function(){
    console.log(importedClients)
    $("#foodImported").html("["+ lastServedCount + "]")
  }, 10000);
}

function uploadToDynamoDB(){
  let start = $("#clientUploadStart").val()
  let end = $("#clientUploadEnd").val()

console.log(start)
console.log(end)

  $("#dependentsImported").html("Imported Records: "+ importedClients.length)
  let clientsUploaded = 0
  $.each( importedClients.slice(start,end), function( i, client ) {
    let URL = aws+"/clients/"

    console.log("ID#:" + client.clientId + " i#:"+ i)

  	result = dbPostData(URL,JSON.stringify(client))
    if (result != null) {
      console.log(JSON.stringify(client))
    } else {
      clientsUploaded++
    }
  })
  $("#clientsUploaded").html("["+ clientsUploaded + "]")
}
// MISSING FROM DEPENDENTS:
// 1) CreationDate_d [*not essential]
// 2) Gender
// 3) Status

 // {
 //  x  clientId
 //  x  givenName
 //  x  familyName
 //     gender                       TODO **** TO BE CALCULATED ****
 //  x  dob
 //  x  createdDateTime
 //  x  updatedDateTime
 //  x  firstSeenDate
 //  x  familyIdCheckedDate          TODO **** ADD TO SERVICES ??? treat as servicetype  ****
 //  x  street
 //  x  city
 //  x  state
 //  x  zipcode
 //  x  telephone
 //  x  email
 //  x  ethnicGroup
 //  x  isActive
 //  x  homeless
 //  x  financials.income
 //  x  financials.govtAssistance
 //  x  financials.rent
 //  x  financials.foodStamps
 //  x  dependents[]
 //     dependents[].createdDateTime  TODO **** MISSING CreationDate_d ****
 //     dependents[].updatedDateTime
 //     dependents[].givenName
 //     dependents[].familyName
 //     dependents[].dob
 //     dependents[].gender           TODO **** MISSING Gender ****
 //     dependents[].relationship
 //     dependents[].isActive         TODO **** MISSING Status ****
 //  x  lastServed[]
 //     lastServed[].serviceTypeId
 //     lastServed[].serviceDateTime
 //     lastServed[].serviceCategory
 //     lastServed[].isUSDA
// });



function getGender(givenName) {
// console.log(givenName)
  let gender = "UNKNOWN"
  let theNames = birthNames.filter(function( obj ) {
    let nameArray = givenName.split(" ")
    return obj.name == nameArray[0]
  })
  if (theNames.length == 0) gender = "UNKNOWN"
  if (theNames.length == 1) gender = theNames[0].gender
  if (theNames.length == 2) {
    if (parseInt(theNames[0].births) > parseInt(theNames[1].births)) {
      gender = theNames[0].gender
      let percentage = (theNames[1].births / theNames[0].births) *100
//      console.log(parseInt(100 - percentage)+"%")
    } else {
      gender = theNames[1].gender
      let percentage = (theNames[0].births / theNames[1].births) *100
//      console.log(parseInt(100 - percentage)+"%")
    }
  }
  if (gender == "M") gender = "Male"
  if (gender == "F") gender = "Female"
  return gender
}

function getGivenNames(file){
  $.getJSON( "data/" + file, function( data ) {
    $.each( data, function( i, item ) {
      // console.log(item.GivenName)
      if ($.inArray(item.GivenName, givenNames) < 0) {
        givenNames.push(toTitleCase(item.GivenName))
      }
    })
  })
  console.log(givenNames.length)
  console.log(givenNames)
}

function getBirthNames(file) {
  console.log(file)
  names = []
  $.getJSON( "data/" + file, function( data ) {
    $.each( data, function( i, item ) {
      names.push(item)
    })
  })
  return names
}

function showNames(){
  givenNames.sort()

console.log(givenNames)

  console.log(birthRecordMaleNames)
  console.log(birthRecordFemaleNames)
  for (var i = 0; i < givenNames.length; i++) {
    givenNames[i] = {"name": givenNames[i], "gender": getGender(givenNames[i])}
  }
  localStorage.setItem('givenNames', JSON.stringify(givenNames));
}

function toTitleCase(str) {
  return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

function generateUsedClientIDList(){
  let temp =[]
  for (var i = 0; i < importedClients.length; i++) {
    temp.push(importedClients[i].clientId)
  }
  usedClientIdArray = temp
  console.log(usedClientIdArray)
}

function generateUnusedClientIDList(){
  let temp =[]
  let l = usedClientIdArray.length -1
console.log(l)
  let lastID = parseInt(usedClientIdArray[l]) + 1
console.log(lastID)
  for (var i = 1; i < lastID; i++) {
    let theClient = importedClients.filter(function( obj ) {
      return obj.clientId == i
    })
    if (theClient.length != 1) {
//      console.log(theClient)
      temp.push(i)
    } else {
      // testClient = dbGetData(aws+"/clients/"+i).clients
      // if (testClient == []) {
      //   console.log(JSON.stringify(testClient) + "ID: "+ i)
      //   utilBeep
      // }
    }
  }
  unusedClientIdArray = temp
  console.log(unusedClientIdArray)
}