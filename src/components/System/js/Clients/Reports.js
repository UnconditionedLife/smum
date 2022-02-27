//******************************************************************
//     ****** ADMIN REPORTS SECTION JAVASCRIPT FUNCTIONS ******
//******************************************************************

export async function utilRemoveServiceSync(ethnicGroup){
	return await dbGetEthnicGroupCountAsync(ethnicGroup)
        .then( async (serviceArray) => {
            let service = serviceArray[0]
            service.serviceValid = false
            return await dbSaveServiceRecordAsync(service)
                // .then( () => {
                //     console.log("utilRemoveService = success!");
                // })
        })
}