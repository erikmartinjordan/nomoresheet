import { useState, useEffect } from 'react';
import firebase                from './Firebase.js';

const GetNumberOfViews = (...uids) => {
    
    const [views, setViews] = useState([]);
    
    // Using JSON.stringify to compare arrays passed as arguments
    // If I don't use it, React will make an infinite render
    let stringUids = JSON.stringify(uids);
    
    useEffect( () => { 
        
        let ref = firebase.database().ref('users/');
        
        let listener = ref.on('value', snapshot => { 
            
            let users = snapshot.val(); 
            
            let numViews = JSON.parse(stringUids).map( uid => ~~users[uid]?.numViews);
            
            setViews(numViews);
            
        });
        
        return () => ref.off('value', listener); 
        
    }, [stringUids]);
    
    return views;
    
}

export default GetNumberOfViews;