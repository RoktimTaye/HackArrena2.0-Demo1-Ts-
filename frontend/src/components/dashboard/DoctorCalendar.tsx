import { useState, useMemo } from "react";
import {
    Paper,
    Typography,
    Box,
    IconButton,
    Grid,
    Chip,
    Tooltip
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { useTranslation } from "react-i18next";

interface Appointment {
    _id: string;
    patientName: string;
    appointmentDate: string;
    status: string;
}

interface DoctorCalendarProps {
    appointments: Appointment[];
}

export const DoctorCalendar = ({ appointments }: DoctorCalendarProps) => {
    const { t } = useTranslation();
    const [currentDate, setCurrentDate] = useState(new Date());

    const daysInMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0
    ).getDate();

    const firstDayOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1
    ).getDay();

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const monthAppointments = useMemo(() => {
        return appointments.filter((apt) => {
            const aptDate = new Date(apt.appointmentDate);
            return (
                aptDate.getMonth() === currentDate.getMonth() &&
                aptDate.getFullYear() === currentDate.getFullYear()
            );
        });
    }, [appointments, currentDate]);

    const getAppointmentsForDay = (day: number) => {
        return monthAppointments.filter((apt) => {
            return new Date(apt.appointmentDate).getDate() === day;
        });
    };

    const renderCalendarDays = () => {
        const days = [];

        // Empty cells for previous month
        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push(<Grid item xs={1.7} key={`empty-${i}`} sx={{ height: 100, border: '1px solid #eee' }} />);
        }

        // Days of current month
        for (let day = 1; day <= daysInMonth; day++) {
            const dayAppointments = getAppointmentsForDay(day);
            const isToday =
                new Date().getDate() === day &&
                new Date().getMonth() === currentDate.getMonth() &&
                new Date().getFullYear() === currentDate.getFullYear();

            days.push(
                <Grid
                    item
                    xs={1.7}
                    key={day}
                    sx={{
                        height: 120,
                        border: '1px solid #eee',
                        p: 1,
                        bgcolor: isToday ? '#f0f7ff' : 'white',
                        overflowY: 'auto'
                    }}
                >
                    <Typography variant="caption" fontWeight="bold" color={isToday ? 'primary' : 'textPrimary'}>
                        {day}
                    </Typography>
                    <Box mt={1} display="flex" flexDirection="column" gap={0.5}>
                        {dayAppointments.map((apt) => (
                            <Tooltip key={apt._id} title={`${new Date(apt.appointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${apt.patientName}`}>
                                <Chip
                                    label={apt.patientName}
                                    size="small"
                                    color={apt.status === 'COMPLETED' ? 'success' : 'primary'}
                                    variant="outlined"
                                    sx={{
                                        fontSize: '0.65rem',
                                        height: 20,
                                        width: '100%',
                                        justifyContent: 'flex-start',
                                        cursor: 'pointer'
                                    }}
                                />
                            </Tooltip>
                        ))}
                    </Box>
                </Grid>
            );
        }

        return days;
    };

    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    return (
        <Paper sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h6">
                    {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </Typography>
                <Box>
                    <IconButton onClick={handlePrevMonth}>
                        <ChevronLeftIcon />
                    </IconButton>
                    <IconButton onClick={handleNextMonth}>
                        <ChevronRightIcon />
                    </IconButton>
                </Box>
            </Box>

            <Grid container columns={11.9}>
                {weekDays.map((day) => (
                    <Grid item xs={1.7} key={day} sx={{ textAlign: 'center', py: 1, fontWeight: 'bold', bgcolor: '#f5f5f5' }}>
                        {day}
                    </Grid>
                ))}
                {renderCalendarDays()}
            </Grid>
        </Paper>
    );
};
