pipeline {
  agent any

  tools {
    jdk 'JDK21'
  }

  stages {
    stage('Check versions') {
      steps {
        bat 'java -version'
        bat 'javac -version'
        bat '"C:\\apache-maven-3.8.6\\bin\\mvn.cmd" -version'
      }
    }

    stage('Build NeuroTutor') {
      steps {
        bat '''
          cd /d C:\\Users\\sweet\\Desktop\\NeuroTutor
          "C:\\apache-maven-3.8.6\\bin\\mvn.cmd" clean install
        '''
      }
    }
  }
}
