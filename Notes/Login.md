# Login
The `LoginForm` component appears in a modal dialog whenever
there is no current user session. After successful
user authentication, the component calls the function
specified by the `onLogin` property with details of the
user session.

## Component States
This component operates as a finite state machine. 
The input fields displayed and the action taken when the
"submit" button is pressed vary according to the current state.

### `login` State
This is the starting state, used for normal logins with username and password.

| | |
|-------------|-------------------------|
| Input fields | Username, password |
| Submit action | Call Cognito `authenticateUser()` |
| State transitions | Email not confirmed -> go to `code` state |
| | Password reset required -> go to `newPassword` state |
| | Forgot password -> go to `newPassword` state |
| Notes | Sets `savedCogUser` for use in other states |

### `initPassword` State
In this state, the user has authenticated successfully, but
an administrator has set the account to require the user to
set a new password.

| | |
|-------------|-------------------------|
| Input fields | New password (twice) |
| Submit action | Call Cognito `completeNewPasswordChallenge()` |
| State transitions | If successful -> Go to `login` state |

### `newPassword` State
In this state, the user has clicked the "forgot password" link.
He will receive a validation code by email, which must be
entered with the new password.

| | |
|-------------|-------------------------|
| Input fields | Validation code, new password (twice) |
| Submit action | Call Cognito `confirmPassword()` |
| State transitions | If successful -> Go to `login` state |

### `code` State
This state is not currently used. It confirms a new user
account by requiring the user to enter a validation code
sent via email.

| | |
|-------------|-------------------------|
| Input fields | Validation code |
| Submit action | Call Cognito `confirmRegistration()` |
| State transitions | If successful -> Go to `login` state |


