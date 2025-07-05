<h1 align="center" id="title">YT2Notes</h1>

<p align="center"><img src="https://socialify.git.ci/Swayam26262/YT2Notes/image?name=1&amp;owner=1&amp;stargazers=1&amp;theme=Light" alt="project-image"></p>

<p id="description">YT2Notes is a web application that helps you convert YouTube videos into organized notes. The application uses Django for the backend and React for the frontend.</p>

<p align="center"><img src="https://img.shields.io/badge/Django-092E20?style=for-the-badge&amp;logo=django&amp;logoColor=white" alt="shields"><img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&amp;logo=react&amp;logoColor=black" alt="shields"><img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&amp;logo=tailwind-css&amp;logoColor=white" alt="shields"><img src="https://img.shields.io/badge/Google_OAuth-4285F4?style=for-the-badge&amp;logo=google&amp;logoColor=white" alt="shields"></p>

<h2>Project Preview:</h2>

<div style="margin-bottom: 20px;">
<img src="https://ik.imagekit.io/clttjxlvp/ytnotes.png?updatedAt=1751295756952" alt="project-screenshot" width="100%" height="auto">
</div>

<hr style="margin: 30px 0; border: 0; height: 1px; background-image: linear-gradient(to right, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.75), rgba(0, 0, 0, 0));">



## ✨ Features

- **Google OAuth Authentication** - Secure login through Google accounts
- **YouTube Video Processing** - Convert videos into transcripts
- **AI Summarization** - Generate concise notes from video content
- **Organized Note Management** - Store and categorize notes
- **Responsive Design** - Works on desktop and mobile devices

## 🚀 Installation Steps

### Prerequisites
- Python 3.9+
- Node.js 16+
- Google API credentials

### Backend Setup

1. Clone the repository
   ```bash
   git clone https://github.com/Swayam26262/YT2Notes.git
   cd YT2Notes
   ```

2. Install backend dependencies
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

3. Configure environment variables
   ```bash
   # Create a .env file in the backend directory with:
   SECRET_KEY=your_django_secret_key
   DEBUG=True
   FRONTEND_URL=http://localhost:5173
   
   # Google OAuth credentials
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   ```

4. Run migrations and start server
   ```bash
   python manage.py migrate
   python manage.py runserver
   ```

### Frontend Setup

1. Install frontend dependencies
   ```bash
   cd frontend
   npm install
   ```

2. Configure environment variables
   ```bash
   # Create a .env file in the frontend directory with:
   VITE_GOOGLE_CLIENT_ID=your_google_client_id
   VITE_API_URL=http://localhost:8000
   ```

3. Start development server
   ```bash
   npm run dev
   ```

4. Access the application at `http://localhost:5173`

## 👥 Contribution Guidelines

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🛠️ Technologies Used

### Backend
- Django REST framework
- JWT authentication
- AssemblyAI for transcription
- Google Generative AI integration
- YouTube-DLP for video processing

### Frontend
- React 19
- Vite
- Tailwind CSS
- React Router
- Google OAuth integration

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📧 Support

For support, email patilswayam96@gmail.com or join our Slack channel. 
