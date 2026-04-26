# Soothe — Senior Web Developer Take-Home Assessment

**Position:** Senior Web Developer
**Screen recording:**
**Star time:** 26/04/2026 14:44 ARG
**End time:**

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
