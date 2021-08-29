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
rsync ./public /var/www/public/html/drums
'''
            }
        }
    }
}
