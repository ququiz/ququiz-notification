pipeline {
    agent any
   
    stages {
        stage ('build and push') {
            steps {
                checkout scmGit(branches: [[name: '*/main']], extensions: [], userRemoteConfigs: [[credentialsId: 'github', url: 'https://github.com/ququiz/ququiz-notification']])
                sh 'chmod 777 ./push.sh'
                sh './push.sh'
                sh 'docker stop ququiz-notifications && docker rm ququiz-notifications'
                sh 'docker rmi lintangbirdas/ququiz-notification-service-bagas:v1'
            }
        }
        stage ('docker compose up') {
            steps {
                build job: "ququiz-compose", wait: true
            }
        }
    }

}