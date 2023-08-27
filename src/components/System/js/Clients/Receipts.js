//******************************************************************
//****** CLIENTS Receipt eposPrinter SECTION JAVASCRIPT FUNCTIONS ******
//******************************************************************
import moment from  'moment';
import { utilSortDependentsByGrade, utilCalcGradeGrouping, utilSortDependentsByAge,
    utilCalcAgeGrouping, utilPadTrimString } from './ClientUtils'
import { getSvcTypes, dbSendReceipt } from '../Database';

const usePrintQueue = true;
let eposDev;
let eposPrinter = null;
let curr_align = '';
let logo;

// Printer discovery and initialization

export function prnConnect(settings) {
    if (usePrintQueue == false) {
        console.log('Attempt to initialize Epson printer')
        logo = prnGetLogo();
        eposDev = new window.epson.ePOSDevice();
        eposDev.connect(settings.printerIP, 8043, eposConnect);
    }
}

function eposConnect(result) {
    const deviceId = 'local_printer';
    const options = {'crypto' : false, 'buffer' : false};
    if ((result == 'OK') || (result == 'SSL_CONNECT_OK')) {
        // Retrieves the Printer object
        eposDev.createDevice(deviceId, eposDev.DEVICE_TYPE_PRINTER, options, eposCreateDevice);
    } else {
        // Displays error messages
        // TODO ADD UI ALERT
        console.log('Epson connect error', result);
    }
}

function eposCreateDevice(deviceObj, result) {
    if (deviceObj === null) {
        console.log('Epson create device error', result);
        return;
    }
    eposPrinter = deviceObj;
}

export function prnPrintFoodReceipt(client, svcUSDA) {
	let rcpt = prnStartReceipt();
	prnServiceHeader(rcpt, client, 'EMERGENCY FOOD PANTRY PROGRAM');
	prnTextLine(rcpt, '(' + client.zipcode +	')');
	prnFeed(rcpt, 1);
	prnTextLine(rcpt, 'CHILDREN | NIÑOS\t\t' + client.family.totalChildren);
	prnTextLine(rcpt, 'ADULTS | ADULTOS\t\t' +
		(client.family.totalAdults + client.family.totalSeniors));
	prnTextLine(rcpt, 'FAMILY | FAMILIA:\t\t' + client.family.totalSize);
	prnFeed(rcpt, 1);
	prnTextLine(rcpt, '**************************************')
	prnTextLine(rcpt, ' ' + svcUSDA + ' ', 2, 2, true);
	prnTextLine(rcpt, '**************************************');
	prnEndReceipt(rcpt);
}

export function prnPrintVoucherReceipt(props) {
    const {client, svcType, dependents, grouping} = props
	let svcName = svcType.svcName;
	let rcpt = prnStartReceipt();
	prnServiceHeader(rcpt, client, svcName.toUpperCase());
	prnFeed(rcpt, 1);
	if (dependents) {
		let sortingFn, groupingFn;
        if (grouping == 'age') {
			sortingFn = utilSortDependentsByAge;
			groupingFn = utilCalcAgeGrouping;
			prnTextLine(rcpt, 'CHILDREN / NIÑOS        GENDER   AGE', 1, 1, false, 'left');
		} else if (grouping == 'grade') {
			sortingFn = utilSortDependentsByGrade;
			groupingFn = utilCalcGradeGrouping;
			prnTextLine(rcpt, 'CHILDREN / NIÑOS        GENDER   GRADE', 1, 1, false, 'left');
		}
		prnFeed(rcpt, 1);
		for (let dep of sortingFn(dependents)) {
			let childName = utilPadTrimString(dep.givenName.toUpperCase() +
				' ' + dep.familyName.toUpperCase(), 24);
			let gender =  utilPadTrimString(dep.gender.toUpperCase(), 9);
			let group = utilPadTrimString(groupingFn(dep), 5);
			prnTextLine(rcpt, childName + gender + group, 1, 1, false, 'left');
		}
		prnFeed(rcpt, 1);
	}
	prnPickupTimes(rcpt, svcType.fulfillment.fromDateTime,
		svcType.fulfillment.toDateTime);
    prnEndReceipt(rcpt);
}

export function prnPrintClothesReceipt(client, serviceType) {
	const numArticles = client.family.totalSize * serviceType.numberItems;
	const timeLimit = 10; // TODO get from service properties

	let rcpt = prnStartReceipt();
	prnServiceHeader(rcpt, client, 'CLOTHES CLOSET PROGRAM');
	prnFeed(rcpt, 1);
	prnTextLine(rcpt, 'CHILDREN | NIÑOS\t\t' + client.family.totalChildren);
	prnTextLine(rcpt, 'ADULTS | ADULTOS\t\t' +
		(client.family.totalAdults + client.family.totalSeniors));
	prnFeed(rcpt, 1);
	prnTextLine(rcpt, 'LIMIT OF ' + serviceType.numberItems + ' ITEMS PER PERSON');
	prnTextLine(rcpt, 'LIMITE ' + serviceType.numberItems + ' ARTÍCULOS POR PERSONA');
	prnFeed(rcpt, 1);
	prnTextLine(rcpt, 'TOTAL ITEMS | ARTÍCULOS');
	prnTextLine(rcpt, '**************************************')
	prnTextLine(rcpt, ' ' + numArticles + ' ', 2, 2, true);
	prnTextLine(rcpt, '**************************************');
    prnFeed(rcpt, 1);
	prnTextLine(rcpt, 'MAXIMUM TIME ' + timeLimit + ' MINUTES');
	prnTextLine(rcpt, 'TIEMPO MÁXIMO ' + timeLimit + ' MINUTOS');
    prnFeed(rcpt, 2);
	prnTextLine(rcpt, 'TIME IN___________   TIME OUT___________');
	prnEndReceipt(rcpt);
}

export function prnPrintReminderReceipt(client, nextVisit) {
	let rcpt = prnStartReceipt();
	prnServiceHeader(rcpt, client, 'NEXT VISIT REMINDER');
	prnFeed(rcpt, 1);
    prnTextLine(rcpt, 'NEXT VISIT | PRÓXIMA VISITA');
    prnTextLine(rcpt, '**************************************')
    prnTextLine(rcpt, ' ' + moment(nextVisit).format("MMMM Do, YYYY") + ' ', 1, 2, true);
    prnTextLine(rcpt, '**************************************');
    prnEndReceipt(rcpt);
}

function prnStartReceipt() {
    return [];
}

function prnAlign(align, force=false) {
    if (force || align != curr_align) {
        if (eposPrinter) {
            if (align == 'center')
                eposPrinter.addTextAlign(eposPrinter.ALIGN_CENTER);
            else if (align == 'left')
                eposPrinter.addTextAlign(eposPrinter.ALIGN_LEFT);
            else if (align == 'right')
                eposPrinter.addTextAlign(eposPrinter.ALIGN_RIGHT);
        }
        else {
            let prnWindow = prnGetWindow();
            prnWindow.document.writeln('</p><p align="' + align + '">')
        }
    }
    curr_align = align;
}

function prnTextLine(rcpt, str, width=1, height=1, inverse=false, align='center') {
    rcpt.push({op: 'text', text: str, width: width, height: height, invert: inverse, align: align});
}

function prnFeed(rcpt, n) {
    rcpt.push({op: 'feed', n: n});
}

function prnEndReceipt(rcpt) {
    if (usePrintQueue) {
        dbSendReceipt(rcpt);
    } else if (eposPrinter) {
        // start
        prnAlign('center', true);
        eposPrinter.addTextSmooth(true);
        eposPrinter.addImage(logo.getContext('2d'), 0, 0, logo.width, logo.height,
            eposPrinter.COLOR_1, eposPrinter.MODE_GRAY16);
        eposPrinter.addTextSize(1, 1);
        eposPrinter.addFeedLine(1);
        eposPrinter.addText('778 S. Almaden Avenue\n');
        eposPrinter.addText('San Jose, CA 95110\n');
        eposPrinter.addText('(408) 292-3314\n');
        // middle
        rcpt.forEach(cmd => {
            if (cmd.op == 'text') {
                prnAlign(cmd.align);
                eposPrinter.addTextSize(cmd.width, cmd.height);
                if (cmd.invert)
                    eposPrinter.addTextStyle(true,false,false,eposPrinter.COLOR_1);
                eposPrinter.addText(cmd.text + '\n');
                if (cmd.invert)
                    eposPrinter.addTextStyle(false,false,false,eposPrinter.COLOR_1);
            } else if (cmd.op == 'feed') {
                eposPrinter.addTextSize(1, 1);
                eposPrinter.addFeedLine(cmd.n);            
            }
        });
        // end
        eposPrinter.addFeedLine(2);
        eposPrinter.addCut(eposPrinter.CUT_FEED);
        eposPrinter.send();
    } else {
        // start
        prnAlign('center', true);
        let prnWindow = prnGetWindow();
        let logo_id = 'logo' + Math.floor(Math.random() * 10000);
        let w = Math.floor(logo.width * 2 / 3);
        let h = Math.floor(logo.height * 2 / 3);
        prnWindow.document.writeln('<canvas id="' + logo_id + '" width="' + w +
            '" height="' + h + '"></canvas>');
        let ctx = prnWindow.document.getElementById(logo_id).getContext('2d');
        ctx.drawImage(logo, 0, 0, w, h);
        prnWindow.document.writeln('<br/>');
        prnWindow.document.writeln('<span style="font-family:monospace;">' +
            '778 S. Almaden Avenue' + '<br/></span>');
        prnWindow.document.writeln('<span style="font-family:monospace;">' +
            'San Jose, CA 95110' + '<br/></span>');
        prnWindow.document.writeln('<span style="font-family:monospace;">' +
            '(408) 292-3314' + '<br/></span>');
        // middle
        rcpt.forEach(cmd => {
            if (cmd.op == 'text') {
                prnAlign(cmd.align);
                let style = "font-family:monospace;";
                if (cmd.height > 1)
                    style += 'font-size:' + cmd.height*100 + '%;';
                if (cmd.invert)
                    style += 'color:white;background-color:black;';
                prnWindow.document.writeln('<span style="' + style + '">' +
                    cmd.text.replace(/ /g, '&nbsp;') + '<br/></span>');
            } else if (cmd.op == 'feed') {
                for (let i = 0; i < cmd.n; i++)
                    prnWindow.document.writeln('<br/>');          
            }
        });
        // end
        prnWindow.document.writeln('</p><br/><br/><hr/>');
    }
}

function prnServiceHeader(rcpt, client, title) {
	prnFeed(rcpt, 2);
	prnTextLine(rcpt, '* ' + title + ' *', 1, 2);
	prnTextLine(rcpt, moment().format("MMMM Do, YYYY LT"));
	prnFeed(rcpt, 1);
	prnTextLine(rcpt, client.givenName + ' ' + client.familyName, 2, 2);
	prnFeed(rcpt, 1);
	prnTextLine(rcpt, ' ' + client.clientId + ' ', 2, 1, true);
}

function prnPickupTimes(rcpt, fromDateTime, toDateTime) {
	prnTextLine(rcpt, '**************************************')
	prnTextLine(rcpt, 'PRESENT THIS FOR PICKUP')
	prnTextLine(rcpt, 'HAY QUE PRESENTAR PARA RECLAMAR')
	prnTextLine(rcpt, ' ' + moment(fromDateTime).format("MMMM Do, YYYY")+ ' ', 2, 2, true);
	prnFeed(rcpt, 1);
	prnTextLine(rcpt, ' ' + moment(fromDateTime).format("h:mm a") + ' - ' +
		moment(toDateTime).format("h:mm a") + ' ', 1, 1, true);
	prnTextLine(rcpt, '**************************************');
}

// PRINTER FUNCTIONS

function prnGetWindow() {
	let win = window.open('', 'Receipt Printer', 'width=550,height=1000');
	win.document.title = 'Receipt Printer';
	return win;
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

export function prnTest(type) {
    if (type == 'minimal') {
        prnTestReceipt(0);
    }
    if (type == 'full') {
        for (let i=0; i < 6; i++)
            prnTestReceipt(i);
    }
}

function prnTestReceipt(receiptType) {
	let service;
    const children = testClient.dependents.filter(d => d.age < 18);
	switch(receiptType) {
		case 0:
			prnPrintReminderReceipt(testClient, new Date());
			break;
        case 1:
            prnPrintFoodReceipt(testClient, 'USDA');
            break;		
        case 2:
			service = getSvcTypes().filter(obj => obj.svcName == 'Clothes')[0];
			prnPrintClothesReceipt(testClient, service);
			break;
		case 3:
			service = getSvcTypes().filter(obj => obj.svcName == 'Thanksgiving Turkey')[0];
			prnPrintVoucherReceipt({ client: testClient, svcType: service });
			break;
		case 4:
			service = getSvcTypes().filter(obj => obj.svcName == 'Christmas Toy')[0];
			prnPrintVoucherReceipt({ client: testClient, svcType: service, dependents: children, grouping: 'age' });
			break;
		case 5:
			service = getSvcTypes().filter(obj => obj.svcName == 'First Step')[0];
			prnPrintVoucherReceipt({ client: testClient, svcType: service, dependents: children, grouping: 'grade' });
			break;
	}
}