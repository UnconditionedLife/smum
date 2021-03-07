import { RRule } from 'rrule';

let eventRules = [
        new RRule({
            dtstart: new Date('2021-03-01'),
            freq: RRule.DAILY,
            count: 1,
        }), 
        new RRule({
            dtstart: new Date('2021-01-01'),
            until: new Date('2021-04-01'),
            freq: RRule.WEEKLY,
            interval: 1,
            byweekday: RRule.WE,
        }),
];

export function loadRules() {
    return eventRules;
}

export function toCalendar(rules) {
    return rules.map(r => { return {title: 'Closed', allDay: true, rrule: r.toString()} });
}

export function findRule(ruleList, date) {
    console.log('Looking for ' + date)
    return ruleList.find(rule => rule.between(date, date, true).length > 0);
}

