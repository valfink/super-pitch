import json
from django.contrib.auth import authenticate, login, logout
from django.views.decorators.csrf import ensure_csrf_cookie, csrf_exempt
from django.db import IntegrityError
from django.http import JsonResponse, HttpResponse
#from django.shortcuts import render, redirect

from .models import User

@ensure_csrf_cookie
def get_csrf_cookie(request):
    return JsonResponse({"ok": "ok"})

def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        data = json.loads(request.body)
        if data.get("email") is not None and data.get("password") is not None:
            username = data["email"]
            password = data["password"]
            user = authenticate(request, username=username, password=password)

            # Check if authentication successful
            if user is not None:
                login(request, user)
                return JsonResponse(user.to_json())
            else:
                return JsonResponse({"error": "Invalid email and/or password."}, status=401)
        else:
            return JsonResponse({"error": "All fields required."}, status=400)
    else:
        return JsonResponse({"error": "POST request required."}, status=400)


def logout_view(request):
    logout(request)
    return JsonResponse({"message": "Successfully logged out."})


def register(request):
    if request.method == "POST":
        data = json.loads(request.body)
        if data.get("email") is not None and data.get("password") is not None:
            username = data["email"]
            email = data["email"]
            password = data["password"]
            # Ensure password matches confirmation
            # confirmation = request.POST["confirmation"]
            # if password != confirmation:
            #     return JsonResponse({"error": "Passwords don't match."}, status=400)

            # Attempt to create new user
            try:
                user = User.objects.create_user(username, email, password)
                user.save()
            except IntegrityError:
                return JsonResponse({"error": "Email address already taken."}, status=400)
            login(request, user)
            return JsonResponse(user.to_json())
        else:
            return JsonResponse({"error": "All fields required."}, status=400)
    else:
        return JsonResponse({"error": "POST request required."}, status=400)


def voiceRange_view(request):
    if not request.user.is_authenticated:
        return JsonResponse({"error": "You are not logged in."}, status=400)

    if request.method == "PUT":
        user = request.user
        data = json.loads(request.body)
        if data.get("voiceRange") is not None:
            user.voiceRangeMinNote = data["voiceRange"][0]
            user.voiceRangeMaxNote = data["voiceRange"][1]
            user.save()
            return JsonResponse(user.to_json())
        else:
            return JsonResponse({"error": "No voice range data found."}, status=400)
    else:
        return JsonResponse(request.user.to_json())
