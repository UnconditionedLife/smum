//******************************************************************
//****** CLIENTS Receipt Printer SECTION JAVASCRIPT FUNCTIONS ******
//******************************************************************
import moment from  'moment';
import { utilSortDependentsByGrade, utilCalcGradeGrouping, utilSortDependentsByAge,
    utilCalcAgeGrouping, utilPadTrimString } from '../Clients/ClientUtils'
import { getSvcTypes, SettingsSchedule } from '../Database';
import { dateFindOpen } from '../GlobalUtils'

let ePosDev = new window.epson.ePOSDevice();
let printer = null;
let logo;

//**** EXPORTABLE JAVASCRIPT FUNCTIONS ****

export function prnConnect(settings) {
    logo = prnGetLogo();

    console.log('Printer IP', settings.printerIP);
    ePosDev.connect(settings.printerIP, '8008', prnCallback_connect);
    // ePosDev.connect(settings.printerIP, '8043', prnCallback_connect); // use TLS
}

export function prnPrintFoodReceipt(client, isUSDA) {
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

export function prnPrintVoucherReceipt(client, serviceType, dependents, grouping) {
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

export function prnPrintClothesReceipt(client, serviceType) {
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
	let nextVisit = dateFindOpen({ targetDate: targetDate, earliestDate: earliestDate, schedule: SettingsSchedule() });
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

export function prnTest(type) {
    if (type == 'minimal') {
        prnStartReceipt();
        prnFeed(2);
        prnTextLine('* Test Receipt *', 1, 2);
        prnEndReceipt();
    }
    if (type == 'full') {
        for (let i=0; i < 6; i++)
            prnTestReceipt(i);
    }
	prnFlush();
}

//**** JAVASCRIPT FUNCTIONS FOR USE WITHIN EXPORTABLE FUNCTIONS ****

function prnStartReceipt() {
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

function prnGetWindow() {
	let win = window.open('', 'Receipt Printer', 'width=550,height=1000');
	win.document.title = 'Receipt Printer';
	return win;
}

function prnCallback_connect(result) {
    var deviceId = 'local_printer';
    var options = {'crypto' : false, 'buffer' : false};
    if ((result == 'OK') || (result == 'SSL_CONNECT_OK')) {
        // Retrieves the Printer object
        ePosDev.createDevice(deviceId, ePosDev.DEVICE_TYPE_PRINTER, options, prnCallback_createDevice);
    } else {
        // Displays error messages
        // TODO ADD UI ALERT
        console.log('Printer connect error', result);
    }
}

function prnCallback_createDevice(deviceObj, result) {
    if (deviceObj === null) {
        console.log('Printer create device error', result);
        return;
    }
    printer = deviceObj;
    //Registers the print complete event
    // printer.onreceive = function(response){
    //     if (response.success) {
    //         console.log("success in callback_createDevice");
    //     } else {
    //        console.log("error in callback_createDevice 1");
    //     }
    // }
}

function prnGetLogo() {
    // The following works, but only if the image is also included in the HTML.
    // Therefore, we just refer to the existing DOM node instead.
    // let img = document.createElement('img');
    // img.src = '/public/images/receipt-logo.png';
    // img.setAttribute('crossOrigin', 'Anonymous');
    let img = document.getElementById('smumlogo');

    let logo = document.createElement('canvas');
    logo.width = 336;
    logo.height = 112;
    logo.getContext('2d').drawImage(img, 0, 0, logo.width, logo.height);
    return logo;
}

// Printer testing

// Dummy client and service data for receipts
const testClient = {
    clientId: '12345', givenName: 'Printing', familyName: 'Tester', gender: 'Female', 
    zipcode: '95110',
    dependents: [
        {
            givenName: "One",
            familyName: "Tester",
            gender: "Female",
            age: 6,
            grade: "1st",
            isActive: "Active",
        }, 
        {
            givenName: "Two",
            familyName: "Tester",
            gender: "Male",
            age: 7,
            grade: "2nd",
            isActive: "Active",
        }, 
        {
            givenName: "Three",
            familyName: "Tester",
            gender: "Female",
            age: 8,
            grade: "3rd",
            isActive: "Active",
        }, 
        {
            givenName: "Four",
            familyName: "Tester",
            gender: "Male",
            age: 9,
            grade: "4th",
            isActive: "Active",
        }, 
        {
            givenName: "Grandpa",
            familyName: "Tester",
            gender: "Male",
            age: 70,
            isActive: "Active",
        }, 
    ],
    family: {totalAdults: 2, totalChildren: 4, totalOtherDependents: 1, totalSeniors: 1, totalSize: 7},
}

function prnTestReceipt(receiptType) {
	let service;
    const children = testClient.dependents.filter(d => d.age < 18);
	switch(receiptType) {
		case 0:
			service = getSvcTypes().filter(obj => obj.serviceName == 'Clothes')[0];
			prnPrintClothesReceipt(testClient, service);
			break;
		case 1:
			prnPrintFoodReceipt(testClient, 'USDA');
			break;
		case 2:
			prnPrintReminderReceipt(testClient);
			break;
		case 3:
			service = getSvcTypes().filter(obj => obj.serviceName == 'Thanksgiving Turkey')[0];
			prnPrintVoucherReceipt(testClient, service);
			break;
		case 4:
			service = getSvcTypes().filter(obj => obj.serviceName == 'Christmas Toy')[0];
			prnPrintVoucherReceipt(testClient, service, children, 'age');
			break;
		case 5:
			service = getSvcTypes().filter(obj => obj.serviceName == 'First Step')[0];
			prnPrintVoucherReceipt(testClient, service, children, 'grade');
			break;
	}
}