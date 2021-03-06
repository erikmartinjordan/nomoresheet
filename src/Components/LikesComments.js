import React, { useContext, useEffect, useState }   from 'react';
import Login                                        from './Login';
import Alert                                        from './Alert';
import Twemoji                                      from './Twemoji';
import firebase                                     from '../Functions/Firebase';
import GetPoints                                    from '../Functions/GetPoints';
import insertNotificationAndReputation              from '../Functions/InsertNotificationAndReputationIntoDatabase';
import UserContext                                  from '../Functions/UserContext';
import '../Styles/LikesComments.css';

const LikesComments = ({ authorId, postId, replyId }) => {  
    
    const [alertMessage, setAlertMessage] = useState(null);
    const [alertTitle, setAlertTitle]     = useState(null);
    const [modal, setModal]               = useState(false);
    const [numVotes, setNumVotes]         = useState(0);
    const [votes, setVotes]               = useState({});
    const points                          = GetPoints(authorId)[0];
    const { user }                        = useContext(UserContext);
    
    useEffect( () => { 
        
        firebase.database().ref(`posts/${postId}/replies/${replyId}/voteUsers`).on('value', snapshot => { 
            
            var votes = snapshot.val();            
            
            if(votes){
                
                setVotes(votes);
                setNumVotes(Object.keys(votes).length);
                
            }
            else{
                
                setVotes({});
                setNumVotes(0);
            }
            
        });
        
    }, [postId, replyId]);

    
    const handleVote = async (e) => {
        
        let autoVote = user.uid === authorId ? true : false;

        if(autoVote){
            
            setAlertTitle('Ups...');
            setAlertMessage('No puedes votar tu propio comentario.');
            
        }
        else{
            
            let userDidntVote = Object.keys(votes).indexOf(user.uid) === -1 ? true : false;
            
            if(userDidntVote){
                
                firebase.database().ref(`posts/${postId}/replies/${replyId}/voteUsers/${user.uid}`).transaction(value => true);
                firebase.database().ref(`users/${authorId}/numApplauses`).transaction(value => ~~value + 1);
                
                let snapshot = await firebase.database().ref(`posts/${postId}/replies/${replyId}/message`).once('value');
                let message  = snapshot.val().slice(0, 50) + '...';
                let url      = postId;
                
                insertNotificationAndReputation(authorId, 'applause', 'add', points, url, message, postId, replyId);
                
            }
            else{
                
                firebase.database().ref(`posts/${postId}/replies/${replyId}/voteUsers/${user.uid}`).remove();
                firebase.database().ref(`users/${authorId}/numApplauses`).transaction(value => ~~value - 1);
                
                let snapshot = await firebase.database().ref(`posts/${postId}/replies/${replyId}/message`).once('value');
                let message  = snapshot.val().slice(0, 50) + '...';
                let url      = postId;
                
                insertNotificationAndReputation(authorId, 'applause', 'sub', points, url, message, postId, replyId);
                
            }
           
        }
        
    }
    
    const displayLoginModal = () => {
        
        setModal(true);
    }
    
    const hideLoginModal = () => {
        
        setModal(false);
        
    }
    
    return (
        <React.Fragment>
            <div className = 'Likes-Comments' onClick = {user ? handleVote : displayLoginModal}>
                <div className = {Object.keys(votes).some(voteId => voteId === user?.uid) ? `Votes Voted` : `Votes`}>
                    <span><Twemoji emoji = {'👏'}/> {numVotes}</span>
                </div>
                <Alert 
                    title      = {alertTitle} 
                    message    = {alertMessage} 
                    seconds    = {3} 
                    setMessage = {setAlertMessage} 
                    setTitle   = {setAlertTitle}
                />
            </div>
            {modal ? <Login hide  = {hideLoginModal}/> : null}
        </React.Fragment>    
    );
}

export default LikesComments;
