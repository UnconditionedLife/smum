import React, { Fragment, useState } from 'react';
import { useForm } from "react-hook-form";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@material-ui/core';
import { FormSelect, FormTextField, SaveCancel } from '../../System';

export default function HistoryEditForm(props) {
    let row = props.row
    row.servicedDateTime = window.moment(row.servicedDateTime).format("MM/DD/YYYY, h:mm a")
    
    const initValues = props.row;

    const { handleSubmit, reset, control, errors, setError, formState } = useForm({
        mode: 'onBlur',
        defaultValues: initValues, 
    });

    return (
        <TableRow key={ row.serviceId } >
            {/* <form> */}
                <TableCell p={ 0 } align="center">
                    <FormTextField name="serviceDateTime" label="" type="date" error={ errors.date }
                        control={ control } />
                    {/* { window.moment(row.servicedDateTime).format("MMM DD, YYYY - h:mm a") } */}
                </TableCell>
                <TableCell p={ 0 } align="center">
                    <FormTextField name="serviceName" label="" error={ errors.serviceName } 
                        control={ control } rules={ {required: 'Service name is required'}} />
                    {/* { row.serviceName } */}
                </TableCell>
                <TableCell align="center">
                    <FormTextField name="serviceName" label="" error={ errors.serviceName } 
                        control={ control } rules={ {required: 'Service name is required'}} />
                    {/* { row.clientStatus } */}
                </TableCell>
                <TableCell align="center">
                    <FormTextField name="homeless" label="" error={ errors.homeless } 
                        control={ control } rules={ {required: 'Service name is required'}} />
                    {/* { row.homeless } */}
                </TableCell>
                <TableCell align="center">
                    <FormTextField name="itemsServed" label="" error={ errors.itemsServed } 
                        control={ control } rules={ {required: 'Service name is required'}} />
                    {/* { row.itemsServed }  */}
                </TableCell>
                <TableCell align="center">
                    <FormTextField name="totalAdultsServed" label="" error={ errors.totalAdultsServed } 
                        control={ control } rules={ {required: 'Service name is required'}} />
                    {/* { row.totalAdultsServed } */}
                </TableCell>
                <TableCell align="center">
                    <FormTextField name="totalChildrenServed" label="" error={ errors.totalChildrenServed } 
                        control={ control } rules={ {required: 'Service name is required'}} />
                    {/* { row.totalChildrenServed } */}
                </TableCell>
                <TableCell align="center">
                    <FormTextField name="totalIndividualsServed" label="" error={ errors.totalIndividualsServed } 
                        control={ control } rules={ {required: 'Service name is required'}} />
                    {/* { row.totalIndividualsServed } */}
                    </TableCell>
                <TableCell align="center">
                    <FormTextField m={ 0 } name="totalSeniorsServed" label="" error={ errors.totalSeniorsServed } 
                        control={ control } rules={ {required: 'Service name is required'}} />
                    {/* { row.totalSeniorsServed } */}
                    </TableCell>
                <TableCell align="center">
                    <FormTextField m={ 0 } name="servicedByUserName" label="" error={ errors.servicedByUserName } 
                        control={ control } rules={ {required: 'Service name is required'}} />
                    {/* { row.servicedByUserName } */}
                </TableCell>
            {/* </form> */}
        </TableRow>
    )
}