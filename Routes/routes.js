import { authenticateUser, fetchVideos, login, signup, validateLogin, addComment, fetchComments, getUserFromToken, deleteComment, fetchComment, updateComment, like, dislike, verifyToken, getVideosByUser, createChannel, checkChannel, deleteVideo, test } from "../Controller/controller.js";

export function routes(app) {
    app.get('/test', test);

    app.get('/videos', authenticateUser, fetchVideos);            //Get request which provide access to all the videos.
    app.get('/videos/by-user/:userId', getVideosByUser);                    //Get Videos and Channel of User.
    app.delete('/videos/:videoId', verifyToken, deleteVideo);           //Delete Video

    app.post('/signup', signup);                //post request to register the User
    app.post('/login', validateLogin, login);   //post request to login the user and provide jwt as output only if the user is registered

    app.get('/comment/:id', fetchComments);                       //Fetch All comments
    app.get('/singlecomment/:id', fetchComment);                //Fetch Single Comment
    app.post('/comment', addComment);                      //Add Comments
    app.delete('/comment/:id', deleteComment);              //Delete Comment
    app.put('/comment/:id', updateComment);             //Update Comment

    app.get('/getUser', getUserFromToken);                  //Get User details from the Token

    app.put('/like/:videoId', verifyToken, like );                               //Like a video
    app.put('/dislike/:videoId', verifyToken, dislike);                     //Dislike Video

    app.post('/createChannel', verifyToken, createChannel);                  //Create a channel 
    app.get('/checkUserChannel/:userId', checkChannel);                 //Check if User has a channel
}
