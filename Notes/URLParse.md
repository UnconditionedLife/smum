# URL Parsing
Forms are implemented using the [react-router](https://reactrouter.com/web/guides/quick-start) component. This component allows for different pages to be rendered based
on the URL, along with providing the ability to change the URL.

The most important hook in this package is the `useHistory()` hook, which allows one to dynamically update the route the user sees. This hook has a `push` method which allows for one to update the URL that the user sees.

## URL Parsing Architecture
When setting up URL parsing for any navigation bar or tab, there are 3 key components that need to be created. These include a component that contains the functions for URL parsing/validation, a component that consists of the navigation code and a component containing the components rendered based on the navigation.

In the case of the `ClientsMain` component, we can see it is split into 3 seperate components: `ClientsMainContainer` (routing checking/update), `ClientsMain` (the HTML for the tab menu itself) and `ClientsContent` consists of the conditional rendering of clients pages dependent on route.

We will go through the necessary functions in each of these components one by one.

Beginning with `ClientsMainContainer`, for any URL parsing container component, one will need to define two functions.
- `updateURL` a function that takes a tab and any additional information and pushes the correct URL to history.
- `checkURL` updates the state of the contained component to match the URL.

NOTE: it is important to have the selectedTab defined at the container level. Only `updateURL` should be passed down to the the children, as only the URL should be updated. `checkURL` should be the only function updating state.

Next is `ClientsMain`. This remains similar to how it looked in the existing codebase, only that now the rendering of pages under this navigation is separated from the code of the navbar itself.

Finally is `ClientsContent`. This consists of two key react router componets.
- `Switch` this component designates a subroute switch block. For example to have the routes /user/main and /user/test I would create a `Switch` component in `UsersContent`.
- `Route` specifies the subroute and child of this component is what is rendered.