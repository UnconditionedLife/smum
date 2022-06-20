# API: /services

# OLD FIELD NAMES
    
# GET: RESPONSE 

    ## OLD FIELD NAMES = 361 characters

    #set($inputRoot = $input.path('$'))
    {
        "count": $inputRoot.Count,
        "services": [
            #foreach($elem in $inputRoot.Items) {
                "serviceId": "$elem.serviceId.S",
                "serviceValid": "$elem.serviceValid.BOOL",
                "clientServedId": "$elem.clientServedId.S",
                "clientStatus": "$elem.clientStatus.S",
                "clientGivenName": "$elem.clientGivenName.S",
                "clientFamilyName": "$elem.clientFamilyName.S",
                "clientZipcode": "$elem.clientZipcode.S",
                "servicedDateTime": "$elem.servicedDateTime.S",
                "servicedDay": "$elem.servicedDay.S",
                "servicedByUserName": "$elem.servicedByUserName.S",
                "serviceTypeId": "$elem.serviceTypeId.S",
                "serviceName": "$elem.serviceName.S",
                "serviceCategory": "$elem.serviceCategory.S",
                "serviceButtons": "$elem.serviceButtons.S",
                "isUSDA": "$elem.isUSDA.S",
                "emergencyFood": "$elem.emergencyFood.S",
                "homeless": "$elem.homeless.S",
                "itemsServed": "$elem.itemsServed.S",
                "totalAdultsServed": "$elem.totalAdultsServed.S",
                "totalChildrenServed": "$elem.totalChildrenServed.S",
                "totalSeniorsServed": "$elem.totalSeniorsServed.S",
                "totalIndividualsServed": "$elem.totalIndividualsServed.S",
                "fulfillment": { 
                    "pending": "$elem.fulfillment.M.pending.BOOL",
                    "dateTime": "$elem.fulfillment.M.dateTime.S",
                    "voucherNumber": "$elem.fulfillment.M.voucherNumber.S",
                    "byUserName": "$elem.fulfillment.M.byUserName.S",          
                    "itemCount": "$elem.fulfillment.M.itemCount.S"
                    }
            }#if($foreach.hasNext),#end
        #end]
    }

# NEW FIELD NAMES

# GET: RESPONSE

## NEW FIELD NAMES = 163 characters

#set($inputRoot = $input.path('$'))
{
    "count": $inputRoot.Count,
    "services": [
        #foreach($elem in $inputRoot.Items) {
            "svcId": "$elem.svcId.S",
            "svcValid": "$elem.svcValid.BOOL",
            "cId": "$elem.cId.S",
            "cStatus": "$elem.cStatus.S",
            "cGName": "$elem.cGName.S",
            "cFName": "$elem.cFName.S",
            "cZip": "$elem.cZip.S",
            "svcDtTm": "$elem.svcDtTm.S",
            "svcDay": "$elem.svcDay.S",
            "svcBy": "$elem.svcBy.S",
            "svcTpId": "$elem.svcTpId.S",
            "svcName": "$elem.svcName.S",
            "svcCat": "$elem.svcCat.S",
            "svcBtns": "$elem.svcBtns.S",
            "isUSDA": "$elem.isUSDA.S",
            "emergFood": "$elem.emergFood.S",
            "homeless": "$elem.homeless.S",
            "items": "$elem.items.S",
            "adlts": "$elem.adlts.S",
            "chldn": "$elem.chldn.S",
            "snrs": "$elem.snrs.S",
            "indvs": "$elem.indvs.S",
            "fulfill": { 
                "pending": "$elem.fulfill.M.pending.BOOL",
                "dtTm": "$elem.fulfill.M.dtTm.S",
                "voucher": "$elem.fulfill.M.voucher.S",
                "by": "$elem.fulfill.M.by.S",          
                "items": "$elem.fulfill.M.items.S"
                }
        }#if($foreach.hasNext),#end
    #end]
}

# POSSIBLE DYNAMIC MAPPING *** NOT COMPLETE -- NOT TESTED ***

#set($inputRoot = $input.path('$'))
{
    "count": $inputRoot.Count,
    "services": [
        #foreach($item in $inputRoot.Items.keySet()) {
            #if ( $item.S )
                "$item": "$item.S.get($item)",
            #elseif( $item.BOOL )
                "$item": "$item.BOOL.get($item)",
            #elseif( $item.N )
                "$item": "$item.BOOL.get($item)",
            #elseif( $item.M )
                {
                    #foreach($fulfill in $item.M.keySet())"$fulfill":$shipitem.M.price.M.get($sprice).N#if($foreach.hasNext),#end #end}
                "$item": "$item.BOOL.get($item)",

            "svcValid": "$elem.svcValid.BOOL",
            "cId": "$elem.cId.S",
            "cStatus": "$elem.cStatus.S",
            "cGName": "$elem.cGName.S",
            "cFName": "$elem.cFName.S",
            "cZip": "$elem.cZip.S",
            "svcDtTm": "$elem.svcDtTm.S",
            "svcDay": "$elem.svcDay.S",
            "svcBy": "$elem.svcBy.S",
            "svcTpId": "$elem.svcTpId.S",
            "svcName": "$elem.svcName.S",
            "svcCat": "$elem.svcCat.S",
            "svcBtns": "$elem.svcBtns.S",
            "isUSDA": "$elem.isUSDA.S",
            "emergFood": "$elem.emergFood.S",
            "homeless": "$elem.homeless.S",
            "items": "$elem.items.S",
            "adlts": "$elem.adlts.S",
            "chldn": "$elem.chldn.S",
            "snrs": "$elem.snrs.S",
            "indvs": "$elem.indvs.S",
            "fulfill": { 
                "pending": "$elem.fulfill.M.pending.BOOL",
                "dtTm": "$elem.fulfill.M.dtTm.S",
                "voucher": "$elem.fulfill.M.voucher.S",
                "by": "$elem.fulfill.M.by.S",          
                "items": "$elem.fulfill.M.items.S"
                }
        }#if($foreach.hasNext),#end
    #end]
}