from django.urls import path
from .views import sample, PasswordResetView, PasswordResetConfirmView

urlpatterns = [
    path("home/", sample, name="sample"),
    path("password-reset/", PasswordResetView.as_view(), name="password-reset"),
    path("password-reset-confirm/", PasswordResetConfirmView.as_view(), name="password-reset-confirm"),
]