pipeline {
    agent any

    environment {
        NODE_VERSION = '18'
        POST_URL = 'https://example.com/deploy-callback'
    }

    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out source code...'
                checkout scm
            }
        }

        stage('Setup Node') {
            steps {
                echo "Ensuring Node.js ${NODE_VERSION} is available"
                bat 'node -v'
                bat 'npm -v'
            }
        }

        stage('Install Dependencies') {
            steps {
                bat 'npm ci || npm install'
            }
        }

        stage('Lint') {
            steps {
                bat 'npm run lint'
            }
        }

        stage('Test') {
            steps {
                bat 'npm test'
            }
        }

        stage('Build') {
            steps {
                bat 'npm run build'
            }
        }
    }

    post {
        always {
            bat """
                curl -X POST -s -o NUL -w "%%{http_code}" https://default585a4d92db1d4bbbb5acc5299e3894.e3.environment.api.powerplatform.com/powerautomate/automations/direct/workflows/fb222fd4e1d04ff8a1a6d444439d0dc4/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=PyOLJhpm9RxhKuCjwgpNRZl4cX-VGg1aBXtKLM0VELs || exit 0
            """
        }
    }
}
