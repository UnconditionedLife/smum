import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Box, Card, CardContent, CardHeader, Container, Dialog, DialogTitle } from '@mui/material';
import { dbGetSettingsAsync, dbSaveSettingsAsync, dbSetModifiedTime, setEditingState } from '../../System/js/Database';
import moment from 'moment-timezone';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import rrulePlugin from '@fullcalendar/rrule';
import interactionPlugin from "@fullcalendar/interaction";
import { utilOrdinal } from '../../System/js/GlobalUtils';
import { calAddSingleRule, calAddMonthlyRule, calAddWeeklyRule, calConvertWeekday, 
    calDeleteRule, calToEvents, calFindRule, calIsClosed, DAILY, WEEKLY, MONTHLY } 
    from '../../System/js/Calendar';
import { Button, SaveCancel } from '../../System';
import { calClone } from '../../System/js/Calendar';

export default function CalendarPage() {
    const [settings, setSettings] = useState(null);

    useEffect(() => { 
        dbGetSettingsAsync().then( stgs => { setSettings(stgs); });
    }, []);

    if (settings)
        return (
            <Container maxWidth='lg'>
                <Card>
                    <CardHeader title="Calendar" />
                    <CardContent>
                        <SettingsSched settings={ settings } />
                    </CardContent>
                </Card>
            </Container>
        );
    else
        return null;
}

SettingsSched.propTypes = {
    settings: PropTypes.object.isRequired,
}

function SettingsSched(props) {
    // const [hover, setHover] = React.useState({el: null, event: null});
    // const [foo, setAnchor] = React.useState(null);
    const [editDate, setEditDate] = React.useState(null);
    const [editEvent, setEditEvent] = React.useState(null);
    const [initValues, setInitValues] = useState(props.settings);
    const [calRules, setCalRules] = useState(calClone(initValues));
    const [saveMessage, setSaveMessage] = useState({result: 'success', time: initValues.updatedDateTime});
    const [fieldsDirty, setFieldsDirty] = useState(false);

    const rules = calRules;
    const calendarRef = React.createRef();

    if (fieldsDirty) 
        setEditingState(true);

    function updateCalRules(rules) {
        setCalRules(rules);
        setFieldsDirty(true);
    }

    function doSave() {
        let settingsData = { ... initValues };

        // Load values from calendar
        Object.assign(settingsData, calClone(calRules));

        // Save data and reset initial state to new values
        dbSetModifiedTime(settingsData, false);
        setSaveMessage({ result: 'working' });
        dbSaveSettingsAsync(settingsData)
            .then( () => {
                setSaveMessage({ result: 'success', time: settingsData.updatedDateTime });
                setInitValues(settingsData);
                setFieldsDirty(false);
                setEditingState(false);
            })
            .catch( message => {
                setSaveMessage({ result: 'error', text: message });
            });
    }

    function doCancel() {
        setCalRules(calClone(initValues));
        setFieldsDirty(false);
        setEditingState(false);
    }

    EventEdit.propTypes = {
        event: PropTypes.object
    }

    function EventEdit(props) {
        const open = Boolean(props.event);
    
        function finish(modified=false) {
            if (modified)
                updateCalRules(rules);
            setEditEvent(null);
        }
    
        if (open) {
            const date = new Date(props.event.start);
            let freq = props.event.extendedProps.type;
            let title;
            const m = moment(date).tz('UTC');
            const fullDate = m.format('MMMM D');
            const weekdayName = m.format('dddd');
            const weekNum = Math.floor((m.date()+6)/7);
            const weekOrdinal = utilOrdinal(weekNum);

            switch (freq) {
            case MONTHLY:
                title = `Closed ${weekOrdinal} ${weekdayName} Each Month`;
                break;
            case WEEKLY:
                title = `Closed Every ${weekdayName}`;
                break;
            case DAILY:
                title = 'Closed Single Day';
                break;
            }
            const rule = calFindRule(rules, date, freq);
            if (!rule) {
                alert('Rule not found!', date);
                return null;
            }

            return (
                // <Dialog open={ Boolean(props.date) } onClose={ () => finish()) }>
                <Dialog open={ true } onClose={ () => finish(false) }>
                    <DialogTitle>{ fullDate }: { title }</DialogTitle>
                    {freq == DAILY && <Box display="flex" flexDirection="column">
                        <Button color="primary" onClick={ () => { calDeleteRule(rules, rule); finish(true); }} >
                            Remove daily rule
                        </Button>
                    </Box>}
                    {freq == WEEKLY && <Box display="flex" flexDirection="column">
                        {/* <Button color="primary" onClick={ () => { calAddException(rule, date); finish(true); }} >
                            Open { fullDate } only
                        </Button> */}
                        <Button color="primary" onClick={ () => { calDeleteRule(rules, rule); finish(true); }} >
                            Remove weekly rule
                        </Button>
                    </Box>}
                    {freq == MONTHLY && <Box display="flex" flexDirection="column">
                        {/* <Button color="primary" onClick={ () => { calAddException(rule, date); finish(true); }} >
                            Open { fullDate } only
                        </Button> */}
                        <Button color="primary" onClick={ () => { calDeleteRule(rules, rule); finish(true); }} >
                            Remove monthly rule
                        </Button>
                    </Box>}
                </Dialog>
            );
        }
        else
            return (<></>);
    }
    
    function DateEdit(props) {
        const open = Boolean(props.date);
    
        function finish(modified=false) {
            if (modified)
                updateCalRules(rules);
            setEditDate(null);
        }
    
        if (open) {
            const m = moment(props.date).tz('UTC');
            const fullDate = m.format('MMMM D');
            const weekday = calConvertWeekday(m.day());
            const weekdayName = m.format('dddd');
            const weekNum = Math.floor((m.date()+6)/7);
            const weekOrdinal = utilOrdinal(weekNum);
        
            return (
                <Dialog open={ true } onClose={ () => finish(false) }>
                    <DialogTitle>{ fullDate }: Add Closure Event</DialogTitle>
                    <Box display="flex" flexDirection="column">
                        <Button color="primary" onClick={ () => { calAddSingleRule(rules, props.date); finish(true); }} >
                            Close { fullDate } only
                        </Button>
                        <Button color="primary" onClick={ () => { calAddWeeklyRule(rules, weekday); finish(true); }} >
                            Close every { weekdayName }
                        </Button>
                        <Button color="primary" onClick={ () => { calAddMonthlyRule(rules, weekday, weekNum); finish(true); }} >
                            Close { weekOrdinal } { weekdayName } of each month
                        </Button>
                    </Box>
                </Dialog>
            );
        }
        else
            return (<></>);
    }

    DateEdit.propTypes = {
        date: PropTypes.object,
    };

    
    // function hoverStart(info) {
    //     console.log(info.jsEvent)
    //     setHover({el: info.jsEvent.relatedTarget, event: info.event});
    //     setAnchor(info.el);
    // }
    
    // function hoverStop(info) {
    //     console.log('Stop')
    //     setHover({el: null, event: null});
    //     setAnchor(null);
    // }

    function doEdit(info) {
        setEditDate(info.date)
    }

    function onEventClick(e) {
        setEditEvent(e.event);
    }

    // XXX remove after debugging
    function showClosedDates() {
        // Determine month shown by current calendar view
        const calendarApi = calendarRef.current.getApi();
        const today = calendarApi.getDate();
        const year = today.getUTCFullYear();
        const month = today.getUTCMonth();
        
        // Show closed dates for current month
        console.log('Closed dates:');
        for (let i = 1; i <= 31; i++) {
            let d = new Date(year, month, i);
            if (calIsClosed(calRules, moment(d)))
                console.log('Closed', d);
        }
    }

    return (
        <Box width={'100%'} maxWidth={'1200px'}>
            {/* <Popper open={true} anchorEl={foo}>
                <Card>
                    <pre>{JSON.stringify(hover.event, 4, undefined)}</pre>
                </Card>
            </Popper> */}
            <FullCalendar
                ref={ calendarRef }
                plugins={[ dayGridPlugin, rrulePlugin, interactionPlugin ]}
                initialView="dayGridMonth"
                dayMaxEvents={true}
                weekends={true}
                fixedWeekCount={false}
                timeZone="US/Pacific"
                events={ calToEvents(rules) }
                dateClick={ doEdit }
                eventClick={ onEventClick }
            />
            <Button onClick={ showClosedDates }>Show Closed Dates</Button>
            <DateEdit date={ editDate } />
            <EventEdit event={ editEvent } />
            <SaveCancel disabled={ !(fieldsDirty) } message={ saveMessage }
                onClick={ (isSave) => { isSave ? doSave() : doCancel() } } />
        </Box>
    );
}