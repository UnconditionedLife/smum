import { Box, Table, TableContainer, TableHead, TableRow, TableCell, TableBody, Typography, TableFooter } from "@material-ui/core";
import React, { useState, useEffect } from "react";
import PropTypes from 'prop-types';
import { ReportsHeader } from "../..";

DailyDistributionReport.propTypes = {
    yearMonth: PropTypes.string
}

export default function DailyDistributionReport() {
    return (
        <Box m={ 1 } maxWidth="100%">
        <TableContainer align="center"> 
            <Table size="small" align="center">
                <ReportsHeader reportType="DAILY REPORT" 
                    reportCategory="FOOD PANTRY"
                    groupColumns={[{"name": "Client", "length": 4}, 
                        {"name": "Clients Served", "length": 5}, 
                        {"name": "Homeless Served", "length": 2}, 
                        {"name":"NonClients Served", "length": 2}]}
                    columns={["ID", "Given", "Family", "Zip", "Households", "Individuals", "Adults", "Children", "Seniors", "Families", "Singles", "Families", "Singles"]} />
            </Table>
        </TableContainer>
        </Box>
    )
}