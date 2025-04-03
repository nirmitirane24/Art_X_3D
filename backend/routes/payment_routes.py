import os
from flask import Blueprint, request, jsonify, session
from models import User, Subscription
from utils.decorators import login_required
from utils.db import get_db_connection
from dotenv import load_dotenv
import logging
import razorpay

load_dotenv()

payment_bp = Blueprint('payment', __name__, url_prefix='/payment')

# Configure logging
logging.basicConfig(level=logging.DEBUG)

# Razorpay configuration
RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET")

# Initialize Razorpay client
razorpay_client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))

# --------------------------------------------------------------------------------#
#                                  PRICING CONFIG                                #
# --------------------------------------------------------------------------------#
PRICING = {
    "pro_monthly": {  # Simplified plan IDs
        "amount": 9,
        "original_amount": 15,
        "currency": "USD",
        "plan_type": "monthly",
        "subscription_level": "pro",
        "description": "Pro Monthly"
    },
    "pro_yearly": {  # Simplified plan IDs
        "amount": 90,
        "original_amount": 15 * 12,
        "currency": "USD",
        "plan_type": "yearly",
        "subscription_level": "pro+",
        "description": "Pro Yearly"
    }
}


# --------------------------------------------------------------------------------#
#                                  CREATE ORDER                                  #
# --------------------------------------------------------------------------------#
@payment_bp.route('/create-order', methods=['POST'])
@login_required
def create_razorpay_order():
    try:
        data = request.get_json()
        plan_id = data.get('plan_id')

        if plan_id not in PRICING:
            return jsonify({'error': 'Invalid plan ID'}), 400

        plan = PRICING[plan_id]

        amount = int(plan['amount']) * 100  # Amount in USD cents
        currency = "USD"  # Force currency to USD

        username = session['username']
        user = User.get_user_by_username(username)
        if not user:
            return jsonify({'error': 'User not found'}), 404

        # Create a Razorpay Order
        try:
            order = razorpay_client.order.create(
                dict(
                    amount=amount,
                    currency=currency,
                    receipt=f"order_rcptid_{user.id}",
                    payment_capture='1'  # Auto capture
                )
            )
        except Exception as e:
            return jsonify({'error': 'Error creating Razorpay order with Razorpay client'}), 500

        return jsonify({'order_id': order['id'], 'amount': order['amount'], 'currency': currency, 'plan_id': plan_id}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


# --------------------------------------------------------------------------------#
#                                  VERIFY PAYMENT                                  #
# --------------------------------------------------------------------------------#
@payment_bp.route('/verify-payment', methods=['POST'])
@login_required
def verify_razorpay_payment():
    try:
        data = request.get_json()

        # Get parameters sent by Razorpay callback
        razorpay_payment_id = data.get('razorpay_payment_id')
        razorpay_order_id = data.get('razorpay_order_id')
        razorpay_signature = data.get('razorpay_signature')
        plan_id = data.get('plan_id')

        # Verify signature
        params_dict = {
            'razorpay_payment_id': razorpay_payment_id,
            'razorpay_order_id': razorpay_order_id,
            'razorpay_signature': razorpay_signature
        }

        # Verify the payment signature
        try:
            razorpay_client.utility.verify_payment_signature(params_dict)
        except Exception as e:
            logging.error(f"Signature verification failed: {e}")
            return jsonify({'error': 'Payment signature verification failed'}), 400

        # Get plan details
        if plan_id not in PRICING:
            logging.error(f"Invalid plan ID: {plan_id}")
            return jsonify({'error': 'Invalid plan ID'}), 400

        plan = PRICING[plan_id]

        # Get the user information
        username = session['username']
        user = User.get_user_by_username(username)

        if not user:
            logging.error(f"User not found: {username}")
            return jsonify({'error': 'User not found'}), 404

        # Connect to database
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("SELECT * FROM subscriptions WHERE user_id = %s", (user.id,))
        existing_subscription = cursor.fetchone()

        import datetime
        start_date = datetime.datetime.now()

        if plan['plan_type'] == 'monthly':
            end_date = start_date + datetime.timedelta(days=30)
        else:  # yearly
            end_date = start_date + datetime.timedelta(days=365)

        if existing_subscription:
            cursor.execute("""
                UPDATE subscriptions
                SET subscription_level = %s, payment_id = %s,
                    start_date = %s, end_date = %s
                WHERE user_id = %s
            """, (
                plan['subscription_level'],
                razorpay_payment_id,
                start_date,
                end_date,
                user.id
            ))
        else:
            cursor.execute("""
                INSERT INTO subscriptions
                (user_id, subscription_level, payment_id, start_date, end_date, auto_renew)
                VALUES (%s, %s, %s, %s, %s, %s)
            """, (
                user.id,
                plan['subscription_level'],
                razorpay_payment_id,
                start_date,
                end_date,
                True  # Auto-renew default to True
            ))

        cursor.execute("""
            UPDATE users
            SET subscription_level = %s
            WHERE id = %s
        """, (
            plan['subscription_level'],
            user.id
        ))

        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({'message': 'Payment successful and subscription provisioned'}), 200

    except Exception as e:
        logging.exception(f"Error verifying payment: {e}")
        return jsonify({'error': str(e)}), 500


@payment_bp.route('/get-subscription', methods=['GET'])
@login_required
def get_subscription():
    try:
        username = session['username']
        user = User.get_user_by_username(username)

        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT subscription_level, end_date
            FROM subscriptions
            WHERE user_id = %s
            ORDER BY end_date DESC
            LIMIT 1
        """, (user.id,))
        subscription = cursor.fetchone()
        conn.close()

        return jsonify({
            'has_subscription': subscription is not None,
            'end_date': subscription[1].isoformat() if subscription else None,
            'current_level': subscription[0] if subscription else 'free'
        }), 200

    except Exception as e:
        logging.exception(f"Error fetching subscription: {e}")
        return jsonify({'error': str(e)}), 500