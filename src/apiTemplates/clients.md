# API: /clients


# GET: REQUEST
{
    "TableName": "$stageVariables.clientsTable"
}


# GET: RESPONSE
#set($inputRoot = $input.path('$'))
{
    "count": $inputRoot.Count,
    "clients": [
        #foreach($elem in $inputRoot.Items) {
            "clientId": "$elem.clientId.S",
            "givenName": "$elem.givenName.S",
            "familyName": "$elem.familyName.S",
            "gender": "$elem.gender.S",
            "dob": "$elem.dob.S",
            "createdDateTime": "$elem.createdDateTime.S",
            "updatedDateTime": "$elem.updatedDateTime.S",
            "firstSeenDate": "$elem.firstSeenDate.S",
            "familyIdCheckedDate": "$elem.familyIdCheckedDate.S",
            "street": "$elem.street.S",
            "city": "$elem.city.S",
            "state": "$elem.state.S",
            "zipcode": "$elem.zipcode.S",
            "zipSuffix": "$elem.zipSuffix.S",
            "telephone": "$elem.telephone.S",
            "email": "$elem.email.S",
            "isActive": "$elem.isActive.S",
            "ethnicGroup": "$elem.ethnicGroup.S",
            "homeless": "$elem.homeless.S",
            "financials": {
                "income": "$elem.financials.M.income.S",
                "govtAssistance": "$elem.financials.M.govtAssistance.S",
                "rent": "$elem.financials.M.rent.S",
                "foodStamps": "$elem.financials.M.foodStamps.S"
                },
            "dependents": [#foreach($elem in $elem.dependents.L) {
                            "createdDateTime": "$elem.M.createdDateTime.S",
                            "updatedDateTime": "$elem.M.updatedDateTime.S",
                            "givenName": "$elem.M.givenName.S",
                            "familyName": "$elem.M.familyName.S",
                            "dob": "$elem.M.dob.S",
                            "gender": "$elem.M.gender.S",
                            "grade": "$elem.M.grade.S",
                            "gradeDateTime": "$elem.M.gradeDateTime.S",
                            "relationship": "$elem.M.relationship.S",
                            "isActive": "$elem.M.isActive.S"
                }#if($foreach.hasNext),#end
                #end
                ],
            "notes": [#foreach($elem in $elem.notes.L) {
                            "createdDateTime": "$elem.M.createdDateTime.S",
                            "updatedDateTime": "$elem.M.updatedDateTime.S",
                            "noteText": "$elem.M.noteText.S",
                            "isImportant": "$elem.M.isImportant.BOOL",
                            "noteByUserName": "$elem.M.noteByUserName.S"
                }#if($foreach.hasNext),#end
                #end
                ],
            "lastServed": [#foreach($elem in $elem.lastServed.L) {
                            "serviceTypeId": "$elem.M.serviceTypeId.S",
                            "serviceDateTime": "$elem.M.serviceDateTime.S",
                            "serviceCategory": "$elem.M.serviceCategory.S",
                            "isUSDA": "$elem.M.isUSDA.S"
                }#if($foreach.hasNext),#end
                #end]
        }#if($foreach.hasNext),#end
    #end]
}

# POST: REQUEST

#set($inputRoot = $input.path('$'))
{ 
    "TableName": "$stageVariables.clientsTable",
    "Item": {
	    "clientId": {"S": "$inputRoot.clientId"},
        "givenName": {"S": "$inputRoot.givenName"},
        "familyName": {"S": "$inputRoot.familyName"},
        "gender": {"S": "$inputRoot.gender"},
        "dob" : {"S": "$inputRoot.dob"},
        "createdDateTime" : {"S": "$inputRoot.createdDateTime"},
        "updatedDateTime" : {"S": "$inputRoot.updatedDateTime"},
        "firstSeenDate" : {"S": "$inputRoot.firstSeenDate"},
        "familyIdCheckedDate" : {"S": "$inputRoot.familyIdCheckedDate"},
        "street" : {"S": "$inputRoot.street"},
        "city" : {"S": "$inputRoot.city"},
        "state" : {"S": "$inputRoot.state"},
        "zipcode" : {"S": "$inputRoot.zipcode"},
        "zipSuffix" : {"S": "$inputRoot.zipSuffix"},
        "telephone" : {"S": "$inputRoot.telephone"},
        "email" : {"S": "$inputRoot.email"},
        "ethnicGroup" : {"S": "$inputRoot.ethnicGroup"},
        "isActive" : {"S": "$inputRoot.isActive"},
        "homeless" : {"S": "$inputRoot.homeless"},
        "financials" : {
            "M": {
                "income": {"S": "$inputRoot.financials.income"},
                "govtAssistance": {"S": "$inputRoot.financials.govtAssistance"},
                "rent": {"S": "$inputRoot.financials.rent"},
                "foodStamps": {"S": "$inputRoot.financials.foodStamps"}
            }
        },
        "dependents" : {
            "L": [
                #foreach($elem in $inputRoot.dependents)
                    {
                        "M": {
                            "createdDateTime": {"S": "$elem.createdDateTime"},
                            "updatedDateTime": {"S": "$elem.updatedDateTime"},
                            "givenName": {"S": "$elem.givenName"},
                            "familyName": {"S": "$elem.familyName"},
                            "dob": {"S": "$elem.dob"},
                            "gender": {"S": "$elem.gender"},
                            "grade" : {"S": "$elem.grade"},
                            "gradeDateTime" : {"S": "$elem.gradeDateTime"},
                            "relationship": {"S": "$elem.relationship"},
                            "isActive": {"S": "$elem.isActive"}
                        }
                    }
                #if($foreach.hasNext),#end
                #end
            ]
        },
         "notes" : {
            "L": [
                #foreach($elem in $inputRoot.notes)
                    {
                        "M": {
                            "createdDateTime": {"S": "$elem.createdDateTime"},
                            "updatedDateTime": {"S": "$elem.updatedDateTime"},
                            "noteText": {"S": "$elem.noteText"},
                            "isImportant": {"BOOL": "$elem.isImportant"},
                            "noteByUserName": {"S": "$elem.noteByUserName"}
                        }
                    }
                #if($foreach.hasNext),#end
                #end
            ]
        },
        "lastServed" : {
            "L": [
                #foreach($elem in $inputRoot.lastServed)
                    {
                        "M": {
                            "serviceTypeId": {"S": "$elem.serviceTypeId"},
                            "serviceDateTime": {"S": "$elem.serviceDateTime"},
                            "serviceCategory": {"S": "$elem.serviceCategory"},
                            "isUSDA": {"S": "$elem.isUSDA"}
                        }
                    }
                #if($foreach.hasNext),#end
                #end
            ]
        }
    }
}


# POST: RESPONSE

** EPMTY **