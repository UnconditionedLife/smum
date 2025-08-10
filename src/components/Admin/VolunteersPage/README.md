# Volunteers Management System

This module provides comprehensive volunteer management functionality for the SMUM application.

## Overview

The Volunteers tab has been added to the Admin section, positioned between Users and Settings. It includes four sub-sections:

1. **Volunteers** - Manage volunteer profiles and information
2. **Shifts** - Schedule and track volunteer shifts (defaults to today's shifts)
3. **Programs** - Manage volunteer programs (placeholder for future implementation)
4. **Activities** - Track volunteer activities (placeholder for future implementation)

## Components

### Main Components

- `VolunteersPage.jsx` - Main container with sub-menu navigation
- `VolunteersList/` - Volunteer management components
- `ShiftsList/` - Shift scheduling and management components
- `ProgramsList/` - Program management (placeholder)
- `ActivitiesList/` - Activity tracking (placeholder)

### Volunteer Management

- `VolunteersList.jsx` - Lists all volunteers with active/inactive filtering
- `VolunteerPage/VolunteerPage.jsx` - Modal dialog for editing volunteer details
- `VolunteerPage/VolunteerForm.jsx` - Form for volunteer data entry

### Shift Management

- `ShiftsList.jsx` - Lists today's shifts by default with edit/delete functionality
- `ShiftFormDialog.jsx` - Modal dialog for creating/editing shifts

## Features

### Volunteers List
- View all volunteers in a table format
- Filter by Active/Inactive status
- Click to edit volunteer details
- Add new volunteers with floating action button
- Editable modal with comprehensive volunteer information

### Shifts List
- Default view shows today's shifts
- Add new shifts with floating action button
- Edit existing shifts inline
- Delete shifts with confirmation
- Status tracking (Scheduled, In Progress, Completed, Cancelled)
- Color-coded status chips

### Volunteer Form Fields
- Basic Information: Volunteer ID, Name, Email, Phone
- Address: Street, City, State, Zip Code
- Emergency Contact: Name and Phone
- Status: Active, Inactive, On Leave
- Skills and Availability (placeholder for future enhancement)

### Shift Form Fields
- Date and Time: Start/End times
- Volunteer Assignment
- Program Assignment
- Status Tracking
- Notes

## Database Integration

Currently using mock data for demonstration. TODO items include:

1. Create volunteer database schema
2. Create shifts database schema
3. Implement database save/load functions
4. Add volunteer-shift relationship management
5. Implement program and activity management

## Navigation

The Volunteers tab is accessible at `/admin/volunteers` and is positioned between Users and Settings in the admin navigation.

## Future Enhancements

1. **Programs Management**: Create, edit, and assign volunteers to programs
2. **Activities Tracking**: Track volunteer activities and hours
3. **Reporting**: Generate volunteer reports and analytics
4. **Notifications**: Email/SMS notifications for shift reminders
5. **Calendar Integration**: Sync with external calendar systems
6. **Skills Matching**: Match volunteers to shifts based on skills
7. **Availability Management**: Track volunteer availability schedules 