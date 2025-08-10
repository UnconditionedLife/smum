import React, { useState } from 'react';
import { Box, Tabs, Tab, Typography } from '@mui/material';
import { People, Schedule } from '@mui/icons-material';
import VolunteersList from './VolunteersList/VolunteersList.jsx';
import ShiftsList from './ShiftsList/ShiftsList.jsx';

export default function VolunteersPage() {
    const [selectedTab, setSelectedTab] = useState(0);

    const handleTabChange = (event, newValue) => {
        setSelectedTab(newValue);
    };

    const renderTabContent = () => {
        switch (selectedTab) {
            case 0:
                return <VolunteersList />;
            case 1:
                return <ShiftsList />;
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
                </Tabs>
            </Box>

            <Box>
                {renderTabContent()}
            </Box>
        </Box>
    );
} 