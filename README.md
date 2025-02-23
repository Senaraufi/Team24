# Emergency Response AI Platform

This system is an AI-powered emergency response platform designed for call centers and doctors. It provides real-time transcription, analysis, and routing of emergency calls to streamline the emergency response process.

## Features

- Real-time call transcription
- Automatic symptom and patient detail extraction
- Live call center dashboard
- Doctor's emergency notification system
- Ambulance dispatch optimization

## Setup

1. **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

2. **Set up environment variables:**
    Create a `.env` file with:
    ```env
    OPENAI_API_KEY=your_api_key_here
    ```

3. **Run the application:**
    ```bash
    python app.py
    ```

## System Components

- **Backend:** Flask (Python)
- **Frontend:** React
- **Real-time Communication:** Socket.IO
- **AI Processing:** OpenAI API

## Security Note

This system handles sensitive medical information. Ensure all necessary security protocols and HIPAA compliance measures are in place before deployment.

## Contributing

We welcome contributions! Please read our [Contributing Guidelines](CONTRIBUTING.md) for more details.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

For more information, please contact our team at [support@team24.com](mailto:support@team24.com).
