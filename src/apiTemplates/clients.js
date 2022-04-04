API: /clients


// GET
{
    "TableName": "$stageVariables.clientsTable"
}


// RESPONSE
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
