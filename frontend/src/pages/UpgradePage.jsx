import React, { useState, useEffect } from "react";
import axios from "axios";
import "./styles/RazorpayCheckout.css";
import { useNavigate } from "react-router-dom";
import { FaCheck } from "react-icons/fa";

const UpgradePage = ({ API_BASE_URL, subscriptionLevel, setSubscriptionLevel }) => {
    const [selectedPlan, setSelectedPlan] = useState("monthly");
    const [currency, setCurrency] = useState('USD'); // Force USD
    const [plans, setPlans] = useState({});
    const [yearlyBilling, setYearlyBilling] = useState(true);
    const navigate = useNavigate();

    const [subscriptionData, setSubscriptionData] = useState(null);
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [paymentError, setPaymentError] = useState(false);

    var API_BASE_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        // Load plans
        const fetchPlans = async () => {
            try {
                const _plans = {
                    free: {
                        name: "Free",
                        description: "Basic access",
                        features: ["Free to use", "Import Models", "Export Models", "Model Editing"],
                        price: null,
                        plan_id: null,
                        type: 'free',
                    },
                    pro_yearly: {
                        name: "Pro Yearly",
                        description: "Best value for professionals",
                        features: ["Value for money", "All pro features", "Priority support", "Cloud Saving", "All pro features", "No ads", "Exports", "3D Printing"],
                        price: 90,
                        plan_id: 'pro_yearly',
                        period: "yearly",
                        type: 'pro',
                    },
                    pro_monthly: {  // Simplified plan IDs
                        name: "Pro Monthly",
                        description: "For serious creators",
                        features: ["Unlimited projects", "Priority support", "Cloud Saving", "All pro features", "No ads", "Exports", "3D Printing"],
                        price: 9,
                        plan_id: 'pro_monthly',
                        period: "monthly",
                        type: 'pro',
                    },
                }
                setPlans(_plans);
            } catch (e) {
                console.log("Error fetching plans")
            }
        }
        fetchPlans();
    }, [])

    useEffect(() => {
        const checkSubscription = async () => {
            try {
                const response = await axios.get(
                    `${API_BASE_URL}/payment/get-subscription`,
                    { withCredentials: true }
                );
                setSubscriptionData(response.data);
            } catch (error) {
                console.error("Error fetching subscription:", error);
            }
        };

        checkSubscription();
    }, []);


    const loadRazorpay = () => {
        return new Promise((resolve) => {
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = () => {
                resolve(true);
            };
            script.onerror = () => {
                resolve(false);
            };

            document.body.appendChild(script);
        });
    };

    const handleCheckout = async () => {
        if (!selectedPlan) {
            return;
        }

        const res = await loadRazorpay();

        if (!res) {
            return;
        }

        try {
            const response = await axios.post(
                `${API_BASE_URL}/payment/create-order`,
                { plan_id: selectedPlan.plan_id },
                { withCredentials: true }
            );

            if (response.data.order_id) {
                const options = {
                    key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                    amount: response.data.amount,
                    currency: response.data.currency,
                    name: "ArtX3D",
                    description: `Upgrade to ${selectedPlan.name}`,
                    order_id: response.data.order_id,
                    handler: async function (razorpayResponse) {
                        try {
                            const verificationResponse = await axios.post(
                                `${API_BASE_URL}/payment/verify-payment`,
                                {
                                    razorpay_payment_id: razorpayResponse.razorpay_payment_id,
                                    razorpay_order_id: razorpayResponse.razorpay_order_id,
                                    razorpay_signature: razorpayResponse.razorpay_signature,
                                    plan_id: selectedPlan.plan_id,
                                },
                                { withCredentials: true }
                            );

                            if (verificationResponse.data.message === "Payment successful and subscription provisioned") {
                                setPaymentSuccess(true);
                                setSubscriptionLevel(selectedPlan.type);
                            }
                            else {
                                setPaymentError(true);
                            }
                        } catch (error) {
                            console.error("Payment verification error:", error);
                            setPaymentError(true);
                        }
                    },
                    prefill: {
                        name: "",
                        email: "",
                        contact: "",
                    },
                    notes: {
                        subscription_level: selectedPlan.plan_id,
                    },
                    theme: {
                        color: "#000000",
                    },
                };

                const paymentObject = new window.Razorpay(options);
                paymentObject.open();
            } else {
                console.error("Error creating Razorpay order:", response.data);
            }
        } catch (error) {
            console.error("Error creating Razorpay order:", error);
        }
    };

    const goHome = () => {
        navigate("/home");
    };

    return (
        <div className="upgrade-page">
            <h2 style={{ color: 'white' }}
            >        <button
                onClick={goHome}
                style={{ marginLeft: "-120px", marginTop: "-2px", backgroundColor: "transparent", border: "none", color: "white", cursor: "pointer" }}
            >
                    ←
                </button>Choose Your Plan</h2>

            <div className="billing-toggle">
                <span className={`toggle-option ${yearlyBilling ? 'active' : ''}`} onClick={() => setYearlyBilling(true)}>Monthly</span>
                <span className={`toggle-option ${!yearlyBilling ? 'active' : ''}`} onClick={() => setYearlyBilling(false)}>Yearly</span>
            </div>

            <div className="plans-container">
                {Object.keys(plans).filter(key => plans[key].type !== 'free').map((key, index) => {
                    const plan = plans[key];
                    if (yearlyBilling && plan.period !== 'monthly') return null;
                    if (!yearlyBilling && plan.period !== 'yearly') return null;

                    return (
                        <div key={index} className={`plan-card ${selectedPlan === plan ? 'selected' : ''}`} onClick={() => setSelectedPlan(plan)}>
                            <h3>{plan.name}</h3>
                            {plan.price && (
                                <div className="pricing">
                                    <span className="current-price">
                                        ${plan.price}
                                    </span>
                                    {plan.period && <span>/{plan.period}</span>}
                                </div>
                            )}
                            <p>{plan.description}</p>
                            <ul className="features">
                                {plan.features.map((feature, i) => (
                                    <li key={i}>
                                        <FaCheck style={{ color: 'white', fontSize: '12px' }} />    {feature}
                                    </li>
                                ))}
                            </ul>

                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedPlan(plan);
                                    setTimeout(() => handleCheckout(), 0);
                                }}
                                className="select-button"
                            >
                                Upgrade
                            </button>
                        </div>
                    );
                })}
                {
                    Object.keys(plans).filter(key => plans[key].type === 'free').map((key, index) => {
                        const plan = plans[key];
                        return (
                            <div key={index} className={`plan-card ${selectedPlan === plan ? 'selected' : ''}`} onClick={() => setSelectedPlan(plan)}>
                                <h3>{plan.name} Plan</h3>
                                {/* {!plan.price && <p>Free</p>} */}
                                <p style={{ margin: '0px' }}>{plan.description}</p>
                                <ul className="features">
                                    {plan.features.map((feature, i) => (
                                        <li key={i}>
                                            <FaCheck style={{ color: 'white', fontSize: '12px' }} />    {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        );
                    })
                }
            </div>

            {paymentSuccess && (
                <div className="payment-status success">
                    <lottie-player
                        src="https://assets10.lottiefiles.com/packages/lf20_hi95bvmx/CheckMark.json"
                        background="transparent"
                        speed="1"
                        style={{ width: '200px', height: '200px' }}
                        loop
                        autoplay
                    />
                    <h3>Payment Successful! 🎉</h3>
                    <p>Your subscription is now active</p>
                    <button
                        onClick={() => navigate("/home")}
                        className="home-button"
                    >
                        Go to Home
                    </button>
                </div>
            )}

            {paymentError && (
                <div className="payment-status error">
                    <lottie-player
                        src="https://assets1.lottiefiles.com/packages/lf20_tts4dic6.json"
                        background="transparent"
                        speed="1"
                        style={{ width: '200px', height: '200px' }}
                        loop
                        autoplay
                    />
                    <h3>Payment Failed</h3>
                    <p>Please try again or contact support</p>
                    <button
                        onClick={() => setPaymentError(false)}
                        className="try-again-button"
                    >
                        Try Again
                    </button>
                </div>
            )}

            {subscriptionData?.has_subscription && !paymentSuccess && (
                <div className="existing-subscription">
                    <h3>You currently have a {subscriptionData.current_level} subscription</h3>
                    <p>Valid until: {new Date(subscriptionData.end_date).toLocaleDateString()}</p>
                </div>
            )}
        </div>
    );
};

export default UpgradePage;