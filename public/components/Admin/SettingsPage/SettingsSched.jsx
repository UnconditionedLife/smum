import React from 'react';
import { Popper, Dialog, DialogTitle, List, ListItem } from '@material-ui/core';
import { Card, Typography } from '../../System';
import moment from 'moment-timezone';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import rrulePlugin from '@fullcalendar/rrule';
import interactionPlugin from "@fullcalendar/interaction";
import { findRule, loadRules, toCalendar } from '../../System/js/Calendar';

// const events = [
//     {
//         // id: '1',
//         title: 'Closed',
//         rrule: {
//             dtstart: '2021-02-01',
//             freq: 'daily',
//             count: 1,
//         }    
//     },
//     {
//         // id: '2',
//         title: 'Closed',
//         rrule: {
//             freq: 'weekly',
//             interval: 1,
//             byweekday: ['we'],
//         }
//     },
// ];

function onEventClick(e) {
    alert('Event ' + JSON.stringify(e.event));
}


export default function SettingsSched(props) {
    const [hover, setHover] = React.useState({el: null, event: null});
    const [foo, setAnchor] = React.useState(null);
    const [editDate, setEditDate] = React.useState(null);
    const [rules, setRules] = React.useState(loadRules());

    function DateEdit(props) {
        const open = Boolean(props.date);
    
        function finish() {
            props.onClose();
        }
    
        if (open) {
            let status = 'Open';
            const m = moment(props.date).tz('UTC');
            const fullDate = m.format('MMMM Do');
            const weekday = m.format('dddd');
            const rule = findRule(rules, props.date);
            console.log(rule);
            if (rule && rule.options.byweekday == null)
                status = 'Closed Single Day';
            else if (rule && rule.options.byweekday)
                status = 'Closed Weekly';
        
            return (
                <Dialog open={ Boolean(props.date) } onClose={ props.onClose }>
                    <DialogTitle>{ fullDate }: { status }</DialogTitle>
                    {status == 'Open' && <List>
                        <ListItem onClick={finish}>Close { fullDate } only</ListItem>
                        <ListItem onClick={finish}>Close every { weekday }</ListItem>
                        <ListItem onClick={finish}>Close nth { weekday } of each month</ListItem>
                    </List>}
                    {status == 'Closed Single Day' && <List>
                        <ListItem onClick={finish}>Open { fullDate }</ListItem>
                    </List>}
                    {status == 'Closed Weekly' && <List>
                        <ListItem onClick={finish}>Open { fullDate } only</ListItem>
                        <ListItem onClick={finish}>Remove weekly rule</ListItem>
                    </List>}
                </Dialog>
            );
        }
        else
            return (<></>);
    }
    
    function hoverStart(info) {
        console.log(info.jsEvent)
        setHover({el: info.jsEvent.relatedTarget, event: info.event});
        setAnchor(info.el);
    }
    
    function hoverStop(info) {
        console.log('Stop')
        setHover({el: null, event: null});
        setAnchor(null);
    }

    function doEdit(info) {
        console.log('Clicked on ' + info.date)
        setEditDate(info.date)
    }

    function SchedDebug(props) {
        const d1 = new Date('2021-02-10')
        const d2 = new Date('2021-02-11')
        return (<div>
            <pre>
                Weekly rule
                { JSON.stringify(rules[1].all(), undefined, 4) }
                Between
                { d1.toString() } and {d2.toString()}
                { JSON.stringify(rules[1].between(d1, d1, true), undefined, 4) }
            </pre>
        </div>);
    }

    return (
        <>
            {/* <Popper open={true} anchorEl={foo}>
                <Card>
                    <pre>{JSON.stringify(hover.event, 4, undefined)}</pre>
                </Card>
            </Popper> */}
            {/* <SchedDebug/> */}
            <DateEdit date={ editDate } onClose={ () => setEditDate(null) }/>
            <FullCalendar
                plugins={[ dayGridPlugin, rrulePlugin, interactionPlugin ]}
                initialView="dayGridMonth"
                editable={true}
                selectable={true}
                selectMirror={true}
                dayMaxEvents={true}
                weekends={true}
                timeZone="UTC"
                events={ toCalendar(rules) }
                dateClick={ doEdit }
                eventClick={ onEventClick }
                eventMouseEnter={ hoverStart }
                eventMouseLeave={ hoverStop }
            />
        </>
    );
}