import React, { useEffect } from 'react';
import { Box, Tabs, Tab } from '@mui/material';
import { People, Schedule, Assessment } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router';
import VolunteersList from './VolunteersList/VolunteersList.jsx';
import ShiftsList from './ShiftsList/ShiftsList.jsx';
import Reports from './Reporting.jsx';
import { navigationAllowed } from '../../System/js/Database';

export default function VolunteersPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const pathname = location.pathname;

    // Determine current sub-tab based on URL pathname
    let selectedTab = 0;
    if (pathname.includes('/shifts')) {
        selectedTab = 1;
    } else if (pathname.includes('/reports')) {
        selectedTab = 2;
    } else {
        selectedTab = 0;
    }

    // Redirect /admin/volunteers or /admin/volunteers/ to /admin/volunteers/volunteers
    useEffect(() => {
        if (pathname === '/admin/volunteers' || pathname === '/admin/volunteers/') {
            navigate('/admin/volunteers/volunteers', { replace: true });
        }
    }, [pathname, navigate]);

    const handleTabChange = (event, newValue) => {
        if (!navigationAllowed()) return;

        switch (newValue) {
            case 0:
                navigate('/admin/volunteers/volunteers');
                break;
            case 1:
                navigate('/admin/volunteers/shifts');
                break;
            case 2:
                navigate('/admin/volunteers/reports');
                break;
            default:
                navigate('/admin/volunteers/volunteers');
                break;
        }
    };

    const renderTabContent = () => {
        switch (selectedTab) {
            case 0:
                return <VolunteersList />;
            case 1:
                return <ShiftsList />;
            case 2:
                return <Reports />;
            default:
                return <VolunteersList />;
        }
    };

    return (
        <Box width="100%">
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs
                    value={selectedTab}
                    onChange={handleTabChange}
                    indicatorColor="secondary"
                    textColor="primary"
                    variant="fullWidth"
                    sx={{
                        '& .MuiTab-root': {
                            minHeight: 64,
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            textTransform: 'none',
                        }
                    }}
                >
                    <Tab
                        icon={<People />}
                        label="Volunteers"
                        iconPosition="start"
                    />
                    <Tab
                        icon={<Schedule />}
                        label="Shifts"
                        iconPosition="start"
                    />
                    <Tab
                        icon={<Assessment />}
                        label="Reports"
                        iconPosition="start"
                    />
                </Tabs>
            </Box>

            <Box>
                {renderTabContent()}
            </Box>
        </Box>
    );
} 