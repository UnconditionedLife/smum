//************************************************
//***** CLIENTS SECTION JAVASCRIPT FUNCTIONS *****
//************************************************
import { saveRecord } from '../../js/Database'

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


//**** JAVASCRIPT FUNCTIONS FOR USE WITHIN EXPORTABLE FUNCTIONS ****