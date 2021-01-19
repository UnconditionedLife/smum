//************************************************
//***** CLIENTS SECTION JAVASCRIPT FUNCTIONS *****
//************************************************
import { dbSaveClient, dbGetNewClientID } from '../../js/Database';
import { utilNow } from '../GlobalUtils';

//**** EXPORTABLE JAVASCRIPT FUNCTIONS ****

export function searchClients(str) {
    const regex = /[/.]/g
    const slashCount = (str.match(regex) || []).length
    let clientsFoundTemp = window.dbSearchClients(str, slashCount)
    
    if (clientsFoundTemp == undefined || clientsFoundTemp==null || clientsFoundTemp.length==0){
      clientsFoundTemp = []
      window.servicesRendered = [] // used temporarily to keep global vars in sync
      window.uiClearCurrentClient()
    }
    return clientsFoundTemp
}

export function saveClientRecord(data){
    console.log(data)
	data.updatedDateTime = utilNow()
	if (data.clientId === undefined) {
        data.clientId = dbGetNewClientID()
        if (data.clientId === 'failed') return 'failed'
        data.createdDateTime = utilNow()
		data.dependents = []
		data.lastServed = []
		data.notes = []
	} else {
        // DELETE svcHistory from client before saving
        delete data.svcHistory
		if (data.dependents === undefined) data.dependents = []
        if (data.lastServed === undefined) data.lastServed = []
        if (data.notes === undefined) data.notes = []
        // DELETE Age fields
        delete data.age
		for (var i = 0; i < data.dependents.length; i++) {
			delete data.dependents[i].age
		}
	}
    const result = dbSaveClient(data)
    console.log(result)
	if (result === 'success') return data
    return 'failed'
}

//**** JAVASCRIPT FUNCTIONS FOR USE WITHIN EXPORTABLE FUNCTIONS ****