import React, { useState, useEffect, useRef } from 'react';
import firebase, {auth}                       from './Firebase';
import Alert                                  from '../Components/Alert';
import GetPoints                              from '../Functions/GetPoints';
import GetLevel                               from '../Functions/GetLevelAndPointsToNextLevel';
import Accounts                               from '../Rules/Accounts';
import '../Styles/EditPost.css';

const EditPost = ({ admin, postId, replyId, type, authorId, uid }) => {
    
    const refTextarea           = useRef(null);
    const [alert, setAlert]     = useState(null);
    const [message, setMessage] = useState(null);
    const [canEdit, setCanEdit] = useState(false);
    const points                = GetPoints(authorId);
    const level                 = GetLevel(...points)[0];
    
    useEffect( () => {
        
        if(refTextarea.current)
            refTextarea.current.style.height = `${refTextarea.current.scrollHeight}px`;    
        
    }, [message]);
    
    useEffect( () => {
        
        firebase.database().ref(`users/${uid}`).on('value', snapshot => {
            
            let userInfo = snapshot.val();
            
            if(userInfo){
                
                let isAdmin   = admin;
                let isAuthor  = authorId === uid; 
                let isPremium = false;
                let canEditMessages = false;
                
                if(userInfo.account){
                    
                    isPremium = true;
                }
                else{
                    
                    let rangeOfLevels = Object.keys(Accounts['free']);
                    let closestLevel  = Math.max(...rangeOfLevels.filter(num => num <= level));
                    
                    canEditMessages = Accounts['free'][closestLevel].edit ? true : false;
                    
                }
                
                if(isAdmin)                      setCanEdit(true);
                else if(isPremium && isAuthor)   setCanEdit(true);
                else if(canEditMessages)         setCanEdit(true);
                else                             setCanEdit(false);
                
            }
            else{
                
                setCanEdit(false);
            }
            
        });
        
    }, [level, uid]);
    
    const editMessage = async () => {
        
        let reference;
        
        type === 'post'
        ? reference = firebase.database().ref(`posts/${postId}/message`)
        : reference = firebase.database().ref(`posts/${postId}/replies/${replyId}/message`);
        
        const snapshot = await reference.once('value');
        const message  = snapshot.val();
        
        setMessage(message);
        
    }
    
    const handleMessage = (e) => {
        
        e.target.style.height = 'inherit';
        e.target.style.height = `${e.target.scrollHeight}px`; 
        
        setMessage(e.target.value);
        
    }
    
    const submitMessage = () => {
        
        let reference;
        
        type === 'post'
        ? reference = firebase.database().ref(`posts/${postId}/message`)
        : reference = firebase.database().ref(`posts/${postId}/replies/${replyId}/message`);
        
        reference.set(message);
        
        type === 'post'
        ? reference = firebase.database().ref(`posts/${postId}/edited`)
        : reference = firebase.database().ref(`posts/${postId}/replies/${replyId}/edited`);

        
        reference.transaction(value => Date.now());
        
        setAlert(true);
        
        setTimeout( () => setAlert(false), 1500);
        setTimeout( () => setMessage(null), 1500);
    }

    return (
        <div className = 'Edit'>
            { message 
            ? <div className = 'Edit-Message'>
                <div className = 'Edit-Message-Wrap'>
                    <textarea ref      = {refTextarea} 
                              value    = {message} 
                              onChange = {(e) => handleMessage(e)} 
                    />
                    <button onClick = {() => submitMessage()} className = 'bottom'>Guardar</button>
                </div>
                {message && <div className = 'Invisible' onClick = {() => setMessage(null)} ></div>}
              </div>
            : canEdit && <button onClick = {() => editMessage()} className = 'Edit'>Editar</button>
            }
            {alert && <Alert title = 'Genial' message = 'Mensaje editado'></Alert>}
        </div>
    );
    
}

export default EditPost;