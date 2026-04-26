export function deleteCartProduct(cartId, cart_product_id, csrfToken, callBackFunc, errorHandler) {
    const url = `${API_ROOT}/${urlStart()}/carts/${cartId}/cart_products/${cart_product_id}`;
    const config = relevantHeader(false, csrfToken);

    return handleRequest(
        axios.delete(url, config),
        callBackFunc,
        errorHandler
    )
}

export function updateCart(cartId, cart, csrfToken, callBackFunc, errorHandler) {
    const attributionParams = hashAffiliateUtms();
    const payload = { cart };

    let isCC = false;
    if (has(cart, 'address_id')) {
        payload.attribution = attributionParams;
    }
    if (has(cart, 'credit_card_id')) {
        isCC = true;
    }
    const url = `${API_ROOT}/${urlStart(isCC)}/carts/${cartId}`;
    const config = relevantHeader(isCC, csrfToken);

    return handleRequest(
        axios.patch(url, payload, config),
        callBackFunc,
        errorHandler
    )
}


export function useCreditCard(cartId, creditCardId, callBackFunc, errorHandler) {
    const url = `${API_ROOT}/v7/carts/${cartId}/use_credit_card`;
    const body = { cart: { credit_card_id: creditCardId } };
    const config = {
        headers: ACCEPT_LANGUAGE_HEADER.headers,
        withCredentials: true,
    };

    return handleRequest(
        axios.post(url, body, config),
        callBackFunc,
        errorHandler
    )
}

export function addCartProduct(cartId, cart_product, callBackFunc, errorHandler) {
    const url = `${API_ROOT}/v7/carts/${cartId}/cart_products`;
    const body = { cart_product };
    const config = {
        headers: ACCEPT_LANGUAGE_HEADER.headers,
        withCredentials: true,
    };

    return handleRequest(
        axios.post(url, body, config),
        callBackFunc,
        errorHandler
    )
}

export function getTherapistPrivateProfile(therapist_id, callBackFunc, errorHandler) {
    const guestUrl = `${API_ROOT}/guest/pro_profile/${therapist_id}`;
    const therapistUrl = `${API_ROOT}/therapists/${therapist_id}/pro_profile`;

    const config = {
        headers: ACCEPT_LANGUAGE_HEADER.headers,
        withCredentials: true,
    };

    return handleRequest(
        axios.get(isGuestUser() ? guestUrl : therapistUrl, config),
        callBackFunc,
        errorHandler
    )
}


export function getAddressDetails(addressId, callBackFunc, errorHandler) {
    const url = `${API_ROOT}/v7/addresses/${addressId}`;
    const config = {
        headers: ACCEPT_LANGUAGE_HEADER.headers,
        withCredentials: true,
    };

    return handleRequest(
        axios.get(url, config),
        callBackFunc,
        errorHandler
    )
}


export function handleRequest(requestHandle, callbackHandle, errorHandle) {
    return requestHandle
        .then(response => {
            if (callbackHandle) callbackHandle(response)
            return response
        })
        .catch((error => {
            if (errorHandle) errorHandle(error);
            console.log(error);
            throw error;
        }))
}