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
  $.getJSON( "data/Mar-9-18-dependents.json", function( depData ) { //data/Mar-3-18-dependents-v2.json
    $.each( depData, function( i, item ) {
      // existingDep = dependentData.filter(function( obj ) {
      //   return obj.DepID == item.DepID
      // })
      // console.log(existingDep.length)
      // if (existingDep.length == 0 ) {
        dependentData.push(item)
      // } else {
      //   console.log(existingDep[0].DOB, " : ", item.DOB)
      //   console.log(existingDep[0].GivenName, " : ", item.GivenName)
      // }
    })
  })
  console.log("DONE DEPS")
  // $.getJSON( "data/Mar-3-18-child-deps.json", function( depData ) {
  //   $.each( depData, function( i, item ) {
  //     existingDep = dependentData.filter(function( obj ) {
  //       return (obj.HouseholdID == item.HouseholdID && obj.DOB == item.DOB && obj.GivenName == item.givenName)
  //     })
  //     console.log(existingDep.length)
  //     if (existingDep.length == 0 ) {
  //       dependentData.push(item)
  //     } else {
  //       console.log(existingDep[0].DOB, " : ", item.DOB)
  //       console.log(existingDep[0].GivenName, " : ", item.GivenName)
  //     }
  //   })
  // })
  // console.log("DONE CHILD")
  // $.getJSON( "data/Mar-3-18-spouse-deps.json", function( depData ) {
  //   $.each( depData, function( i, item ) {
  //     existingDep = dependentData.filter(function( obj ) {
  //       return (obj.HouseholdID == item.HouseholdID && obj.DOB == item.DOB && obj.GivenName == item.givenName)
  //     })
  //     console.log(existingDep.length)
  //     if (existingDep.length == 0 ) {
  //       dependentData.push(item)
  //     } else {
  //       console.log(existingDep[0].DOB, " : ", item.DOB)
  //       console.log(existingDep[0].GivenName, " : ", item.GivenName)
  //     }
  //   })
  // })
  // console.log("DONE SPOUSE")


  setTimeout(function(){
      console.log(dependentData.length)
      $("#dependentsLoaded").html("["+ dependentData.length+"]")
  }, 4000);
}

function loadServices(){
  $.getJSON( "data/Mar-9-18-services.json", function( servData ) {
    $.each( servData, function( i, item ) {
      let tempClient = importedClients.filter(function( obj ) {
        return obj.clientId == item.HouseholdID
      })
      if (tempClient.length > 0) {
        console.log(item.HouseholdID)
        console.log(tempClient[0])
        tempService = {}
        tempService.serviceId = cuid()
        tempService.serviceValid = true
        tempService.servicedDateTime = moment(item.DateofService, uiDate).format(dateTime)
        if (tempService.servicedDateTime == "") tempService.servicedDateTime = moment(item.DateCreation_d, uiDate).format(dateTime)
        tempService.servicedMonth = moment(tempService.servicedDateTime).format("YYYYMM")
        tempService.servicedDay = moment(tempService.servicedDateTime).format("YYYYMMDD")
        tempService.clientServedId = "" + item.HouseholdID
        tempService.clientStatus = tempClient[0].isActive
        tempService.servicedByUserName = "Imported"
        if (item.ServiceID == 3) {
          tempService.serviceTypeId = "cjdfdjqse00003i8v5757q4q4"
        } else if (item.ServiceID == 5) {
          tempService.serviceTypeId = "7d2d8e12f846a868055e6f4b569ed5a4fbe0eda9"
        } else if (item.ServiceID == 6) {
          tempService.serviceTypeId = "cjem7yi0z05183iacs4mjuev6"
        } else if (item.ServiceID == 8) {
          if (tempClient[0].gender == "Male") {
            tempService.serviceTypeId = "a14a6d3e55dd070911f6917f8ec42a225117ba44"
          } else {
            tempService.serviceTypeId = "cj7v6jrg400013k7paa8m81p2"
          }
        } else if (item.ServiceID == 12) {
          tempService.serviceTypeId = "c5cf41b232afc23a6564f8278dc9982ce16a9148"
        }
        tempServiceType = utilGetServiceTypeByID(tempService.serviceTypeId)
        tempService.serviceName = tempServiceType.serviceName
        tempService.serviceCategory = tempServiceType.serviceCategory
        tempService.serviceButtons = tempServiceType.serviceButtons
        tempService.isUSDA = tempServiceType.isUSDA
        tempService.itemsServed = "" + item.Number_items
        tempService.homeless = tempClient[0].homeless
        tempService.emergencyFood = "NO"
        tempService.totalAdultsServed = "*EMPTY*"
        tempService.totalChildrenServed = "*EMPTY*"
        tempService.totalSeniorsServed = "*EMPTY*"
        tempService.totalIndividualsServed = "" + item.LINumberBenefitted
        tempService.fulfillment = {}
        tempService.fulfillment.pending = false
        tempService.fulfillment.dateTime = tempService.servicedDateTime
        tempService.fulfillment.voucherNumber = "NA"
        tempService.fulfillment.byUserName = "Imported"
        tempService.fulfillment.itemCount = "" + item.Number_items

        console.log(tempService.serviceName)
        serviceData.push(tempService)
      }
    })
  })
  setTimeout(function(){
      console.log(serviceData)
      $("#servicesCount").html("["+ serviceData.length+"]")
  }, 1000);
};

function removeEmptyClientRecords(){
  $("#cleanCount").html("Started Removing...")
  let clientCopy = [];
  $.getJSON( "data/clients.json", function( data ) {
    console.log(data.length)
    $.each( data, function( i, item ) {
      console.log(item.HouseholdID)
      if (item.HouseholdID == "") {
        console.log("missing ID")
      } else {
        // check if it exists
        existingClient = clientCopy.filter(function( obj ) {
  				return obj.HouseholdID == item.HouseholdID
  			})
        console.log(existingClient.length)
        if (existingClient.length == 0 ) {
          if (item.DOB != "") item.DOB = cleanDate(item.DOB)
          if (item["Ethnic Group"] == "Asian/Pac Islander") {
        		item["Ethnic Group"] = "Asian/Pacific Islander"
        	}
          if (item.City == "") item.City = "San Jose"
          if (typeof item.Street == "Number") item.Street = String(item.Street)
          if (item.Comments != "") {
            console.log(item.Comments)
            let comments = item.Comments.split('\"')
            item.Comments = comments.join("'")
            console.log(item.Comments)
          }
          clientCopy.push(item)
        }
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
  console.log(importClientData.length)
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
};

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
    if (item.Status == "Client" || item.Status == "client") record.isActive = "Client"
    if (item.Status == "Active" || item.Status == "active") record.isActive = "Client"
    if (item.Status == "y" || item.Status == "Y") record.isActive = "Client"
    if (item.Status == "Emergency") record.isActive = "NonClient" //item.Status
    if (item.Status == "Inactive") record.isActive = "Inactive"
    if (item.Status == "") record.isActive = "Inactive"

    record.createdDateTime = moment(item.DateCreation_d, uiDate).format(dateTime)
    record.updatedDateTime = moment().format(dateTime)
    record.clientId = String(item.HouseholdID)

//console.log("ID: "+ item.HouseholdID)

    record.familyName = item.FamilyName
    record.givenName = item.GivenName
    record.gender = getGender(item.GivenName)
    if (item.DOB != "") {
      record.dob = moment(item.DOB, uiDate).format(date)
    } else {
      record.dob = "*EMPTY*"
    }
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
    if (record.firstSeenDate == "Invalid date") record.firstSeenDate = moment(record.createdDateTime).format(date)
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
      record.familyIdCheckedDate = moment(record.createdDateTime).format(date)
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
      let notes = comments.split("\n")

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
          let tempDate = dateArray[0]
          tempDate = tempDate.replace(/-/g, "/")
          console.log(tempDate)
          tempDate = cleanDate(tempDate)
          console.log(tempDate)
          notesTemp.createdDateTime = moment(tempDate, uiDate).format(dateTime)
//console.log(note + ": \n" + notesTemp.createdDateTime)
        } else {
          notesTemp.createdDateTime = moment(item.DateCreation_d, uiDate).format(dateTime)
        }

        if (notesTemp.createdDateTime == "Invalid date"){
          console.log("Invalid date")
          console.log("ID: ",item.HouseholdID )
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
      if (dependents[d].GivenName == "") {
        console.log("Missing Given Name: " + dependents[d].HouseholdID)
        dependents[d].GivenName = "*EMPTY*"
      }
      depRecord.givenName = dependents[d].GivenName
      if (dependents[d].FamilyName == "") {
        console.log("Missing Family Name: " + dependents[d].HouseholdID)
        dependents[d].FamilyName = "*EMPTY*"
      }
      depRecord.familyName = dependents[d].FamilyName
      if (dependents[d].DOB != "" && dependents[d].DOB != "*EMPTY*") {
console.log(dependents[d].HouseholdID + " | " + dependents[d].DOB)
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
    if (latestUSDA != "1900-01-01") {
      let recordUSDA = {}
      recordUSDA.serviceDateTime = latestUSDA
      recordUSDA.isUSDA = "USDA"
      recordUSDA.serviceCategory = "Food_Pantry"
      recordUSDA.serviceTypeId = "cj86davnj00013k7zi3715rf4"
      importedClients[i].lastServed.push(recordUSDA)
      lastServedCount++
    }
    if (latestNonUSDA != "1900-01-01") {
      let recordNonUSDA = {}
      recordNonUSDA.serviceDateTime = latestNonUSDA
      recordNonUSDA.isUSDA = "NonUSDA"
      recordNonUSDA.serviceCategory = "Food_Pantry"
      recordNonUSDA.serviceTypeId = "c2e6fbfcd32adcfdyht56a14c166d0b304da3aa32"
      importedClients[i].lastServed.push(recordNonUSDA)
      lastServedCount++
    }
    let clientString = JSON.stringify(client)
    if (clientString.includes("Invalid date")) {
      console.log("INVALID DATE")
      console.log(client)
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
 //TODO  familyIdCheckedDate  **** ADD TO SERVICES ??? REMOVE AS FIELD ??? treat as servicetype  ****
};

function loadFoodServices(){
  // Check if HouseholdID is in clientId


  $.each( foodSmall, function( i, item ) {
    if (moment(item.DateCreation_d, uiDate).isAfter("2016-12-31")) {
      console.log(item.DateCreation_d, "|", item.DateServed)
      let tempClient = importedClients.filter(function( obj ) {
         return obj.clientId == item.HouseholdID
      })
      if (tempClient.length > 0) {
        console.log(item.HouseholdID)
        console.log(tempClient[0])
        tempService = {}
        tempService.serviceId = cuid()
        tempService.serviceValid = true
        tempService.servicedDateTime = moment(item.DateServed, uiDate).format(dateTime)
        if (tempService.servicedDateTime == "") tempService.servicedDateTime = moment(item.DateCreation_d, uiDate).format(dateTime)
        tempService.servicedMonth = moment(tempService.servicedDateTime).format("YYYYMM")
        tempService.servicedDay = moment(tempService.servicedDateTime).format("YYYYMMDD")
        tempService.clientServedId = "" + item.HouseholdID
        tempService.clientStatus = tempClient[0].isActive
        tempService.servicedByUserName = "Imported"
        if (item.USDA == "USDA") {
          tempService.serviceTypeId = "cj86davnj00013k7zi3715rf4"
        } else if (item.USDA == "Non-USDA") {
          tempService.serviceTypeId = "c2e6fbfcd32adcfdyht56a14c166d0b304da3aa32"
        }
        tempServiceType = utilGetServiceTypeByID(tempService.serviceTypeId)
        tempService.serviceName = tempServiceType.serviceName
        tempService.serviceCategory = tempServiceType.serviceCategory
        tempService.serviceButtons = tempServiceType.serviceButtons
        tempService.isUSDA = tempServiceType.isUSDA
        tempService.itemsServed = "1"
        tempService.homeless = tempClient[0].homeless
        tempService.emergencyFood = "NO"
        tempService.totalAdultsServed = "" + item.Adults_served
        if (tempService.totalAdultsServed == "") tempService.totalAdultsServed = "0"
        tempService.totalChildrenServed = "" + item.Children_served
        if (tempService.totalChildrenServed == "") tempService.totalChildrenServed = "0"
        tempService.totalSeniorsServed = "0"
        tempService.totalIndividualsServed = "" + item.Individuals_served
        if (tempService.totalIndividualsServed == "") tempService.totalIndividualsServed = "0"
        tempService.fulfillment = {}
        tempService.fulfillment.pending = false
        tempService.fulfillment.dateTime = tempService.servicedDateTime
        tempService.fulfillment.voucherNumber = "NA"
        tempService.fulfillment.byUserName = "Imported"
        tempService.fulfillment.itemCount = "1"

        console.log(tempService.serviceName)
        serviceData.push(tempService)
      }
    }
  })
  setTimeout(function(){
      console.log(serviceData)
      $("#servicesFoodCount").html("["+ serviceData.length+"]")
  }, 1000);
};

function uploadServicesToDynamoDB(){
  let start = $("#servicesUploadStart").val()
  let end = $("#servicesUploadEnd").val()

console.log(start)
console.log(end)

  let servicesUploaded = 0
  $.each( serviceData.slice(start,end), function( i, service ) {
    let URL = aws+"/clients/services/"
    console.log("ID#:" + service.clientServedId + " i#:"+ i)
    result = dbPostData(URL,JSON.stringify(service))
    if (result != null) {
      console.log(JSON.stringify(service))
    } else {
      servicesUploaded++
    }
  })
  $("#servicesUploaded").html("["+ servicesUploaded + "]")
};

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

function changeAllClients(){
  let data = {}
  for (var i = 3500; i < 4600; i++) { //4600
    data = dbGetData(aws+"/clients/"+i).clients

    if (data.length > 0){
      data = data[0]
      console.log(data.clientId, data.isActive)
      if (data.isActive == "Active" ) {
        data.isActive = "Client"
      } else if (data.isActive == "Emergency" ) {
        data.isActive = "NonClient"
      }
      console.log(data.clientId, data.isActive)
      for (var l = 0; l < data.lastServed.length; l++) {
        if (data.lastServed[l].serviceCategory == "Food"){
          data.lastServed[l].serviceCategory = "Food_Pantry"
        }
      }
      console.log(data.lastServed)
      data = JSON.stringify(data)
      let URL = aws+"/clients/"
      result = dbPostData(URL,data)
    }
  }
};
