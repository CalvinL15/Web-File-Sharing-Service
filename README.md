# Web File Sharing Service
### For details regarding the task, please check the dbw-project-task-description.pdf file!

This project is divided into 3 sections: the database, the server, and the client. 

1. First, install the dependencies of both server and client. Run yarn install in the root directory of the project and also in the client folder.

2. In case that you want to use your own (PostgreSQL) database to run the project, execute the provided initialization script database/init_script.sql in your database server. You would also need to change the database credentials configured in the server/config.json file and the ./env file. In addition, you would also need to set up your own cron job. For more detail, please refer to the project term paper, "Removal of inactive files" section.

3. In server/config.json, fill in your TU Chemnitz's credentials in the "username" and "password" keys. Otherwise, authentication to the distributed blocklist service would not be possible.

4. Start the server by running "yarn start" in the project root directory.

5. With the server running, you can start the client in the development mode by running "yarn start" inside the client folder. Another option would be to first bundle the app into static files with "yarn build", and then run it with the command "serve -s build".

6. With both server and client finally running, you can now use the application!
