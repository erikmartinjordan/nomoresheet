import React, { useState, useEffect }      from 'react';
import Question                            from './Question';
import Replies                             from './Replies';
import Norms                               from './Norms';
import RelatedContent                      from './RelatedContent';
import NewReply                            from './NewReply';
import Default                             from './Default';
import Privileges                          from './Privileges';
import Ad                                  from './Ad';
import firebase, { auth, fetchAdmin }      from '../Functions/Firebase';
import '../Styles/Forum.css';

const Detail = (props) => {
    
    const [admin, setAdmin]         = useState(false);
    const [uid, setUid]             = useState(null);
    const [validPost, setValidPost] = useState(true);
    const [title, setTitle]         = useState(null);
    const url                       = props.match.params.string;
    
    auth.onAuthStateChanged( async user => {

        if(user){
            
            let admin = await fetchAdmin(user);
            
            setAdmin(admin);
            setUid(user.uid);
        }
        else{
            setAdmin(false);
            setUid(null);
        }
        
    });
    
    useEffect( () => {
        
        const fetchPost = async () => {
            
            let snapshot = await firebase.database().ref(`posts/${url}`).once('value');
            
            let capture  = snapshot.val();
            
            capture
            ? firebase.database().ref(`posts/${url}/views`).transaction( value =>  value + 1 )
            : setValidPost(false);
            
        }
        
        fetchPost();
        
    }, [url]);
        
    return (
        <React.Fragment>
            {validPost
            ? <div className = 'Forum Detail'>
                <h1>{title}</h1>
                <div className = 'Forum-TwoCol'>
                    <div className = 'Main'>
                        <Question postId = {url} admin = {admin} uid = {uid} setTitle = {setTitle} />
                        <Replies  postId = {url} admin = {admin} uid = {uid}/>
                        <NewReply postId = {url}/>
                    </div>
                    <div className = 'Sidebar'>
                        <Norms/>
                        <Privileges/>
                        <RelatedContent/>
                        <Ad/>
                    </div>
                </div>
              </div>   
            : <Default/>
            }
        </React.Fragment> 
    );
}

export default Detail;