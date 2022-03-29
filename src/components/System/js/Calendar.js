import { RRule } from 'rrule';
import moment from 'moment';
import _ from 'lodash';
import { SettingsSchedule } from './Database';
import theme from '../../Theme.jsx';

export const DAILY = RRule.DAILY;
export const WEEKLY = RRule.WEEKLY;
export const MONTHLY = RRule.MONTHLY;

// Return a copy of the calendar rules from the orig structure
export function calClone(orig) {
    if (orig == null)
        return null;
    const subset = {
        calClosed: [... orig.calClosed],
    };
    return _.cloneDeep(subset);
}

// Add a rule that matches a single date
export function calAddSingleRule(schedule, date) {
    schedule.calClosed.push(new RRule({
        dtstart: new Date(date),
        freq: RRule.DAILY,
        count: 1,
    }));
}

// Add a recurring weekly rule (e.g. every Friday)
export function calAddWeeklyRule(schedule, weekday) {   
    schedule.calClosed.push(new RRule({
        dtstart: new Date('2000-01-01'),
        freq: RRule.WEEKLY,
        interval: 1,
        byweekday: weekday,
    }));
}

// Add a recurring monthly rule (e.g. 3rd Friday of each month)
export function calAddMonthlyRule(schedule, weekday, weekNum) {
    schedule.calClosed.push(new RRule({
        dtstart: new Date('2000-01-01'),
        freq: RRule.MONTHLY,
        bysetpos: weekNum,
        byweekday: weekday,
    }));
}

// Delete the specified rule
export function calDeleteRule(schedule, deleted) {
    schedule.calClosed = schedule.calClosed.filter(r => r != deleted);
}

// Add an exception date to a recurring rule
function calAddException(rule, date) {
    // Not implemented due to bugs in RRuleSet:
    // - RRuleSet.between() ignores exception dates
    // - RRuleSet.fromString() cannot parse rules containing exceptions
    //
    // When implemented, this function should convert rule from
    // an RRule to an RRuleSet if needed and then call
    // rule.exdate(date);
}

// Convert the list of rules to an array of strings,
// suitable for storage in the settings table.
export function calEncodeRules(ruleList) {
    return ruleList.map(r => {
        return encodeURIComponent(r.toString());
    });
}

// Convert an array of strings (read from the settings table)
// to a list of rules.
export function calDecodeRules(settings) {
    let result = {
        calClosed: [],
    };

    if (settings.calClosed) {
        for (const ruleString of settings.calClosed) {
            const rule = RRule.fromString(decodeURIComponent(ruleString));
            result.calClosed.push(rule);
        }
    } else {
        // Convert rules from previous calendar implementation
        for (const weekday of settings.closedEveryDays) {
            calAddWeeklyRule(result, calConvertWeekday(parseInt(weekday)));
        }
        for (const pair of settings.closedEveryDaysWeek) {
            const num = parseInt(pair[0]);
            const weekday = calConvertWeekday(parseInt(pair[1]));
            calAddMonthlyRule(result, weekday, num);
        }
        for (const date of settings.closedDays) {
            calAddSingleRule(result, date);
        }
        // Do not bother converting single-day open exceptions from
        // settings.openDays. This feature was only used to work around
        // a bug in the legacy code.
    }
    return result;
}

// Convert a day-of-week index (0 through 6) from the
// Moment convention (0=Sunday) to the RRules
// convention (0=Monday).
export function calConvertWeekday(index) {
    let n = index - 1;
    if (n < 0)
        n += 7;
    return n;
}

// Convert the list of rules to a list of events for FullCalendar
export function calToEvents(schedule) {
    const eventColor = theme.palette.secondary.light;

    const events = schedule.calClosed.map(r => {
        const freq = r.options.freq;
        let title;

        switch (freq) {
        case RRule.DAILY:
            title ='Closed';
            break;
        case RRule.WEEKLY:
            title ='Closed (weekly)';
            break;
        case RRule.MONTHLY:
            title = 'Closed (monthly)';
            break;
        }
        return {type: freq, title: title, backgroundColor: eventColor, allDay: true, rrule: r.toString()};
    });
    return events;
}

// Return the rule of the specified frequency (daily, weekly, monthly)
// that matches the given date
export function calFindRule(schedule, date, freq) {
    return schedule.calClosed.find(rule => (rule.between(date, date, true).length > 0) && 
        rule.options.freq == freq);
}

// Find the open date nearest to targetDate
export function calFindOpenDate(targetDate, maxDaysBefore) {
    const schedule = SettingsSchedule();
    let proposed = moment(targetDate);

	// Start with target date and work backward to earliest
	for (let i = 0; i < maxDaysBefore; i++) {
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

// Return true if there is a rule matching the given date
export function calIsClosed(schedule, date) {
    const dateUTC = coerceDateToUTC(date.toDate());
    return Boolean(schedule.calClosed.find(rule => (rule.between(dateUTC, dateUTC, true).length > 0)));
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
