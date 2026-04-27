**Screen recording:**: <https://drive.google.com/file/d/1tSlZVRRSnQZKReLdwk2TUYsuxY-1t5e8/view?usp=sharing>

# Soothe — Senior Web Developer Take-Home Assessment

**Position:** Senior Web Developer
**Star time:** 26/04/2026 14:44 ARG
**End time:** 26/04/2026 18:36 ARG

## Part 1 — Code Review (45 min)

### Snippet 1 — Redux Reducer

- State **what** the issue is
  - **critical** State is mutating
  - **minor** most cases do the same

- Explain **why** it's a problem (what breaks, what's the risk)
  - Assign modifies the first argument, it mutates state object
  - A lot of logic is repeated

- Show **how** you'd fix it (write the corrected code)
    **critical**

    ```javascript
    case SOOTHE_PASS_ONE_TIME_POPUP:
      return {
        ...state,
        ...action.payload
      }
    ```

    **minor**

    ```javascript
    case SOOTHE_PASS_ONE_TIME_POPUP:
    case AVAILABLE_THERAPISTS:
    case RECIPIENT_OPTION:
    case BOOKING_FLOW_REDESIGN:
    case AVAILABLE_THERAPISTS_WITH_TIME_SLOTS:
      return {
        ...state,
        ...action.payload
      }
    ```

- Rate the severity: **critical** (causes bugs now), **major** (will cause bugs), or **minor** (code quality)
  - it's **critical**
  - it's **minor**

### Snippet 2 — API Helper

- State **what** the issue is
  - **critical** axios GET receibes 3 arguments
  - **critical** axios POST receibes 4 arguments
  - **critical** axios checkoutBooking POST receibes {withCredentials} as body instead of config

- Explain **why** it's a problem (what breaks, what's the risk)
  - documentations shows it expects 2 arguments. URL and config. The risk is ACCEPT_LANGUAGE_HEADER being ignored, request probably fails
  - documentation shows it expects 3 arguments. URL, body and config. The risk is ACCEPT_LANGUAGE_HEADER being ignored.
  - we pass 2 arguments besides URL, both are config, second argument is expected to be the body

- Show **how** you'd fix it (write the corrected code)

    ```javascript
        axios.get(
            `${API_ROOT}/v7/carts/${cartId}`,
            {
                headers: ACCEPT_LANGUAGE_HEADER.headers,
                withCredentials: true,
            }
        )
    ```

    ```javascript
        axios.post(
            `${API_ROOT}/v7/carts/${cartId}/cart_products`,
            {cart_product},
            {
                headers: ACCEPT_LANGUAGE_HEADER.headers,
                withCredentials: true,
            }
        )
    ```

    ```javascript
        axios.post(
            `${API_ROOT}/v7/carts/${cartId}/checkout`,
            {},
            {
                headers: ACCEPT_LANGUAGE_HEADER.headers,
                withCredentials: true,
            }
        )
    ```

- Rate the severity: **critical** (causes bugs now), **major** (will cause bugs), or **minor** (code quality)
  - it's **critical**
  - it's **critical**
  - it's **critical**

### Snippet 3 — Component from a Junior Developer's PR

- State **what** the issue is
  - **major** missing componentWillUnmount to remove addEventListener for resize
  - **major** no catch or finally or any other method in fetchProviders if it fails or doesn't resolve with success
  - **major** missing key prop in this.filterProviders().map()

- Explain **why** it's a problem (what breaks, what's the risk)
  - if we dont remove the listener when the component destroys, we risk having memory leaks and bugs with setState
  - if fetchProviders fails, loading state never changes to false
  - when rendering lists, react need a key element with an unique key/identifier to render things correctly

- Show **how** you'd fix it (write the corrected code)

    ```javascript
        componentWillUnmount() {
            window.removeEventListener('resize', this.handleResize);
        }
    ```

    ```javascript
        fetchProviders() {
            this.setState({ loading: true });
            axios.get(`${API_ROOT}/v7/carts/${this.props.cartId}/available_providers`)
            .then(res => {
                this.setState({ providers: res.data.providers, loading: false });
            }).catch((_e) => this.setState({ loading: false }));
        }
    ```

    ```javascript
        {this.filterProviders().map(provider => (
            <ProviderCard
                key={provider.id} //or name or w/e is unique, if we dont have an unique key, we can do a combination of name with index
                name={provider.name}
                rating={provider.rating}
                avatar={provider.avatar}
                onClick={() => this.props.onSelect(provider)}
            />
        ))}
    ```

- Rate the severity: **critical** (causes bugs now), **major** (will cause bugs), or **minor** (code quality)
  - **major**
  - **major**
  - **major**

### Snippet 4 — Store Configuration

- State **what** the issue is
  - **major** using blacklist in persistConfig is risky
  - **minor** needs version in persistConfig

- Explain **why** it's a problem (what breaks, what's the risk)
  - the risk is that any new slice that you add to rootReducer will persist by default
  - if the composition of the state changes, old users could have compatibility problems

- Show **how** you'd fix it (write the corrected code)

    Use whitelist instead

    ```javascript
    const persistConfig = {
        key: 'root',
        storage,
        whitelist: [...], //add what's really needed
        stateReconciler: hardSet,
    };
    ```

    ```javascript
    const persistConfig = {
        key: 'root',
        version: 1,
        ...
    };
    ```

- Rate the severity: **critical** (causes bugs now), **major** (will cause bugs), or **minor** (code quality)
  - **major**
  - **minor**

## Part 2 — Bug Investigation (30 min)

**2a.answer**

- relevantGoBack() is called
- currentStep and rebook is read from redux
- currentStep is not one of the if/else if options, goes to else by default calling updateBookingStep()
- bookingFlow.previousStep should point to previous step, should be PICKAPRO or PICKAPRO2
- updateBookingStep() is called with previous step
- updates browser history
- parent component updates because currentStepId changes
- renderStep() renders again
- react renders ProviderPickStepMarketplace
- ProviderPickStepMarketplace did not render while user was on REVIEW, it should mount again when returning to PICKAPRO
- ProviderPickStepMarketplace componentDidMount() is called
- if cartId && cartProductId && dateUtc are present it fetches again
- dispatch for availableTherapists
- same object is returned for the flow, so redux maybe doesnt detect the state change correctly
- components depending on availableTherapists may not re-render

For ProviderPickStepMarketplace because availableTherapists object may be the same, redux update may not trigger so component may not update. That's why reloading fixes it.

**2b.answer**
Probably the fact that the lodash assign. It's the same problem than in part 1, the assign mutates the existing state instead of having a new reference of that object. On refresh is fixed because the app reloads from the start, the data is reconstructured

**2c.answer**
One fix could be doing this. It guarantees a new object reference is made. Not really much of a risk, it should depende on some other existing code.
I'd ship it because it's a low risk, easy to implement and test fix.

    ```javascript
    case AVAILABLE_THERAPISTS:
      return {
        ...state,
        ...action.payload
      }
    ```

Another fix could be forcing the fetch on step change. It's less clean, but could also work.
I prefer the first approach. It's cleaner.

    ```javascript
        <ProviderPickStepMarketplace
            stepId={this.state.currentStepId}
            assignToCart={this.assignToCart}
            stepEnteredAt={this.state.stepEnteredAt}
            toggleNavBarStyle={this.toggleNavBarStyle}
            changeBackground={this.changeBackground}
            setBookingFlowStepThroughParent={this.updateBookingStep}
            displayError={this.displayError}
            setLoaderFlag={this.setLoaderFlag}
        />

        this.setState({
            showLoader: false,
            currentStepId: step.id,
            currentStepState: step,
            stepEnteredAt: Date.now(),
            showBgFlag: this.showVideoBg(step),
        }, () => //...

        //in child component
        componentDidUpdate(previousProps) {
            if (this.props.stepEnteredAt !== previousProps.stepEnteredAt) {
                // fetch
            }
        }
    ```

**2d.answer**
I would not use `key={Date.now()}` to force a remount on every render. It would be too costly, recreating the component constantly, instead of when it's really needed.

## Part 3 — Feature Implementation (90 min)

**3a.** Where exactly in the existing code would you dispatch the tracking action? Describe the integration point, which file it would be in, and what the calling code would look like. Explain why you chose that specific location over other options.

- I would dispatch `addRecentlyViewedProvider` when the provider profile request succeds, inside the component.
- I would not dispatch from the API, API helpers should stay responsible for API, not redux side effects.
- Example would be something like `handleViewedProviderProfile`, on success I'd call `this.props.addRecentlyViewedProvider()` with relevant information, and it would be connected something like this `export default connect(mapStateToProps, {addRecentlyViewedProvider})(ProviderPickStepMarketplace)`
- I chose this location because it means provider profile was viewed or loaded successfully, not just loaded in a bulk with everything else.

**3b.** You found a bug in the reducer pattern in Part 1. Did you replicate that pattern in your new reducer or deviate from it? Explain your decision and the trade-off of each choice (matching the team's existing pattern vs. doing it correctly).

- I did not replicate it. The previous bug with assign mutates current Redux state object, instead my reducer uses immutable updates. The trade-off is that my approach is different from the legacy style of the rest of the code, but it follows the redux expected behaviour.

**3c.** If this feature later needed to survive page refreshes (persist across sessions), what specific changes would you make? Don't just say "add it to redux-persist" — explain what else you'd need to consider (data shape, storage limits, stale data, etc.).

- First i'd remove it from the persist blacklist (or add it to the whitelist if that approach was implemented)
- I'd only persist a small part of the provider data, id, name, rating, avatar, what's needed to render the card. I would not worry about storage limits, unless the application was overloaded with stored information.

## Part 4 — Refactoring (45 min)

**4a.** You'll notice the file has separate "authenticated" and "guest" versions of several functions (e.g., `getAvailableTherapists` and `guestGetAvailableTherapists`). These differ only in URL prefix and headers. Without implementing it, describe how you would consolidate these pairs into single functions. Show a short code sketch of the approach.

I would consolidate them into a single function that accepts the different URL as an option and maybe leave them as different functions (or not, would depend on the code) to separate functionality.

For example:

    ```javascript
        handleGetAvailableTherapists(cartId, cartProductId, dateUtc, csrfToken, callBackFunc, errorHandler, isGuest = {guest: false}) {...} //all the same
        getAvailableTherapists(cartId, cartProductId, dateUtc, csrfToken, callBackFunc, errorHandler, {guest: false})
        guestGetAvailableTherapists(cartId, cartProductId, dateUtc, csrfToken, callBackFunc, errorHandler, {guest: true})
    ```

**4b.** A teammate proposes wrapping every API call in a retry with exponential backoff. For which of the functions in this file would that be **safe**, and for which would it be **dangerous**? Name at least 3 specific functions for each category and explain why.

It dependes, i wouldnt do it in EVERY function, but for the **safe**
`getCartDetails`
`getAddressDetails`
`getAvailableTherapists`
Becuase GET requests are generally safe and should not create any problem

Now, for the **dangerous**
`createCart`
`addCartProduct`
`useCreditCard`
Because it may create multiple instances of a cart or payment, or add products the user did not select. Retrying after a timeout or whatever reason could create duplicate items or charges.

**4c.** The `checkoutBooking` function has a subtle but critical bug beyond the one shared with other functions. Find it and explain what would happen in production.

It's the same as what was mentioned in part 1. `checkoutBooking` has the `{withCredentials: true}` sent as body. This could cause the checkout to fail

## Part 5 — Architecture & Opinions (30 min, written only)

**5a.** This codebase uses React 16.3 with class components, Redux with `connect()`, and react-router v4. If you were tasked with planning an incremental modernization over 6 months (no full rewrite), what would you prioritize first, second, and third? For each, explain why it comes in that order, what concrete steps you'd take, and what risk it carries.

- I would not do a full rewrite or hook migration. I'd start with the stabilization (aka fixing existing bugs) in redux, apis, etc. Using helper functions, refactors or normalizing the way the information is accessed. Why first? Api calls and redux states are the core of the application. It's foundamental to have it be as strong as it could be.
- Then I'd organize all the booking, payments, guest or therapist logic into functions, so it can be reutilized, it's cleanier and easier to maintain. This would be my second call, once all the bugs and weak links are fixed, extracting the logic so it's easier to migrate or refactor to newer components is key.
- Finally, i'd start by modernizing react incrementally. Why this last? It helps with it being easier to read/follow, but functionality wise, it's not something that's going to really change the code performance. Plus, class and hooks components can coexist, so a slower migration can be done, is not super priority

**5b.** The codebase uses three different styling approaches simultaneously: Bootstrap 3, Material-UI 4, and styled-components. You need to pick **one** as the standard going forward for this specific project. Which do you choose and why? What's your migration strategy — do you convert everything at once, or something else?

- I'd choose `Material UI 4`. `Bootstrap 3` is old and has a lot of global styles, making it harder to maintain. `Styled-components` are flexible, but it's hard for every team member to be aligned and it can lead to the design system to spiral out of control fast.
- `Material UI` gives the team a structured component library, themes, accessibility and a way to standarize styles.

- I would not convert everything at one, I'd start with freezing the usage of bootstrap, then only using styled components for concrete things or exceptions. Then, any new component or refactor, I'd try to make it so `Material UI` is used. Finally, prioritize high traffic/used components first.

**5c.** The main booking flow component is an ~870-line class component that manages step navigation, API calls, background images, analytics events, B2B logic, guest flow logic, Persona identity verification, and UI rendering all in one file. A junior developer suggests splitting it into smaller components. A senior developer says "it works, splitting it risks introducing bugs." You need to make the call. Who do you side with, and what specifically would you do? Be concrete — what would you extract, what would you leave, and in what order?

- I'd side with the Junior dev. Splitting into smaller components is the right idea, but I wouldnt do it all at once. It's true that it works, so the senior dev is not totally wrong, but maintaining an almost 900 line component is not going to end well. It's really hard to maintain in the long run.

- I'd extract navigation/step logic first, move everything to helper functions.
- Then, all the API calls and services.
- Analytics and any other kind of logic/event
- UI components

**5d.** The Redux persist config uses a blacklist approach (persist everything EXCEPT listed slices). Would you switch to a whitelist approach (persist NOTHING except listed slices)? Argue both sides, then give your recommendation. Describe what could go wrong during the switch and how you'd mitigate it.

Blacklist is convenient. Keeping it like this avoids accidentally logging users out or losing preferences. Plus, the app works like this right now.
Whitelist is safer and more conventional. You dont need to remember to exclude each new reducer, less risky for sensitive data.
I'd switch to a Whitelist. I'll do it by parts, also I'll add a persist version so migration is cleaner and old users get new data updated.

**5e.** Describe a time in a past project where you debugged a state management issue in a React application that was difficult to reproduce. What tools or techniques did you use? What turned out to be the root cause? How long did it take, and what did you learn from it?

I had a problem were some users were experiencing problems with their completed meditations (it's from a meditation and wellbeing app), it was hard to reproduce because it did not happen to everyuser and there was no real step to step way of verifying the problem. We save completed meditations in the user redux plus the database. Data showed everything was ok, redux stated were empty.

Turns out, some months ago, some core changed were made to the completed meditations redux model, adding one extra level in the model object. Turns out it only was affecting users that didnt open the app in some time and it was because we didnt have a persist version for our configuration. It took a few days or weeks to really understand the problem, we ended up updating the version control and users stopped having problems.
