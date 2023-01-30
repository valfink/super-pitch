from django.urls import path

from . import views

urlpatterns = [
    #path("", views.index, name="index"),
    path("get_csrf_cookie", views.get_csrf_cookie, name="get_csrf_cookie"),
    path("register", views.register, name="register"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("voiceRange", views.voiceRange_view, name="voiceRange"),
    ]