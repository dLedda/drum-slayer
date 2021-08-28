pipeline {
  agent any
  stages {      
    stage('Build') {
      steps {
        sh 'npm install'
        sh 'npm run build'
      }
    }
    stage('Deploy') {
      steps {
        sh 'rsync ./public /var/www/public/html/drums'
      }
    }
  }
}
