const inr = new Intl.NumberFormat("en-IN",{
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
});

export const formatPaise = (paise) => inr.format((paise||0) / 100);
export const paiseToRupees = (paise) => (paise||0)/100;