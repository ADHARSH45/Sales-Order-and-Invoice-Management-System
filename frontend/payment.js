function selectPayment(method) {
    const result = document.getElementById("payment-result");

    if (method === "Cash") {
        result.innerHTML = "✅ Cash payment selected. Please pay at the counter.";
    }
}

function goToUPI() {
    window.location.href = "upi.html";
}
