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
                curl -X POST -s -o NUL -w "%%{http_code}" %POST_URL% || exit 0
            """
        }
    }
}
