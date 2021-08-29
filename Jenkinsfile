pipeline {
    agent any
    tools {
        nodejs "nodejs-default"
    }
    stages {
        stage('Build') {
            steps {
                sh 'npm install'
                sh 'npm run build'
            }
        }
        stage('Deploy') {
            steps {
                sh '''#!/bin/sh
rm -r /var/www/public/html/drums
cp ./public /var/www/public/html/drums
'''
            }
        }
    }
}
