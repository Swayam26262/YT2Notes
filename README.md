# YT2Notes

YT2Notes is a web application that helps you convert YouTube videos into organized notes. The application uses Django for the backend and React for the frontend.

## Features

- Google OAuth authentication
- YouTube video transcription
- Note organization and management
- Responsive web design

## Project Structure

- `/backend`: Django REST API
- `/frontend`: React application built with Vite

## Prerequisites

- Python 3.9+
- Node.js 16+
- Google API credentials

## Installation

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install Python dependencies:
   ```
   pip install -r requirements.txt
   ```

3. Create a `.env` file in the backend directory with the following variables:
   ```
   SECRET_KEY=your_django_secret_key
   DEBUG=True
   FRONTEND_URL=http://localhost:5173
   
   # Google OAuth credentials
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   ```

4. Configure Google OAuth:
   - Create a project in [Google Cloud Console](https://console.cloud.google.com/)
   - Enable Google OAuth API
   - Set up authorized origins and redirect URIs as described in the backend README
   - Add `postmessage` as an authorized redirect URI

5. Run the OAuth setup script:
   ```
   python setup_google_oauth.py
   ```

6. Run migrations:
   ```
   python manage.py migrate
   ```

7. Start the backend server:
   ```
   python manage.py runserver
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install Node.js dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the frontend directory:
   ```
   VITE_GOOGLE_CLIENT_ID=your_google_client_id
   VITE_API_URL=http://localhost:8000
   ```

4. Start the development server:
   ```
   npm run dev
   ```

## Usage

1. Open your browser and navigate to `http://localhost:5173`
2. Sign in using Google authentication
3. Start creating notes from YouTube videos!

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 