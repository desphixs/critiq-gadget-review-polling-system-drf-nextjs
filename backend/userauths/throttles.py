# Import the native AnonRateThrottle class from Django REST Framework's throttling modules.
from rest_framework.throttling import AnonRateThrottle

class AuthAnonRateThrottle(AnonRateThrottle):
    """
    CUSTOM ANONYMOUS AUTHENTICATION RATE THROTTLE
    
    Analogy:
    Think of this class like a smart doorbell security camera.
    Usually, guests can ring the doorbell once in a while without issues.
    But if someone (an unauthenticated guest) keeps rapidly pounding on the doorbell
    (making request after request to register or login), the camera detects this behavior
    and temporarily locks the doorbell button, preventing them from ringing again for a minute!
    
    We define a custom 'auth_anon' scope to throttle sensitive authentication views independently
    from standard site-wide anonymous rate limits.
    """
    # Assign a custom scope name. This key maps to settings.py REST_FRAMEWORK DEFAULT_THROTTLE_RATES.
    scope = 'auth_anon'
