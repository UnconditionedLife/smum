//******************************************************************
//****** CLIENTS Receipt Printer SECTION JAVASCRIPT FUNCTIONS ******
//******************************************************************
import moment from  'moment';
import { utilSortDependentsByGrade, utilCalcGradeGrouping, utilSortDependentsByAge,
    utilCalcAgeGrouping, utilPadTrimString } from '../Clients/ClientUtils'
import { dateFindOpen, getSvcTypes, SettingsPrinter, SettingsSchedule } from '../GlobalUtils';

const svcTypes = getSvcTypes()

let ePosDev = new window.epson.ePOSDevice();
let img = document.getElementById('smum');
let printer = null;

//**** EXPORTABLE JAVASCRIPT FUNCTIONS ****

export function prnConnect() {
    // TODO UI ALERT CONNECTED TO PRINTER
    prnDrawCanvas('smum');
    ePosDev.connect(SettingsPrinter(), '8008', prnCallback_connect);
}

export function prnPrintFoodReceipt(at) {
    const { client, isUSDA } = at
	prnStartReceipt();
	prnServiceHeader(client, 'EMERGENCY FOOD PANTRY PROGRAM');
	prnTextLine('(' + client.zipcode +	')');
	prnFeed(1);
	prnTextLine('CHILDREN | NIÑOS\t\t' + client.family.totalChildren);
	prnTextLine('ADULTS | ADULTOS\t\t' +
		(client.family.totalAdults + client.family.totalSeniors));
	prnTextLine('FAMILY | FAMILIA:\t\t' + client.family.totalSize);
	prnFeed(1);
	prnTextLine('**************************************')
	prnTextLine(' ' + isUSDA + ' ', 2, 2, ['inverse']);
	prnTextLine('**************************************');
	prnEndReceipt();
}

export function prnPrintVoucherReceipt( at ) {
    const { client, serviceType, dependents, grouping } = at
	let serviceName = serviceType.serviceName;
	prnStartReceipt();
	prnServiceHeader(client, serviceName.toUpperCase());
	prnFeed(1);
	if (dependents) {
		let sortingFn, groupingFn;
		prnAlign('left');
        if (grouping == 'age') {
			sortingFn = utilSortDependentsByAge;
			groupingFn = utilCalcAgeGrouping;
			prnTextLine('CHILDREN / NIÑOS        GENDER   AGE');
		} else if (grouping == 'grade') {
			sortingFn = utilSortDependentsByGrade;
			groupingFn = utilCalcGradeGrouping;
			prnTextLine('CHILDREN / NIÑOS        GENDER   GRADE');
		}
		prnFeed(1);
		for (let dep of sortingFn(dependents)) {
			let childName = utilPadTrimString(dep.givenName.toUpperCase() +
				' ' + dep.familyName.toUpperCase(), 24);
			let gender =  utilPadTrimString(dep.gender.toUpperCase(), 9);
			let group = utilPadTrimString(groupingFn(dep), 5);
			prnTextLine(childName + gender + group);
		}
		prnFeed(1);
	}
	prnAlign('center');
	prnPickupTimes(serviceType.fulfillment.fromDateTime,
		serviceType.fulfillment.toDateTime);
  prnEndReceipt();
}

export function prnPrintClothesReceipt(at) {
    const { client, serviceType } = at
	const numArticles = client.family.totalSize * serviceType.numberItems;
	const timeLimit = 10; // TODO get from service properties

	prnStartReceipt();
	prnServiceHeader(client, 'CLOTHES CLOSET PROGRAM');
	prnFeed(1);
	prnTextLine('CHILDREN | NIÑOS\t\t' + client.family.totalChildren);
	prnTextLine('ADULTS | ADULTOS\t\t' +
		(client.family.totalAdults + client.family.totalSeniors));
	prnFeed(1);
	prnTextLine('LIMIT OF ' + serviceType.numberItems + ' ITEMS PER PERSON');
	prnTextLine('LIMITE ' + serviceType.numberItems + ' ARTÍCULOS POR PERSONA');
	prnFeed(1);
	prnTextLine('TOTAL ITEMS | ARTÍCULOS');
	prnTextLine('**************************************')
	prnTextLine(' ' + numArticles + ' ', 2, 2, ['inverse']);
	prnTextLine('**************************************');
    prnFeed(1);
	prnTextLine('MAXIMUM TIME ' + timeLimit + ' MINUTES');
	prnTextLine('TIEMPO MÁXIMO ' + timeLimit + ' MINUTOS');
    prnFeed(2);
	prnTextLine('TIME IN___________   TIME OUT___________');
	prnEndReceipt();
}

export function prnPrintReminderReceipt(client) {
	// Determine next visit date
	let targetDate = moment().add(14, 'days');
	let earliestDate = moment().add(7, 'days');
	let nextVisit = dateFindOpen({ targetDate: targetDate, eraliestDate: earliestDate, schedule: SettingsSchedule() });
	prnStartReceipt();
	prnServiceHeader(client, 'NEXT VISIT REMINDER');
	prnFeed(1);
  prnTextLine('NEXT VISIT | PRÓXIMA VISITA');
  prnTextLine('**************************************')
  prnTextLine(' ' + nextVisit.format("MMMM Do, YYYY") + ' ', 1, 2, ['inverse']);
  prnTextLine('**************************************');
  prnEndReceipt();
}

export function prnFlush() {
	if (printer)
		printer.send();
}

//**** JAVASCRIPT FUNCTIONS FOR USE WITHIN EXPORTABLE FUNCTIONS ****

function prnStartReceipt() {
	let logo = document.getElementById('smum');
	if (printer) {
		printer.addTextAlign(printer.ALIGN_CENTER);
		printer.addTextSmooth(true);
		printer.addImage(logo.getContext('2d'), 0, 0, logo.width, logo.height,
			printer.COLOR_1, printer.MODE_GRAY16);
	} else {
		let prnWindow = prnGetWindow();
		prnWindow.document.writeln('<p align="center">');
		let logo_id = 'logo' + Math.floor(Math.random() * 10000);
		let w = Math.floor(logo.width * 2 / 3);
		let h = Math.floor(logo.height * 2 / 3);
		prnWindow.document.writeln('<canvas id="' + logo_id + '" width="' + w +
			'" height="' + h + '"></canvas>');
		let ctx = prnWindow.document.getElementById(logo_id).getContext('2d');
		ctx.drawImage(logo, 0, 0, w, h);
	}
	prnFeed(1);
	prnTextLine('778 S. Almaden Avenue');
	prnTextLine('San Jose, CA 95110');
	prnTextLine('(408) 292-3314');
}

function prnAlign(align) {
	if (printer) {
		if (align == 'left')
			printer.addTextAlign(printer.ALIGN_LEFT);
		else if (align == 'center')
			printer.addTextAlign(printer.ALIGN_CENTER);
	}
	else {
		let prnWindow = prnGetWindow();
		prnWindow.document.writeln('</p><p align="' + align + '">')
	}
}

function prnTextLine(str, width, height, attrs) {
	if (width == null)
		width = 1;
	if (height == null)
		height = 1;
	let inverse = attrs && attrs.indexOf('inverse') >= 0;
	if (printer) {
		printer.addTextSize(width, height);
		if (inverse)
			printer.addTextStyle(true,false,false,printer.COLOR_1);
		printer.addText(str + '\n');
		if (inverse)
			printer.addTextStyle(false,false,false,printer.COLOR_1);
	} else {
		let prnWindow = prnGetWindow();
		let style = "font-family:monospace;";
		if (height > 1)
			style += 'font-size:' + height*100 + '%;';
		if (inverse)
			style += 'color:white;background-color:black;';
		prnWindow.document.writeln('<span style="' + style + '">' +
			str.replace(/ /g, '&nbsp;') + '<br/></span>')
	}
}

function prnFeed(n) {
	if (printer) {
		printer.addTextSize(1, 1);
        printer.addFeedLine(n);
	} else {
		let prnWindow = prnGetWindow();
		for (let i = 0; i < n; i++) {
			prnWindow.document.writeln('<br/>');
		}
	}
}

function prnEndReceipt() {
	if (printer) {
		printer.addFeedLine(2);
		printer.addCut(printer.CUT_FEED);
	} else {
		let prnWindow = prnGetWindow();
		prnWindow.document.writeln('</p><br/><br/><hr/>');
	}
}

function prnServiceHeader(client, title) {
	prnFeed(2);
	prnTextLine('* ' + title + ' *', 1, 2);
	prnTextLine(moment().format("MMMM Do, YYYY LT"));
	prnFeed(1);
	prnTextLine(client.givenName + ' ' + client.familyName, 2, 2);
	prnFeed(1);
	prnTextLine(' ' + client.clientId + ' ', 2, 1, ['inverse']);
}

function prnPickupTimes(fromDateTime, toDateTime) {
	prnTextLine('**************************************')
	prnTextLine('PRESENT THIS FOR PICKUP')
	prnTextLine('HAY QUE PRESENTAR PARA RECLAMAR')
	prnTextLine(' ' + moment(fromDateTime).format("MMMM Do, YYYY")+ ' ', 2, 2, ['inverse']);
	prnFeed(1);
	prnTextLine(' ' + moment(fromDateTime).format("h:mm a") + ' - ' +
		moment(toDateTime).format("h:mm a") + ' ', 1, 1, ['inverse']);
	prnTextLine('**************************************');
}

// PRINTER FUNCTIONS

function prnCallback_connect(resultConnect){
    var deviceId = 'local_printer';
    var options = {'crypto' : false, 'buffer' : false};
    if ((resultConnect == 'OK') || (resultConnect == 'SSL_CONNECT_OK')) {
        //Retrieves the Printer object
        ePosDev.createDevice(deviceId, ePosDev.DEVICE_TYPE_PRINTER, options, prnCallback_createDevice);
    } else {
        //Displays error messages
        // TODO ADD UI ALERT
        console.log("Error in callback_connect");
 }
}

function prnGetWindow() {
	let win = window.open('', 'Receipt Printer', 'width=550,height=1000');
	win.document.title = 'Receipt Printer';
	return win;
}

function prnCallback_createDevice(deviceObj, errorCode){
    if (deviceObj === null) {
       //Displays an error message if the system fails to retrieve the Printer object
        console.log("error in callback_createDevice 1");
        return;
    }
    printer = deviceObj;
    //Registers the print complete event
    printer.onreceive = function(response){
        if (response.success) {
            console.log("success in callback_createDevice");
        } else {
           console.log("error in callback_createDevice 1");
        }
    }
}

function prnDrawCanvas(name) {
   let canvas = document.getElementById(name);
   let img = document.getElementById(name + 'img');
   // img.setAttribute('crossOrigin', 'Anonymous');
   canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
}

// Printer testing
let receiptIndex = 0;
const receiptTypes = 6;

function clickPrintTestSingle() {
	prnTestReceipt(receiptIndex);
	prnFlush();
	receiptIndex = (receiptIndex + 1) % receiptTypes;
}

function clickPrintTestBatch() {
	for (let i=0; i < receiptTypes; i++)
		prnTestReceipt(i);
	prnFlush();
}

function prnTestReceipt(receiptType) {
	let service;
	switch(receiptType) {
		case 0:
			service = svcTypes.filter(obj => obj.serviceName == 'Clothes')[0];
			prnPrintClothesReceipt(service);
			break;
		case 1:
			prnPrintFoodReceipt('USDA');
			break;
		case 2:
			prnPrintReminderReceipt();
			break;
		case 3:
			service = svcTypes.filter(obj => obj.serviceName == 'Thanksgiving Turkey')[0];
			prnPrintVoucherReceipt(service);
			break;
		case 4:
			service = svcTypes.filter(obj => obj.serviceName == 'Christmas Toy')[0];
			prnPrintVoucherReceipt(service, client.dependents, 'age');
			break;
		case 5:
			service = svcTypes.filter(obj => obj.serviceName == 'First Step')[0];
			prnPrintVoucherReceipt(service, client.dependents, 'grade');
			break;
	}
}