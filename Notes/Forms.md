# Forms
Forms are implemented using the [react-hook-forms](https://react-hook-form.com/api/) component. This component
is the form framework containing the individual form fields. A form is created using the `useForm()` hook.
The most important arguments and return values from `useForm()` are as follows:
- The `defaultValues` argument is an object containing the initial values for each form field.
- `handleSubmit()` returns the function to submit the form when `Save` is pressed.
- `reset()` restores all fields to their initial values when `Cancel` is pressed.
- `control` is passed as a prop to each form field to link them with the parent form.
- `errors` is an object containing all fields with validation errors.
- `formState` is an object containing the overall form state.

## Form Fields
Controls within a form use an internal `FormTextField` or `FormSelect` component, which wraps a Material UI
`TextField` or `Select` with a `Typography` component to display the field validation error, if any. 
For other types of form fields, such as radio buttons or checkboxes, we would need a similar wrapper
to display validation errors.

The following props are required for the `FormTextField` component:
- `name` - Name of the field within the object containing the form data
- `label` - Human-readable label for the field to be displayed
- `control` - Same as the `control` value returned from `useForm()`
- `error` - The current validation error for this field. This should be set to `errors.<name>` where `<name>`
  matches the field name.
- `rules` - Object containing validation rules. See the documentation for `register` to see the set
  of allowed values, including custom validation functions.

An initial value for the field can be specified with the `defaultValue` prop, but this is not
recommended because it *will not* override a value in the overall `defaultValues` object.

These and any additional props are passed to the underlying `TextField` or `Select` component. Note that the 
`error` prop contains the validation message that will be displayed by the `FormTextField` component, but
the prop name is carefully chosen so that, when it is passed to an underlying `TextField`,
it will also cause the text field to be displayed in red if `error` contains a non-null value.

## Form Validation
Individual fields are validated according to the `rules` specified for the `FormTextField` as described above.
Form-level validation, for example comparing two fields to ensure that they have matching values
must be done when the form is submitted by clicking `Save`. If an error is found, it can be
marked on the appropriate field using `setError()`.

## Saving and Canceling
`handleSubmit()` is used to specify the callback function for saving the form after it passes
validation. However, calling `handleSubmit()` *does not* submit the form. Instead, it returns
the function to call to submit the form. Therefore, we include a line like

    const submitForm = handleSubmit(doSave);

to get the function `submitForm()` to call when the user presses `Save`. If the validation
of individual fields is successful, it will invoke the callback function `doSave()`.

The save function should perform the following steps:
1. Perform any necessary form-level validation. If there are any errors, mark them with
`setError()` and return.
2. Convert form values to a canonical form, such as converting state abbreviations to upper case.
3. Overwrite fields of the original data structure with form data fields using `Object.assign()`.
Note that this may leave some fields in the original data structure unchanged.
4. For most data structures, set the created and modified times using `dbSetModifiedTime()`.
5. Save the updated data structure using `dbSaveData()`.
6. Call `reset(formValues)` to update the form default values to the current values.

Resetting the form when the user presses `Cancel` just requires a call to `reset()`. The 
`isDirty` field of `formState` can be used to enable the buttons of the `SaveCancel`
component. Therefore, the full instantiation of the `Save` and `Cancel` buttons looks
like this:

    <SaveCancel disabled={ !formState.isDirty } onClick={ (isSave) => { isSave ? submitForm() : reset() } } />

