import { RRule, RRuleSet } from 'rrule';

// Return a copy of the calendar rules from the orig structure
export function calClone(orig) {
    return {
        calDaily: [... orig.calDaily],
        calWeekly: [... orig.calWeekly],
        calMonthly: [... orig.calMonthly],
    };
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
    const monthly = rules.calMonthly.map(r => {
        return {type: 'monthly', title: 'Closed (monthly)', allDay: true, rrule: r.toString()}
    });
    const weekly = rules.calWeekly.map(r => {
        return {type: 'weekly', title: 'Closed (weekly)', allDay: true, rrule: r.toString()}
    });
    const daily = rules.calDaily.map(r => {
        return {type: 'single', title: 'Closed', backgroundColor: 'red', allDay: true, rrule: r.toString()}
    });
    return monthly.concat(weekly).concat(daily);
}

export function calFindRule(ruleList, date) {
    // console.log('Looking for ' + date)
    return ruleList.find(rule => rule.between(date, date, true).length > 0);
}

