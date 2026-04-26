# Soothe — Senior Web Developer Take-Home Assessment

**Position:** Senior Web Developer
**Time Limit:** 4 hours maximum
**Deadline:** Return within 48 hours of receiving

---

## Before You Begin

### Rules

1. **No AI tools.** No ChatGPT, Copilot, Cursor AI, Claude, Gemini, Codeium, Tabnine, or any other AI coding assistant.
2. **Reference docs only.** You may use official documentation: MDN, reactjs.org, redux.js.org, axios-http.com. No StackOverflow, no blog posts, no tutorials.
3. **Screen record your entire session.** Use Loom, OBS, or QuickTime. The recording must show your full screen (editor + browser) with no cuts from start to finish. Submit the recording link with your answers. **Submissions without a screen recording will not be reviewed.**
4. **Use Git.** Initialize a repo and commit frequently with meaningful messages as you work through each part. Your commit history must reflect your working process across the 3-4 hour session — we want to see how you progressed through the problems, not just the final result. A single commit or a handful of bulk commits at the end will result in automatic disqualification. Aim for at least 10-15 commits that show your thought process (e.g., "Part 1: initial code review notes", "Part 3: add reducer and action", "Part 3: wire up component to Redux", "Part 4: create shared API utility", etc.).
5. **Time yourself.** Note your start time and end time at the top of your submission. Going over 4 hours is fine — honesty matters more.

### What to Submit

A **public GitHub repo** — email us the link when you're done. The repo must contain:

1. A file called `ANSWERS.md` at the repo root with your written answers for all parts
2. A folder called `code/` containing your code files for Parts 3 and 4
3. Your screen recording link added to the top of `ANSWERS.md`
4. Your start and end timestamps added to the top of `ANSWERS.md`

---

## Context: The Application

You are being evaluated for a role working on a **React 16 web application** for a wellness booking platform. The app allows clients to book in-home massage and spa services through a multi-step booking wizard.

**Tech stack:**
- React 16.3 (class components, no hooks in existing code)
- Redux 4.0 with `react-redux` `connect()` for state management
- `redux-persist` 5.10 for persisting selected state to localStorage
- `react-router-dom` 4.3 for routing
- `axios` for REST API calls
- Bootstrap 3, Material-UI 4, and `styled-components` for styling
- `lodash` used extensively throughout
- JavaScript only (no TypeScript)
- Create React App (react-scripts 5.0)

**Booking flow architecture:**

The main booking flow is an ~870-line class component (`BookingFlowForMarketplace`) that manages a multi-step wizard. Steps are lazy-loaded with `React.lazy` + `Suspense`. The steps are:

`MENU → AUTHENTICATION → TIMING → PICKAPRO → REVIEW → CHECKOUT → CONFIRMATION`

Navigation between steps is managed through Redux actions, and each step is a separate component rendered via a `switch` statement. Step components receive callbacks as props (e.g., `assignToCart`, `setBookingFlowStepThroughParent`, `displayError`).

---

## Part 1 — Code Review (45 min)

You've joined the team and are reviewing pull requests on your first day. For each snippet below, write a thorough code review as if you're commenting on a real PR. For each issue you find:

- State **what** the issue is
- Explain **why** it's a problem (what breaks, what's the risk)
- Show **how** you'd fix it (write the corrected code)
- Rate the severity: **critical** (causes bugs now), **major** (will cause bugs), or **minor** (code quality)

Prioritize your findings — list the most important issues first.

---

### Snippet 1 — Redux Reducer

This reducer manages the booking flow state for the entire multi-step booking wizard. It stores which step the user is on, available therapists, and various flow flags.

```javascript
import { assign } from 'lodash';
import {
  BOOKING_FLOW, BOOKING_FLOW_REDESIGN, RECIPIENT_OPTION,
  AVAILABLE_THERAPISTS, SOOTHE_PASS_ONE_TIME_POPUP,
  AVAILABLE_THERAPISTS_WITH_TIME_SLOTS,
} from '../Actions';

export default function (state = {}, action) {
  switch (action.type) {
    case SOOTHE_PASS_ONE_TIME_POPUP:
      return assign(state, action.payload);
    case AVAILABLE_THERAPISTS:
      return assign(state, action.payload);
    case RECIPIENT_OPTION:
      return assign(state, action.payload);
    case BOOKING_FLOW_REDESIGN:
      return assign(state, action.payload);
    case BOOKING_FLOW:
      return action.payload;
    case AVAILABLE_THERAPISTS_WITH_TIME_SLOTS:
      return assign(state, action.payload);
    default:
      return state;
  }
}
```

The corresponding action creators look like this:

```javascript
import { merge } from 'lodash';

export const BOOKING_FLOW_REDESIGN = 'BOOKING_FLOW_REDESIGN';
export const BOOKING_FLOW = 'BOOKING_FLOW';
export const AVAILABLE_THERAPISTS = 'AVAILABLE_THERAPISTS';
// ... other constants

export function setBookingFlowStep(step) {
  return {
    type: BOOKING_FLOW_REDESIGN,
    payload: { step },
  };
}

export function setAvailableTherapists(availableTherapists) {
  return {
    type: AVAILABLE_THERAPISTS,
    payload: { availableTherapists },
  };
}
```

---

### Snippet 2 — API Helper

This function is one of ~30 helpers in a shared file that the booking flow uses for all API communication. All 30 functions follow this same pattern.

```javascript
import axios from 'axios';
import { has, get, isEmpty, omit } from 'lodash';
import { API_ROOT, ACCEPT_LANGUAGE_HEADER } from '../../../apiConfig';

// API_ROOT = `${process.env.REACT_APP_API_URL}/api`
// ACCEPT_LANGUAGE_HEADER = { headers: { 'Accept-Language': 'en' } }

export function getCartDetails(cartId, callBackFunc, errorHandler) {
  if (cartId) {
    axios.get(
      `${API_ROOT}/v7/carts/${cartId}`,
      { withCredentials: true },
      ACCEPT_LANGUAGE_HEADER,
    )
      .then((response) => {
        const { result } = response.data;
        if (result && callBackFunc) {
          callBackFunc(response);
        }
      }).catch((err) => {
        if (errorHandler) {
          errorHandler(err);
        } else {
          console.log(err);
        }
      });
  }
}

export function addCartProduct(cartId, cart_product, callBackFunc, errorHandler) {
  axios.post(
    `${API_ROOT}/v7/carts/${cartId}/cart_products`,
    { cart_product },
    { withCredentials: true },
    ACCEPT_LANGUAGE_HEADER,
  ).then((response) => {
    const { result } = response.data;
    if (result && callBackFunc) {
      callBackFunc(response);
    }
  }).catch((err) => {
    if (errorHandler) {
      errorHandler(err);
    } else {
      console.log(err);
    }
  });
}

export function checkoutBooking(cartId, callBackFunc, errorHandler) {
  axios.post(
    `${API_ROOT}/v7/carts/${cartId}/checkout`,
    { withCredentials: true },
    ACCEPT_LANGUAGE_HEADER,
  ).then((response) => {
    const { result } = response.data;
    if (result && callBackFunc) {
      callBackFunc(response);
    }
  }).catch((err) => {
    if (errorHandler) {
      errorHandler(err);
    } else {
      console.log(err);
    }
  });
}
```

---

### Snippet 3 — Component from a Junior Developer's PR

A junior developer submitted this component for the provider availability list. Write your review as you would on a real PR — be constructive but thorough.

```javascript
class ProAvailability extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      providers: [],
      loading: true,
      filter: 'all',
    };
  }

  componentDidMount() {
    this.fetchProviders();
    window.addEventListener('resize', this.handleResize);
  }

  componentDidUpdate(prevProps) {
    if (this.props.cartId != prevProps.cartId) {
      this.fetchProviders();
    }
  }

  fetchProviders() {
    this.setState({ loading: true });
    axios.get(`${API_ROOT}/v7/carts/${this.props.cartId}/available_providers`)
      .then(res => {
        this.setState({ providers: res.data.providers, loading: false });
      });
  }

  handleResize() {
    this.setState({ width: window.innerWidth });
  }

  filterProviders() {
    if (this.state.filter == 'all') return this.state.providers;
    return this.state.providers.filter(p => p.rating >= 4.5);
  }

  render() {
    return (
      <div>
        {this.state.loading && <Spinner />}
        <select onChange={(e) => this.setState({ filter: e.target.value })}>
          <option value="all">All Providers</option>
          <option value="top">Top Rated</option>
        </select>
        {this.filterProviders().map(provider => (
          <ProviderCard
            name={provider.name}
            rating={provider.rating}
            avatar={provider.avatar}
            onClick={() => this.props.onSelect(provider)}
          />
        ))}
      </div>
    );
  }
}
```

---

### Snippet 4 — Store Configuration

This is how the Redux store is set up. Review it for issues.

```javascript
import { createStore } from 'redux';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import hardSet from 'redux-persist/lib/stateReconciler/hardSet';
import rootReducer from './Reducers';

const persistConfig = {
  key: 'root',
  storage,
  blacklist: [
    'purchasedGiftCardAssortment', 'creditCards', 'creditCard',
    'booking', 'chats', 'currentChat', 'anonymousCart',
    'fieldsHolder', 'abTest', 'appointment', 'rebookOptions',
    'soothePassSubscriptions'
  ],
  stateReconciler: hardSet,
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export default () => {
  const store = createStore(persistedReducer);
  const persistor = persistStore(store);
  return { store, persistor };
};
```

The root reducer combines these slices:

```javascript
const rootReducer = combineReducers({
  localize: localizeReducer,
  addresses: AddressesReducer,
  address: AddressReducer,
  bookingFlow: BookingFlowReducer,
  client: ClientReducer,
  creditCards: CreditCardsReducer,
  creditCard: CreditCardReducer,
  giftCard: GiftCardReducer,
  giftCardCart: GiftCardCartReducer,
  purchasedGiftCardAssortment: PurchasedGiftCardAssortmentReducer,
  subscription: SubscriptionReducer,
  subscriptionView: SubscriptionViewReducer,
  booking: CartReducer,
  productsReducer: ProductsReducer,
  appointment: AppointmentReducer,
  upcomingAppointmentId: UpcomingAppointmentReducer,
  rebookOptions: RebookOptionsReducer,
  chats: ChatsReducer,
  currentChat: SingleChatReducer,
  anonymousCart: AnonymousCartReducer,
  abTest: ABTestReducer,
  fieldsHolder: FieldsHolderReducer,
  mainEvent: EventReducer,
  soothePassSubscriptions: SoothePassSubscriptionsReducer,
});
```

---

## Part 2 — Bug Investigation (30 min)

Read the bug report and the code below, then answer the questions.

### Bug Report

> **Bug #4127:** Users report that when they navigate **back** from the Review step to the Provider Pick step in the booking flow, the previously selected provider is no longer shown and the available providers list appears empty. Refreshing the page fixes it. This only happens in the marketplace booking flow.

### Relevant Code

**Step navigation — how "go back" works:**

```javascript
relevantGoBack() {
    const currentStep = get(this.props, 'bookingFlow.step.id', STEPS[0].id);
    const rebook = get(this.props, 'booking.cart.rebook', false);

    if (currentStep === 'CONFIRMATION' && isEventBooking()) {
        window.location.href = `${HOST_ROOT}/events-booking`;
    } else if (hasUuid() && (currentStep === 'CONFIRMATION' || currentStep === 'TIMING')) {
        // ... B2B redirect logic ...
        window.location.href = nextUrl;
    } else if ((currentStep === 'MENU' && !rebook) || currentStep === 'CONFIRMATION') {
        window.location.href = `${HOST_ROOT}${ROUTES.index}`;
    } else if (currentStep === 'MENU' && rebook) {
        this.setState({ redirect: true });
    } else {
        this.updateBookingStep(get(this.props, 'bookingFlow.previousStep', STEPS[0]));
    }
}
```

**How steps are updated:**

```javascript
updateBookingStep(step, skipHistoryUpdate = false) {
    if (isEmpty(step)) {
        step = STEPS[0];
    }
    const searchValue = window.location.search;
    if (!skipHistoryUpdate && step.id !== 'AUTHENTICATION') {
        this.props.history.push(`/booking/${step.id}${searchValue}`);
    }
    this.setState({
        showLoader: false,
        currentStepId: step.id,
        currentStepState: step,
        showBgFlag: this.showVideoBg(step),
    }, () => {
        this.props.setBookingFlowStep(step);
    });
}
```

**How the step component is rendered (inside `<Suspense>`):**

```javascript
renderStep() {
    const currentStep = this.state.currentStepId;
    switch (currentStep) {
        // ...
        case 'PICKAPRO':
        case 'PICKAPRO2':
            return (
                <ProviderPickStepMarketplace
                    assignToCart={this.assignToCart}
                    toggleNavBarStyle={this.toggleNavBarStyle}
                    changeBackground={this.changeBackground}
                    setBookingFlowStepThroughParent={this.updateBookingStep}
                    displayError={this.displayError}
                    setLoaderFlag={this.setLoaderFlag}
                />
            );
        case 'REVIEW':
            return (
                <ReviewStep
                    assignToCart={this.assignToCart}
                    // ...same pattern...
                />
            );
        // ...
    }
}
```

**The provider data is stored in Redux via this action:**

```javascript
export function setAvailableTherapists(availableTherapists) {
  return {
    type: AVAILABLE_THERAPISTS,
    payload: { availableTherapists },
  };
}
```

**And handled by the same reducer from Snippet 1:**

```javascript
case AVAILABLE_THERAPISTS:
    return assign(state, action.payload);
```

**The ProviderPickStep component fetches providers in its `componentDidMount`:**

```javascript
componentDidMount() {
    const cartId = get(this.props, 'booking.cart.id', null);
    const cartProductId = get(this.props, 'booking.cart.cartProducts.0.id', null);
    const dateUtc = get(this.props, 'booking.cart.date.dateUtc', null);
    if (cartId && cartProductId && dateUtc) {
        getAvailableTherapists(cartId, cartProductId, dateUtc, csrfToken,
            (response) => {
                this.props.setAvailableTherapists(get(response, 'data.therapists', []));
                // ...render providers...
            },
            (error) => { /* error handling */ }
        );
    }
}
```

### Questions

**2a.** Trace the full sequence of events when a user clicks "back" from the Review step. List every method call, state change, and component lifecycle event that fires, in order. Explain what happens to the ProviderPickStep component specifically (does it mount? remount? update?).

**2b.** Explain what you believe is the root cause of this bug. Be specific — reference exact code from the snippets above. Explain why the bug manifests only on backward navigation (not on first load), and why a page refresh fixes it.

**2c.** Propose **two different fixes**, each with a different trade-off. For each fix:
- Write the exact code change
- Explain what it fixes and what risks it introduces
- State which fix you'd ship to production and why

**2d.** A teammate suggests: *"Let's just add a `key={Date.now()}` to the lazy-loaded step components to force remount on every step change."* In 3-4 sentences, explain why this is or isn't a good idea.

---

## Part 3 — Feature Implementation (90 min)

Build the following feature as standalone files that could be integrated into the codebase described above. Your code must match the existing patterns and conventions.

### Feature: Recently Viewed Providers

When a user views a provider's profile during the booking flow, track it. Display a "Recently Viewed" row at the top of the provider pick step so users can quickly re-select a provider they already looked at.

### Requirements

1. Track the last 5 unique providers the user has viewed (clicked into their profile)
2. Most recently viewed appears first
3. If a provider is viewed again, move them to the front (no duplicates)
4. Data persists across booking step navigation but clears on page refresh (session-only — not stored in `redux-persist`)
5. Display a horizontal scrollable row showing: provider avatar (or placeholder), first name, and star rating
6. Clicking a recently viewed provider card should trigger a selection callback passed via props
7. If there are no recently viewed providers, render nothing (no empty state UI)
8. Must work with class components and `connect()` — do not use hooks

### Existing patterns you must follow

**Action creator pattern** (from the codebase):

```javascript
// src/Actions/BookingFlowAction.js
export const AVAILABLE_THERAPISTS = 'AVAILABLE_THERAPISTS';

export function setAvailableTherapists(availableTherapists) {
  return {
    type: AVAILABLE_THERAPISTS,
    payload: { availableTherapists },
  };
}
```

**Reducer pattern** (from the codebase — note: you found a bug in this pattern in Part 1. Decide whether to replicate the bug or fix it in your code):

```javascript
// src/Reducers/BookingFlowReducer.js
import { assign } from 'lodash';
export default function (state = {}, action) {
  switch (action.type) {
    case SOME_ACTION:
      return assign(state, action.payload);
    default:
      return state;
  }
}
```

**Root reducer registration** (for reference — show where yours would go):

```javascript
// src/Reducers/index.js
const rootReducer = combineReducers({
  bookingFlow: BookingFlowReducer,
  booking: CartReducer,
  client: ClientReducer,
  // ... your new reducer goes here
});
```

**Redux persist config** (session-only means it should be in the blacklist):

```javascript
const persistConfig = {
  key: 'root',
  blacklist: ['booking', 'chats', /* ...your new slice here... */],
  stateReconciler: hardSet,
};
```

**connect() pattern** (from the codebase):

```javascript
const mapStateToProps = (state) => ({
    booking: state.booking,
    bookingFlow: state.bookingFlow,
    client: state.client,
});

export default connect(mapStateToProps, {
    setBookingFlowStep, setCart, setProducts, loadClient,
})(Index);
```

**API helper that fetches a provider profile** (the dispatch point — this is where viewing happens):

```javascript
export function getTherapistPrivateProfile(therapist_id, callBackFunc, errorHandler) {
  axios.get(
    `${API_ROOT}/therapists/${therapist_id}/pro_profile`,
    { withCredentials: true },
    ACCEPT_LANGUAGE_HEADER,
  ).then((resp) => {
    const { result } = resp.data;
    if (result && callBackFunc) {
      callBackFunc(resp);
    }
  }).catch((err) => {
    if (errorHandler) {
      errorHandler(err);
    } else {
      console.log(err);
    }
  });
}
```

### What to deliver (in the `code/` folder):

1. `RecentlyViewedAction.js` — action type constant(s) and action creator(s)
2. `RecentlyViewedReducer.js` — the reducer
3. `RecentlyViewedProviders.js` — the React component (class component, connected to Redux)
4. `RecentlyViewedProviders.css` — styles for the component

### In your `ANSWERS.md`, also answer:

**3a.** Where exactly in the existing code would you dispatch the tracking action? Describe the integration point, which file it would be in, and what the calling code would look like. Explain why you chose that specific location over other options.

**3b.** You found a bug in the reducer pattern in Part 1. Did you replicate that pattern in your new reducer or deviate from it? Explain your decision and the trade-off of each choice (matching the team's existing pattern vs. doing it correctly).

**3c.** If this feature later needed to survive page refreshes (persist across sessions), what specific changes would you make? Don't just say "add it to redux-persist" — explain what else you'd need to consider (data shape, storage limits, stale data, etc.).

---

## Part 4 — Refactoring (45 min)

Below is the complete API helpers file from the booking flow. All ~30 functions follow the same pattern. Your job is to refactor it.

```javascript
import axios from 'axios';
import { has, get, isEmpty, omit } from 'lodash';
import { API_ROOT, ACCEPT_LANGUAGE_HEADER } from '../../../apiConfig';
import { isEventBooking, isGuestUser } from '../../../constants';
import { hashAffiliateUtms } from '../../Shared/WebAnalytics';

function urlStart(forceUser = false) {
  if (isGuestUser() && !forceUser) {
    return 'guest';
  }
  return 'v7';
}

function relevantHeader(forceUser = false, csrfToken = '') {
  if ((isGuestUser() && !forceUser) || isEventBooking()) {
    return { headers: { ...ACCEPT_LANGUAGE_HEADER.headers, 'X-CSRF-Token': csrfToken, withCredentials: true } };
  }
  return { headers: { ...ACCEPT_LANGUAGE_HEADER.headers, withCredentials: true } };
}

export function getCartDetails(cartId, callBackFunc, errorHandler) {
  if (cartId) {
    axios.get(
      `${API_ROOT}/v7/carts/${cartId}`,
      { withCredentials: true },
      ACCEPT_LANGUAGE_HEADER,
    )
      .then((response) => {
        const { result } = response.data;
        if (result && callBackFunc) {
          callBackFunc(response);
        }
      }).catch((err) => {
        if (errorHandler) {
          errorHandler(err);
        } else {
          console.log(err);
        }
      });
  }
}

export function createCart(addressId, csrfToken, callBackFunc, errorHandler) {
  const attributionParams = hashAffiliateUtms();
  axios.post(
    `${API_ROOT}/v7/carts`,
    { cart: {}, attribution: attributionParams },
    { withCredentials: true },
    ACCEPT_LANGUAGE_HEADER,
  ).then((response) => {
    const { result } = response.data;
    if (result && callBackFunc) {
      const cartId = get(response, 'data.cart.id', '');
      if (cartId) {
        updateCart(cartId, { address_id: addressId }, csrfToken, callBackFunc, errorHandler);
      }
    }
  }).catch((err) => {
    if (errorHandler) {
      errorHandler(err);
    } else {
      console.log(err);
    }
  });
}

export function updateCart(cartId, cart, csrfToken, callBackFunc, errorHandler) {
  const attributionParams = hashAffiliateUtms();
  let isCC = false;
  const payload = { cart };
  if (has(cart, 'address_id')) {
    payload.attribution = attributionParams;
  }
  if (has(cart, 'credit_card_id')) {
    isCC = true;
  }
  axios.patch(
    `${API_ROOT}/${urlStart(isCC)}/carts/${cartId}`,
    payload,
    relevantHeader(isCC, csrfToken),
  ).then((response) => {
    const { result } = response.data;
    if (result && callBackFunc) {
      callBackFunc(response);
    }
  }).catch((err) => {
    if (errorHandler) {
      errorHandler(err);
    } else {
      console.log(err);
    }
  });
}

export function addCartProduct(cartId, cart_product, callBackFunc, errorHandler) {
  axios.post(
    `${API_ROOT}/v7/carts/${cartId}/cart_products`,
    { cart_product },
    { withCredentials: true },
    ACCEPT_LANGUAGE_HEADER,
  ).then((response) => {
    const { result } = response.data;
    if (result && callBackFunc) {
      callBackFunc(response);
    }
  }).catch((err) => {
    if (errorHandler) {
      errorHandler(err);
    } else {
      console.log(err);
    }
  });
}

export function deleteCartProduct(cartId, cart_product_id, csrfToken, callBackFunc, errorHandler) {
  axios.delete(
    `${API_ROOT}/${urlStart()}/carts/${cartId}/cart_products/${cart_product_id}`,
    relevantHeader(false, csrfToken),
  ).then((response) => {
    const { result } = response.data;
    if (result && callBackFunc) {
      callBackFunc(response);
    }
  }).catch((err) => {
    if (errorHandler) {
      errorHandler(err);
    } else {
      console.log(err);
    }
  });
}

export function getAddressDetails(addressId, callBackFunc, errorHandler) {
  axios.get(
    `${API_ROOT}/v7/addresses/${addressId}`,
    { withCredentials: true },
    ACCEPT_LANGUAGE_HEADER,
  ).then((response) => {
    const { result } = response.data;
    if (result && callBackFunc) {
      callBackFunc(response);
    }
  }).catch((err) => {
    if (errorHandler) {
      errorHandler(err);
    } else {
      console.log(err);
    }
  });
}

export function getAvailableTherapists(cartId, cartProductId, dateUtc, csrfToken, callBackFunc, errorHandler) {
  axios.get(
    `${API_ROOT}/${urlStart()}/carts/${cartId}/cart_products/${cartProductId}/available_providers?session_date=${dateUtc}`,
    relevantHeader(false, csrfToken),
  ).then((response) => {
    const { success } = response.data;
    if (success && callBackFunc) {
      callBackFunc(response);
    }
  }).catch((err) => {
    if (errorHandler) {
      errorHandler(err);
    } else {
      console.log(err);
    }
  });
}

export function guestGetAvailableTherapists(cartId, cartProductId, dateUtc, csrfToken, callBackFunc, errorHandler) {
  axios.get(
    `${API_ROOT}/guest/carts/${cartId}/cart_products/${cartProductId}/available_providers?session_date=${dateUtc}`,
    relevantHeader(false, csrfToken),
  ).then((response) => {
    const { success } = response.data;
    if (success && callBackFunc) {
      callBackFunc(response);
    }
  }).catch((err) => {
    if (errorHandler) {
      errorHandler(err);
    } else {
      console.log(err);
    }
  });
}

export function requestPro(cartId, cartProductId, cart_product, csrfToken, callBackFunc, errorHandler) {
  const cart = get(cart_product, 'cart', null);
  const additional_pros = get(cart_product, 'additional_pros', false);
  axios.post(
    `${API_ROOT}/${urlStart()}/carts/${cartId}/cart_products/${cartProductId}/request_pro`,
    {
      cart_product: omit(cart_product, ['cart', 'additional_pros']),
      cart,
      additional_pros,
    },
    relevantHeader(false, csrfToken),
  ).then((resp) => {
    const { result } = resp.data;
    if (result && callBackFunc) {
      callBackFunc(resp);
    }
  }).catch((err) => {
    if (errorHandler) {
      errorHandler(err);
    } else {
      console.log(err);
    }
  });
}

export function guestRequestPro(cartId, cartProductId, cart_product, csrfToken, callBackFunc, errorHandler) {
  axios.post(
    `${API_ROOT}/guest/carts/${cartId}/cart_products/${cartProductId}/request_pro`,
    { cart_product },
    relevantHeader(false, csrfToken),
  ).then((resp) => {
    const { result } = resp.data;
    if (result && callBackFunc) {
      callBackFunc(resp);
    }
  }).catch((err) => {
    if (errorHandler) {
      errorHandler(err);
    } else {
      console.log(err);
    }
  });
}

export function checkoutBooking(cartId, callBackFunc, errorHandler) {
  axios.post(
    `${API_ROOT}/v7/carts/${cartId}/checkout`,
    { withCredentials: true },
    ACCEPT_LANGUAGE_HEADER,
  ).then((response) => {
    const { result } = response.data;
    if (result && callBackFunc) {
      callBackFunc(response);
    }
  }).catch((err) => {
    if (errorHandler) {
      errorHandler(err);
    } else {
      console.log(err);
    }
  });
}

export function acceptTerms(cartId, callBackFunc, errorHandler) {
  axios.post(`${API_ROOT}/v7/carts/${cartId}/accept_terms`, {
    cart: { accept: true },
  }, { withCredentials: true }, ACCEPT_LANGUAGE_HEADER).then((response) => {
    const { result } = response.data;
    if (result && callBackFunc) {
      callBackFunc(response);
    }
  }).catch((err) => {
    if (errorHandler) {
      errorHandler(err);
    } else {
      console.log(err);
    }
  });
}

export function useCreditCard(cartId, creditCardId, callBackFunc, errorHandler) {
  axios.post(
    `${API_ROOT}/v7/carts/${cartId}/use_credit_card`,
    { cart: { credit_card_id: creditCardId } },
    { withCredentials: true },
    ACCEPT_LANGUAGE_HEADER,
  ).then((response) => {
    const { result } = response.data;
    if (result && callBackFunc) {
      callBackFunc(response);
    }
  }).catch((err) => {
    if (errorHandler) {
      errorHandler(err);
    } else {
      console.log(err);
    }
  });
}

export function getTherapistPrivateProfile(therapist_id, callBackFunc, errorHandler) {
  axios.get(
    isGuestUser()
      ? `${API_ROOT}/guest/pro_profile/${therapist_id}`
      : `${API_ROOT}/therapists/${therapist_id}/pro_profile`,
    { withCredentials: true },
    ACCEPT_LANGUAGE_HEADER,
  ).then((resp) => {
    const { result } = resp.data;
    if (result && callBackFunc) {
      callBackFunc(resp);
    }
  }).catch((err) => {
    if (errorHandler) {
      errorHandler(err);
    } else {
      console.log(err);
    }
  });
}

export function getProducts(queryParam, callBackFunc, errorHandler) {
  axios.get(
    `${API_ROOT}/v7/products${queryParam || ''}`,
    { withCredentials: true },
    ACCEPT_LANGUAGE_HEADER,
  ).then((response) => {
    const { result } = response.data;
    if (result && callBackFunc) {
      callBackFunc(response);
    }
  }).catch((err) => {
    if (errorHandler) {
      errorHandler(err);
    } else {
      console.log(err);
    }
  });
}
```

### Task

1. Create a shared utility function that abstracts the repetitive callback/error pattern
2. Refactor **at least 6 functions** to use your utility — pick a mix of GET, POST, PATCH, and DELETE
3. Every refactored function must keep the **exact same function signature** (same arguments, same behavior for existing callers)
4. Every refactored function must now **also return a Promise** so future callers can use `async/await`
5. Fix any bugs you discover during the refactoring

### What to deliver (in the `code/` folder):

1. `helpers_refactored.js` — the full refactored file

### In your `ANSWERS.md`, also answer:

**4a.** You'll notice the file has separate "authenticated" and "guest" versions of several functions (e.g., `getAvailableTherapists` and `guestGetAvailableTherapists`). These differ only in URL prefix and headers. Without implementing it, describe how you would consolidate these pairs into single functions. Show a short code sketch of the approach.

**4b.** A teammate proposes wrapping every API call in a retry with exponential backoff. For which of the functions in this file would that be **safe**, and for which would it be **dangerous**? Name at least 3 specific functions for each category and explain why.

**4c.** The `checkoutBooking` function has a subtle but critical bug beyond the one shared with other functions. Find it and explain what would happen in production.

---

## Part 5 — Architecture & Opinions (30 min, written only)

Answer these in your `ANSWERS.md`. We're looking for experienced, honest reasoning — not textbook answers. Disagree with us if you want, just defend your position.

**5a.** This codebase uses React 16.3 with class components, Redux with `connect()`, and react-router v4. If you were tasked with planning an incremental modernization over 6 months (no full rewrite), what would you prioritize first, second, and third? For each, explain why it comes in that order, what concrete steps you'd take, and what risk it carries.

**5b.** The codebase uses three different styling approaches simultaneously: Bootstrap 3, Material-UI 4, and styled-components. You need to pick **one** as the standard going forward for this specific project. Which do you choose and why? What's your migration strategy — do you convert everything at once, or something else?

**5c.** The main booking flow component is an ~870-line class component that manages step navigation, API calls, background images, analytics events, B2B logic, guest flow logic, Persona identity verification, and UI rendering all in one file. A junior developer suggests splitting it into smaller components. A senior developer says "it works, splitting it risks introducing bugs." You need to make the call. Who do you side with, and what specifically would you do? Be concrete — what would you extract, what would you leave, and in what order?

**5d.** The Redux persist config uses a blacklist approach (persist everything EXCEPT listed slices). Would you switch to a whitelist approach (persist NOTHING except listed slices)? Argue both sides, then give your recommendation. Describe what could go wrong during the switch and how you'd mitigate it.

**5e.** Describe a time in a past project where you debugged a state management issue in a React application that was difficult to reproduce. What tools or techniques did you use? What turned out to be the root cause? How long did it take, and what did you learn from it?

---

## Submission Checklist

Before submitting, verify:

- [ ] `ANSWERS.md` exists at the repo root with answers for **all parts** (1-5)
- [ ] Screen recording link is at the top of `ANSWERS.md`
- [ ] Start and end timestamps are at the top of `ANSWERS.md`
- [ ] `code/` folder contains: `RecentlyViewedAction.js`, `RecentlyViewedReducer.js`, `RecentlyViewedProviders.js`, `RecentlyViewedProviders.css`, `helpers_refactored.js`
- [ ] You have **at least 10-15 commits** with meaningful messages showing your progression
- [ ] Your code has no syntax errors
- [ ] You've re-read your answers for clarity

---

## What Happens Next

After you submit, we'll schedule a **30-minute follow-up video call** where:

1. You'll share your screen and walk us through your code
2. We'll ask you to make a small live modification to your Part 3 implementation
3. We'll discuss your architecture answers from Part 5 in depth
4. We'll ask you to explain specific lines in your code — why you wrote them that way, what alternatives you considered

This follow-up is a required part of the assessment. Come prepared to discuss your work in detail.

---

Good luck. We're not looking for perfection — we're looking for how you think, how you reason about trade-offs, and whether you can ship quality work in a legacy codebase.
