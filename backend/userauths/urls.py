# Import Django's URL routing functions.
from django.urls import path

# Import our custom Views to hook them up to URL paths.
from .views import (
    RegisterView, LoginView, GitHubLogin, GoogleLogin, 
    RequestMagicLinkView, VerifyMagicLinkView, 
    RequestOTPView, VerifyOTPView, 
    UserProfileView, PasswordChangeView, 
    CloudinarySignatureView, DeleteAccountView,
    PasswordResetInitiateView, PasswordResetConfirmView
)

# Define the local URL patterns list for the userauths application.
urlpatterns = [
    # 1. Map the 'register/' path to our RegisterView class.
    path('register/', RegisterView.as_view(), name='register'),

    # 2. Map the 'login/' path to our LoginView class.
    path('login/', LoginView.as_view(), name='login'),

    # 3. Map the 'github/' path to our GitHubLogin social authentication class.
    path('github/', GitHubLogin.as_view(), name='github_login'),

    # 4. Map the 'google/' path to our GoogleLogin social authentication class.
    path('google/', GoogleLogin.as_view(), name='google_login'),

    # 5. Map the 'magic-link/request/' path to our RequestMagicLinkView class.
    path('magic-link/request/', RequestMagicLinkView.as_view(), name='request_magic_link'),

    # 6. Map the 'magic-link/verify/' path to our VerifyMagicLinkView class.
    path('magic-link/verify/', VerifyMagicLinkView.as_view(), name='verify_magic_link'),

    # 7. Map the 'otp/request/' path to our RequestOTPView class.
    path('otp/request/', RequestOTPView.as_view(), name='request_otp'),

    # 8. Map the 'otp/verify/' path to our VerifyOTPView class.
    path('otp/verify/', VerifyOTPView.as_view(), name='verify_otp'),

    # 9. Map the 'profile/' path to our UserProfileView class.
    path('profile/', UserProfileView.as_view(), name='profile'),

    # 10. Map the 'password/change/' path to our PasswordChangeView class.
    path('password/change/', PasswordChangeView.as_view(), name='password_change'),

    # 11. Map the 'cloudinary/signature/' path to our CloudinarySignatureView class.
    path('cloudinary/signature/', CloudinarySignatureView.as_view(), name='cloudinary_signature'),

    # 12. Map the 'account/delete/' path to our DeleteAccountView class.
    path('account/delete/', DeleteAccountView.as_view(), name='delete_account'),

    # 13. Map the 'password/reset/initiate/' path to our PasswordResetInitiateView class.
    path('password/reset/initiate/', PasswordResetInitiateView.as_view(), name='password_reset_initiate'),

    # 14. Map the 'password/reset/confirm/' path to our PasswordResetConfirmView class.
    path('password/reset/confirm/', PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
]
