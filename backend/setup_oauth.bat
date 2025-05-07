@echo off
echo Installing required packages...
pip install -r requirements.txt

echo Setting up Google OAuth configuration...
python setup_google_oauth.py

echo Done! 