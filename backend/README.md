# YT2Notes Backend

## Setup Instructions

### 1. Install Requirements
```bash
pip install -r requirements.txt
```

### 2. Environment Variables
Create a `.env` file in the backend directory with the following variables:
```
SECRET_KEY=your_django_secret_key
DEBUG=True
FRONTEND_URL=http://localhost:5173

# Google OAuth credentials
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### 3. Google OAuth Configuration
To obtain and properly configure Google OAuth credentials:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Go to "APIs & Services" > "Credentials"
4. Click "Create Credentials" > "OAuth client ID"
5. Choose "Web application" as the application type
6. Set "Authorized JavaScript origins":
   - Add `http://localhost:5173` (frontend development server)
   - Add `http://localhost:8000` (backend server)

7. Set "Authorized redirect URIs":
   - Add `http://localhost:8000/api/auth/google/`
   - Add `http://localhost:8000/accounts/google/login/callback/`
   - Add `postmessage` (important for Google One Tap sign-in)

8. Copy the Client ID and Client Secret to your `.env` file

### 4. Setup Google OAuth
Run the setup script to configure Google OAuth:
```bash
# On Windows
.\setup_oauth.bat

# On Mac/Linux
pip install -r requirements.txt
python setup_google_oauth.py
```

### 5. Run Migrations
```bash
python manage.py migrate
```

### 6. Run the Server
```bash
python manage.py runserver
```

## API Endpoints

### Authentication
- `POST /api/auth/google/`: Google OAuth login
- `POST /api/auth/apple/`: Apple OAuth login

## Troubleshooting

### "Google OAuth configuration not found"
If you receive this error, make sure you have:
1. Set the correct `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in your `.env` file
2. Run the setup script: `.\setup_oauth.bat` or `python setup_google_oauth.py`
3. Check that the SocialApp was created in the database

### "Failed to exchange authorization code for token"
This error indicates an issue with the Google OAuth configuration. Make sure:

1. You've added `postmessage` to the authorized redirect URIs in Google Cloud Console
2. Your frontend and backend are using the same Google Client ID
3. The Client ID and Secret in your `.env` file match exactly with what's in Google Cloud Console
4. You've restarted your server after updating the `.env` file
5. Your frontend is using `ux_mode: 'popup'` in the Google Sign-in configuration 