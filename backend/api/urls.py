from django.urls import path
from .views import sample, PasswordResetView, PasswordResetConfirmView
from .social_auth import GoogleLoginView, AppleLoginView

urlpatterns = [
    path("home/", sample, name="sample"),
    path("password-reset/", PasswordResetView.as_view(), name="password-reset"),
    path("password-reset-confirm/", PasswordResetConfirmView.as_view(), name="password-reset-confirm"),
    path("auth/google/", GoogleLoginView.as_view(), name="google_login"),
    path("auth/apple/", AppleLoginView.as_view(), name="apple_login"),
]