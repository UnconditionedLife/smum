{
    "serviceId": { "S": "cjrwd7c9x002i3ae56csr1vz2" },      // n
    "servicedDateTime": { "S": "2019-02-08T10:08" },        // n  FILTER IN DATABASE 
    "clientServedId": { "S": "96" },                        // yes
    "totalSeniorsServed": { "S": "0" },                     // yes
    "serviceName": {
      "S": "Socks"
    },
    "clientGivenName": {
      "S": "Ervin"
    },
    "emergencyFood": {                                      // n
      "S": "NO"
    },
    "servicedByUserName": {                                 // n
      "S": "CJP"
    },
    "clientStatus": {                                       // n
      "S": "Client"
    },
    "isUSDA": {                                             // Yes
      "S": "NA"
    },
    "clientZipcode": {                                      // yes
      "S": "95110"
    },
    "servicedDay": {
      "S": "20190208"                                       // DABATBASE INDEX
    },

    //  NEW
    "servicedMonth": { "S": "201902" },                     // NEW KEY & INDEX
                                               
      
    "firstSerice": { "B": TRUE },                           // NEW KEY & INDEX MAKE BOOLEAN

    //

    "fulfillment": {
      "M": {
        "dateTime": {
          "S": "2019-02-08T10:08"
        },
        "byUserName": {
          "S": "CJP"
        },
        "itemCount": {
          "S": "1"
        },
        "pending": {
          "BOOL": false
        },
        "voucherNumber": {
          "S": "XXXXX"
        }
      }
    },
    "totalIndividualsServed": {
      "S": "1"
    },
    "homeless": {                                       // Yes
      "S": "YES"
    },
    "itemsServed": {
      "S": "1"
    },
    "totalChildrenServed": {
      "S": "0"
    },
    "serviceButtons": {                                 // no
      "S": "Secondary"
    },
    "totalAdultsServed": {
      "S": "1"
    },
    "clientFamilyName": {                               // no
      "S": "Villareal"
    },
    "serviceTypeId": {
      "S": "c2e6fbfcd32adcf82730a14c166d0b304da3aa32"   // FILTER (INDEX ??)
    },
    "serviceValid": { "BOOL": true },                   // FILTER (INDEX ??)
    "serviceCategory": {
      "S": "Winter_Warming"                             // no
    }
  }

  // new API for valid food services (USDA & NON-USDA) by month -- MONTHLY & YEARLY REPORT

  // new API for valid first service (USDA & NON-USDA) by month -- ZIP CODE REPORT