import { RRule, RRuleSet } from 'rrule';
import moment from 'moment';
import _ from 'lodash';
import { SettingsSchedule } from './Database';
import theme from '../../Theme.jsx';

// Return a copy of the calendar rules from the orig structure
export function calClone(orig) {
    const subset = {
        calDaily: [... orig.calDaily],
        calWeekly: [... orig.calWeekly],
        calMonthly: [... orig.calMonthly],
    };
    return _.cloneDeep(subset);
}

export function calAddSingleRule(rules, date) {
    rules.calDaily.push(new RRule({
        dtstart: new Date(date),
        freq: RRule.DAILY,
        count: 1,
    }));
}

export function calAddWeeklyRule(rules, weekday) {
    const rruleset = new RRuleSet();
    
    rruleset.rrule(new RRule({
        dtstart: new Date('2000-01-01'),
        freq: RRule.WEEKLY,
        interval: 1,
        byweekday: weekday,
    }));
    rules.calWeekly.push(rruleset);
}

export function calAddMonthlyRule(rules, weekday, weekNum) {
    const rruleset = new RRuleSet();

    rruleset.rrule(new RRule({
        dtstart: new Date('2000-01-01'),
        freq: RRule.MONTHLY,
        bysetpos: weekNum,
        byweekday: weekday,
    }));
    rules.calMonthly.push(rruleset);
}

export function calDeleteSingleRule(rules, deleted) {
    rules.calDaily = rules.calDaily.filter(r => r != deleted);
}

export function calDeleteWeeklyRule(rules, deleted) {
    rules.calWeekly = rules.calWeekly.filter(r => r != deleted);
}

export function calDeleteMonthlyRule(rules, deleted) {
    rules.calMonthly = rules.calMonthly.filter(r => r != deleted);
}

export function calAddException(rule, date) {
    rule.exdate(date);
}

export function calConvertLegacyEvents(settings) {
    let rules = {
        calDaily: [],
        calWeekly: [],
        calMonthly: [],
    };

    for (const weekday of settings.closedEveryDays) {
        calAddWeeklyRule(rules, calConvertWeekday(parseInt(weekday)));
    }
    for (const pair of settings.closedEveryDaysWeek) {
        const num = parseInt(pair[0]);
        const weekday = calConvertWeekday(parseInt(pair[1]));
        calAddMonthlyRule(rules, weekday, num);
    }
    for (const date of settings.closedDays) {
        calAddSingleRule(rules, date);
    }

    // Do not bother converting single-day open exceptions from
    // settings.openDays. This feature was only used to work around
    // a bug in the legacy code.

    return rules;
}

// Convert a day-of-week index (0 through 6) from the
// Moment convention (0=Sunday) to the FullCalendar
// convention (0=Monday).
export function calConvertWeekday(index) {
    let n = index - 1;
    if (n < 0)
        n += 7;
    return n;
}

export function calToEvents(rules) {
    const eventColor = theme.palette.secondary.light;
    const monthly = rules.calMonthly.map(r => {
        return {type: 'monthly', title: 'Closed (monthly)', backgroundColor: eventColor, allDay: true, rrule: r.toString()}
    });
    const weekly = rules.calWeekly.map(r => {
        return {type: 'weekly', title: 'Closed (weekly)', backgroundColor: eventColor, allDay: true, rrule: r.toString()}
    });
    const daily = rules.calDaily.map(r => {
        return {type: 'single', title: 'Closed', backgroundColor: eventColor, allDay: true, rrule: r.toString()}
    });
    return monthly.concat(weekly).concat(daily);
}

export function calFindRule(ruleList, date) {
    // console.log('Looking for ' + date)
    return ruleList.find(rule => rule.between(date, date, true).length > 0);
}

export function calFindOpenDate(targetDate, earliestDate) {
    const schedule = SettingsSchedule();
    let proposed = moment(targetDate);

	// Start with target date and work backward to earliest
	while (proposed >= earliestDate) {
		if (calIsClosed(schedule, proposed)) {
			proposed.subtract(1, 'days');
		} else {
			return proposed;
		}
	}
	// Select the first open date after target
	proposed = moment(targetDate).add(1, 'days');
	// eslint-disable-next-line no-constant-condition
	while (true) {
		if (calIsClosed(schedule, proposed)) {
			proposed.add(1, 'days');
		} else {
			return proposed;
		}
	}
}

export function calIsClosed(schedule, date) {
    const dateUTC = coerceDateToUTC(date);
    const res = Boolean(calFindRule(schedule.calMonthly, dateUTC) || calFindRule(schedule.calWeekly, dateUTC) ||
        calFindRule(schedule.calDaily, dateUTC));
    return res;
}

// Convert a local Date object to UTC without adjusting for timezone offset. The returned object
// has time set to midnight and UTC date set to the local date of the input object.
function coerceDateToUTC(date) {
    return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
}

// XXX Date functions using previous calendar implementation

function dateParse(dateString) {
	let momentDay = moment(dateString)
	let dayOfWeek = momentDay.day();
	let weekInMonth = momentDay.isoWeek() -
		momentDay.subtract(momentDay.date()-1, 'days').isoWeek() + 1;
	return {
		"dayOfWeek": dayOfWeek,
		"weekInMonth": weekInMonth,
		"formatted": dateString
	}
}

//**** JAVASCRIPT FUNCTIONS FOR USE WITH EXPORTABLE FUNCTIONS ****

// TODO should switch to an implementation that follows RFC 5545
function dateIsClosed(schedule, date) {
	let dateObj = dateParse(date.format('YYYY-MM-DD'));
	if (schedule.openDays.indexOf(dateObj.formatted) >= 0) {
		return false;
	}
	for (let i = 0; i < schedule.closedEveryDays.length; i++) {
		if (dateObj.dayOfWeek == schedule.closedEveryDays[i]) {
			return true;
		}
	}
	for (let i = 0; i < schedule.closedEveryDaysWeek.length; i++) {
		if (dateObj.weekInMonth == schedule.closedEveryDaysWeek[i][0] &&
			dateObj.dayOfWeek == schedule.closedEveryDaysWeek[i][1]) {
			return true;
		}
	}
	for (let i = 0; i < schedule.closedDays.length; i++) {
		if (dateObj.formatted == schedule.closedDays[i]) {
			return true;
		}
	}
	return false;
}
