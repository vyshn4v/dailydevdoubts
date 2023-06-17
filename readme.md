###Dailydevdoubts
```This web application is about providing a better solution for every developer doubt. user can easily access this application using signup with google and raise a question to the app, and other user can answer to the question ```

```This app mainly focus on question and answering but user can also chat with others and make a group to communicate with other developers, each user can follow other users to make a connection with them ```

####<u>Documentation</u>
BaseUrl : http://localhost:3000/api/

Routes


| Method | Url   |
| ------ | ----- |
| Header | Title |
Request
``` 
{
   username:"john",
   email:"john123@gmail.com",
   phone:1234567891
   password:"john1234567@9"
   confirm_password:"john1234567@9"
}
```
Response
```
{
  "name": "john",
  "email": "john123@gmail.com",
  "phone": 1234567891,
  "isBanned": false,
  "isVerified": false,
  "following_user": [],
  "isSignupWithGoogle": false,
}
```