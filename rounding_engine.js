// VolTrx / BBM-POS Precision Currency & Volume Calculation Utility
function calculateNormalizedTotal(liters, pricePerLiter) {
    const rawTotal = liters * pricePerLiter;
    return Math.round((rawTotal + Number.EPSILON) * 100) / 100;
}

function calculateChange(cashPaid, totalBill) {
    if (cashPaid < totalBill) {
        throw new Error("Insufficient payment amount");
    }
    return Math.round((cashPaid - totalBill + Number.EPSILON) * 100) / 100;
}

module.exports = { calculateNormalizedTotal, calculateChange };
