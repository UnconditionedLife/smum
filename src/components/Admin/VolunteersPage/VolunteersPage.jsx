import React, { useEffect } from 'react';
import { Box, Tabs, Tab, Typography } from '@mui/material';
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
        <Box sx={{
            width: "100%",
            mt: 2,
            mb: 2,
            bgcolor: 'background.paper',
            border: 1,
            borderColor: 'divider',
            borderRadius: '16px',
            overflow: 'hidden',
        }}>
            <Box sx={{ px: 2.5, py: 1.5, borderBottom: 1, borderColor: 'divider', display: 'flex',
                alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                <Typography variant='h6'>Volunteers</Typography>
                {/* Segmented switcher between the three volunteer views */}
                <Tabs
                    value={selectedTab}
                    onChange={handleTabChange}
                    textColor="primary"
                    slotProps={{ indicator: { sx: { display: 'none' } } }}
                    sx={{
                        minHeight: 0,
                        p: 0.5,
                        borderRadius: 999,
                        bgcolor: 'rgba(28, 36, 33, 0.06)',
                        '& .MuiTab-root': {
                            minHeight: 40,
                            px: 2,
                            borderRadius: 999,
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            textTransform: 'none',
                            transition: 'background-color 120ms ease, box-shadow 120ms ease',
                        },
                        '& .MuiTab-root.Mui-selected': {
                            bgcolor: 'background.paper',
                            boxShadow: '0 1px 2px rgba(16, 24, 40, 0.10), 0 1px 3px rgba(16, 24, 40, 0.10)',
                        },
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