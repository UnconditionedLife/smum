//******************************************************************
//****** CLIENTS Receipt eposPrinter SECTION JAVASCRIPT FUNCTIONS ******
//******************************************************************
import dayjs from  'dayjs';
import { utilSortDependentsByGrade, utilCalcGradeGrouping, utilSortDependentsByAge,
    utilCalcAgeGrouping, utilPadTrimString } from './ClientUtils'
import { getSvcTypes, dbSendReceipt } from '../Database';

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
    prnTextLine(rcpt, ' ' + dayjs(nextVisit).format("MMMM D, YYYY") + ' ', 1, 2, true);
    prnTextLine(rcpt, '**************************************');
    prnEndReceipt(rcpt);
}

function prnStartReceipt() {
    return [];
}

function prnTextLine(rcpt, str, width=1, height=1, inverse=false, align='center') {
    rcpt.push({op: 'text', text: str, width: width, height: height, invert: inverse, align: align});
}

function prnFeed(rcpt, n) {
    rcpt.push({op: 'feed', n: n});
}

function prnEndReceipt(rcpt) {
    dbSendReceipt(rcpt);
}

function prnServiceHeader(rcpt, client, title) {
	prnFeed(rcpt, 2);
	prnTextLine(rcpt, '* ' + title + ' *', 1, 2);
	prnTextLine(rcpt, dayjs().format("MMMM D, YYYY LT"));
	prnFeed(rcpt, 1);
	prnTextLine(rcpt, client.givenName + ' ' + client.familyName, 2, 2);
	prnFeed(rcpt, 1);
	prnTextLine(rcpt, ' ' + client.clientId + ' ', 2, 1, true);
}

function prnPickupTimes(rcpt, fromDateTime, toDateTime) {
	prnTextLine(rcpt, '**************************************')
	prnTextLine(rcpt, 'PRESENT THIS FOR PICKUP')
	prnTextLine(rcpt, 'HAY QUE PRESENTAR PARA RECLAMAR')
	prnTextLine(rcpt, ' ' + dayjs(fromDateTime).format("MMMM D, YYYY")+ ' ', 2, 2, true);
	prnFeed(rcpt, 1);
	prnTextLine(rcpt, ' ' + dayjs(fromDateTime).format("h:mm a") + ' - ' +
		dayjs(toDateTime).format("h:mm a") + ' ', 1, 1, true);
	prnTextLine(rcpt, '**************************************');
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
    console.log('Print test', type);
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