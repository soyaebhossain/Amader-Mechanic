from typing import Dict, Any

SMS_TEMPLATES: Dict[str, Dict[str, str]] = {
    "OTP_VERIFICATION": {
        "bn-BD": "আমাদের মেকানিক: আপনার ওটিপি কোড হলো {otp}। এটি {minutes} মিনিটের জন্য কার্যকর। কাউকে এটি বলবেন না।",
        "en": "Amader Mechanic: Your verification OTP is {otp}. Valid for {minutes} minutes. Never share this code."
    },
    "REQUEST_ASSIGNED": {
        "bn-BD": "আপনার অনুরোধে মেকানিক নিযুক্ত হয়েছে। মেকানিক: {provider_name}, মোবাইল: {provider_phone}। গাড়ির দিকে রওনা হয়েছেন।",
        "en": "Mechanic assigned to your request. Provider: {provider_name}, Mobile: {provider_phone}. En route to your vehicle."
    },
    "QUOTE_READY": {
        "bn-BD": "আপনার গাড়ির প্রাথমিক পরিদর্শন সম্পন্ন হয়েছে। মোট খরচের কোটেশন: ৳{amount}। অ্যাপে গিয়ে অনুমোদন দিন।",
        "en": "Vehicle inspection complete. Itemized quote: BDT {amount}. Please review and approve in the app."
    },
    "PAYMENT_SUCCESS": {
        "bn-BD": "ধন্যবাদ! সার্ভিস ফি ৳{amount} সফলভাবে গ্রহণ করা হয়েছে (TrxID: {txn_id})। নিরাপদ ভ্রমণের শুভকামনা।",
        "en": "Thank you! Service payment of BDT {amount} was received (TrxID: {txn_id}). Drive safely."
    },
    "JOB_DISPATCH_ALERT_PROVIDER": {
        "bn-BD": "জরুরি সার্ভিস অফার! দূরত্ব: {distance_km} কিমি, অবস্থান: {location}। গ্রহণ করতে অ্যাপ খুলুন।",
        "en": "Emergency service job offer! Distance: {distance_km}km, Location: {location}. Open app to accept."
    }
}

def render_sms_template(template_key: str, lang: str = "bn-BD", **kwargs: Any) -> str:
    template_group = SMS_TEMPLATES.get(template_key)
    if not template_group:
        raise KeyError(f"Template key '{template_key}' does not exist.")

    template_str = template_group.get(lang) or template_group.get("bn-BD")
    return template_str.format(**kwargs)
